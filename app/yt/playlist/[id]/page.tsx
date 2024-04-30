"use client";
import Image from "next/image";

import Header from "@/components/Header";

import  PlaylistContent from "@/components/PlaylistContent";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import PlayButton from "@/components/PlayButton";
import { usePlayerStore, useProfileStore } from "@/app/store";
import { useRouter } from "next/navigation";
import { FaPlay } from "react-icons/fa";
import { twMerge } from "tailwind-merge";
import shuffle from "@/public/images/shuffle.svg";

import playlistImage from "@/public/images/playlist.jpeg";

import { getPlaylistTracks } from "@/actions/useInnertube";
import YoutubeSong from "@/components/YoutubeSong";

const Playlist = () => {
  const params = useParams();
  const id = params.id;
  const router = useRouter();

  const { setCurrentTrack, setCurrentPlaylist, isShuffled, setIsShuffled, shufflePlaylist, setUnshuffledPlaylist} = usePlayerStore();

  const { getYtPlaylist } = useProfileStore();

  const [playlistData, setPlaylistData] = useState(
    {
      name: "",
      image: playlistImage,
      songs: [], 
      tracks: [], 
      info: {
        title: "", 
        author: {
          id, 
          name: "",
          thumbnails: [{url: ""}]
        },
        description: "",
        thumbnails: [{url: ""}]


      }
    }
  );

    const [isUserPlaylist, setIsUserPlaylist] = useState(true);

  useEffect(() => {
    const pData = getYtPlaylist(id as string);
    console.log(pData);
    if(pData !== undefined) {
      setPlaylistData(pData);
    }
    else {
      setIsUserPlaylist(false);
      const fetchData = async () => {
        const ytList = await getPlaylistTracks(id as string)
        console.log(ytList);
        if(ytList !== undefined) {
          setPlaylistData(ytList);
        }
      }
      fetchData();

    }
  }, []);


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

  const getYoutubeSongData = (song: any) => {
    return {
      id: song?.id,
      author: song?.author,
      title: {text: song?.title?.text},
      thumbnails: song?.thumbnails, 
      platform: "Youtube"
    }
  }

  
  const playPlaylist = () => {
    console.log("Playing playlist");
    if(playlistData === null || playlistData?.songs?.length === 0 && playlistData?.tracks?.length === 0) return;
    else {
      if(isUserPlaylist) {
        if(isShuffled) {
          const copyOfPlaylistData = playlistData.songs?.slice();
          const notShuffled = copyOfPlaylistData;
          const shuffled = notShuffled.sort(() => 0.5 - Math.random());
          const song = shuffled[0];
          console.log(song);

          const songData = getSongData(song);

          setCurrentTrack(songData);

          setCurrentPlaylist({...playlistData, songs: [...shuffled.slice(1).map((song) => 
            getSongData(song)
          ), songData]})
        }
        else {
          console.log("Playing", playlistData);
          const song = playlistData?.songs[0];
          console.log(song);
          // think we need to change the song object up to match the yt object

          const songData = getSongData(song);
          setCurrentTrack(songData);
          setCurrentPlaylist(
            {...playlistData, 
              songs: [...playlistData?.songs.slice(1).map(
                (song: any) => getSongData(song)
              ), songData]})
        }
      }
      else {
        if(isShuffled) {
          const copyOfPlaylistData = playlistData.tracks?.slice();
          const notShuffled = copyOfPlaylistData;
          const shuffled = notShuffled.sort(() => 0.5 - Math.random());
          const song = shuffled[0];
          console.log(song);

          const songData = getYoutubeSongData(song);

          setCurrentTrack(songData);

          setCurrentPlaylist({...playlistData, songs: [...shuffled.slice(1).map((song) => 
            getYoutubeSongData(song)
          ), songData]})
        }
        else {
          console.log("Playing", playlistData);
          const song = playlistData?.tracks[0];
          console.log(song);
          // think we need to change the song object up to match the yt object

          const songData = getYoutubeSongData(song);
          setCurrentTrack(songData);
          setCurrentPlaylist(
            {...playlistData, 
              songs: [...playlistData?.tracks.slice(1).map(
                (song: any) => getYoutubeSongData(song)
              ), songData]})
        }
      }
    }
  }



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
            <div className="relative h-32 w-32 lg:h-64 lg:w-64">

              {isUserPlaylist &&
                <Image
                  className="object-cover"
                  fill
                  src={playlistData?.image || "/images/liked.png"}
                  alt="Playlist"
                />
              }
              {!isUserPlaylist &&
                <Image
                  className="object-cover"
                  fill
                  src={playlistData?.info?.thumbnails[0]?.url || "/images/liked.png"}
                  alt="Playlist"
                />
              }
            </div>
            <div className="flex flex-col gap-y-2 mt-4 md:mt-0">
              <p className="hidden md:block font-semibold text-sm">
                Playlist
              </p>
              {(isUserPlaylist) &&
                <h1  
                  className="
                    text-white 
                    text-4xl 
                    sm:text-5xl 
                    lg:text-7xl 
                    font-bold
                  "
                >
                  {playlistData?.name}
                </h1>
              }
              {(!isUserPlaylist) &&
                <h1  
                  className="
                    text-white 
                    text-4xl 
                    sm:text-5xl 
                    lg:text-7xl 
                    font-bold
                  "
                >
                  {playlistData?.info?.title}
                </h1>
              }
            </div>
          </div>
          <div className="mt-5
              flex 
              flex-col 
              md:flex-row ">
          <div className="gap-y-2 mt-4 items-center justify-center">
            <div className="
              transition 
              opacity-100 
              rounded-full 
              inline-flex
              items-center 
              justify-center 
              bg-green-600
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
        </div>
      </Header>
    
      {isUserPlaylist && playlistData !== null && <PlaylistContent songs={playlistData?.songs?.map((song:any) => {return({...song, image_path: song.image})})} />}
      {!isUserPlaylist && 
        <div className="flex flex-col gap-y-2 w-full p-6">
          {playlistData?.tracks?.map((song: any) => (
            <YoutubeSong
              key={song.id} 
                song={{
                  id: song.id,
                  author: song.author,
                  name: song.title.text,
                  href: song.id,
                  image_path: song.thumbnails[0]?.url,
                  views: "0 views",
                  platform: "Youtube",
                }}
                onPlay={() => {
                    router.push('/watch/' + song.id);
                    setCurrentTrack({
                      id: song.id,
                      author: song.author,
                      title: {text: song.title.text},
                      thumbnails: song.thumbnails, 
                      platform: "Youtube"
                    });
                  }
                }
            />
          ))}
        </div>
      }
    </div>
  );
}

export default Playlist;
