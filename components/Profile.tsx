"use client";

import Image from "next/image";
import Header from "@/components/Header";
import { twMerge } from "tailwind-merge";
import { ProfileStore } from "@/hooks/useProfile";
import SongItem from "./SongItem";
import PlaylistItem from "./PlaylistItem";
import useOnPlay from "@/hooks/useOnPlay";
import Button from "./Button";
import { useSoundcloudAccountModal, useSpotifyAccountModal, useYoutubeAccountModal } from "@/hooks/useAccountModal";
import { useRouter } from "next/navigation";

import playlistImage from "@/public/images/playlist.jpeg";

import { useProfileStore } from "@/app/store";

interface ProfileProps {
  profile?: ProfileStore;
  platform: string;
}

const Profile: React.FC<ProfileProps> = ({ 
  profile,
  platform,
}) => {
  const color = platform === 'Spotify' ? 'from-green-500' : platform === 'Youtube' ? 'from-red-400' : 'from-orange-500';
  const router = useRouter();

  const { spotPlaylists, ytPlaylists, scPlaylists, spotProfile, scProfile, ytProfile  } = useProfileStore();

  const platProfile = platform === 'Spotify' ? spotProfile : platform === 'Youtube' ? ytProfile : scProfile;

  const platPlaylists = platform === 'Spotify' ? spotPlaylists : platform === 'Youtube' ? ytPlaylists : scPlaylists;

  // account modals
  const spotifyModal = useSpotifyAccountModal();
  const ytModal = useYoutubeAccountModal();
  const scModal = useSoundcloudAccountModal();

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
        ${color}
        `
      )}>
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
            {/* {platProfile && */}
              <>
              <div className={twMerge("relative h-60 w-60 lg:h-55 lg:w-55")}>
                {/* Profile photo goes here below */}
                <Image
                  className="object-cover rounded-full"
                  src={platProfile?.image}
                  alt="Playlist"
                  fill
                />
              </div>
              <div className="flex flex-col gap-y-2 mt-4 md:mt-0">
                <p className="hidden md:block font-semibold text-sm">
                  Profile
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
                  {platProfile?.username}
                </h1>
              </div>
              {platPlaylists === null || platPlaylists.length === 0 && 
              <Button
                className={twMerge(`w-[100px] bg-cyan-400 hover:bg-cyan-500 p-2`)}
                onClick={() => {
                    if(platform === 'Spotify') {
                      spotifyModal.onOpen();
                    }
                    else if(platform === 'Youtube') {
                      ytModal.onOpen();
                    }
                    else if(platform === 'Soundcloud') {
                      scModal.onOpen();
                    }
                  }
                }
              > 
                Load Playlists
              </Button>
              }
              </>
            {/* } */}

          </div>
        </div>
      </Header>
      <div 
        className="
          grid 
          grid-cols-2 
          sm:grid-cols-3 
          md:grid-cols-3 
          lg:grid-cols-4 
          xl:grid-cols-5 
          2xl:grid-cols-8 
          gap-4 
          mt-4
          p-5
        "
      >
        {platform === "Spotify" && spotPlaylists.length > 0 &&
          spotPlaylists?.map((playlist: any) => (
            <PlaylistItem
              onClick={() => {
                const platformPrefix = '/spot';
                router.push(platformPrefix + '/playlist?id=' + playlist.id);
              }}
              key={playlist.id} 
              data={{title: playlist?.name, id: playlist?.id, artist: playlist?.author?.display_name, artist_href: playlist?.author?.href}}
              image={playlist?.image  || playlistImage}
            />
          ))
        }
        {platform === "Youtube" && ytPlaylists.length > 0 &&
          ytPlaylists?.map((playlist: any) => (
            <PlaylistItem
              onClick={() => {
                const platformPrefix = 'yt';
                router.push(platformPrefix + '/playlist?id=' + playlist.id);
              }
              }
              key={playlist?.id}
              data={{title: playlist?.name, id: playlist?.id, artist: playlist?.author?.name, artist_href: playlist?.author?.id}}
              image={playlist?.image || playlistImage}
            />
          ))
        }

        {platform === "Soundcloud" && scPlaylists.length > 0 &&
          scPlaylists?.map((playlist: any) => (
            <PlaylistItem
              onClick={() => {
                const platformPrefix = '/sc';
                router.push(platformPrefix + '/playlist?id=' + playlist?.id);
              }}
              key={playlist.id}
              data={{title: playlist?.name, id: playlist?.id, artist: playlist?.author?.name, artist_href: playlist?.author?.id}}
              image={playlist?.image}
            />
          ))
        }

        {/* Playlists go here below */}
        {/* {profile?.playlists?.map((playlist) => (
          <PlaylistItem
            // onClick={(id) => onPlay(id)} 
            onClick={() => {
              const platformPrefix = platform === "Spotify" ? '/spot' : platform === "Soundcloud" ? '/sc' : 'yt';
              if(platform !== "Youtube") router.push(platformPrefix + playlist.href);
              else router.push(platformPrefix + "/playlist?id=" + playlist.id)
            }}
            key={playlist.href} 
            data={platform !== 'Youtube' ? {title: playlist.name, id: playlist.href, artist: profile.name, artist_href: profile.username}: {...playlist, id: playlist.id, artist: playlist.author.name, artist_href: playlist.author.id  }}
            image={platform !== 'Youtube' ? playlist.image : playlist.thumbnails[0]?.url}
          />
        ))} */}
      </div>
    </div>
  );
}

export default Profile;
