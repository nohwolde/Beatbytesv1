"use client";
import Image from "next/image";
import * as playlistImage from '@/public/images/playlist.jpeg';
import { getThumbnail } from "@/actions/useInnertube";
import { useRouter } from "next/navigation";
import * as PlayNext from '@/public/images/play-next.svg';
import * as PlayLast from '@/public/images/play-last.svg';

import { usePlayerStore } from "@/app/store";

import PlayButton from "./PlayButton";
import toast from "react-hot-toast";

interface VideoItemProps {
  data: any;
}

const VideoItem: React.FC<VideoItemProps> = ({ data }) => {
  const router = useRouter();

  const {addToFront, addToQueue, setCurrentTrack} = usePlayerStore();

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

  const addFrontQueue = () => {
    console.log("adding to Front of Queue");
    addToFront({...data, platform: "Youtube"});
  }

  const addEndQueue = () => {
    console.log("adding to End of Queue");
    addToQueue({...data, platform: "Youtube"});
  }

  return ( 
    <div
      onClick={() => {router.push(`/watch/${data.id}`); console.log('Playing Now');setCurrentTrack({...data, platform:"Youtube"});}}
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
        <div 
          className="
            absolute 
            top-5 
            right-5
            flex
            flex-row
          "
        >
          <div
            className="
              transition 
              opacity-0 
              rounded-md 
              flex 
              items-center 
              justify-center 
              bg-cyan-500 
              p-2 
              mb-2
              drop-shadow-md 
              translate
              translate-y-1/4
              group-hover:opacity-100 
              group-hover:translate-y-0
              hover:scale-110
              mr-2
            "
            onClick={(e) => {e?.stopPropagation(); addFrontQueue(); toast.success("Added to Queue");}}
          >
            <Image 
              className="object-contain"
              src={PlayNext}
              alt="Image"
              width={45}
              height={45}
            />
          </div>
          <div
            className="
              transition 
              opacity-0 
              rounded-md
              flex 
              items-center 
              justify-center 
              bg-blue-500
              p-2
              mt-2
              drop-shadow-md 
              translate
              translate-y-1/4
              group-hover:opacity-100 
              group-hover:translate-y-0
              hover:scale-110
            "
            onClick={(e) => {e?.stopPropagation(); addEndQueue(); toast.success("Added to Queue");}}
          >
            <Image 
              className="object-contain"
              src={PlayLast}
              alt="Image"
              width={45}
              height={45}
            />
          </div>
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
            router.push(`/channel?id=${data?.author?.id}`)
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
