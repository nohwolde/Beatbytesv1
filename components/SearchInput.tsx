"use client";

import Image from "next/image";
import qs from "query-string";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useSearch, Platform} from "@/hooks/useSearch";

import useDebounce from "@/hooks/useDebounce";

import Input from "./Input";

const SearchInput = () => {
  const router = useRouter();
  const [value, setValue] = useState<string>('');
  const debouncedValue = useDebounce<string>(value, 500);

  const { 
    searchTerm,
    setSearchTerm,
    searchResults,
    isLoading,
    getNextPage,
    searchPage,
    platform,
    setPlatform
  } = useSearch();

  // logo paths
  const spotifyLogoPath = platform === Platform.Spotify ? '/images/logos/spot.svg' : '/images/logos/spotDark.svg';
  const ytLogoPath = platform === Platform.Youtube ? '/images/logos/yt.svg' : '/images/logos/ytDark.svg';
  const scLogoPath = platform === Platform.Soundcloud ? '/images/logos/soundcloud.png' : '/images/logos/soundcloudDark.png';

  useEffect(() => {
    const query = {
      title: debouncedValue,
    };
    
    const url = qs.stringifyUrl({
      url: '/search',
      query
    });

    router.push(url);
  }, [debouncedValue, router]);

  useEffect(() => {
    if(debouncedValue !== '') setSearchTerm(debouncedValue);
    // Iterate through each url and check if there is a song in the bb database with the same song_path
  }, [debouncedValue, router]);

  return (
    <div className="mb-2 flex flex-row gap-x-2 gap-y-6 bg-cyan-900 rounded-md justify-between items-center p-1">
      <Input
        placeholder="What do you want to listen to?"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && value !== '' && setSearchTerm(value)}
      />
      {/* <Image
        src={spotifyLogoPath}
        width={30}
        height={30}
        alt='Spotify'
        onClick={() => setPlatform(Platform.Spotify)}
        className="cursor-pointer"
      /> */}
      <Image
        src={ytLogoPath}
        width={45}
        height={45}
        alt='Youtube'
        onClick={() => setPlatform(Platform.Youtube)}
        className="cursor-pointer"
      />
      <Image
        src={scLogoPath}
        width={40}
        height={40}
        alt='Soundcloud'
        onClick={() => setPlatform(Platform.Soundcloud)} 
        className="cursor-pointer mr-1"
      />
    </div>
  );
}
 
export default SearchInput;