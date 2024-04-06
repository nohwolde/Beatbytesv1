// "use client";

import { useYoutubeProfile } from "@/hooks/useProfile";
import Profile from "@/components/Profile";

import YtProfile from "./components/YtProfile";

// export const revalidate = 0;

export const dynamic = 'force-dynamic';

const Yt = () => {

  return (
    <YtProfile />
    // <div 
    //   className="
    //     bg-neutral-900 
    //     rounded-lg 
    //     h-full 
    //     w-full 
    //     overflow-hidden 
    //     overflow-y-auto
    //   "
    // >
    //   <Profile platform="Youtube"/>
    // </div>
  );
}

export default Yt;