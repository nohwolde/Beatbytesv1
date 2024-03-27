import React, {useEffect, useState} from "react";
import VideoItem from "@/components/VideoItem";
import ChannelItem from "@/components/ChannelItem";
import { useRouter, usePathname, useParams } from "next/navigation";
import { usePlayerStore } from "@/app/store";


interface ChannelContentProps {
  contents: any[];
}

const ChannelContent: React.FC<ChannelContentProps> = ({ contents }) => {
  const router = useRouter();

  const {currentTrack, setCurrentTrack} = usePlayerStore();
  
  const shelf = (shelf: any) => {
    return (
      <div className="mb-2">
        <div className="text-lg font-semibold">{shelf.title?.text}</div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4 w-full">
          {shelf.content.items.map((video: any) => {
            if (video.type === "GridVideo") {
              return (
                <VideoItem 
                  key={video.id}
                  data={video}

                />
              )
            }
            else if (video.type === "GridChannel") {
              return (
                <ChannelItem 
                  key={video.author.id}
                  data={video}
                  onClick={() => router.push(`/channel/${video.author.id}`)}
                />
              )
            }
          })}
        </div>
        {/* add a separator here */}
        <hr className="border-gray-200" />
      </div>
    )
  }
  return (
    <div className="mt-2 mb-7 px-6">
      {contents.map((content) => {
        if(content.contents[0]?.type === "Shelf") {
          return shelf(content.contents[0])
        }
      })}
    </div>
  )
}

export default ChannelContent;
  

