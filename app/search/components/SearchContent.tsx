"use client";

import { Song } from "@/types";
import MediaItem from "@/components/MediaItem";
import LikeButton from "@/components/LikeButton";
import useOnPlay from "@/hooks/useOnPlay";
import { useSearch, SearchType, Platform } from "@/hooks/useSearch";
import Image from "next/image";
import { Innertube, UniversalCache } from 'youtubei.js/web';
import { useEffect, useRef, useState } from "react";

import { useUser } from "@/hooks/useUser";
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { postData } from "@/libs/helpers";
import { useRouter, usePathname, useParams } from "next/navigation";
import usePlayer from "@/hooks/usePlayer";
import PlaylistRow from "@/components/PlaylistRow";

import YoutubeSong from "@/components/YoutubeSong";
import { usePlayerStore, useSearchStore, useKeyStore } from "@/app/store";
import SoundcloudSong from "@/components/SoundcloudSong";
import SoundcloudPlaylist from "@/components/SoundcloudPlaylist";
import SoundcloudUser from "@/components/SoundcloudUser";
import { fetchSoundcloud } from "@/soundcloudController/api-controller";

interface SearchContentProps {
  songs: Song[];
} 

const SearchContent: React.FC<SearchContentProps> = ({
  songs
}) => {
  const router = useRouter();
  const { 
    searchType, 
    setSearchType,
    searchTerm,
    setYtSearch,
    ytSearch,
    setSearchTerm,
    topResults, 
    songResults,
    playlistResults,
    artistResults,  
    albumResults,
    searchResults,
    isLoading,
    getNextPage,
    searchPage,
    platform,
    setPlatform, 
  } = useSearch();

  const { scKey } = useKeyStore();
  const { scResults, setScResults, spotResults, ytResults, setYtResults } = useSearchStore();
  const { currentTrack, setCurrentTrack } = usePlayerStore();
  // setYtSearcher(youtube);
  const searchCategories: SearchType[] = [SearchType.Top, SearchType.Songs, SearchType.Playlists, SearchType.Artists, SearchType.Albums]
  const ytCategories: SearchType[] = [SearchType.Top, SearchType.Songs, SearchType.Playlists, SearchType.Artists]
  const categories = platform === Platform.Youtube ? ytCategories : searchCategories;
  const activeColor = platform === Platform.Youtube ? 'bg-red-600 text-white' : platform === Platform.Spotify ? 'bg-green-600 text-white'  : 'bg-orange-600 text-white';

  const { user } = useUser();
  const supabaseClient = useSupabaseClient();

  const player = usePlayer();
  
  const getActiveCategory = () => {
    if (platform !== Platform.Youtube) {
      return searchType;
    } else {
      return searchType !== SearchType.Albums ? searchType : SearchType.Top;
    }
  }

  const showSong = (song: any, onClick: () => void) => {
    return (
      <div 
        key={song.id} 
        // className="flex items-center gap-x-4 w-full"
      >
        <div 
        // className="flex-1 flex justify-between items-center gap-x-3 cursor-pointer hover:bg-neutral-800/50 w-full p-2 rounded-md"
        >
          <MediaItem
            data={song} 
            onClick={onClick}
          >
            <div className="items-end">
              <LikeButton songId={song.id} song={{
                  id: song?.id,
                  // check this in the console to fill in artist data
                  author: {name: song?.user?.username, id: song?.user?.id, image: song?.user?.avatar_url},
                  name: song?.title,
                  image: song?.artwork_url,
                  media: {...song?.media, track_authorization: song?.track_authorization},
                  platform: "Soundcloud"
                }} />
            </div>
          </MediaItem>
        </div>
      </div>
    );
  }
  
  const showArtist = (artist: any) => {
    return (
      <div 
        key={artist.id} 
        className="
        flex 
        items-center 
        gap-x-3 
        cursor-pointer 
        hover:bg-neutral-800/50 
        w-full 
        p-2 
        rounded-md
        "
      >
        <div 
          className="
            relative 
            rounded-md 
            min-h-[48px] 
            min-w-[48px] 
            overflow-hidden
          "
        >
          <Image
            fill
            src={artist.coverArt.sources[0].url || "/images/music-placeholder.png"}
            alt="ArtistItem"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col gap-y-1 overflow-hidden">
          <p className="text-white truncate">{artist.name}</p>
          {/* <p className="text-neutral-400 text-sm truncate">
            {data.artists.map((artist) => artist.name).join(", ")}
          </p> */}
        </div>
      </div>
    );
  }

  const showPlaylist = (playlist: any) => {
    return (
      <div 
        key={playlist.id} 
        className="
        flex 
        items-center 
        gap-x-3 
        cursor-pointer 
        hover:bg-neutral-800/50 
        w-full 
        p-2 
        rounded-md
        "
      >
        <div 
          className="
            relative 
            rounded-md 
            min-h-[48px] 
            min-w-[48px] 
            overflow-hidden
          "
        >
          <Image
            fill
            src={playlist.coverArt.sources[0].url || "/images/music-placeholder.png"}
            alt="ArtistItem"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col gap-y-1 overflow-hidden">
          <p className="text-white truncate">{playlist.name}</p>
          <p className="text-neutral-400 text-sm truncate">
            {playlist.subtitle}
          </p>
        </div>
      </div>
    );
  }

  const showAlbum = (album: any) => {
    return (
      <div 
        key={album.id} 
        className="
        flex 
        items-center 
        gap-x-3 
        cursor-pointer 
        hover:bg-neutral-800/50 
        w-full 
        p-2 
        rounded-md
        "
      >
        <div 
          className="
            relative 
            rounded-md 
            min-h-[48px] 
            min-w-[48px] 
            overflow-hidden
          "
        >
          <Image
            fill
            src={album.coverArt.sources[0].url || "/images/music-placeholder.png"}
            alt="ArtistItem"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col gap-y-1 overflow-hidden">
          <p className="text-white truncate">{album.name}</p>
          <p className="text-neutral-400 text-sm truncate">
            {album.subtitle}
          </p>
        </div>
      </div>
    );
  }

  const showSpotifyResults = () => {
    return (
      <div className="flex flex-col gap-y-2 w-full px-6">
        {(spotResults.map((top: any) => {
            if(top.type === 'track') {
              return (
                showSong({
                  id: top.id,
                  artists: top.artists,
                  name: top.name,
                  href: top.uri,
                  image_path: top.coverArt.sources[0].url,
                  isExplicit: top.isExplicit || false,
                  platform: "Spotify"
              }, 
              () => {
                setCurrentTrack({...top, platform: "Spotify"});
                player.setId(top.id);
                player.setIds(spotResults);
              }
              ))
            }
            else if(top.type === 'playlist') {
              return (
                PlaylistRow(top, top.coverArt.sources[0].url)
              )
            }
            else if(top.type === 'album') {
              return (
                showAlbum(top)
              )
            }
            else if(top.type === 'artist') {
              return (
                showArtist(top)
              )
            }
          })
        )}
      </div>
    );
  }

  const showScPlaylist = (playlist: any, onClick: any) => {
    return (
      <SoundcloudPlaylist
        data={playlist}
        onClick={onClick}
      />
    );
  }

  const ShowScResults = () => {
    const sentinelRef = useRef(null);

    useEffect(() => {
      const observer = new IntersectionObserver(async (entries) => {
        if (entries[0].isIntersecting) {
          console.log("Intersecting");
          if(scResults){
            if(scResults?.next_href && scKey) {
              console.log("Getting Next Page");
              const next = await fetchSoundcloud(scResults?.next_href, 1, scKey);
              const nextPage = next.response;
              console.log(nextPage);

              setScResults({...nextPage, collection: [...scResults.collection, ...nextPage.collection]});
              // setScResults(nextPage);
              // setScResults([...scResults, ...nextPage.collection]);
              // setYtSearch({...nextPage, results: [...ytSearch?.results, ...nextPage.results]});
            }
          }
        }
      });
  
      if (sentinelRef.current) {
        observer.observe(sentinelRef.current);
      }
  
      return () => {
        if (sentinelRef.current) {
          observer.unobserve(sentinelRef.current);
        }
      };
    }, [sentinelRef, scResults, scKey]);

    return (
      <div className="flex flex-col gap-y-2 w-full px-6">
        {
          scResults?.collection?.map((item: any) => {
            if(item.kind === 'track') {
              return (
                showSong({id: item.id,
                  artists: [item.user],
                  name: item.title,
                  href: item.permalink_url,
                  image_path: item.artwork_url,
                  waveform_url: item.waveform_url,
                  track_authorization: item.track_authorization,
                  likes_count: item.likes_count,
                  media: item.media,
                  platform: "Soundcloud"
                }
                ,() => {
                  router.push(`/sc/track/${item.id}`); 
                  setCurrentTrack({...item, platform: "Soundcloud"});
                })
              )
          }
            else if (item.kind === 'playlist') {
              return (
                showScPlaylist(
                  {
                    id: item.id, 
                    name: item.title, 
                    href: item.permalink_url,
                    image_path: item.artwork_url,
                    description: item.description || "",
                    tracks: item.tracks, 
                    track_count: item.track_count,
                    likes_count: item.likes_count,
                    duration: item.duration,
                    display_date: item.display_date,
                    is_album: item.is_album || false,
                    user: item.user,
                    platform: "Soundcloud"
                  }
                  , () => {
                    router.push(`/sc/playlist/${item.id}`)
                  })
              )
            }
            else if (item.kind === 'user') {
              return (
                <SoundcloudUser
                  key={item.id}
                  data={
                    {
                      id: item.id,
                      username: item.username,
                      name: item.full_name,
                      description: item.description,
                      track_count: item.track_count,
                      followers_count: item.followers_count,
                      permalink: item.permalink,
                      verified: item.verified,
                      image_path: item.avatar_url,
                      visuals: item.visuals,
                      platform: "Soundcloud"
                    }
                  }
                  onClick={
                    () => {
                      router.push(`/sc/user/${item.id}`)
                    }
                  }
                />
              )
            }
          })
        }
        <div ref={sentinelRef}></div>
      </div>
    );
  }

  const showYtSong = (song: any, onPlay: any) => {
    return (
      <div 
        key={song.id}
        onClick={() => {
          onPlay(song.id);
          router.push(`/watch/${song.id}`)
        }}
        className="
        flex 
        items-center 
        gap-x-3 
        cursor-pointer 
        hover:bg-neutral-800/50 
        w-full 
        p-2 
        rounded-md
        "
      >
        <div 
          className="
            relative 
            rounded-md 
            min-h-[60px] 
            min-w-[60px] 
            overflow-hidden
          "
        >
          <Image
            fill
            src={song.image_path || "/images/music-placeholder.png"}
            alt="ArtistItem"
            className="object-cover"
          />
        </div>
        <div className="flex-col gap-y-1 overflow-hidden">
          <p className="text-white truncate pb-1">{song.name}</p>
          <div className="flex gap-x-2 overflow-hidden items-center">
            <div 
              className="
                relative 
                rounded-full 
                h-8
                w-8
                overflow-hidden
              "
            >
              <Image
                fill
                src={song.author.thumbnails[0].url || "/images/music-placeholder.png"}
                alt="ArtistItem"
                className="object-cover"
              />
            </div>
            <p className="text-neutral-400 text-sm truncate hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/channel/${song.author.id}`)
                }
              }
            >
              {song.author.name}
            </p>
          </div>
        </div>
      </div>
    );
  }


  const showChannel = (channel: any) => {
    return (
      <div 
        key={channel.id}
        onClick={()=> router.push(`/channel/${channel.author.id}`)}
        className="
        flex 
        items-center 
        gap-x-3 
        cursor-pointer 
        hover:bg-neutral-800/50 
        w-full 
        p-2 
        rounded-md
        "
      >
        <div 
          className="
            relative 
            rounded-full 
            min-h-[48px] 
            min-w-[48px] 
            overflow-hidden
          "
        >
          <Image
            fill
            src={channel?.author?.thumbnails[0]?.url.startsWith("https:") ? channel?.author?.thumbnails[0]?.url : "https:" + channel?.author?.thumbnails[0]?.url}
            alt="ArtistItem"
            className="object-cover"
          />
        </div>
        <div className="flex-col gap-y-1 overflow-hidden">
          <p className="text-white truncate">{channel?.author?.name}</p>
          <div className="flex gap-x-2 overflow-hidden items-center">
            <p className="text-neutral-400 text-sm truncate">
              {channel?.subscriber_count?.text}
            </p>
            <p className="text-neutral-400 text-sm truncate">
              •
            </p>
            <p className="text-neutral-400 text-sm truncate">
              {channel?.video_count?.text}
            </p>
        </div>
      </div>
      </div>
    );
  }

  const showYtPlaylist = (playlist: any) => {
    return (
      <div 
        key={playlist.id} 
        className="
        flex 
        items-center 
        gap-x-3 
        cursor-pointer 
        hover:bg-neutral-800/50 
        w-full 
        p-2 
        rounded-md
        "
      >
        <div 
          className="
            relative 
            rounded-md 
            min-h-[100px] 
            min-w-[100px] 
            overflow-hidden
          "
        >
          <Image
            fill
            src={playlist.thumbnails[0].url || "/images/music-placeholder.png"}
            alt="ArtistItem"
            className="object-cover"
          />
        </div>
        <div className="flex-col gap-y-1 overflow-hidden">
          <p className="text-white text-md truncate">
            {playlist.title.text}
          </p>
          <div className="flex gap-x-2 overflow-hidden items-center">
            <p className="text-neutral-400 text-sm truncate">
              {playlist.author.name}
            </p>
          </div>
          <div className='my-2'>
            {playlist.first_videos?.map((video: any) => {
              return (
                <p key={video.id} className="text-white text-sm truncate">
                  {video.title.text}
                </p>
              )
            }
            )}
          </div>
          <p className="text-neutral-400 text-sm truncate">
            VIEW FULL PLAYLIST
          </p>
        </div>
      </div>
    );
  }

  const ShowYtResults = () => {
    const sentinelRef = useRef(null);

    useEffect(() => {
      const observer = new IntersectionObserver(async (entries) => {
        if (entries[0].isIntersecting) {
          console.log("Intersecting");
          // getNextPage();
          console.log(ytSearch);
          if (ytSearch?.results?.length > 0) {
            if(ytSearch?.has_continuation) {
              console.log("Getting Next Page");
              const nextPage = await ytSearch?.getContinuation();
              console.log(nextPage);
              setYtSearch(nextPage);
              setYtResults([...ytResults, ...nextPage.results]);
              // setYtSearch({...nextPage, results: [...ytSearch?.results, ...nextPage.results]});
            }
          }
        }
      });
  
      if (sentinelRef.current) {
        observer.observe(sentinelRef.current);
      }
  
      return () => {
        if (sentinelRef.current) {
          observer.unobserve(sentinelRef.current);
        }
      };
    }, [sentinelRef, ytSearch]);

    return (
      <div className="flex flex-col gap-y-2 w-full px-6">
        {ytResults?.map((top: any) => {
            if(top.type === 'Video') {
              return (
                <YoutubeSong 
                  key={top.id}
                
                  song={{
                  id: top.id,
                  author: top.author,
                  name: top.title.text,
                  href: "youtube.com" + top.endpoint?.metadata?.url,
                  image_path: top.thumbnails[0].url,
                  views: top.short_view_count.text,
                  platform: "Youtube",
                }}
                onPlay={() => {
                  setCurrentTrack({...top, platform: "Youtube"});
                  player.setId(top.id);
                  player.setIds(ytSearch?.results);
                }}
                />
              )
            }
            else if(top.type === 'Channel') {
              return (
                showChannel(top)
              )
            }
            else if(top.type === 'Playlist') {
              return (
                showYtPlaylist(top)
              )
            }
          })
        }
        <div ref={sentinelRef}></div>
      </div>
    );
  }

  return ( 
    <div className="flex flex-col gap-y-2 w-full px-6">
      {/* display buttons for searching Top, Songs, Playlists, Artists */}
      <div className="flex flex-row gap-x-2">
        {categories.map((category: SearchType) => (
          <button 
            key={category} 
            className={`
              ${category === getActiveCategory()
                ? activeColor 
                : 'bg-neutral-700 text-neutral-300'
              } 
              px-4 py-2 rounded-lg 
              focus:outline-none 
              focus:ring-2 
              focus:ring-neutral-500 
              focus:ring-offset-2 
              focus:ring-offset-neutral-900
            `}
            onClick={() => setSearchType(category)}
          >
            {category}
          </button>
        ))}
      </div>
      {/* show topResults, songResults, playlistResults, or artistResults which could be a list of songs, playlists, artists, or albums */}
      {/* {platform === Platform.Spotify && showSpotifyResults()} */}
      {platform === Platform.Youtube && ShowYtResults()}
      {platform === Platform.Soundcloud && ShowScResults()}
      {/* {songs.map((song: Song) => (
        <div 
          key={song.id} 
          className="flex items-center gap-x-4 w-full"
        >
          <div className="flex-1">
            <MediaItem 
              onClick={(id: string) => onPlay(id)} 
              data={song}
            />
          </div>
          <LikeButton songId={song.id} />
        </div>
      ))} */}
    </div>
  );
}
 
export default SearchContent;