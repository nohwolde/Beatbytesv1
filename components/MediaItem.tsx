"use client";

import Image from "next/image";

import useLoadImage from "@/hooks/useLoadImage";
import { Song } from "@/types";
import usePlayer from "@/hooks/usePlayer";

import songImage from '@/public/images/playlist.jpeg';

interface MediaItemProps {
  data: any;
  onClick?: (id: string) => void;
  children?: React.ReactNode;
}

const MediaItem: React.FC<MediaItemProps> = ({
  data,
  onClick,
  children
}) => {
  const player = usePlayer();
  // const imageUrl = useLoadImage(data);

  const handleClick = () => {
    if (onClick) {
      return onClick(data.id);
    }
  
    return player.setId(data.id);
  };

  return (
    <div
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
      onClick={handleClick}
    >
      <div
        className="
          flex 
          items-center 
          cursor-pointer  
          gap-x-3
          w-full 
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
            src={data.image_path || songImage}
            alt="MediaItem"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col gap-y-1 overflow-hidden">
          <p className="text-white truncate">{data.name}</p>
          {/* <p className="text-neutral-400 text-sm truncate">
            {data.artists.map((artist) => artist.name || artist.name).join(", ")}
          </p> */}
        </div>
      </div>
      {children}
    </div>
  );
}
 
export default MediaItem;
