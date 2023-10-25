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
    <div 
      className="
        fixed
        bottom-0 
        bg-black 
        w-full 
        py-2 
        h-[80px] 
        px-4
      "
    >
      <PlayerContent song={song} songUrl={songUrl}/>
    </div>
  );
}

export default Player;
