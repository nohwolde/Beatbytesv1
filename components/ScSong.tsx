import React from "react";
import { useRouter } from "next/navigation";
import MediaItem from "./MediaItem";
import LikeButton from "./LikeButton";
import { usePlayerStore } from "@/app/store";
import Image from "next/image";
import PlayNext from "@/public/images/play-next.svg";
import PlayLast from "@/public/images/play-last.svg";

import expand from "@/public/images/expand.svg";

import useSongModal from "@/hooks/useSongModal";
import AddSongButton from "./AddSongButton";

const ScSong = (song, onClick, children?) => {

  // const { onOpen, onClose, isOpen, setSong } = useSongModal();

  // const router = useRouter();
  // const { setCurrentTrack } = usePlayerStore();

  // const {addToFront, addToQueue} = usePlayerStore();

  // const addFrontQueue = () => {
  //   console.log("adding to Front of Queue");
  //   addToFront({...song, platform: "Soundcloud"});

  // }

  // const addEndQueue = () => {
  //   console.log("adding to End of Queue");
  //   addToQueue({...song, platform: "Soundcloud"});
  // }

  return (
    <div 
      key={song?.id} 
      // className="flex items-center gap-x-4 w-full"
    >
      <div 
      // className="flex-1 flex justify-between items-center gap-x-3 cursor-pointer hover:bg-neutral-800/50 w-full p-2 rounded-md"
      >
        <MediaItem
          data={
            {id: song?.id,
              artists: [song?.user],
              name: song?.title,
              href: song?.permalink_url,
              image_path: song?.artwork_url,
              waveform_url: song?.waveform_url,
              track_authorization: song?.track_authorization,
              likes_count: song?.likes_count,
              media: song?.media,
              platform: "Soundcloud"
            }
          }
          onClick={onClick}
        >
          <div className="flex items-end">
            {children}
            <LikeButton songId={song?.id} />
            <AddSongButton song={
              {platform: "Soundcloud",
                id: song?.id,
                name: song?.title,
                author: song?.user,
                image: song?.artwork_url,
                media: {track_authorization: song?.track_authorization, ...song?.media}
              }
              } 
            />
          </div>
        </MediaItem>
      </div>
    </div>
  );
}

export default ScSong;