"use client";

import Profile from "@/components/Profile";
import { useSoundcloudProfile } from "@/hooks/useProfile";

// export const revalidate = 0;

// export const dynamic = 'force-dynamic';

const Sc = () => {

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
      <Profile platform="Soundcloud"/>
    </div>
  );
}

export default Sc;
