"use client"

import { MyVideoPlayerContextProvider } from "@/hooks/useVideoPlayer";
import VideoPlayerMemo from "@/components/VideoPlayerMemo";

interface VideoPlayerProviderProps {
  children: React.ReactNode;
}

const VideoPlayerProvider: React.FC<VideoPlayerProviderProps> = ({
  children
}) => {
  // return ( 
  //   <MyVideoPlayerContextProvider player={player}>
  //     {children}
  //   </MyVideoPlayerContextProvider>
  //  );
  const player = <VideoPlayerMemo />;

   return (
    <MyVideoPlayerContextProvider player={player}>
      {children}
    </MyVideoPlayerContextProvider>
  );
}

export default VideoPlayerProvider;