"use client";

import { useEffect, useState, useRef, memo } from "react";
import { BsPauseFill, BsPlayFill, BsChevronDown, BsChevronUp } from "react-icons/bs";
import { HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";
import { AiFillStepBackward, AiFillStepForward } from "react-icons/ai";
import * as QueueIcon from "@/public/images/queue.svg";
import * as songPlaceholder from "@/public/images/playlist.jpeg";
import { Song } from "@/types";
import usePlayer from "@/hooks/usePlayer";

import shuffle from "@/public/images/shuffle.svg";
import replay from "@/public/images/replay.svg";

import { toast } from "react-hot-toast";

import LikeButton from "./LikeButton";
import MediaItem from "./MediaItem";
import Slider from "./Slider";
import VideoPlayerMemo from "./VideoPlayerMemo";
import VideoPlayer from "./VideoPlayer";
import { usePathname, useParams, useRouter } from "next/navigation";
import YoutubeSong from "@/components/YoutubeSong";
import showSong from "@/components/ScSong";

import { getDash, getVideo } from "@/actions/useInnertube";
const Draggable = require('react-draggable');

const shaka = require('shaka-player/dist/shaka-player.ui.js');
import 'shaka-player/dist/controls.css'; /* Shaka player CSS import */

// import Watch from "@/components/Watch";

import Header from "@/components/Header";
import { twMerge } from "tailwind-merge";
import Image from "next/image";

import 'shaka-player/dist/controls.css'; /* Shaka player CSS import */
import VideoItem from "@/components/VideoItem";
import { watch } from "fs";
import { usePlayerStore, useKeyStore } from "@/app/store";
import { getSoundcloudImage, getTrackStream } from "@/soundcloudController/api-controller";

interface PlayerContentProps {
  song: Song | undefined;
  songUrl: string;
}

const PlayerContent: React.FC<PlayerContentProps> = ({ 
  song, 
  songUrl
}) => {
  const videoPlayerRef = useRef(null);
  const watchRef = useRef(null);
  const playerRef = useRef(null);
  const player = usePlayer();
  const [volume, setVolume] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const pathname = usePathname();
  const params = useParams();
  const { id } = useParams();

  // const id = params.id;
  const router = useRouter();

  const [highQualityArtworkUrl, setHighQualityArtworkUrl] = useState<string>("");

  const [currentId, setCurrentId] = useState("");
  const [feed, setFeed] = useState([]);
  const [videoData, setVideoData] = useState(null);
  const [dash, setDash] = useState("");
  const licenseServer = "https://widevine-proxy.appspot.com/proxy";

  const {scKey} = useKeyStore();

  const {currentTrack, setCurrentTrack, playNext, playPrev, queue, shufflePlaylist, isShuffled, setIsShuffled} = usePlayerStore();
  
  const Icon = isPlaying ? BsPauseFill : BsPlayFill;
  const VolumeIcon = volume === 0 ? HiSpeakerXMark : HiSpeakerWave;

  const [isPlayerExpanded, setIsPlayerExpanded] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      if(currentTrack?.artwork_url) {
        const url = await getSoundcloudImage(currentTrack?.artwork_url);
        setHighQualityArtworkUrl(url);
      }
    };
    
    fetchImage();
  }, [currentTrack?.artwork_url]);

  useEffect(() => {
    setFeed(videoData?.watch_next_feed.filter((item) => item?.type === "CompactVideo"));
  }, [videoData]);

  // const setInnertube = async (id: string) => {
  //   console.log(id);
  //   if(currentId !== id) {
  //     // setCurrentId(id as string);
  //     const video = await getDash(id);
  //     if(video) {
  //       console.log(video);
  //       setVideoData(video.video);
  //       // const uri = 'data:application/dash+xml;charset=utf-8;base64,' + btoa(video.dash);
  //       // setDash(uri);
  //       setCurrentTrack(video.video);
  //     }
  //   }
  // }

  useEffect(() => {
    const fetchTrack = async () => {
      // This code will only run once after the initial render
      console.log('App mounted');
      if(pathname.startsWith('/watch/')) {
        console.log("PATHNAME:", pathname);
        const newId = pathname.split('/')[2];
        if(newId && newId !== "") {
          console.log("ID", newId);
          if(currentTrack === null || currentTrack?.id !== id) {
            setCurrentTrack({id: newId, platform: "Youtube"});
            // const getTrack = await getVideo(newId);
            // console.log("Playing Track:", getTrack);
            // setCurrentTrack({...getTrack.basic_info, thumbnails: getTrack.basic_info.thumbnail, views:getTrack.basic_info.view_count, title: {text: getTrack.basic_info.title}, endpoint:{metadata: {url: "/watch/" + getTrack.basic_info.id }},  platform: "Youtube"});
          }
        }
      }
    };

    fetchTrack();
    
  }, []); // Empty array means this effect has no dependencies, so it won't re-run


  // const setInnertube = async () => {
  //   if(currentTrack?.platform !== "Youtube") {
  //     const id = player.activeId;
  //     console.log(id);
  //     if(currentId !== id) {
  //       setCurrentId(id as string);
  //       const video = await getDash(id);
  //       console.log(video);
  //       setVideoData(video.video);
  //       const uri = 'data:application/dash+xml;charset=utf-8;base64,' + btoa(video.dash);
  //       setDash(uri);
  //     }
  //   }
  //   else if(currentTrack?.platform === "Soundcloud") {

  //   }
  // }

  // useEffect(() => {
  //   setInnertube();
  // }, []);

  const video = useRef(null);
  const videoContainer = useRef(null);
  let currPlayer: any = null;
  
  let inWatchPage = false;
  
  useEffect(() => {
    if (watchRef.current || playerRef.current) {
      const observer = new MutationObserver((mutationsList, observer) => {
        // Log all mutations
        console.log(mutationsList);
      
        for(let mutation of mutationsList) {
          if (mutation.type === 'childList') {
            // Disconnect the observer before moving the video element
            observer.disconnect();
  
            // Check if the refs are not null before trying to append the videoContainer
            // if (pathname.startsWith('/watch/') && watchRef.current && videoContainer.current && !inWatchPage) {
            //   watchRef.current.appendChild(videoContainer.current);
            //   inWatchPage = true;
            //   console.log("Moving player to watch page");
            // } else if (playerRef.current && videoContainer.current && inWatchPage) {
            //   playerRef.current.appendChild(videoContainer.current);
            //   inWatchPage = false;
            //   console.log("Moving player to player bar")
            // }
  
            // Reconnect the observer after moving the video element
            if (watchRef.current) {
              observer.observe(watchRef.current, { childList: true, subtree: true });
            }
            if (playerRef.current) {
              observer.observe(playerRef.current, { childList: true, subtree: true });
            }
          }
        }
      });
  
      // Start observing the watch page and the player bar with the configured parameters
      if (watchRef.current) {
        observer.observe(watchRef.current, { childList: true, subtree: true });
        console.log("Watching watch page")
      }
      if (playerRef.current) {
        observer.observe(playerRef.current, { childList: true, subtree: true });
        console.log("Watching player bar")
      }
  
      // Manually move the video element if the watch page or player bar is already in the DOM
      if (pathname.startsWith('/watch/') && watchRef.current && videoContainer.current) {
        if (!watchRef.current.contains(videoContainer.current)) {
          watchRef.current.appendChild(videoContainer.current);
          console.log("Moving player to watch page")
        }
      } else if (playerRef.current && videoContainer.current) {
        if (!playerRef.current.contains(videoContainer.current)) {
          playerRef.current.appendChild(videoContainer.current);
          console.log("Moving player to player bar")
        }
      }
  
      return () => observer.disconnect();
    }
  }, [pathname, watchRef.current, playerRef.current]);

  // useEffect hook to load shaka player
  const hasRun = useRef(false); 

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Calculate the progress (as a percentage) for the progress bar
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (time: any) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  const handleProgressBarClick = (e: any) => {
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const x = e.clientX - rect.left; // Click position within progress bar
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    if (video.current) video.current.currentTime = newTime;
  };

  useEffect(() => {
    hasRun.current = true;
    let vid = video.current;
    let vidContainer = videoContainer.current;

    var player = new shaka.Player(vid);
    let ui: any = null;

    currPlayer = player;

    video.current?.addEventListener('play', () => {
      console.log("Event Listener: Video Play");
      setIsPlaying(true);
    });

    video.current?.addEventListener('pause', () => {
      console.log("Event Listener: Video Pause");
      setIsPlaying(false);
    });

    if(ui)  {
      ui.destroy();
      ui = null;
    }

    vidContainer?.querySelectorAll("div")
        .forEach(node => node.remove());
    
    shaka.polyfill.installAll();

    ui = new shaka.ui.Overlay(player, vidContainer, vid);
    const config = {
      seekBarColors: {
        base: 'rgba(255,255,255,.2)',
        buffered: 'rgba(255,255,255,.4)',
        played: 'rgb(64, 224, 208)',
      },
      // fadeDelay: 0,
      // controlPanelElements: ["time_and_duration", "spacer", "play_pause", "spacer", "captions", "fullscreen", "overflow" ]
    };

    ui.configure(config);
    // const controls = ui.getControls();


    console.log(Object.keys(shaka.ui));

    const onError = (error: { code: any; }) => {
      // Log the error.
      console.error('Error code', error.code, 'object', error);
    }

    const addTimeListener = () => {
      player.getMediaElement().addEventListener('timeupdate', () => {
            
        const accTime = player.getMediaElement().currentTime;
        const currDuration = player.getMediaElement().duration;
        setCurrentTime(accTime);
        // console.log("Current Time", currentTime, duration);
      
        // If the current time is within 1 second of the duration, consider the video as ended
        if (currDuration - accTime <= 1) {
          console.log("Video Ended");
          playNext();
        }
      });
    }



    if(currentTrack?.platform === "Youtube") {
      player.configure({
        streaming: {
          bufferingGoal: 180,
          rebufferingGoal: 0.02,
          bufferBehind: 300, 
          retryParameters: {
            maxAttempts: 5,  // Change this to the desired number of attempts
          },
        },
        drm: {
          servers: { 'com.widevine.alpha': licenseServer }
        }
      });

      player.getNetworkingEngine()?.registerRequestFilter((_type: any, request: any) => {
        const uri = request.uris[0];
        const url = new URL(uri);
        const headers = request.headers;
        
        if (url.host.endsWith(".googlevideo.com") || headers.Range || url.host.includes("cf-hls-media.sndcdn.com")) {
          url.searchParams.set('__host', url.host);
          url.host = 'localhost:8080';
          url.protocol = 'http';

          if (url.host.includes("cf-hls-media.sndcdn.com")) {
            url.pathname = '/hls' + url.pathname;
          }
        }

        // request.method = 'GET';

        // // protobuf - { 15: 0 }
        // request.body = new Uint8Array([120, 0]);

        // if (url.pathname === "/watch") {
          if (headers.Range) {
            request.headers = {};
            url.searchParams.set("range", headers.Range.split("=")[1]);
            url.searchParams.set("alr", "yes");
          }
        // }

        request.uris[0] = url.toString();
      });

      // The UTF-8 characters "h", "t", "t", and "p".
      const HTTP_IN_HEX = 0x68747470;

      const RequestType = shaka.net.NetworkingEngine.RequestType;


      player.getNetworkingEngine()?.registerResponseFilter(async (type: any, response: any) => {
        const dataView = new DataView(response.data);
        
        if (response.data.byteLength < 4 ||
          dataView.getUint32(0) != HTTP_IN_HEX) {
          // This doesn't start with "http", so it is not an ALR.
          return;
        }

        // Interpret the response data as a URL string.
        const response_as_string = shaka.util.StringUtils.fromUTF8(response.data);

        let retry_parameters;

        if (type == RequestType.MANIFEST) {
          retry_parameters = player!.getConfiguration().manifest.retryParameters;
        } else if (type == RequestType.SEGMENT) {
          retry_parameters = player!.getConfiguration().streaming.retryParameters;
        } else if (type == RequestType.LICENSE) {
          retry_parameters = player!.getConfiguration().drm.retryParameters;
        } else {
          retry_parameters = shaka.net.NetworkingEngine.defaultRetryParameters();
        }

        // Make another request for the redirect URL.
        const uris = [response_as_string];
        const redirect_request = shaka.net.NetworkingEngine.makeRequest(uris, retry_parameters);
        const request_operation = player!.getNetworkingEngine()!.request(type, redirect_request);
        const redirect_response = await request_operation.promise;

        // Modify the original response to contain the results of the redirect
        // response.
        response.data = redirect_response.data;
        response.headers = redirect_response.headers;
        response.uri = redirect_response.uri;
      });

      getDash(currentTrack?.id as string).then((video) => {
        console.log(video);
        setVideoData(video.video);
        if (!currentTrack?.title) {
          console.log("Setting Current Track")
          setCurrentTrack(
            {...video.video.basic_info, 
              author: video.video.secondary_info.owner.author,
              thumbnails: video.video.basic_info.thumbnail, 
              views: video.video.basic_info.view_count, 
              title: {text: video.video.basic_info.title}, 
              endpoint:{metadata: {url: "/watch/" + video.video.basic_info.id }},  
              platform: "Youtube"
            });
        }
        const uri = 'data:application/dash+xml;charset=utf-8;base64,' + btoa(video.dash);
        setDash(uri);
        player.load(uri).then(function() {
          // showUI({ hidePlayer: false });
          currPlayer = player;
          console.log("Player", player);
          console.log(currPlayer);
          // This runs if the asynchronous load is successful.
          console.log('The video has now been loaded!');
          setDuration(player.getMediaElement().duration);

          addTimeListener();

          console.log(pathname);
          if (pathname.startsWith('/watch') && pathname.split('/')[2] !== currentTrack?.id) {
            console.log("Changing route name");
            router.push('/watch/' + currentTrack?.id);
          }

          // player.getMediaElement().addEventListener('timeupdate', () => {
            
          //   const accTime = player.getMediaElement().currentTime;
          //   const currDuration = player.getMediaElement().duration;
          //   setCurrentTime(accTime);
          //   // console.log("Current Time", currentTime, duration);
          
          //   // If the current time is within 1 second of the duration, consider the video as ended
          //   if (currDuration - accTime <= 1) {
          //     console.log("Video Ended");
          //     playNext();
          //   }
          // });
        }
        ).catch(onError);
        currPlayer = player;
      });
    }
    else if (currentTrack?.platform === "Soundcloud") {
      if(scKey !== null) {
        getTrackStream(currentTrack?.media.transcodings[0].url, currentTrack?.track_authorization, scKey,).then(
          (res) => {
            console.log(res);
            
            player.load(res.url).then(function() {
              // showUI({ hidePlayer: false });
              currPlayer = player;
              console.log("Player", player);
              console.log(currPlayer);
              // This runs if the asynchronous load is successful.
              console.log('The video has now been loaded!');

              setDuration(player.getMediaElement().duration);

              addTimeListener();


            }).catch(onError);  // onError is executed if the asynchronous load fails.


          }
        )
      }
    }
  }, [currentTrack?.id]);

  // useEffect(() => {
  //   if (video.current) {
  //     let vid = video.current;
  
  //     vid.addEventListener('play', () => {
  //       console.log("Event Listener: Video Play");
  //       setIsPlaying(true);
  //     });
  
  //     vid.addEventListener('pause', () => {
  //       console.log("Event Listener: Video Pause");
  //       setIsPlaying(false);
  //     });
  
  //     vid.addEventListener('ended', () => {
  //       setTimeout(playNext, 100);
  //     });
  
  //     // Clean up function to remove event listeners when the component unmounts or the source changes
  //     return () => {
  //       vid.removeEventListener('play', setIsPlaying);
  //       vid.removeEventListener('pause', setIsPlaying);
  //       vid.removeEventListener('ended', playNext);
  //     };
  //   }
  // }, [video.current?.src]); // Dependency on the video source

  
  // useEffect(() => {
  //   if(!pathname.startsWith('/watch/')) {
  //     if (isPlayerExpanded) {
  //       showUI({ hidePlayer: false });
  //     }
  //     else {
  //       showUI({ hidePlayer: true });
  //     }
  //   }
  //   else {
  //     showUI({ hidePlayer: false });
  //   }
  // }, [pathname]);



  function showUI(args: { hidePlayer?: boolean } = {
    hidePlayer: true,
  }) {
    const ytplayer = document.getElementById('video') as HTMLDivElement;
  
    ytplayer.style.display = args.hidePlayer ? 'none' : 'block';
  
    const video_container = document.getElementById('shaka-container') as HTMLDivElement;
    video_container.animate({ opacity: [0, 1] }, { duration: 300, easing: 'ease-in-out' });
    video_container.style.display = 'block';
  
    // loader.style.display = 'none';
  }

  // useEffect(() => {
  //   if(pathname.startsWith('/watch')) {
  //     console.log("Watch Ref", watchRef);
  //     console.log(pathname)
  //     if(videoContainer.current && watchRef.current) {
  //       console.log("Video Container", videoContainer.current);
  //       console.log("Watch Ref", watchRef.current);
  //       watchRef.current.appendChild(videoContainer.current);
  //     }
  //   }
  // }, [pathname]);

  useEffect(() => {
    // if(watchRef.current) {
      console.log("Watch Ref", watchRef);
      console.log("Video Container", videoContainer.current);
      // watchRef.current.appendChild(videoContainer.current);
    // }
  }, [watchRef.current]);

  const renderSong = () => {
    if (!song || !songUrl || !player.activeId) {
      return false;
    }
    return true;
  }

  const onPlayNext = () => {
    playNext();
  }

  const onPlayPrevious = () => {
    playPrev();
  }

  const handlePlay = () => {
    if (!isPlaying) {
      video.current?.play();
      setIsPlaying(true);
    } else {
      video.current?.pause();
      setIsPlaying(false);
    }
  }

  const toggleMute = () => {
    if (volume === 0) {
      setVolume(1);
    } else {
      setVolume(0);
    }
  }
  
  const channelInfo = () => {
    return (
      <div
        className="
        flex 
        flex-col
        gap-x-3 
        cursor-pointer 
        hover:bg-neutral-800/50 
        w-full 
        p-4
        rounded-md
        "
      >
        <div className="flex mb-2 gap-y-1">
          <p className="font-semibold truncate w-full">
            {videoData?.basic_info?.title}
          </p>
        </div>
        <div className="flex mb-2 gap-y-1 overflow-hidden truncate"
          onClick={() => router.push(`/channel/${videoData?.basic_info?.channel?.id}`)}
        >
          <div
            className="
              flex
              relative 
              rounded-full 
              min-h-[50px] 
              min-w-[50px] 
              overflow-hidden
            "
          >
            <Image
              fill
              src={videoData?.secondary_info?.owner?.author?.thumbnails[0]?.url}
              alt="ArtistItem"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col">
            <div className="gap-y-1 overflow-hidden">
              <p className="text-white truncate ml-2">{videoData?.secondary_info?.owner?.author?.name}</p>
              <div className="flex ml-2 gap-x-2 overflow-hidden items-center">
                <p className="text-neutral-400 text-sm truncate">
                  {videoData?.secondary_info?.owner?.subscriber_count?.text}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const watchNext = (feed: Array<any>) => {
    return (
      <>
        {feed?.map((item) => <VideoItem data={item} />)}
      </>
    );
  };

  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  return (
    <>
    {pathname.startsWith('/watch/') && 
      <div 
        className="
          bg-black
          w-full 
          h-[calc(100%-80px)]
          flex-1 
          overflow-y-auto 
          py-2 
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
        </Header>
        {videoData &&
          <div
            className="
            flex
            flex-row
            gap-x-3
            p-4
            mr-4
            "
          >
            <div className="w-full md:w-3/4 h-auto">
              {/* <div className="mb-2 gap-y-6"> */}
                <div
                  className="
                    flex 
                    w-full
                    h-auto
                    items-center 
                    justify-center 
                    rounded-md 
                    overflow-hidden 
                    gap-x-4 
                    bg-neutral-400/5 
                    cursor-pointer 
                    hover:bg-neutral-400/10 
                    transition 
                  "
                  ref={watchRef}
                >
                  {/* Put video info and channel info below */}
                </div>
              {/* </div> */}
              {channelInfo()}
              <div className="flex flex-col items-start min-w-full pt-4 gap-y-1">
                <p 
                  className={`
                    text-neutral-400 
                    text-sm 
                    pb-4 
                    w-full 
                    ${isDescriptionExpanded ? '' : 'truncate'}
                  `}
                >
                  {videoData?.secondary_info?.description?.text}
                </p>
                <button 
                  className="text-neutral-100 text-sm"
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                >
                  {isDescriptionExpanded ? 'Show less' : 'Show more'}
                </button>
              </div>
              <div className="md:hidden flex-col gap-y-6">
                {watchNext(feed)}
              </div>
            </div>
            <div
              className="hidden md:flex w-1/4 h-auto flex-col gap-y-6"
            >
              {watchNext(feed)}
            </div>
          </div>
        }
      </div>
      </div>
      }
      <div 
        className="
          fixed
          bottom-0 
          bg-black 
          w-full 
          py-2 
          h-[80px] 
          px-4
        "
      > 
        <div className="grid grid-cols-4 md:grid-cols-3 h-full">
          <div className="flex w-full justify-start col-span-3 md:col-span-1">

              {/* Investigate the placement of this outer div due to the positional change of the current track in the player onClick of the Chevron Up*/}
              <div className={`hidden md:${currentTrack && currentTrack.platform ==='Youtube' && isPlayerExpanded ? "block" : 'hidden'} flex bg-black py-2 px-4`}> 

                <div className={`absolute bottom-20 right-0 items-center gap-x-2 max-w-[400px]`}>
                  <div className=
                    {`cursor-pointer
                      relative 
                      rounded-full
                      h-[30px] 
                      w-[30px] 
                      overflow-hidden
                      bg-neutral-800
                      flex
                      items-center
                      justify-center
                      ${pathname.startsWith('/watch/') ? "hidden" : "block"}
                      `
                    } 
                    onClick={() => setIsPlayerExpanded(!isPlayerExpanded)}>
                    {isPlayerExpanded ? <BsChevronDown size={18} /> : <BsChevronUp size={18} />}
                  </div>
                  <div className="bg-black py-2 px-4 bottom-20 rounded-md w-full" ref={playerRef}>
                    <div
                      className="bg-black shadow-lg mx-auto w-full"
                      ref={videoContainer} id="shaka-container">
                      <video id="video" ref={video}
                      className="w-full h-full"
                      poster={currentTrack && currentTrack.platform ==='Youtube' ? videoData?.basic_info?.thumbnail[0].url : currentTrack && currentTrack.platform === "Soundcloud" ? highQualityArtworkUrl || currentTrack.artwork_url : songPlaceholder}
                      autoPlay
                      >
                      </video>
                    </div>
                  </div>
                </div>
              </div>

              {(currentTrack) ? 
                (
                  (currentTrack?.platform === "Youtube" && currentTrack?.title) ? (
                    <div key={currentTrack.id} className="flex justify-between items-center w-full rounded shadow truncate">
                      <YoutubeSong
                      song={{
                        id: currentTrack.id,
                        author: currentTrack.author,
                        name: currentTrack.title?.text,
                        href: "youtube.com" + currentTrack.endpoint?.metadata?.url,
                        image_path: currentTrack.thumbnails[0]?.url,
                        views: currentTrack.short_view_count?.text,
                        platform: "Youtube",
                      }} 
                      onPlay={() => console.log("Already playing")} 
                    >
                      <div
                        className="
                          relative 
                          rounded-full
                          h-[30px] 
                          w-[30px] 
                          overflow-hidden
                          bg-neutral-800
                          flex
                          items-center
                          justify-center
                        " 
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsPlayerExpanded(!isPlayerExpanded);
                        }}
                      >
                      {isPlayerExpanded ? 
                        <BsChevronDown size={15} /> : 
                        <BsChevronUp size={15} />
                      }
                      </div>
                    </YoutubeSong>
                    </div>
                  ) :
                    (showSong(currentTrack, () => console.log("Already playing")))
                ) 
                : 
                <div className="flex items-center gap-x-4">
                  <div className="w-10 h-10 bg-gray-400 rounded-sm animate-pulse" />
                  <div className="w-10 h-10 bg-gray-400 rounded-full animate-pulse" />
                </div>
              }
            </div>

            <div 
              className="
                flex 
                md:hidden 
                col-auto 
                w-full 
                justify-end 
                items-center
              "
            >
              <div 
                onClick={handlePlay} 
                className="
                  h-10
                  w-10
                  flex 
                  items-center 
                  justify-center 
                  rounded-full 
                  bg-white 
                  p-1 
                  cursor-pointer
                "
              >
                <Icon size={30} className="text-black" />
              </div>
            </div>
            <div 
              className="
                hidden
                h-full
                md:flex 
                justify-center 
                items-center 
                w-full 
                max-w-[722px] 
                gap-x-6
                flex-col
              "
            >
              <div className="flex justify-center items-center w-full gap-x-6">
                                
                                  <Image 
                                    className="object-contain filter invert-100"
                                    src={shuffle}
                                    style={{ filter: 'invert(70%)' }}
                                    alt="Image"
                                    width={28}
                                    height={28}
                                  />
                                
                <AiFillStepBackward
                  onClick={onPlayPrevious}
                  size={30} 
                  className="
                    text-neutral-400 
                    cursor-pointer 
                    hover:text-white 
                    transition
                  "
                />
                <div 
                  onClick={handlePlay}
                  className="
                    flex 
                    items-center 
                    justify-center
                    h-10
                    w-10 
                    rounded-full 
                    bg-white 
                    p-1 
                    cursor-pointer
                  "
                >
                  <Icon size={30} className="text-black" />
                </div>
                <AiFillStepForward
                  onClick={onPlayNext}
                  size={30} 
                  className="
                    text-neutral-400 
                    cursor-pointer 
                    hover:text-white 
                    transition
                  " 
                />
                <Image 
                  className="object-contain"
                  src={replay}
                  style={{ filter: 'invert(70%)' }}
                  alt="Image"
                  width={25}
                  height={25}
                />
              </div>
              <div className="w-full flex justify-between items-center mt-2">
                <span>{formatTime(currentTime)}</span>
                <div className="flex-grow mx-2 h-1 bg-gray-500 relative cursor-pointer"
                  onClick={handleProgressBarClick}
                >
                  <div style={{ width: `${progress}%` }} className="absolute left-0 top-0 h-1 bg-blue-500"></div>
                </div>
                <span>{formatTime(duration)}</span>

              </div>
            </div>
              <div className="hidden md:flex lg:flex" >
                {/* <div className={"flex items-center gap-x-2 max-w-[120px] max-h-[80px]"}>
                  <div className="bg-black py-2 px-4 bottom-20" ref={playerRef}>
                    <div
                      className="shadow-lg mx-auto max-w-full"
                      ref={videoContainer} id="shaka-container">
                      <video id="video" ref={video}
                      className="w-full h-full "
                      poster={videoData?.basic_info?.thumbnail[0].url}
                      autoPlay
                      >
                      </video>
                    </div>
                  </div>
                </div> */}
                
                <div className="flex items-center gap-x-2 ml-auto">
                  {/* add a queue icon to the left of the volume Icon and slider
                   */}
                  <div className="flex items-center gap-x-2"
                    onClick={() => router.push('/queue')}
                  >
                    {queue.length > 0 &&
                      <div
                        className="
                          hidden
                          xl:flex 
                          items-center
                          flex-col
                          gap-x-2
                          cursor-pointer
                          hover:bg-neutral-800/50
                          rounded-md
                          
                        "
                        onMouseEnter={(e) => e?.currentTarget?.children[1]?.firstChild?.classList.add('animate-marquee')} // Add the animation class on mouse enter
                        onMouseLeave={(e) => e?.currentTarget?.children[1]?.firstChild?.classList.remove('animate-marquee')} // Remove the animation class on mouse leave
                      >
                        <span 
                          className="
                            px-2 
                            py-1 
                            text-md
                            text-gray-400
                            font-semibold
                          "
                        >
                          Up Next
                        </span>
                        <div
                          className="
                            rounded-full 
                            px-2 
                            py-1 
                            text-md
                            text-gray-400
                            font-semibold
                            w-60  // Limit the width to 15rem (240px)
                            overflow-hidden  // Hide the overflow
                            whitespace-nowrap  // Prevent the text from wrapping
                            relative  // Make the div a positioned parent
                            h-6
                            group
                          "
                        >
                          <div
                            className="
                              absolute 
                              top-0 
                              left-0 
                              whitespace-nowrap 
                              group-hover:animate-marquee  // Apply the marquee animation on hover
                              h-full
                            "
                          >
                            {queue[0].platform === "Youtube" ? queue[0].title.text : queue[0].title}
                          </div>
                        </div>
                      </div>
                    }
                    <Image 
                      className="object-contain"
                      src={QueueIcon}
                      style={{ filter: 'invert(100%)' }}
                      alt="Image"
                      width={37}
                      height={37}
                    />
                  </div>
                  <div className="flex items-center gap-x-2">
                    <VolumeIcon 
                      onClick={toggleMute} 
                      className="cursor-pointer" 
                      size={27} 
                    />
                    <Slider
                      value={volume}
                      onChange={(value) => setVolume(value)}
                      sx={{ width: '100px' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
   );
}
 
export default PlayerContent;