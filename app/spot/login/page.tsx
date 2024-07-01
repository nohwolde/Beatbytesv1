"use client";
import { useEffect, useState } from "react";

import { useSpotifyProfile } from "@/hooks/useProfile";
import Profile from "@/components/Profile";
import { postData } from "@/libs/helpers";

import { handleLogin } from "@/spotifyController/handleLogin";
import Input from "@/components/Input";
import useDebounce from "@/hooks/useDebounce";

import { getMyLibrary } from "@/spotifyController/spotController";




const Spot = () => {

  const [cookies, setCookies] = useState<string>('');

  const [value, setValue] = useState<string>('');
  const debouncedValue = useDebounce<string>(value, 500);

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

  useEffect(() => {
    if(cookies !== '') {
      const getLibrary = async () => {
        const library = await getMyLibrary(cookies);
        console.log(library);
      }
      getLibrary(); 
    }
  }, [cookies]);


  // useEffect(() => {
  //   if(debouncedValue !== '') setCookies(debouncedValue);
  //   // Iterate through each url and check if there is a song in the bb database with the same song_path
  // }, [debouncedValue]);

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
        <Input
          placeholder="Enter your spotify cookies here"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && value !== '' && setCookies(value)}
        />
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
            m-4
          "
          onClick={handleOpenLoginWindow}
        >
          Open Login Window
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

