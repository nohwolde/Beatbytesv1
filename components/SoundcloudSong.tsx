"use client";

import Image from "next/image";

import { Song } from "@/types";
import usePlayer from "@/hooks/usePlayer";

interface SoundcloudSongProps {
  data: any;
  onClick?: (id: string) => void;
}

const SoundcloudSong: React.FC<SoundcloudSongProps> = ({
  data,
  onClick,
}) => {
  const player = usePlayer();

  const handleClick = () => {
    if (onClick) {
      return onClick(data.id);
    }
  
    return player.setId(data.id);
  };

  return (
    <div
      onClick={handleClick}
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
          src={data.image_path || "/images/music-placeholder.png"}
          alt="MediaItem"
          className="object-cover"
        />
      </div>
      <div className="flex flex-col gap-y-1 overflow-hidden">
        <p className="text-white truncate">{data.name}</p>
        {/* <p className="text-neutral-400 text-sm truncate">
          {data.artists.map((artist: any) => artist.username).join(", ")}
        </p> */}
      </div>
    </div>
  );
}
 
export default SoundcloudSong;
