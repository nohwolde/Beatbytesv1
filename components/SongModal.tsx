"use client";

import React, { useEffect, useState } from 'react';
import { 
  useSessionContext, 
  useSupabaseClient
} from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';

import useSongModal from "@/hooks/useSongModal";

import Modal from './Modal';
import { twMerge } from 'tailwind-merge';

import { useProfileStore, usePlayerStore } from '@/app/store';
import { Platform } from '@/hooks/useSearch';
import PlaylistRow from './PlaylistRow';

import Image from 'next/image';

import PlayNext from '@/public/images/play-next.svg';
import PlayLast from '@/public/images/play-last.svg';

import { toast } from 'react-hot-toast';
import { AiOutlinePlus } from 'react-icons/ai';



const SongModal = () => {
  const { session } = useSessionContext();
  const router = useRouter();
  const { onClose, isOpen, song } = useSongModal();

  const {spotPlaylists, ytPlaylists, scPlaylists} = useProfileStore();

  const {addToFront, addToQueue} = usePlayerStore();

  const [selectedPlatform, setSelectedPlatform] = useState('Spotify');
   
  
  const supabaseClient = useSupabaseClient();

  useEffect(() => {
    if (session) {
      router.refresh();
      onClose();
    }
  }, [session, router, onClose]);

  const onChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  }

  const addToPlaylist = async (playlistId: string) => {
    // first check if the song is stored in the songs table

    const { data, error } = await supabaseClient.from('songs').select().eq('id', song.id);

    if (error) {
      console.log(error);
    }

    if(data && data.length === 0) {
      // song is not stored in the songs table
      // first add the song to the songs table
      const { data, error } = await supabaseClient.from('songs').insert(song);

      if (error) {
        console.log(error);
      }

      console.log(data);
    }

    // now add the song to the playlist
    const { data: currentSongs, error: currentSongsError } = await supabaseClient
      .from("playlists_songs")
      .select("*")
      .filter("playlistId", "eq", playlistId);

    if (currentSongsError) {
      console.error(
        "Error getting current songs:",
        currentSongsError
      );
      return;
    }

    // Calculate the next song order
    const nextSongOrder =
      currentSongs.length > 0 ? currentSongs.length + 1 : 1;
    
    const { error: error2 } = await supabaseClient.from("playlists_songs").insert({
      playlistId: playlistId,
      song_id: song.id,
      song_order: nextSongOrder,
    });

    if (error2) {
      console.log(error2);
      toast.error("Failed to add to playlist");
    }
    else {
      toast.success("Added to Playlist");
    }

    return;
  }

  const addFrontQueue = () => {
    console.log("adding to Front of Queue",  song);
    if(song.platform === 'Soundcloud') {
      addToFront(
        {id: song?.id,
          user: [song?.author],
          title: song?.name,
          artwork_url: song?.image,
          track_authorization: song?.media?.track_authorization,
          media: song?.media,
          platform: "Soundcloud"
        }
      );
    }
    else if(song.platform === 'Youtube') {
      addToFront({
        id: song?.id,
        author: song?.author,
        title: {text: song?.name}, 
        thumbnails: [{url: song?.image}], 
        platform: "Youtube"
      });
    }
    else { 
      // this is a spotify song
      addToFront({
        id: song.yt?.id,
        author: song.yt?.author,
        title: {text: song.yt?.name}, 
        thumbnails: [{url: song.yt?.image}], 
        platform: "Youtube"
      });
    }
  }

  const addEndQueue = () => {
    console.log("adding to End of Queue", song);
    if(song.platform === 'Soundcloud') {
      addToQueue({
        id: song?.id,
        user: [song?.author],
        title: song?.name,
        artwork_url: song?.image,
        track_authorization: song?.media?.track_authorization,
        media: song?.media,
        platform: "Soundcloud"
      });
    }
    else if(song.platform === 'Youtube') {
      addToQueue({
        id: song?.id,
        author: song?.author,
        title: {text: song?.name}, 
        thumbnails: [{url: song?.image}], 
        platform: "Youtube"
      });
    }
    else { 
      // this is a spotify song
      addToQueue({
        id: song.yt?.id,
        author: song.yt?.author,
        title: {text: song.yt?.name}, 
        thumbnails: [{url: song.yt?.image}], 
        platform: "Youtube"
      });
    }
  }


  return (
    <Modal 
      title="Add to Queue or Playlist" 
      description="" 
      isOpen={isOpen} 
      onChange={onChange} 
    >
      <div className={twMerge(`overflow-y-scroll`)}>
        <div className={twMerge(`flex flex-col items-center justify-center`)}>
          <div className={twMerge(`flex flex-col items-center justify-center`)}>
            <div className={twMerge(`flex flex-col items-center justify-center bg-neutral-700 p-2 rounded-md`)}>
              {song && (
                <>
                  <img src={song.image} alt={song.name} className={twMerge(`w-auto h-32 rounded-md`)} />
                  <h2 className={twMerge(`text-lg font-bold mt-4`)}>{song.name}</h2>
                  <p className={twMerge(`text-sm text-gray-200`)}>{song.author?.username}</p>
                </>
              )}
              <h2 className={twMerge(`text-2xl text-center font-bold mt-4`)}>Queue</h2>
              <div className={twMerge(`flex flex-row items-center justify-center`)}>
                <div
                  className="
                    transition 
                    opacity-100 
                    rounded-md 
                    justify-center 
                    bg-cyan-500 
                    p-4
                    drop-shadow-md 
                    group-hover:opacity-100 
                    group-hover:translate-y-0
                    hover:scale-110
                    
                  "
                  onClick={(e) => {e?.stopPropagation(); addFrontQueue(); toast.success("Added to Queue"); onClose();}}
                >
                  <Image 
                    className="object-contain"
                    src={PlayNext}
                    alt="Image"
                    width={55}
                    height={55}
                  />
                </div>
                <div
                  className="
                    transition 
                    opacity-100 
                    rounded-md
                    flex 
                    items-center 
                    justify-center 
                    bg-blue-500
                    p-4
                    drop-shadow-md 
                    group-hover:opacity-100 
                    hover:scale-110
                  "
                  onClick={(e) => {e?.stopPropagation(); addEndQueue(); toast.success("Added to Queue"); onClose();}}
                >
                  <Image 
                    className="object-contain"
                    src={PlayLast}
                    alt="Image"
                    width={55}
                    height={55}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

      <h2 className={twMerge(`text-2xl text-center font-bold mt-4 `)}>Playlist</h2>
      <div className="flex w-full pt- p-4 bg-neutral-800 rounded-full">
        <div 
          className={`flex-1 text-center hover:cursor-pointer ${selectedPlatform === 'Spotify' ? 'text-green-500 text-2xl font-semibold' : 'text-gray-400 hover:text-xl font-semibold'}`}
          onClick={() => setSelectedPlatform('Spotify')}
        >
          Spotify
        </div>
        <div 
          className={`flex-1 text-center hover:cursor-pointer ${selectedPlatform === 'Youtube' ? 'text-rose-500 text-2xl font-semibold' : 'text-gray-400 hover:text-xl font-semibold'}`}
          onClick={() => setSelectedPlatform('Youtube')}
        >
          YouTube
        </div>
        <div 
          className={`flex-1 text-center hover:cursor-pointer ${selectedPlatform === 'Soundcloud' ? 'text-orange-500 text-2xl font-semibold' : 'text-gray-400 hover:text-xl font-semibold'}`}
          onClick={() => setSelectedPlatform('Soundcloud')}
        >
          Soundcloud
        </div>
      </div>

      <div className="flex flex-col bg-neutral-900 rounded-lg overflow-y-scroll max-h-[300px]">
        <div className='pr-4'>
          {selectedPlatform === "Spotify" && spotPlaylists && spotPlaylists.map((item) => (
            <div key={item.id} className='flex flex-1 w-full hover:bg-neutral-700'>
              <div className="flex-grow truncate">
                <PlaylistRow 
                  onClick={() => {}} 
                  key={item.id} 
                  playlist={{...item, subtitle: ""}}
                  image={item.image}
                />
              </div>
              <div className="flex-shrink-0">
                <AiOutlinePlus 
                  onClick={() => addToPlaylist(item.id)}
                  size={30} 
                  className="
                    items-end
                    m-2
                    mt-4
                    text-neutral-400 
                    cursor-pointer 
                    hover:text-white 
                    transition
                  "
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col bg-neutral-900 rounded-lg overflow-y-auto max-h-[300px]">
        <div className='pr-4'>
          {selectedPlatform === "Youtube" && ytPlaylists && ytPlaylists.map((item) => (
            <div key={item.id} className='flex flex-1 w-full hover:bg-neutral-700'>
              <div className="flex-grow truncate">
                <PlaylistRow 
                  onClick={() => {}} 
                  key={item.id} 
                  playlist={{...item, subtitle: ""}}
                  image={item.image}
                />
              </div>
              <div className="flex-shrink-0">
                <AiOutlinePlus 
                  onClick={() => addToPlaylist(item.id)} 
                  size={30} 
                  className="
                    items-end
                    m-2
                    mt-4
                    text-neutral-400 
                    cursor-pointer 
                    hover:text-white 
                    transition
                  "
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col bg-neutral-900 rounded-lg overflow-y-auto max-h-[300px]">
        <div className='pr-4'>
          {selectedPlatform === "Soundcloud" && scPlaylists && scPlaylists.map((item) => (
            <div key={item.id} className='flex flex-1 w-full hover:bg-neutral-700 '>
              <div className="flex-grow truncate">
                <PlaylistRow 
                  onClick={() => {}} 
                  key={item.id} 
                  playlist={{...item, subtitle: ""}}
                  image={item.image}
                />
              </div>
              <div className="flex-shrink-0">
                <AiOutlinePlus 
                  onClick={() => addToPlaylist(item.id)} 
                  size={30} 
                  className="
                    items-end
                    m-2
                    mt-4
                    text-neutral-400 
                    cursor-pointer 
                    hover:text-white 
                    transition
                  "
                />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
    </Modal>
  );
}

export default SongModal;