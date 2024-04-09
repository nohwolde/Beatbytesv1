"use client";
import Image from "next/image";

import getLikedSongs from "@/actions/getLikedSongs";
import Header from "@/components/Header";

import PlaylistContent from "@/components/PlaylistContent";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSoundcloudProfile } from "@/hooks/useProfile";

// export const revalidate = 0;

export const dynamicParams = true;

const Playlist = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const { getPlaylist, playlists, username } = useSoundcloudProfile();
  const [playlistData, setPlaylistData] = useState(
    {
      name: "",
      image: "",
      songs: []
    }
  );

  useEffect(() => {
    console.log(playlists);
    const pData = getPlaylist(id as string);
    console.log(pData);
    setPlaylistData(pData);
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
      <Header>
        <div className="mt-20">
          <div 
            className="
              flex 
              flex-col 
              md:flex-row 
              items-center 
              gap-x-5
            "
          >
            <div className="relative h-32 w-32 lg:h-44 lg:w-44">
              <Image
                className="object-cover"
                fill
                src={playlistData?.image || "/images/liked.png"}
                alt="Playlist"
              />
            </div>
            <div className="flex flex-col gap-y-2 mt-4 md:mt-0">
              <p className="hidden md:block font-semibold text-sm">
                Playlist
              </p>
              <h1 
                className="
                  text-white 
                  text-4xl 
                  sm:text-5xl 
                  lg:text-7xl 
                  font-bold
                "
              >
                {playlistData?.name}
              </h1>
            </div>
          </div>
        </div>
      </Header>
      <PlaylistContent songs={playlistData?.songs} />
    </div>
  );
}

export default Playlist;
