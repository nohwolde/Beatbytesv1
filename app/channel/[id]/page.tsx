"use client";
import React, {useEffect, useState} from "react";
import { getChannel } from "@/actions/useInnertube";
import { useRouter, usePathname, useParams } from "next/navigation";
import Header from "@/components/Header";
import { twMerge } from "tailwind-merge";
import Image from "next/image";

import ChannelContent from "../components/ChannelContent";

const ChannelPage = () => {
  const [channelData, setChannelData] = useState(null);
  // {header: {}, current_tab: {content: {contents: []}}}
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  console.log(id);
  useEffect(() => {
    const setInnertube = async () => {
      console.log(id);
      const channel = await getChannel(id as string);
      console.log(channel);
      setChannelData(channel);
      console.log(channel?.current_tab.content.contents.filter((shelf: any) => shelf.contents[0].type === "Shelf" || shelf.contents[0].type === "ChannelVideoPlayer"));
    }
    setInnertube();
  }, []);

  return (
    <div 
      className="
        bg-neutral-900
        rounded-lg 
        h-full 
        w-full 
        overflow-hidden 
        overflow-y-auto
      "
    >
      <Header
        className={twMerge(`
          bg-gradient-to-b 
          from-blue-900
          to-b
          `
        )}>
        {channelData &&
          <div className="mb-2 flex flex-col gap-y-6">
            <div
              className="
                rounded-md
              "
            >
              <Image src={channelData?.header?.banner[0]?.url} alt="Banner" width="2560" height="424" className="object-contain" />
            </div>
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
            >
              <div
                className="
                  hidden 
                  md:flex
                  relative 
                  rounded-full 
                  min-h-[150px] 
                  min-w-[150px] 
                  overflow-hidden
                "
              >
                <Image
                  fill
                  src={channelData?.metadata?.avatar[0]?.url.startsWith("https:") ? channelData?.metadata?.avatar[0]?.url : "https:" + channelData?.metadata?.avatar[0]?.url}
                  alt="ArtistItem"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <div className="gap-y-1 overflow-hidden">
                  <p className="text-white truncate">{channelData?.header?.author?.name}</p>
                  <div className="flex mb-2 gap-x-2 overflow-hidden items-center">
                    <p className="text-neutral-400 text-sm truncate">
                      {channelData?.header?.channel_handle?.text}
                    </p>
                    <p className="text-neutral-400 text-sm truncate">
                      {channelData?.header?.subscribers?.text}
                    </p>
                    <p className="text-neutral-400 text-sm truncate">
                      •
                    </p>
                    <p className="text-neutral-400 text-sm truncate">
                      {channelData?.header?.videos_count?.text}
                    </p>
                  </div>
                </div>
                <div className="flex mb-2 gap-y-1 overflow-hidden truncate">
                  <p className="text-neutral-400 truncate">
                    {channelData?.metadata?.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        }
      </Header>
      {channelData && <ChannelContent contents={channelData?.current_tab.content.contents.filter((shelf: any) => shelf.contents[0].type === "Shelf" || shelf.contents[0].type === "ChannelVideoPlayer")} />
      }
    </div>
  );
}

export default ChannelPage;
