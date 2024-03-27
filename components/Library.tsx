"use client";

import { AiOutlinePlus } from "react-icons/ai";

import { Song } from "@/types";
import useUploadModal from "@/hooks/useUploadModal";
import { useUser } from "@/hooks/useUser";
import useAuthModal from "@/hooks/useAuthModal";
import useSubscribeModal from "@/hooks/useSubscribeModal";
import useOnPlay from "@/hooks/useOnPlay";
import SidebarItem from "./SidebarItem";
import { usePathname } from "next/navigation";
import PlaylistRow from "./PlaylistRow";
import {useRouter} from "next/navigation";

import Image from "next/image";
interface LibraryProps {
  spotify: any[];
  soundcloud: any[];
  youtube: any[];
  songs: Song[];
}

const Library: React.FC<LibraryProps> = ({
  songs, 
  spotify,
  soundcloud,
  youtube
}) => {
  const router = useRouter();

  const pathname = usePathname();
  const { user, subscription } = useUser();
  const uploadModal = useUploadModal();
  const authModal = useAuthModal();
  const subscribeModal = useSubscribeModal();

  const onPlay = useOnPlay(songs);

  const onClick = () => {
    if (!user) {
      return authModal.onOpen();
    }

    if (!subscription) {
      return subscribeModal.onOpen();
    }

    return uploadModal.onOpen();
  }

  return ( 
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-5 pt-4">
        <div className="inline-flex items-center gap-x-2 text-neutral-400 cursor-pointer hover:text-white">
          <SidebarItem name="library" label="Your Library" href="/" active={pathname === '/library'}/>
          {/* <p className="font-medium text-md">
            Your Library
          </p> */}
        </div>
        <AiOutlinePlus 
          // onClick={onClick} 
          size={20} 
          className="
            mt-2
            text-neutral-400 
            cursor-pointer 
            hover:text-white 
            transition
          "
        />
      </div>
      <div className="flex flex-col gap-y-2 mt-4 px-3">
        {/* {songs.map((item) => (
          <MediaItem 
            onClick={(id: string) => onPlay(id)} 
            key={item.id} 
            data={item}
          />
        ))} */}
        {/* spotify playlist section */}
        {(spotify.length > 0) &&
          <div className="">
            <p className="text-green-500  text-lg font-bold truncate hover:cursor-pointer" onClick={() => router.push('/spot')}>
              Spotify Playlists
            </p>
            {spotify.map((item) => (
              <PlaylistRow 
                onClick={() => router.push(`/spot/playlist/${item.id}`)} 
                key={item.id} 
                playlist={{...item, id: item.href, subtitle: ""}}
                image={item.image}
              />
            ))}
          </div>
        }
        {/* soundcloud playlist section */}
        {(soundcloud.length > 0) &&
          <div className="">
            <p className="text-orange-500 text-lg font-bold truncate hover:cursor-pointer" onClick={() => router.push('/sc')}>
              Soundcloud Playlists
            </p>
            {soundcloud.map((item) => (
              <PlaylistRow 
                onClick={() => router.push(`/sc/playlist/${item.id}`)} 
                key={item.id} 
                playlist={{...item, subtitle: ""}}
                image={item.image}
              />
            ))}
          </div>
        }
        {/* youtube playlist section */}
        {(youtube.length > 0) &&
          <div className="">
            <p className="text-rose-500 text-lg font-bold truncate hover:cursor-pointer" onClick={() => router.push('/yt')}>
              Youtube Playlists
            </p>
            {youtube.map((item) => (
              <PlaylistRow 
                onClick={() => router.push(`/yt/playlist/${item.id}`)} 
                key={item.id} 
                playlist={{...item, subtitle: ""}}
                image={item.image}
              />
            ))}
            {/* {youtube.map((item) => (
              showYtPlaylist(item)
            ))} */}
          </div>
        }
      </div>
    </div>
   );
}
 
export default Library;