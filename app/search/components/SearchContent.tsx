"use client";

import { Song } from "@/types";
import MediaItem from "@/components/MediaItem";
import LikeButton from "@/components/LikeButton";
import useOnPlay from "@/hooks/useOnPlay";
import { useSearch, SearchType, Platform } from "@/hooks/useSearch";
import Image from "next/image";
import { Innertube, UniversalCache } from 'youtubei.js/web';

import { useEffect, useState } from "react";

import { useUser } from "@/hooks/useUser";
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { postData } from "@/libs/helpers";
import { useRouter, usePathname, useParams } from "next/navigation";
import VideoContainer from "@/app/watch/components/VideoContainer";
import usePlayer from "@/hooks/usePlayer";


async function createInnertube() {
  const yt = await Innertube.create({
    fetch: async (input, init) => {
      // url
      const url = typeof input === 'string'
          ? new URL(input)
          : input instanceof URL
          ? input
          : new URL(input.url);

      // transform the url for use with our proxy
      url.searchParams.set('__host', url.host);
      url.host = 'localhost:8080';
      url.protocol = 'http';

      console.log(init?.headers);

      const headers = init?.headers
          ? new Headers(init.headers)
          : input instanceof Request
          ? input.headers
          : new Headers();

      // now serialize the headers
      url.searchParams.set('__headers', JSON.stringify([...headers]));

      if (input instanceof Request) {
        // @ts-ignore
        input.duplex = 'half';
      }

      // copy over the request
      const request = new Request(
          url,
          input instanceof Request ? input : undefined,
      );

      headers.delete('user-agent');
      headers.delete('sec-fetch-site');

      // fetch the url
      return fetch(request, init ? {
          ...init,
          headers
      } : {
          headers
      });
    },
    cache: new UniversalCache(false),
  });
  // const yt = await Innertube.create({
  //   cache: new UniversalCache(false)
  // });
  return yt;
}

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
    setYtSearcher,
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
    setPlatform
  } = useSearch();
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

  // useEffect(() => {
  //   const youtube = createInnertube();
  //   console.log('Setting Innertube');
  //   setYtSearcher(youtube);
  // }, [])

  useEffect(() => {
  }, [ytSearch]);
    

  // useEffect(() => {
  //   const insertSongs = async () => {
  //     if(searchType === SearchType.Top || searchType === SearchType.Songs) {
  //       const results = ytSearch?.results.filter((result: any) => result.type === 'Video');
  //       console.log("Supabase Results");
  //       console.log(results);
  //       const songConvert = results.map((result: any) => {
  //         return {
  //           // user_id: user?.id,
  //           name: result.title.text,
  //           image_path: result.thumbnails[0].url,
  //           href: "https://youtube.com" + result.endpoint.metadata.url,
  //           yt_href:  "https://youtube.com" + result.endpoint.metadata.url,
  //           platform: "Youtube",
  //         }
  //       }
  //       );
  //       const { error: supabaseError } = await supabaseClient
  //       .from('songs')
  //       .insert(songConvert);
  //       if(supabaseError) console.log(supabaseError)
  //     }
  //   }
  //   insertSongs();
  // }, [ytSearch]);

  // useEffect(() => {
  //   const insertSongs = async () => {
  //     if(searchType === SearchType.Top || searchType === SearchType.Songs) {
  //       const results = searchResults.filter((result: any) => result.type === 'track');
  //       console.log("Supabase Results");
  //       console.log(results);
  //       const songConvert = results.map((result: any) => {
  //         return {
  //           // user_id: user?.id,
  //           name: result.name,
  //           image_path: result.coverArt.sources[0].url,
  //           href: result.uri,
  //           yt_href:  await postData('/api/spotify/getYtUrl', {}),
  //           platform: "Spotify",
  //         }
  //       }
  //       );
  //       const { error: supabaseError } = await supabaseClient
  //       .from('songs')
  //       .insert(songConvert);
  //       if(supabaseError) console.log(supabaseError)
  //     }
  //   }
  //   insertSongs();
  // }
  // , [searchResults]);

  // if (songs.length === 0) {
  //   return (
  //     <div 
  //       className="
  //         flex 
  //         flex-col 
  //         gap-y-2 
  //         w-full 
  //         px-6 
  //         text-neutral-400
  //       "
  //     >
  //       No songs found.
  //     </div>
  //   )
  // }

  const showSong = (song: any) => {
    return (
      <div 
        key={song.id} 
        className="flex items-center gap-x-4 w-full"
      >
        <div className="flex-1">
          <MediaItem 
            data={song} 
            onClick={() => {}}
          />
        </div>
          <LikeButton songId={song.href} />
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

  const spotifyResults = () => {
    return (
      <div className="flex flex-col gap-y-2 w-full px-6">
        {searchType === SearchType.Top && (
          topResults.map((top: any) => {
            if(top.type === 'track') {
              return (
                showSong({id: top.id,
                artists: top.artists,
                name: top.name,
                href: top.uri,
                image_path: top.coverArt.sources[0].url,
                isExplicit: top.isExplicit || false,
                platform: "Spotify"
              }))
            }
            else if(top.type === 'playlist') {
              return (
                showPlaylist(top)
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
        {searchType === SearchType.Songs && 
          songResults.map((song: any) => 
            showSong({
              id: song.id,
              artists: song.artists,
              name: song.name,
              href: song.uri,
              image_path: song.coverArt.sources[0].url,
              isExplicit: song.isExplicit || false,
              platform: "Spotify"
            })
        )}
        {searchType === SearchType.Playlists && (
          playlistResults.map((playlist: any) => {
            return (
              showPlaylist(playlist)
            )
          })
        )}
        {searchType === SearchType.Artists && (
          artistResults.map((artist: any) => {
            return (
              showArtist(artist)
            )
          })
        )}
        {searchType === SearchType.Albums && (
          albumResults.map((album: any) => {
            return (
              showAlbum(album)
            )
          })
        )}
      </div>
    );
  }

  const scResults = () => {
    return (
      <div className="flex flex-col gap-y-2 w-full px-6">
        {searchType === SearchType.Top || searchType === SearchType.Albums && (
          topResults.map((top: any) => {
            if(top.type === 'track') {
              return (
                showSong({id: top.id,
                artists: [top.author],
                name: top.title,
                href: top.url,
                image_path: top.thumbnail,
                isExplicit: top.isExplicit || false,
                platform: "Soundcloud"
              }))
            }
            else if(top.type === 'playlist') {
              return (
                showPlaylist(top)
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
        {searchType === SearchType.Songs && 
          songResults.map((song: any) => {
            return (
              showSong({id: song.id,
              artists: [song.author],
              name: song.title,
              href: song.url,
              image_path: song.thumbnail,
              isExplicit: song.isExplicit || false,
              platform: "Soundcloud"
            }))
        }
        )}
        {searchType === SearchType.Playlists && (
          playlistResults.map((playlist: any) => {
            return (
              showPlaylist(playlist)
            )
          })
        )}
        {searchType === SearchType.Artists && (
          artistResults.map((artist: any) => {
            return (
              showArtist(artist)
            )
          })
        )}
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
            src={channel.author?.thumbnails[0].url.startsWith("https:") ? channel.author?.thumbnails[0].url : "https:" + channel.author?.thumbnails[0].url}
            alt="ArtistItem"
            className="object-cover"
          />
        </div>
        <div className="flex-col gap-y-1 overflow-hidden">
          <p className="text-white truncate">{channel.author.name}</p>
          <div className="flex gap-x-2 overflow-hidden items-center">
            <p className="text-neutral-400 text-sm truncate">
              {channel.subscriber_count.text}
            </p>
            <p className="text-neutral-400 text-sm truncate">
              •
            </p>
            <p className="text-neutral-400 text-sm truncate">
              {channel.video_count.text}
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

  const ytResults = () => {
    return (
      <div className="flex flex-col gap-y-2 w-full px-6">
        {getActiveCategory() === SearchType.Top && (
          ytSearch?.results?.map((top: any) => {
            if(top.type === 'Video') {
              return (
                showYtSong({id: top.id,
                author: top.author,
                name: top.title.text,
                href: "youtube.com" + top.endpoint?.metadata?.url,
                image_path: top.thumbnails[0].url,
                views: top.short_view_count.text,
                platform: "Youtube",
              },() => {
                player.setId(top.id);
                player.setIds(ytSearch?.results);
              }
              ))
            }
            else if(top.type === 'Artist') {
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
        )}
        {getActiveCategory() === SearchType.Songs && 
          ytSearch?.results?.map((song: any) => {
            if(song.type === 'Video')
              return (
                showYtSong({id: song.id,
                author: song.author,
                name: song.title.text,
                href: "youtube.com" + song.endpoint?.metadata?.url,
                image_path: song.thumbnails[0].url,
                views: song.short_view_count.text,
                platform: "Youtube",
              },() => {
                player.setId(song.id);
                player.setIds(ytSearch?.results);
              }
              ))
          })
        }
        {getActiveCategory() === SearchType.Playlists && (
          ytSearch?.results?.map((playlist: any) => {
            if(playlist.type === 'Playlist')
              return (
                showYtPlaylist(playlist)
              )
          })
        )}
        {getActiveCategory() === SearchType.Artists && (
          ytSearch?.results?.map((channel: any) => {
            if(channel.type === 'Channel')
              return (
                showChannel(channel)
              )
          })
        )}
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
      {platform === Platform.Spotify && spotifyResults()}
      {platform === Platform.Youtube && ytResults()}
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