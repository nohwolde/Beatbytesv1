"use client";

import { useYoutubeProfile } from "@/hooks/useProfile";
import Profile from "@/components/Profile";

// export const revalidate = 0;

const Yt = () => {

  const profile = useYoutubeProfile();

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
      <Profile profile={profile} platform="Youtube"/>
    </div>
  );
}

export default Yt;