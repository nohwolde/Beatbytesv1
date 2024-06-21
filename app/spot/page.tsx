"use client";

import { useSpotifyProfile } from "@/hooks/useProfile";
import Profile from "@/components/Profile";

const Spot = () => {

  const profile = useSpotifyProfile();

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
      <Profile profile={profile} platform="Spotify"/>
    </div>
  );
}

export default Spot;