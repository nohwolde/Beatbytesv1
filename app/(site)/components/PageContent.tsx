"use client"

import { Song } from "@/types";
import useOnPlay from "@/hooks/useOnPlay";
import SongItem from "@/components/SongItem";
import { Platform } from "@/hooks/useSearch";
import { useKeyStore, useProfileStore } from '@/app/store';
import getNewKey from "@/soundcloudController/keys"
import setKey from "@/actions/setKey";
import { useEffect } from "react";

import { useSessionContext } from "@supabase/auth-helpers-react";
import getKey from "@/actions/getKey";

import Profile from "@/components/Profile";
import PlaylistItem from "@/components/PlaylistItem";

import playlistImage from "@/public/images/playlist.jpeg";
import { useRouter } from "next/navigation";

interface PageContentProps {
  songs?: Song[];
  // key: string | null;
}

const PageContent: React.FC<PageContentProps> = ({
  songs, 
  // key
}) => {
  const router = useRouter();
  const {
    supabaseClient
  } = useSessionContext();
  const { scKey, setScKey } = useKeyStore();

  const { spotPlaylists, scPlaylists, ytPlaylists } = useProfileStore();

  // useEffect(() => {
  //   const fetchData = async () => {
  //     const { data, error } = await supabaseClient
  //       .from('keys')
  //       .select('key')
  //       .single();
      
  //     if (!error && data) {
  //       console.log("KEY:", data.key);
  //       setScKey(data.key);

  //       // setKey(Platform.Soundcloud, "client_id", data.key);
  //     }
  //     // const newKey = await getKey(Platform.Soundcloud, "client_id");

  //     // const newKey = await getNewKey.refreshSoundcloudClientId();
  //     // console.log("NEW KEY:", newKey);
  //     // setScKey(newKey);
  //     // setScKey(await getNewKey.refreshSoundcloudClientId())
  //   }

  //   fetchData();
  // }, []);

  // useEffect(() => {
  //   const keyExists = async () => {
  //     console.log(key);

  //     if(key){
  //       setScKey(key);
  //     }
  //     else {
  //       const newKey = await getNewKey.refreshSoundcloudClientId();
  //       setScKey(newKey);
  //       setKey(Platform.Soundcloud, "client_id", newKey);
  //     }
  //   }
  //   keyExists();
  // }, []);

  // if (songs.length === 0) {
  //   return (
  //     <div className="mt-4 text-neutral-400">
  //       No songs available.
  //     </div>
  //   )
  // }

  return ( 
    <div 
      className="
        grid 
        grid-cols-1 
        gap-4 
        mt-4
        p-5
      "
    >

  <div className="grid grid-cols-1 gap-4 mt-4 p-5">
    <div className="w-full">
      {spotPlaylists.length > 0 &&
        <>
        <h1 className="text-3xl font-bold text-green-500 m-4" onClick={() => router.push('/spot')}>
          Spotify Playlists
        </h1>
        <div className="w-full grid md:grid-cols-3 lg:grid-cols-5 gap-4" >
          {spotPlaylists.length > 0 &&
            spotPlaylists?.map((playlist) => (
              <PlaylistItem
                onClick={() => {
                  const platformPrefix = '/spot';
                  router.push(platformPrefix + '/playlist/' + playlist.id);
                }}
                key={playlist.id} 
                data={{title: playlist?.name, id: playlist?.id, artist: playlist?.author?.display_name, artist_href: playlist?.author?.href}}
                image={playlist?.image  || playlistImage}
              />
            ))
          }
        </div>
        </>
      }
    </div>  

    <div className="w-full">
      {ytPlaylists.length > 0 &&
        <>
          <h1 className="text-3xl font-bold text-rose-500 m-4" onClick={() => router.push('/spot')}>
            Youtube Playlists
          </h1>
          <div className="w-full grid md:grid-cols-3 lg:grid-cols-5 gap-4">
            {
              ytPlaylists?.map((playlist) => (
                <PlaylistItem
                  onClick={() => {
                    const platformPrefix = 'yt';
                    router.push(platformPrefix + '/playlist/' + playlist.id);
                  }}
                  key={playlist?.id}
                  data={{title: playlist?.name, id: playlist?.id, artist: playlist?.author?.name, artist_href: playlist?.author?.id}}
                  image={playlist?.image || playlistImage}
                />
              ))
            }
          </div>
        </>
      }
    </div>
    <div className="w-full">
      {scPlaylists.length > 0 &&
      <>
        <h1 className="text-3xl font-bold text-orange-500 m-4" onClick={() => router.push('/spot')}>
          Soundcloud Playlists
        </h1>   
        <div className="w-full grid md:grid-cols-3 lg:grid-cols-5 gap-4">

          {scPlaylists.length > 0 &&
            scPlaylists?.map((playlist) => (
              <PlaylistItem
                onClick={() => {
                  const platformPrefix = '/sc';
                  router.push(platformPrefix + '/playlist/' + playlist?.id);
                }}
                key={playlist?.id}
                data={{title: playlist?.name, id: playlist?.id, artist: playlist?.author?.name, artist_href: playlist?.author?.id}}
                image={playlist?.image}
              />
            ))
          }
        </div>
      </>
      }
    </div>
  </div>
  </div>
  );
}
 
export default PageContent;