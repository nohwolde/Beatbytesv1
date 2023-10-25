"use client";
import Image from "next/image";
import * as playlistImage from '@/public/images/playlist.jpeg';
import { getThumbnail } from "@/actions/useInnertube";
import { useRouter } from "next/navigation";

import PlayButton from "./PlayButton";

interface VideoItemProps {
  data: any;
  onClick: (id: string) => void;
}

const VideoItem: React.FC<VideoItemProps> = ({ data, onClick }) => {
  const router = useRouter();

  // const ThumbnailImage = async () => {
  //   const thumbnail = data.thumbnails? getThumbnail(data, "max", data?.thumbnails[0]?.url) : playlistImage;
  //   return (
  //     <Image
  //       className="object-cover"
  //       src={await thumbnail}
  //       fill
  //       alt="Image"
  //     />
  //   )
  // }

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
      "
    >
      <div 
        className="
          relative 
          w-full
          h-full 
          rounded-md 
          overflow-hidden
        "
      >
        <Image
          className="object-contain"
          src={`https://img.youtube.com/vi/${data.id}/hqdefault.jpg`|| `https://img.youtube.com/vi/${data.id}/mqdefault.jpg`|| playlistImage}
          width={1280}
          height={720}
          alt="Image"
        />
        <div 
          className="
            absolute 
            bottom-5 
            right-5
          "
        >
          <PlayButton />
        </div>
      </div>
      <div className="flex flex-col items-start w-full pt-4 gap-y-1">
        <p className="font-semibold truncate w-full">
          {data?.title?.text}
        </p>
        <p 
          className="
            text-neutral-400 
            text-sm 
            pb-4 
            truncate
            hover:text-white
          "
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/channel/${data?.author?.id}`)
          }
          }
        >
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
          {data?.short_view_count?.text} • {data?.published?.text}
        </p>
      </div>

    </div>
   );
}
 
export default VideoItem;
