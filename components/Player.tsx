"use client";

// import usePlayer from "@/hooks/usePlayer";
// import useGetSongByHref from "@/hooks/useGetSongByHref";

import { useEffect, useState } from "react";

import PlayerContent from "./PlayerContent";

const Player = () => {
  // const player = usePlayer();
  // const { song } = useGetSongByHref(player.activeId);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [shaka, setShaka] = useState(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      import('shaka-player/dist/shaka-player.ui.js')
        .then((shakaModule) => {
          setShaka(shakaModule);
          setIsLoading(false);
          // Initialize shaka-player here...
        })
        .catch((error) => {
          console.error('Error loading shaka-player:', error);
        });
    }
  }, [isClient]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <PlayerContent shaka={shaka} />
  );
}

export default Player;
