"use client";

import React, { useEffect, useState } from 'react';
import { 
  useSessionContext, 
  useSupabaseClient
} from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import { ScrollArea } from "@/components/ScrollArea";


import Modal from './Modal';
import Image from 'next/image';
import Input from './Input';
import Button from './Button';
import { twMerge } from 'tailwind-merge';
import { LoaderIcon } from 'react-hot-toast';
import { postData } from '@/libs/helpers';
import playlistImage from '@/public/images/playlist.jpeg';
import useDebounce from '@/hooks/useDebounce';
import { ProfileStore } from '@/hooks/useProfile';
import { getPlaylist, search } from '@/actions/useInnertube'

import { useProfileStore } from '@/app/store';


interface AccountModalProps {
  profile: ProfileStore;
  onClose: () => void;
  isOpen: boolean;
  platform: string;
  handleSearchUser: (value: string) => Promise<JSON>;
  handleGetPlaylists: (value: string) => Promise<JSON>;
}

const AccountModal: React.FC<AccountModalProps> = ({
  profile,
  onClose,
  isOpen,
  platform, 
  handleSearchUser, 
  handleGetPlaylists
}) => {
  const [page, setPage] = useState<number>(1);
  const [user, setUser] = useState<any>(null);
  const [playlists, setPlaylists] = useState<any>(null);
  const [value, setValue] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const { session } = useSessionContext();
  const router = useRouter();
  const supabaseClient = useSupabaseClient();
  
  const platformLogoPath = platform === 'Spotify' ? '/images/logos/spot.svg' : platform === 'Youtube' ? '/images/logos/yt.svg' : '/images/logos/soundcloud.png';

  const buttonColor = platform === 'Spotify' ? 'bg-green-500' : platform === 'Youtube' ? 'bg-red-500' : 'bg-orange-500';
  const hoverButtonColor = platform === 'Spotify' ? 'hover:bg-green-600' : platform === 'Youtube' ? 'hover:bg-red-600' : 'hover:bg-orange-600';
  const profileColor = platform === 'Spotify' ? 'bg-green-800' : platform === 'Youtube' ? 'bg-gray-500' : 'bg-orange-600';
  
  const { spotPlaylists, setSpotPlaylists } = useProfileStore();

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

  useEffect(() => {
    if(username !== '') handleSearchUser(username).then((res) => {
      if (res) {
        setUser(res);
      }
    })
  }, [username]);

  useEffect(() => {
    if (user) {
      console.log(user);
      profile.setUsername(user.username);
      profile.setImage(user.photo);
      profile.setName(user.name);
      router.push(platform === 'Spotify' ? '/spot' : platform === 'Youtube' ? '/yt' : '/sc');
    }
  }, [user]);

  const handleImportPlaylists = async (playlists: Array<any>) => {
    try {
      console.log(playlists);
      playlists.map(async (playlist) => {
        // const importResponse = await postData({
        //   url: `/api/${platform.toLowerCase()}/getPlaylist`,
        //   data: { playlist }
        // });
        const importResponse = platform !== "Youtube" ? await postData({
          url: `/api/${platform.toLowerCase()}/getPlaylist`,
          data: { playlist }
        }) : await getPlaylist(playlist.id);
        // if(platform === "Youtube") console.log(await getPlaylist(playlist.id));

        console.log({...playlist, importResponse});
        if (platform !== 'Youtube') {
          const songs = await Promise.all(await importResponse.map(async (song: any) => {
            const yt = (await search(platform === 'Spotify' ? song.name.concat(" - ", song.artists[0].name) : song.name, "video")).results;
              // await postData({ url: '/api/youtube/search/findOne', data: { searchTerm: platform === 'Spotify' ? song.artists[0].name.concat(" - ", song.name) : song.name } })
            const newSong = {
              ...song,
              yt: yt ? yt : null
            }
            console.log(newSong);
            return newSong;
          }

          ));
          profile.addPlaylist({...playlist, songs: songs});
          console.log({...playlist, songs: songs});
        }
        else {
          profile.addPlaylist({...importResponse.info, image: playlist.image, name: playlist.name, id: playlist.id, songs: importResponse.videos.map((song:any) => {return{...song, platform:"Youtube" }})});
          console.log({...importResponse.info, image: playlist.image, name: playlist.name, id: playlist.id, songs: importResponse.videos.map((song:any) => {return{...song, platform:"Youtube" }})});
        }
        setTimeout(() => {
          console.log('done');
        }, 500);
      });
    } catch (error) {
      if (error) return alert((error as Error).message);
    }
  }

  const displayLogin = () => {
    return (
    <div className={twMerge(`flex flex-row items-center justify-center p-3`)}>
      <Input
        placeholder={`What's your ${platform} Username?`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className='w-[300px]'
        onKeyDown={(e) => e.key === 'Enter' && value !== '' && setUsername(value)}
      />
      <Button
        className={twMerge(`w-[100px] ${buttonColor} ${hoverButtonColor}`)}
        onClick={() => 
          handleSearchUser(value).then((res) => {
            res ? setUser(res) : setUser(null);
          })
        }
      >
        Search
      </Button>
    </div>
    )
  }

  const displayUser = () => {
    if (user) {
      return (
        <div className={twMerge(`flex flex-row items-center justify-center m-2 p-2 bg-gray-700 rounded-sm`)}>
          <div className={twMerge(`flex flex-col items-center justify-center m-2 ${profileColor} p-2 rounded-md`)}>
            <Image
              src={user.photo || playlistImage}
              alt="Image"
              width={60}
              height={60}
              className='rounded-full'
            />
            <p className="text-center text-white">{user.name}</p>
          </div>
          {page === 1 && 
          <Button
            className={twMerge(`w-[100px] bg-cyan-400 hover:bg-cyan-500`)}
            onClick={() => {
                setPage(2);
                handleGetPlaylists(user).then((res) => {
                  if(res) {
                    setPlaylists(res);
                  }
                  else setPlaylists([]);
                })
              }
            }
          > 
            Load Playlists
          </Button>
          }
        </div>
      )
    }
    else {
      return (
        <div className={twMerge("flex flex-col items-center justify-center")}>
          <p>No user found</p>
        </div>
      )
    }
  }

  const displayPlaylists = () => {
    return (
      <div className={twMerge(`flex flex-row items-center justify-center p-3`)}>
        {playlists && playlists.length !== 0 ?
            <div className={twMerge(`flex flex-col m-2 p-2 rounded-md`)}>
              {/* items-center justify-center  */}
              {/* <Image
                src={playlist.image || playlistImage}
                alt="Image"
                width={60}
                height={60}
                className='rounded-md'
              />
              <p className="text-center text-white">{playlist.name}</p> */}
              <ScrollArea className="h-72 w-150 rounded-md border">
                <div className="p-4">
                  <h4 className="mb-4 text-sm font-medium leading-none">Playlists</h4>
                    {playlists.map((playlist: any) =>
                    <React.Fragment>
                      <div className='flex-row'>
                        <Image 
                          src={playlist.image || playlistImage}
                          alt="Image"
                          width={60}
                          height={60}
                          className='rounded-full'
                        />
                        <p className="text-white">{playlist.name}</p>
                      </div>
                    </React.Fragment>
                    )}
                  </div>
              </ScrollArea>
              <Button
                className={twMerge(`w-[400px] bg-cyan-400 hover:bg-cyan-500`)}
                onClick={() => 
                  {
                    console.log(playlists);
                    handleImportPlaylists(playlists);
                  }
                }
              >
                Import Playlists to Beatbytes
              </Button>
            </div>
        : playlists === null ?
          <div>
            <p>Loading Playlists...</p>
            <LoaderIcon />
          </div>
        : <div>
            <p>No playlists found</p>
            <Button
              className={twMerge(`w-[100px] bg-cyan-400 hover:bg-cyan-500`)}
              onClick={() => 
                handleGetPlaylists(value).then((res) => {
                  res ? setPlaylists(res) : setPlaylists([]);
                  console.log(res);
                })
              }
            >
              Retry
            </Button>
          </div>
        }
      </div>
    );
  }


  return (
    <Modal
      title={`Load your ${platform} playlists`} 
      description={page === 1 ? "Type your account username to load your playlists." : ""}
      isOpen={isOpen}
      onChange={onChange}
    >
      <div className={twMerge(`flex flex-col items-center justify-center`)}>
        {(page === 1) && displayLogin()}
        {displayUser()}
        {(page === 2) && displayPlaylists()}
        <Image
          className="object-cover"
          src={platformLogoPath}
          alt="Image"
          width={60}
          height={60}
        />
      </div>
    </Modal>
  );
}

export default AccountModal;