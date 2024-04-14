"use client";
import Image from "next/image";

import getLikedSongs from "@/actions/getLikedSongs";
import Header from "@/components/Header";

import PlaylistContent from "@/components/PlaylistContent";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSoundcloudProfile } from "@/hooks/useProfile";
import { getSoundcloudPlaylist, getSoundcloudImage } from "@/soundcloudController/api-controller";
import { useKeyStore, usePlayerStore, useProfileStore} from "@/app/store";
import { useRouter } from "next/navigation";
import MediaItem from "@/components/MediaItem";
import LikeButton from "@/components/LikeButton";
import showSong from "@/components/ScSong";


import PlayNext from "@/public/images/play-next.svg";
import PlayLast from "@/public/images/play-last.svg";
import { FaPlay } from "react-icons/fa";
import { twMerge } from "tailwind-merge";

import playlistImage from "@/public/images/playlist.jpeg";
import shuffle from "@/public/images/shuffle.svg";

export const revalidate = 0;

const Playlist = () => {
  const params = useParams();
  const id = params.id;
  const { scKey, setScKey } = useKeyStore();
  const { setCurrentTrack, addToFront, addToQueue, setCurrentPlaylist, isShuffled, setIsShuffled, shufflePlaylist, setUnshuffledPlaylist} = usePlayerStore();
  const router = useRouter();

  const { getScPlaylist } = useProfileStore();
  const [playlistData, setPlaylistData] = useState(
    {
      name: "",
      title: "",
      image: "",
      artwork_url: "",
      songs: [{image: ""}], 
      tracks: [{artwork_url: ""}]
    }
  );
  const [highQualityArtworkUrl, setHighQualityArtworkUrl] = useState<string>("");
  const [isUserPlaylist, setIsUserPlaylist] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
    const pData = await getScPlaylist(id as string);
    console.log(pData);
    if(pData !== undefined) { 
      setPlaylistData(pData);
    }
    else {
      setIsUserPlaylist(false);
      if(scKey) {
        const playlist = await getSoundcloudPlaylist(id as string, scKey);
        console.log(playlist);
        setPlaylistData(playlist);
      }
    }
  }
  fetchData();
  }, [scKey]);

  const getSongData = (song: any) => {
    return song.platform === "Youtube" ?
    {
      id: song?.id,
      author: song?.author,
      title: {text: song?.name}, 
      thumbnails: [{url: song?.image}], 
      platform: "Youtube"
    }
    : song.platform === "Spotify" ?
    {
      id: song.yt?.id,
      author: song.yt?.author,
      title: {text: song.yt?.name}, 
      thumbnails: [{url: song.yt?.image}], 
      platform: "Youtube"
    }
    : // Soundcloud
    {
      id: song.id,
      user: [song.author],
      title: song.name,
      href: song.id,
      artwork_url: song.image,
      isExplicit: song.isExplicit || false,
      platform: "Soundcloud",
      track_authorization: song.media?.track_authorization, 
      media: song.media
    }
  }

  const playPlaylist = () => {
    if(isUserPlaylist) {
      if(isShuffled) {
        const copyOfPlaylistData = playlistData.songs?.slice();
        const notShuffled = copyOfPlaylistData;
        const shuffled = notShuffled.sort(() => 0.5 - Math.random());
        const songData = getSongData(shuffled[0]);
        console.log(songData);
        setCurrentTrack(songData);
        setCurrentPlaylist({...playlistData, songs: [...shuffled.slice(1).map((song) => 
          getSongData(song)
        ), songData]})
      }
      else {
        console.log("Playing", playlistData);
        const song = playlistData?.songs[0];
        console.log(song);
        setCurrentTrack(getSongData(song));
        setCurrentPlaylist(
          {...playlistData, songs: [...playlistData?.songs.slice(1).map((song) => 
            getSongData(song)
          ), getSongData(song)]})
      }
    }
    else {
      if(isShuffled) {
        const copyOfPlaylistData = playlistData.tracks?.slice();
        const notShuffled = copyOfPlaylistData;
        const shuffled = notShuffled.sort(() => 0.5 - Math.random());
        console.log(shuffled[0]);
        setCurrentTrack({...shuffled[0], platform: "Soundcloud"});
        setCurrentPlaylist({...playlistData, songs: [...shuffled.slice(1).map((scSong: any) => {return{...scSong, platform: "Soundcloud" }}), {...shuffled[0], platform: "Soundcloud"}]})
      }
      else {
        setCurrentTrack({...playlistData?.tracks[0], platform: "Soundcloud"});
        console.log("Playing", playlistData);
        setCurrentPlaylist({...playlistData, songs: [...playlistData?.tracks.slice(1).map((scSong: any) => {return{...scSong, platform: "Soundcloud" }}), {...playlistData?.tracks[0], platform: "Soundcloud"}]})
      }
    }
  }

  useEffect(() => {
    const fetchImage = async () => {
      if(playlistData?.image) {
        const url = await getSoundcloudImage(playlistData?.image);
        setHighQualityArtworkUrl(url);
      }
      else if (playlistData?.tracks) {
        const url = await getSoundcloudImage(playlistData?.tracks[0].artwork_url);
        setHighQualityArtworkUrl(url);
      }
    };
  
    fetchImage();
  }, [playlistData?.image, playlistData?.tracks]);

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
      <Header
        className={twMerge(`
        bg-gradient-to-b 
        from-indigo-700
        to-b
        `
      )}
      >
        <div className="mt-20">
          <div 
            className="
              flex 
              flex-col 
              md:flex-row 
              items-center 
              gap-x-5
            "
          >
            <div className="relative h-48 w-48 lg:h-56 lg:w-56">
              <Image
                className="object-cover"
                fill
                src={isUserPlaylist? playlistData?.image : highQualityArtworkUrl? highQualityArtworkUrl : playlistData?.artwork_url? playlistData.artwork_url : playlistData?.tracks? playlistData?.tracks[0]?.artwork_url : playlistImage}
                alt="Playlist"
              />
            </div>
            <div className="flex flex-col gap-y-2 mt-4 md:mt-0">
              <p className="hidden md:block font-semibold text-sm">
                Playlist
              </p>
              <h1 
                className="
                  text-white 
                  text-4xl 
                  sm:text-5xl 
                  lg:text-7xl 
                  font-bold
                "
              >
                {isUserPlaylist? playlistData?.name :  playlistData?.title}
              </h1>
            </div>
          </div>
          <div className="items-center justify-center gap-x-4 mt-4">
            <div className="
              transition 
              opacity-100 
              rounded-full 
              inline-flex
              items-center 
              justify-center 
              bg-orange-600
              p-6 
              drop-shadow-md 
              translate
              translate-y-1/4
              group-hover:opacity-100 
              group-hover:translate-y-0
              hover:scale-110
            "
              onClick={() => playPlaylist()}
            >
              <FaPlay className="text-3xl text-white" size={25} />
            </div>
            <div className="
              transition 
              opacity-100 
              inline-flex
              items-center 
              justify-center 
              p-6 
              drop-shadow-md 
              translate
              translate-y-1/3
              group-hover:translate-y-0
              hover:scale-110
            "
              onClick={() => setIsShuffled(!isShuffled)}
            >
              <Image
                src={shuffle}
                style={isShuffled?  { filter: ' invert(50%) sepia(52%) saturate(2434%) hue-rotate(224deg) brightness(114%) contrast(101%)'} : { filter: 'invert(70%)' }}
                alt="Shuffle"
                width={60}
                height={60}
              />
            </div>
          </div>
        </div>
      </Header>
      {isUserPlaylist && <PlaylistContent songs={playlistData?.songs} />}
      {!isUserPlaylist && 
        <div className="flex flex-col gap-y-2 w-full p-6">
          {playlistData?.tracks?.map((song: any) => (
            <div 
              key={song.id} 
              className="flex-1 items-center gap-x-4 w-full"
            >
              {showSong(song, () => setCurrentTrack({...song, platform: "Soundcloud"
              }))}
            </div>
          ))}
        </div>
      }
    </div>
  );
}

export default Playlist;
