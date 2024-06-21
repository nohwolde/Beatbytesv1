import React, {useEffect, useState} from "react";
import VideoItem from "@/components/VideoItem";
import ChannelItem from "@/components/ChannelItem";
import { useRouter, usePathname, useParams } from "next/navigation";
import { usePlayerStore } from "@/app/store";
import PlaylistItem from "@/components/PlaylistItem";


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
        {/* <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-4 w-full"> */}
        <div className="flex overflow-x-auto mt-4 w-full space-x-4 scrollbar-hide">
          {shelf.content.items.map((video: any) => {
            if (video.type === "GridVideo") {
              return (
                <div className="flex-none w-1/2 sm:w-1/3 md:w-1/3 lg:w-1/4">
                  <VideoItem 
                    key={video.id}
                    data={video}

                  />
                </div>
              )
            }
            else if (video.type === "GridChannel") {
              return (
                <div className="flex-none w-1/2 sm:w-1/3 md:w-1/3 lg:w-1/6">
                  <ChannelItem 
                    key={video.author.id}
                    data={video}
                    onClick={() => router.push(`/channel/${video.author.id}`)}
                  />
                </div>
              )
            }
            else if(video.type === "CompactStation") {
              return (
                // <div style={{flex: '0 0 auto', width: '16.66%'}}>
                <div className="flex-none w-1/2 sm:w-1/3 md:w-1/3 lg:w-1/6">
                  <PlaylistItem 
                    key={video.endpoint.payload.playlistId}
                    data={{title: video.title.text, artist: "Youtube Music"}}
                    image={video.thumbnail[1].url || video.thumbnail[video.thumbnail.length - 1].url}
                    onClick={() => router.push(`/yt/playlist/${video.endpoint.payload.playlistId}`)}
                  />
                </div>
              )
            }
            else if (video.type === "GridPlaylist") {
              return (
                <div className="flex-none w-1/2 sm:w-1/3 md:w-1/3 lg:w-1/6">
                  <PlaylistItem 
                    key={video.playlistId}
                    data={{title: video.title.text}}
                    image={video.thumbnail_renderer.thumbnail[0].url}
                    onClick={() => router.push(`/yt/playlist/${video.id}`)}
                  />
                </div>
              )
            }
          })}
        </div>
        {/* add a separator here */}
        <br />
      </div>
    )
  }
  return (
    <div className="mt-2 mb-7 px-6">
      {contents.map((content) => {
        if(content.contents[0]?.type === "Shelf" && content.contents[0]?.content?.items.length > 0) {
          return shelf(content.contents[0])
        }
      })}
    </div>
  )
}

export default ChannelContent;
  

