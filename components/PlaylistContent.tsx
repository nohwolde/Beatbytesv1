"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { FaPlay } from "react-icons/fa";

import { Song } from "@/types";
import { useUser } from "@/hooks/useUser";
import MediaItem from "@/components/MediaItem";
import LikeButton from "@/components/LikeButton";
import useOnPlay from "@/hooks/useOnPlay";
import YoutubeSong from "./YoutubeSong";

import ScSong from "./ScSong";

import { usePlayerStore } from "@/app/store";

interface PlaylistContentProps {
  songs: any[];
};

const PlaylistContent: React.FC<PlaylistContentProps> = ({
  songs
}) => {
  const router = useRouter();
  const { isLoading, user } = useUser();

  const onPlay = useOnPlay(songs);

  const { setCurrentTrack } = usePlayerStore();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/');
    }
  }, [isLoading, user, router]);
  return ( 
    <div className="flex flex-col gap-y-2 w-full p-6">
      {/* add faPlay icon above in its own row */}
      {songs?.map((song: any) => (
        <div 
          key={song.id} 
          className="flex items-center gap-x-4 w-full"
        >
          {(song.platform === "Soundcloud") ?
          <div className="flex-1 items-center gap-x-4 w-full">
            {ScSong({
              id: song.id,
              user: [song.author],
              title: song.name,
              href: song.id,
              artwork_url: song.image,
              isExplicit: song.isExplicit || false,
              platform: "Soundcloud",
              track_authorization: song.media?.track_authorization, 
              media: song.media
            }, () => 
              setCurrentTrack({
                id: song.id,
                user: [song.author],
                title: song.name,
                href: song.id,
                artwork_url: song.image,
                isExplicit: song.isExplicit || false,
                platform: "Soundcloud",
                track_authorization: song.media?.track_authorization, 
                media: song.media
              })
            )
            }
          </div>
            : song.platform === "Youtube" ?
              <YoutubeSong key={song.id} 
                song={{
                  id: song.id,
                  author: song.author,
                  name: song.name,
                  href: song.id,
                  image_path: song.image,
                  views: "0 views",
                  platform: "Youtube",
                }}
                onPlay={() => {
                  router.push('/watch?id=' + song.id);
                  setCurrentTrack({
                    id: song?.id,
                    author: song?.author,
                    title: {text: song?.name}, 
                    thumbnails: [{url: song?.image}], 
                    platform: "Youtube"
                  });
                }}
              />
            :
              <YoutubeSong key={song.yt?.id} 
                song={{
                  id: song.yt?.id,
                  author: song.yt?.author,
                  name: song.yt?.name,
                  href: song.id,
                  image_path: song.yt?.image,
                  views: "0 views",
                  platform: "Youtube",
                }}
                onPlay={() => {
                  router.push('/watch?id=' + song.id);
                  setCurrentTrack({
                    id: song.yt?.id,
                    author: song.yt?.author,
                    title: {text: song.yt?.name}, 
                    thumbnails: [{url: song.yt?.image}], 
                    platform: "Youtube"
                  });
                }}
              />
          }
        </div>
      ))}
    </div>
  );
}
 
export default PlaylistContent;
