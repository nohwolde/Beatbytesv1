"use client";

import usePlayer from "@/hooks/usePlayer";
import useLoadSongUrl from "@/hooks/useLoadSongUrl";
import useGetSongByHref from "@/hooks/useGetSongByHref";
import { usePathname } from "next/navigation";

import PlayerContent from "./PlayerContent";
import React, { useEffect, useState } from "react";
import Video from "./Video";
import { getDash } from "@/actions/useInnertube";
const Draggable = require('react-draggable');

const shaka = require('shaka-player/dist/shaka-player.ui.js');
import 'shaka-player/dist/controls.css'; /* Shaka player CSS import */

interface VideoProps {
  licenseServer: string,
  manifestUrl: string,
  posterUrl: string
}


// export default Video;

const VideoPlayer = () => {
  const player = usePlayer();
  // const { song } = useGetSongByHref(player.activeId);
  // const songUrl = useLoadSongUrl(song!);
  const pathname = usePathname();

  const [currentId, setCurrentId] = useState("");
  const [videoData, setVideoData] = useState(null);
  const [dash, setDash] = useState("");
  const licenseServer = "https://widevine-proxy.appspot.com/proxy";

  useEffect(() => {
    const setInnertube = async () => {
      const id = player.activeId;
      console.log(id);
      if(currentId !== id) {
        setCurrentId(id as string);
        const video = await getDash(id);
        console.log(video);
        setVideoData(video.video);
        const uri = 'data:application/dash+xml;charset=utf-8;base64,' + btoa(video.dash);
        setDash(uri);
      }
    }
    setInnertube();
  }, [player.activeId, currentId]);

  if(dash !== "") {
    return (
      <Draggable>
        <div 
        className={
          pathname.startsWith('/watch') 
            ? "bg-black relative py-2 px-4 bottom-0"
            : "bg-black w-1/4 fixed py-2 px-4 bottom-0"
        }  // Define and use a CSS variable for the height of the VideoPlayer
      >
          <Video
            licenseServer={licenseServer}
            manifestUrl={dash}
            setManifestUrl={setDash}
            posterUrl={videoData?.basic_info?.thumbnail[0].url}
            currentId={currentId}
            setCurrentId={setCurrentId}
          />
        </div>
      </Draggable>
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
        fixed
        bottom-0
      "
    >
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-xl text-white font-bold">Click a video to play</p>
      </div>
    </div>
  );
}

export default VideoPlayer;
