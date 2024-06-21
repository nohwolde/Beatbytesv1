"use client";
import { useState } from "react";

import { useSpotifyProfile } from "@/hooks/useProfile";
import Profile from "@/components/Profile";
import { postData } from "@/libs/helpers";

import { handleLogin } from "@/spotifyController/handleLogin";



const Spot = () => {

  const [cookies, setCookies] = useState(null);

  const handleOpenLoginWindow = () => {
    window.open('https://accounts.spotify.com/en/login', '_blank');
  };

  const handleButtonClick = async () => {
    try {
      const { seleniumCookies, error } = await postData({
        url: '/api/handleLogin', 
        data: {login: true}
      });

      console.log(seleniumCookies);
      setCookies(seleniumCookies);

      // const cookies = await handleLogin();

      // console.log(cookies);

    } catch (error) {
      console.error('Error during automation:', error);
    }
  };

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
      <div 
        className="
          p-4 
          bg-neutral-800 
          rounded-lg 
          mt-4
        "
      >
        <h1
          className="
            text-gray-100
            text-3xl 
            font-semibold
            mb-4
          "
        >
          Spotify Cookie Grabber
        </h1>
        <button 
          className="
            bg-gradient-to-b 
            from-[#2B75FF] 
            to-[#2B75FF] 
            text-gray-100 
            text-lg 
            font-semibold 
            py-2 
            px-4 
            rounded-lg 
            mb-4
          "
          onClick={handleOpenLoginWindow}
        >
          Open Login Window
        </button>
        <button 
          className="
            bg-gradient-to-b 
            from-[#2B75FF] 
            to-[#2B75FF] 
            text-gray-100 
            text-lg 
            font-semibold 
            py-2 
            px-4 
            rounded-lg 
            mb-4
          "
          onClick={handleButtonClick}
        >
          Get Cookies
        </button>
        {cookies && (
          <div>
            <h2>Cookies:</h2>
            <pre>{JSON.stringify(cookies, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default Spot;

