"use client";

import Image from "next/image";

import { Song } from "@/types";
import usePlayer from "@/hooks/usePlayer";

interface SoundcloudPlaylistProps {
  data: any;
  onClick?: (id: string) => void;
}

const SoundcloudPlaylist: React.FC<SoundcloudPlaylistProps> = ({
  data,
  onClick,
}) => {
  const player = usePlayer();

  const handleClick = () => {
    if (onClick) {
      return onClick(data.id);
    }
  
    return player.setId(data.id);
  };

  return (
    <div
      onClick={handleClick}
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
          relative 
          rounded-md 
          min-h-[80px] 
          min-w-[80px] 
          overflow-hidden
        "
      >
        <Image
          fill
          src={data.image_path || "/images/music-placeholder.png"}
          alt="MediaItem"
          className="object-cover"
        />
      </div>
      {/* <div className="flex flex-col gap-y-1 overflow-hidden">
        <p className="text-white truncate">{data.name}</p>
        <p className="text-neutral-400 text-sm truncate">
          {data.artists.map((artist: any) => artist.username).join(", ")}
        </p>
      </div> */}
      <div className="flex-col gap-y-1 overflow-hidden">
          <p className="text-white text-md truncate">
            {data.name}
          </p>
          <div className="flex gap-x-2 overflow-hidden items-center">
            <p className="text-neutral-400 text-sm truncate">
              {data.user.username}
            </p>
          </div>
          <div className='my-2'>
            {data.tracks?.slice(0, 3).map((song: any) => {
              return (
                <div
                  className="          
                  flex 
                  items-center 
                  gap-x-3 
                  cursor-pointer 
                  hover:bg-neutral-800/50 
                  w-full 
                  p-2 
                  "
                  key={song.id}
                >
                  <div 
                    className="
                      relative 
                      rounded-md 
                      min-h-[48px] 
                      min-w-[48px] 
                      overflow-hidden
                    "
                  >
                    <Image
                      fill
                      src={song.artwork_url || "/images/music-placeholder.png"}
                      alt="MediaItem"
                      className="object-cover"
                    />
                  </div>
                  <p key={song.id} className="text-white text-sm truncate">
                    {song.title}
                  </p>
                </div>
              )
            }
            )}
          </div>
          <p className="text-neutral-400 text-sm truncate">
            VIEW FULL PLAYLIST
          </p>
        </div>
    </div>
  );
}
 
export default SoundcloudPlaylist;
