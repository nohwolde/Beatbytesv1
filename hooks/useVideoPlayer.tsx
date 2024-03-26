import { useEffect, useState, createContext, useContext } from 'react';
import VideoPlayerMemo from '@/components/VideoPlayerMemo';

export interface Props {
  player: JSX.Element;
  children: React.ReactNode;
  // [propName: string]: any;
}

export interface VideoPlayerContextType {
  videoPlayer: JSX.Element | null;
}

export const VideoPlayerContext = createContext<VideoPlayerContextType | undefined>(undefined);

export const MyVideoPlayerContextProvider = ({player, children}: Props) => {
  // const [videoPlayer, setVideoPlayer] = useState<JSX.Element | null>(null);

  // useEffect(() => {
  //   setVideoPlayer(player); // Create an instance of VideoPlayerMemo
  // }, []);

  const value = {
    videoPlayer: player
  }

  return (
    <VideoPlayerContext.Provider value={value}>
      {children}
    </VideoPlayerContext.Provider>
  );
};

export const useVideoPlayer = () => {
  const context = useContext(VideoPlayerContext);
  if (context === undefined) {
    throw new Error(`useUser must be used within a MyUserContextProvider.`);
  }
  return context;
};
