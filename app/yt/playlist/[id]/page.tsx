// "use client";
// import Image from "next/image";

// import Header from "@/components/Header";

// import  PlaylistContent from "@/components/PlaylistContent";
// import { useParams } from "next/navigation";
// import { useEffect, useState } from "react";
// import PlayButton from "@/components/PlayButton";
// import { usePlayerStore, useProfileStore } from "@/app/store";
// import { useRouter } from "next/navigation";
// import { FaPlay } from "react-icons/fa";
// import { twMerge } from "tailwind-merge";
// import shuffle from "@/public/images/shuffle.svg";

// import playlistImage from "@/public/images/playlist.jpeg";

import YtPlaylist from "../../components/YtPlaylist";

// export const revalidate = 0;

export const dynamic = 'force-dynamic';

const Playlist = () => {
  // const params = useParams();
  // const id = params.id;
  // const router = useRouter();

  // const { setCurrentTrack, setCurrentPlaylist, isShuffled, setIsShuffled, shufflePlaylist, setUnshuffledPlaylist} = usePlayerStore();

  // const { getYtPlaylist } = useProfileStore();

  // const [playlistData, setPlaylistData] = useState(
  //   {
  //     name: "",
  //     image: playlistImage,
  //     songs: []
  //   }
  // );

  // useEffect(() => {
  //   const pData = getYtPlaylist(id as string);
  //   console.log(pData);
  //   if(pData) {
  //     setPlaylistData(pData);
  //   }
  // }, []);


  // const getSongData = (song: any) => {
  //   return song.platform === "Youtube" ?
  //   {
  //     id: song?.id,
  //     author: song?.author,
  //     title: {text: song?.name}, 
  //     thumbnails: [{url: song?.image}], 
  //     platform: "Youtube"
  //   }
  //   : song.platform === "Spotify" ?
  //   {
  //     id: song.yt?.id,
  //     author: song.yt?.author,
  //     title: {text: song.yt?.name}, 
  //     thumbnails: [{url: song.yt?.image}], 
  //     platform: "Youtube"
  //   }
  //   : // Soundcloud
  //   {
  //     id: song.id,
  //     user: [song.author],
  //     title: song.name,
  //     href: song.id,
  //     artwork_url: song.image,
  //     isExplicit: song.isExplicit || false,
  //     platform: "Soundcloud",
  //     track_authorization: song.media?.track_authorization, 
  //     media: song.media
  //   }
  // }

  
  // const playPlaylist = () => {
  //   console.log("Playing playlist");
  //   if(playlistData === null || playlistData?.songs.length === 0) return;
  //   else {
  //     if(isShuffled) {
  //       const copyOfPlaylistData = playlistData.songs?.slice();
  //       const notShuffled = copyOfPlaylistData;
  //       const shuffled = notShuffled.sort(() => 0.5 - Math.random());
  //       const song = shuffled[0];
  //       console.log(song);

  //       const songData = getSongData(song);

  //       setCurrentTrack(songData);

  //       setCurrentPlaylist({...playlistData, songs: [...shuffled.slice(1).map((song) => 
  //         getSongData(song)
  //       ), songData]})
  //     }
  //     else {
  //       console.log("Playing", playlistData);
  //       const song = playlistData?.songs[0];
  //       console.log(song);
  //       // think we need to change the song object up to match the yt object

  //       const songData = getSongData(song);
  //       setCurrentTrack(songData);
  //       setCurrentPlaylist(
  //         {...playlistData, 
  //           songs: [...playlistData?.songs.slice(1).map(
  //             (song: any) => getSongData(song)
  //           ), songData]})
  //     }
  //   }
  // }



  return (
    <YtPlaylist />
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
    //   <Header
    //     className={twMerge(`
    //     bg-gradient-to-b 
    //     from-indigo-700
    //     to-b
    //     `
    //   )}
      
    //   >
    //     <div className="mt-20">
    //       <div 
    //         className="
    //           flex 
    //           flex-col 
    //           md:flex-row 
    //           items-center 
    //           gap-x-5
    //         "
    //       >
    //         <div className="relative h-32 w-32 lg:h-44 lg:w-44">
    //           <Image
    //             className="object-cover"
    //             fill
    //             src={playlistData?.image || "/images/liked.png"}
    //             alt="Playlist"
    //           />
    //         </div>
    //         <div className="flex flex-col gap-y-2 mt-4 md:mt-0">
    //           <p className="hidden md:block font-semibold text-sm">
    //             Playlist
    //           </p>
    //           <h1  
    //             className="
    //               text-white 
    //               text-4xl 
    //               sm:text-5xl 
    //               lg:text-7xl 
    //               font-bold
    //             "
    //           >
    //             {playlistData?.name}
    //           </h1>
    //         </div>
    //       </div>
    //       <div className="mt-5
    //           flex 
    //           flex-col 
    //           md:flex-row ">
    //       <div className="gap-y-2 mt-4 items-center justify-center">
    //         <div className="
    //           transition 
    //           opacity-100 
    //           rounded-full 
    //           inline-flex
    //           items-center 
    //           justify-center 
    //           bg-green-600
    //           p-6 
    //           drop-shadow-md 
    //           translate
    //           translate-y-1/4
    //           group-hover:opacity-100 
    //           group-hover:translate-y-0
    //           hover:scale-110
    //         "
    //           onClick={() => playPlaylist()}
    //         >
    //           <FaPlay className="text-3xl text-white" size={25} />
    //         </div>
    //         <div className="
    //           transition 
    //           opacity-100 
    //           inline-flex
    //           items-center 
    //           justify-center 
    //           p-6 
    //           drop-shadow-md 
    //           translate
    //           translate-y-1/3
    //           group-hover:translate-y-0
    //           hover:scale-110
    //         "
    //           onClick={() => setIsShuffled(!isShuffled)}
    //         >
    //           <Image
    //             src={shuffle}
    //             style={isShuffled?  { filter: ' invert(50%) sepia(52%) saturate(2434%) hue-rotate(224deg) brightness(114%) contrast(101%)'} : { filter: 'invert(70%)' }}
    //             alt="Shuffle"
    //             width={60}
    //             height={60}
    //           />
    //         </div>
    //       </div>
    //       </div>
    //     </div>
    //   </Header>
    //   {playlistData !== null && <PlaylistContent songs={playlistData?.songs?.map((song:any) => {return({...song, image_path: song.image})})} />}
    // </div>
  );
}

export default Playlist;
