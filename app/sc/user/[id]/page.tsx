"use client";

import React, { useEffect, useRef, useState } from 'react';
import Header from '@/components/Header';
import * as defaultBannerUrl from '@/public/images/banner2.jpg';
import { useParams } from 'next/navigation';
import { getSoundcloudUserById, getSoundcloudArtistRecentTracks, getSoundcloudArtistTopTracks, getSoundcloudImage, getSoundcloudArtistAlbums, getSoundcloudArtistPlaylists, fetchSoundcloud} from '@/soundcloudController/api-controller';
import { useKeyStore, usePlayerStore } from '@/app/store';
import { twMerge } from 'tailwind-merge';
import Image from 'next/image';
import showSong from '@/components/ScSong';

import SoundcloudPlaylist from "@/components/SoundcloudPlaylist";
import SoundcloudUser from "@/components/SoundcloudUser";
import MediaItem from '@/components/MediaItem';
import LikeButton from '@/components/LikeButton';



import { useRouter } from "next/navigation"

const UserProfile = () => {
  // stores

  const { scKey, setScKey } = useKeyStore();
  const { setCurrentTrack } = usePlayerStore();

  // router

  const router = useRouter();

  // states
  
  const [userData, setUserData] = useState({
    full_name: "",
    username: "",
    avatar_url: "",
    followers_count: 0,
    description: "",
    visuals: {
      visuals: [
        {
          visual_url: ""
        }
      ]
    }
  });
  const [recentTracks, setRecentTracks] = useState(null);
  const [popTracks, setPopTracks] = useState(null);
  const [highQualityProfileUrl, setHighQualityProfileUrl] = useState<string>("");
  const [playlists, setPlaylists] = useState(null);
  const [albums, setAlbums] = useState(null);
  const [reposts, setReposts] = useState(null);
  const [likes, setLikes] = useState(null);

  const [activeSection, setActiveSection] = useState('All');

  const sections = ['All', 'Popular tracks', 'Tracks', 'Albums', 'Playlists', 'Reposts'];



  const params = useParams();
  const id = params.id;

  const showSong = (song: any, onClick: () => void) => {
    return (
      <div 
        key={song.id} 
        // className="flex items-center gap-x-4 w-full"
      >
        <div 
        // className="flex-1 flex justify-between items-center gap-x-3 cursor-pointer hover:bg-neutral-800/50 w-full p-2 rounded-md"
        >
          <MediaItem
            data={song} 
            onClick={onClick}
          >
            <div className="items-end">
              <LikeButton songId={song.href} />
            </div>
          </MediaItem>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (scKey) {
      getSoundcloudUserById(id as string, scKey).then((data) => {
        console.log(data);
        setUserData(data.response);
        if (data.newKey) {
          if (data.newKey !== scKey) {
            console.log("Setting new key");
            setScKey(data.newKey);
          }
        }
      });
    }
  }, [scKey]);

  useEffect(() => {
    if (scKey) {
      getSoundcloudArtistRecentTracks(id as string, scKey).then((data) => {
        console.log(data);
        setRecentTracks(data.response);
      });
    }
  }, [scKey]);


  // get top tracks
  useEffect(() => {
    if (scKey) {
      getSoundcloudArtistTopTracks(id as string, scKey).then((data) => {
        console.log(data);
        setPopTracks(data.response);
      });
    }
  }, [scKey]);

  // get albums
  useEffect(() => {
    if (scKey) {
      getSoundcloudArtistAlbums(id as string, scKey).then((data) => {
        console.log(data);
        setAlbums(data.response);
      });
    }
  }, [scKey]);

  // get playlists
  useEffect(() => {
    if (scKey) {
      getSoundcloudArtistPlaylists(id as string, scKey).then((data) => {
        console.log(data);
        setPlaylists(data.response);
      });
    }
  }, [scKey]);

  // get reposts
  useEffect(() => {
    if (scKey) {
      getSoundcloudArtistPlaylists(id as string, scKey).then((data) => {
        console.log(data);
        setReposts(data.response);
      });
    }
  }, [scKey]);


  useEffect(() => {
    const fetchImage = async () => {
      if(userData?.avatar_url) {
        const url = await getSoundcloudImage(userData?.avatar_url);
        setHighQualityProfileUrl(url);
      }
    };
  
    fetchImage();
  }, [userData?.avatar_url]);

  const DisplayCollection = (results: any, setCollection: any) => {
    const sentinelRef = useRef(null);

    useEffect(() => {
      const observer = new IntersectionObserver(async (entries) => {
        if (entries[0].isIntersecting) {
          console.log("Intersecting");
          if(results?.next_href && scKey) {
            console.log("Getting Next Page");
            const newPage = await fetchSoundcloud(results?.next_href, 1, scKey);
            const nextPage = newPage.response
            console.log(nextPage);
  
            setCollection({...nextPage, collection: [...results.collection, ...nextPage.collection]});
          }
        }
      });
  
      if (sentinelRef.current) {
        observer.observe(sentinelRef.current);
      }
  
      return () => {
        if (sentinelRef.current) {
          observer.unobserve(sentinelRef.current);
        }
      };
    }, [sentinelRef, results, scKey]);
    
    return (
    <div>
      {results && results.collection?.map((item: any) => {
        if(item.kind === 'track') {
          return (
            showSong({id: item.id,
              artists: [item.user],
              name: item.title,
              href: item.permalink_url,
              image_path: item.artwork_url,
              waveform_url: item.waveform_url,
              track_authorization: item.track_authorization,
              likes_count: item.likes_count,
              media: item.media,
              platform: "Soundcloud"
            }
            ,() => {
              // router.push(`/sc/track/${item.id}`); 
              setCurrentTrack({...item, platform: "Soundcloud"});
            })
          )
        }
        else if (item.kind === 'playlist') {
          return (
            <SoundcloudPlaylist
              key={item.id}
              data={{
                id: item.id, 
                name: item.title, 
                href: item.permalink_url,
                image_path: item.artwork_url,
                description: item.description || "",
                tracks: item.tracks, 
                track_count: item.track_count,
                likes_count: item.likes_count,
                duration: item.duration,
                display_date: item.display_date,
                is_album: item.is_album || false,
                user: item.user,
                platform: "Soundcloud"
              }}
              onClick={() => {
                router.push(`/sc/playlist/${item.id}`)
              }}
            />
          )
        }
        else if (item.kind === 'user') {
          return (
            <SoundcloudUser
              key={item.id}
              data={
                {
                  id: item.id,
                  username: item.username,
                  name: item.full_name,
                  description: item.description,
                  track_count: item.track_count,
                  followers_count: item.followers_count,
                  permalink: item.permalink,
                  verified: item.verified,
                  image_path: item.avatar_url,
                  visuals: item.visuals,
                  platform: "Soundcloud"
                }
              }
              onClick={
                () => {
                  router.push(`/sc/user/${item.id}`)
                }
              }
            />
          )
        }})}
        <div ref={sentinelRef}></div>
      </div>
      )
  }

  const All = () => {
    return (
      <div>
        {DisplayCollection(recentTracks, setRecentTracks)}
      </div>
    );
  };

  const PopularTracks = () => {
    return (
      <div>
        {DisplayCollection(popTracks, setPopTracks)}
      </div>
    );
  };

  const Tracks = () => {
    return (
      <div>
        {DisplayCollection(recentTracks, setRecentTracks)}
      </div>
    );
  };

  const Albums = () => {
    return (
      <div>
        {DisplayCollection(albums, setAlbums)}
      </div>
    );
  };

  const Playlists = () => {
    return (
      <div>
        {DisplayCollection(playlists, setPlaylists)}
      </div>
    );
  };

  const Reposts = () => {
    return (
      <div>
        {DisplayCollection(reposts, setReposts)}
      </div>
    );
  };
  

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
        bg-neutral-900
        rounded-lg 
        h-full 
        w-full 
        overflow-hidden 
        overflow-y-auto
      "
    >
      <Header
        className={twMerge(`
          bg-gradient-to-b 
          from-blue-900
          to-b
          `
        )}>
        <div className="rounded-md h-64 relative">
          <Image src={userData?.visuals?.visuals[0]?.visual_url || defaultBannerUrl} alt="Banner" layout="fill" objectFit="cover" className="inset-0 backdrop-blur-md rounded-md max-h-[250px]" />
          <div className="flex justify-center items-center mt-4 absolute ">
            <img className="w-48 h-48 rounded-full" src={highQualityProfileUrl || userData?.avatar_url} alt={userData?.username} />
            <div className="ml-4">
              <h2 className="text-2xl font-bold">{userData?.full_name}</h2>
              <p className="text-gray-500">@{userData?.username}</p>
            </div>
          </div>
        </div>
      </Header>
      <div className="flex flex-col md:flex-col">
        <div className="flex md:w-full md:sticky md:top-0 bg-neutral-900 justify-center items-center">
          {sections.map(section => (
            <button
              key={section}
              className={`p-4 ${activeSection === section ? 'text-white text-2xl' : 'text-md text-gray-500 hover:text-xl hover:text-gray-400'}`}
              onClick={() => setActiveSection(section)}
            >
              {section}
            </button>
          ))}
        </div>
        <div className="md:w-full p-4 ">
          {activeSection === 'All' && <All />}
          {activeSection === 'Popular tracks' && <PopularTracks />}
          {activeSection === 'Tracks' && <Tracks />}
          {activeSection === 'Albums' && <Albums />}
          {activeSection === 'Playlists' && <Playlists />}
          {activeSection === 'Reposts' && <Reposts />}
        </div>
      </div>
      {/* <div className="
        container 
        mx-auto 
        px-4 
        flex 
        flex-col 
        md:flex-row 
        items-center 
        gap-x-5">
        <div className="flex justify-center items-center mt-4">
          <img className="w-48 h-48 rounded-full" src={userData?.avatar_url} alt={userData?.username} />
          <div className="ml-4">
            <h2 className="text-2xl font-bold">{userData?.full_name}</h2>
            <p className="text-gray-500">@{userData?.username}</p>
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-xl font-bold">About</h3>
          <p>{userData?.description}</p>
        </div>
        <div className="mt-4">
          <h3 className="text-xl font-bold">Location</h3>
          <p>{userData?.city}, {userData?.country_code}</p>
        </div>
        <div className="mt-4">
          <h3 className="text-xl font-bold">Stats</h3>
          <p>Followers: {userData?.followers_count}</p>
          <p>Following: {userData?.followings_count}</p>
          <p>Tracks: {userData?.track_count}</p>
        </div>
      </div> 
      */}
    </div>
  </div>
  );
};

export default UserProfile;