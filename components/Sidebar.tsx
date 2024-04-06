"use client";

import { HiHome } from "react-icons/hi";
import { BiSearch } from "react-icons/bi";
import { twMerge } from "tailwind-merge";
import { usePathname } from "next/navigation";

import { Song } from "@/types";
import usePlayer from "@/hooks/usePlayer";

import SidebarItem from "./SidebarItem";
import Box from "./Box";
import Library from "./Library";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSpotifyProfile, useSoundcloudProfile, useYoutubeProfile } from "@/hooks/useProfile";
import VideoPlayer from "./VideoPlayer";

import { useProfileStore } from "@/app/store";

interface SidebarProps {
  children: React.ReactNode;
}

const Sidebar = ({ children }: SidebarProps) => {
  const pathname = usePathname();
  const player = usePlayer();

  const { spotPlaylists, ytPlaylists, scPlaylists } = useProfileStore();

  // const { playlists: spotPlaylists } = useSpotifyProfile();
  // const { playlists: ytPlaylists } = useYoutubeProfile();
  // const { playlists: scPlaylists } = useSoundcloudProfile();

  const routes = useMemo(() => [
    {
      icon: HiHome,
      label: 'Home',
      active: pathname !== '/search',
      href: '/'
    },
    {
      icon: BiSearch,
      label: 'Search',
      href: '/search',
      active: pathname === '/search'
    },
  ], [pathname]);

  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  return (
    <div
      className={twMerge((pathname.startsWith("/watch")) ?
        `
        flex
        h-[calc(100%-80px)]
        `
        :
      `
        flex
        h-[calc(100%-80px)]
        w-full
        `
      )}
    >
      {/* <button onClick={() => setIsSidebarVisible(!isSidebarVisible)}>
        {isSidebarVisible ? 'Hide Sidebar' : 'Show Sidebar'}
      </button> */}
      {isSidebarVisible && (
        <div 
          className="
            hidden 
            md:flex 
            flex-col 
            gap-y-2 
            bg-black 
            h-full 
            w-[300px] 
            p-2
          "
        >
          <Box>
            <div className="flex flex-col gap-y-4 px-5 py-4">
              {/* {routes.map((item) => (
                <SidebarItem key={item.label} {...item} />
              ))} */}
              <SidebarItem name="home" label="Home" href="/" active={pathname === '/'}/>
              <SidebarItem name="search" label="Search" href='/search' active={pathname === '/search'}/>
            </div>
          </Box>
          <Box className="overflow-y-auto h-full">
            <Library spotify={spotPlaylists || []} soundcloud={scPlaylists || []} youtube={ytPlaylists || []}/>
          </Box>
        </div>
      )}

    {/* <div className=""> */}
    {!(pathname.startsWith("/watch")) &&
      <main className="h-full w-full flex-1 overflow-y-auto py-2">
        {children}
      </main>
    }
      {/* {!(pathname.startsWith("/watch")) && videoPlayer && videoPlayer} */}
    </div>
  );
}
 
export default Sidebar;
