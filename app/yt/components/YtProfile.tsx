"use client";

import Profile from "@/components/Profile";

// export const revalidate = 0;

// export const dynamic = 'force-dynamic';

const YtProfile = () => {

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
      <Profile platform="Youtube"/>
    </div>
  );
}

export default YtProfile;