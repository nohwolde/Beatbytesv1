"use client";

import Profile from "@/components/Profile";
import { useSoundcloudProfile } from "@/hooks/useProfile";


const Sc = async () => {
  
  const profile = useSoundcloudProfile();

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
      <Profile profile={profile} platform="Soundcloud"/>
    </div>
  );
}

export default Sc;
