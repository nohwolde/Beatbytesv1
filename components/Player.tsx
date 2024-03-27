"use client";

import usePlayer from "@/hooks/usePlayer";
import useGetSongByHref from "@/hooks/useGetSongByHref";

import PlayerContent from "./PlayerContent";

const Player = () => {
  const player = usePlayer();
  const { song } = useGetSongByHref(player.activeId);


  return (
    <PlayerContent song={song} songUrl={""}/>
  );
}

export default Player;
