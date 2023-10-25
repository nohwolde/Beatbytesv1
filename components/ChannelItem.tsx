"use client";
import Image from "next/image";
import * as playlistImage from '@/public/images/playlist.jpeg';
import { getThumbnail } from "@/actions/useInnertube";

import PlayButton from "./PlayButton";

interface VideoItemProps {
  data: any;
  onClick: (id: string) => void;
}

const ChannelItem: React.FC<VideoItemProps> = ({ data, onClick }) => {

  return ( 
    <div
      onClick={() => onClick(data.id)} 
      className="
        relative 
        group 
        flex 
        flex-col 
        items-center 
        justify-center 
        rounded-md 
        overflow-hidden 
        gap-x-4 
        bg-neutral-400/5 
        cursor-pointer 
        hover:bg-neutral-400/10 
        transition 
        p-3
        text-center
      "
    >
      <div 
        className="
          relative 
          w-full
          h-full 
          rounded-full
          overflow-hidden
        "
      >
        <Image
          className="object-contain"
          src={data.author?.thumbnails[0].url.startsWith("https:") ? data.author?.thumbnails[0].url : "https:" + data.author?.thumbnails[0].url}
          width={1280}
          height={720}
          alt="Image"
        />
      </div>
      <div className="flex flex-col items-start w-full pt-4 gap-y-1">
        <p className="font-semibold truncate w-full">
            {data?.author?.name}
        </p>
        <p 
          className="
            text-neutral-400 
            text-sm 
            pb-4 
            w-full 
            truncate
          "
        >
            {data?.subscribers.text}
        </p>
      </div>
    </div>
   );
}
 
export default ChannelItem;
