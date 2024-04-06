"use client";
import Image from "next/image";

import Header from "@/components/Header";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getSoundcloudTrack, getSoundcloudImage, getRelatedSoundcloudTracks } from "@/soundcloudController/api-controller";
import { useKeyStore, usePlayerStore } from "@/app/store";
import Waveform from "@/components/Waveform";
import { FaPlay } from "react-icons/fa";
import showSong from "@/components/ScSong";

/* eslint-disable */

export const revalidate = 0;

const TrackContent = () => {
  const params = useParams();
  const id = params.id;

  const {scKey, setScKey} = useKeyStore();
  const {setCurrentTrack} = usePlayerStore();
  const [trackData, setTrackData] = useState({
    title: "",
    artwork_url: "",
    user: {
      username: "",
      avatar_url: "",
      followers_count: 0,
      description: "",
      visuals: {
        enabled: false,
        visuals: [
          {
            visual_url: ""
          }
        ]
      }
    }
  
  });
  const [highQualityArtworkUrl, setHighQualityArtworkUrl] = useState<string>("");
  const [highQualityProfilePicture, setHighQualityProfilePicture] = useState<string>("");
  const [relatedTracks, setRelatedTracks] = useState({
    collection: []
  });

  useEffect(() => {
    const fetchData = async () => {
      if(scKey) {
        const data = await getSoundcloudTrack(id as string, scKey);
        const track = data.response;
        console.log(data);
        setTrackData(track);
        if(data.newKey){
          if(data.newKey !== scKey) {
            console.log("Setting new key");
            setScKey(data.newKey);
          }
        }
      }
    };

    fetchData();
  }, [scKey]);

  useEffect(() => {
    const fetchImage = async () => {
      if(trackData?.artwork_url) {
        const url = await getSoundcloudImage(trackData?.artwork_url);
        setHighQualityArtworkUrl(url);
      }
    };
  
    fetchImage();
  }, [trackData?.artwork_url]);

  useEffect(() => {
    const fetchImage = async () => {
      if(trackData?.user.avatar_url) {
        const profileUrl = await getSoundcloudImage(trackData?.user.avatar_url);
        setHighQualityProfilePicture(profileUrl);
      }
    };
  
    fetchImage();
  }, [trackData?.user.avatar_url]);

  useEffect(() => {
    const fetchRelatedTracks = async () => {
      if(scKey) {
        const data = await getRelatedSoundcloudTracks(id as string, scKey);
        const related = data.response;
        console.log(related);
        setRelatedTracks(related);
      }
    };

    fetchRelatedTracks();
  }, [scKey]);

  if(!trackData) {
    return <div>Loading...</div>;
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
      <Header>
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
            <div className="relative h-48 w-48 lg:h-60 lg:w-60">
              <Image
                className="object-cover"
                fill
                src={highQualityArtworkUrl || trackData?.artwork_url || "/images/liked.png"}
                alt="Song"
              />
            </div>
            <div className="flex flex-col gap-y-2 mt-4 md:mt-0">
              <p className="hidden md:block font-semibold text-sm">
                Song
              </p>
              <h1 
                className="
                  text-white 
                  text-3xl 
                  sm:text-4xl 
                  lg:text-5xl 
                  font-bold
                "
              >
                {trackData?.title}
              </h1>
            </div>

          </div>
          {trackData &&
            <div className="
              transition 
              opacity-100 
              rounded-full 
              inline-flex
              items-center 
              justify-center 
              bg-blue-600
              p-6 
              drop-shadow-md 
              translate
              translate-y-1/4
              group-hover:opacity-100 
              group-hover:translate-y-0
              hover:scale-110
            "
              onClick={() => setCurrentTrack({...trackData, platform: "Soundcloud"})}
            >
              <FaPlay className="text-3xl text-white" size={25} />
            </div>
          }
        </div>
      </Header>
      <div className="p-5">
        <div 
          className="
            flex 
            flex-col 
            gap-y-5 
            md:gap-y-10
          "
        >
          {/* Display profile below trackData.user */}
          <div 
            className="
              flex 
              flex-col 
              gap-y-5 
              md:gap-y-10
              p-5
              bg-neutral-800
              rounded-lg
            "
          >
            <div>
              {/* <h2 
                className="
                  text-white 
                  text-2xl 
                  sm:text-3xl 
                  lg:text-4xl 
                  font-bold
                "
              >
                Profile
              </h2> */}
              <div 
                className="
                  flex 
                  flex-col 
                  gap-y-5 
                  md:gap-y-10
                "
              >
                {trackData?.user?.visuals?.enabled && (
                  <div className="relative h-64 w-full">
                    <Image
                      className="object-cover"
                      layout="fill"
                      src={trackData?.user?.visuals?.visuals[0].visual_url}
                      alt="Banner"
                    />
                  </div>
                )}
                <div 
                  className="
                    flex 
                    flex-col 
                    md:flex-row 
                    items-center 
                    gap-x-5
                  "
                >
                  <div className="relative h-32 w-32 lg:h-32 lg:w-32">
                    <Image
                      className="object-cover rounded-full"
                      fill
                      src={highQualityProfilePicture || trackData?.user.avatar_url || "/images/liked.png"}
                      alt="Profile"
                    />
                  </div>
                  <div className="flex flex-col gap-y-2 mt-4 md:mt-0">
                    <p className="hidden md:block font-semibold text-sm">
                      Artist
                    </p>
                    <h1 
                      className="
                        text-white 
                        text-3xl 
                        sm:text-4xl 
                        lg:text-5xl 
                        font-bold
                      "
                    >
                      {trackData?.user.username}
                    </h1>
                    {trackData?.user.followers_count &&
                      <div className="flex flex-col gap-y-2">
                        <p className="text-white text-sm sm:text-base lg:text-lg">
                          Followers
                        </p>
                        <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-semibold">
                          {trackData?.user.followers_count}
                        </h2>
                      </div>
                    }
                  </div>
                </div>
                <p 
                  className="
                    text-white 
                    text-sm 
                    sm:text-base 
                    lg:text-lg
                  "
                >
                  {trackData?.user.description}
                </p>
              </div>
            </div>


          </div>

          {/* Display related tracks */}
          <div>
            <h2 
              className="
                text-white 
                text-2xl 
                sm:text-3xl 
                lg:text-4xl 
                font-bold
              "
            >
              Related Tracks
            </h2>
            <div 
              className="
                flex 
                flex-col 
                gap-y-5 
                md:gap-y-10
              "
            >
              
              {relatedTracks?.collection?.map((track: any, index: number) => (
                <div key={index}>
                  {showSong(track, () => setCurrentTrack({...track, platform: "Soundcloud"}))}
                </div>
              ))}
            </div>
          </div>

          {/* <div>
            <h2 
              className="
                text-white 
                text-2xl 
                sm:text-3xl 
                lg:text-4xl 
                font-bold
              "
            >
              Waveform
            </h2>
              <Waveform url={trackData?.waveform_url} duration={trackData?.duration} currentTime={0} />
          </div> */}
        </div>
      </div>
    </div>
  );
}

export default TrackContent;
