"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import {BsChevronUp, BsChevronDown} from "react-icons/bs";

import LikeButton from "./LikeButton";
import AddSongButton from "./AddSongButton";

import songImage from '@/public/images/playlist.jpeg';

interface YoutubeSongProps {
  song: {
    id: string,
    author: any,
    name: string,
    href: string,
    image_path: string,
    views: string,
    platform: string
  },
  onPlay: any,
  children?: React.ReactNode;
}
const YoutubeSong: React.FC<YoutubeSongProps> = ({song, onPlay, children}) => {
  
  const router = useRouter();
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
        flex 
        items-center 
        gap-x-3 
        cursor-pointer 
        w-full 
        "
    > 
      <div 
        className="
          relative 
          rounded-md 
          min-h-[60px] 
          min-w-[60px] 
          overflow-hidden
          group
        "
      >
        <Image
          fill
          src={song.image_path || songImage}
          alt="Song"
          className="object-cover"
        />
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {children}
        </div>
      </div>
      <div className="flex-col gap-y-1 overflow-hidden">
        <p className="text-white truncate pb-1">{song.name}</p>
        <div className="flex gap-x-2 overflow-hidden items-center">
          {(song.author?.thumbnails && song.author?.thumbnails?.length > 0) &&
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
              src={song.author?.thumbnails[0]?.url}
              alt="Artist"
              className="object-cover"
            />
          </div>
          }
          <p className="text-neutral-400 text-sm truncate hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/channel/${song.author?.id}`)
              }
            }
          >
            {song.author?.name}
          </p>
        </div>
      </div>
      </div>
      <div className="flex items-end">
        <div className="flex gap-x-2 items-end justify-end">
          <LikeButton songId={song.id} />
          <AddSongButton song={{
              platform: "Youtube",
              id: song.id,
              name: song.name,
              image: song.image_path,
              author: song.author
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default YoutubeSong;