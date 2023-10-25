"use client";

import usePlayer from "@/hooks/usePlayer";
import useLoadSongUrl from "@/hooks/useLoadSongUrl";
import useGetSongByHref from "@/hooks/useGetSongByHref";

import PlayerContent from "./PlayerContent";
import { useEffect, useState } from "react";
import Video from "./Video";
import { getDash } from "@/actions/useInnertube";

const VideoPlayer = () => {
  const player = usePlayer();
  // const { song } = useGetSongByHref(player.activeId);
  // const songUrl = useLoadSongUrl(song!);

  const [videoData, setVideoData] = useState(null);
  const [dash, setDash] = useState("");
  const licenseServer = "https://widevine-proxy.appspot.com/proxy";

  useEffect(() => {
    const setInnertube = async () => {
      const id = player.activeId;
      console.log(id);
      const video = await getDash(id);
      console.log(video);
      setVideoData(video.video);
      const uri = 'data:application/dash+xml;charset=utf-8;base64,' + btoa(video.dash);
      setDash(uri);
    }
    setInnertube();
  }, [player.activeId]);

  if(dash !== "") {
    return (
      <div 
        className="
          bg-black 
          w-full 
          py-2 
          px-4
        "
      >
        <Video
          licenseServer={licenseServer}
          manifestUrl={dash}
          posterUrl={videoData?.basic_info?.thumbnail[0].url}
        />
      </div>
    )
  }
  else return (
    // display something that tells the user to click a video to play
    <div
      className="
        bg-black 
        w-full 
        py-2 
        px-4
      "
    >
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-xl text-white font-bold">Click a video to play</p>
      </div>
    </div>
  );
}

export default VideoPlayer;
