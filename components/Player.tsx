"use client";

import usePlayer from "@/hooks/usePlayer";
import useLoadSongUrl from "@/hooks/useLoadSongUrl";
import useGetSongByHref from "@/hooks/useGetSongByHref";

import PlayerContent from "./PlayerContent";

const Player = () => {
  const player = usePlayer();
  const { song } = useGetSongByHref(player.activeId);

  const songUrl = useLoadSongUrl(song!);

  return (
    <PlayerContent song={song} songUrl={songUrl}/>
  );
}

export default Player;
