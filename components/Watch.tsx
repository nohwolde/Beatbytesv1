"use client";
import Header from "@/components/Header";
import { twMerge } from "tailwind-merge";
import Image from "next/image";

import 'shaka-player/dist/controls.css'; /* Shaka player CSS import */
import VideoItem from "@/components/VideoItem";

interface WatchProps {
  Video: any;
  videoData: any;
  setVideoData: any;
  licenseServer: string,
  dash: string,
  setDash: any,
  posterUrl: string, 
  currentId: string,
  setCurrentId: any,
}
const Watch = ({Video, videoData, setVideoData, licenseServer, dash, setDash, posterUrl, currentId, setCurrentId}: WatchProps) => {
  // const [videoData, setVideoData] = useState("");
  // const [dash, setDash] = useState("");
  // const router = useRouter();
  // const params = useParams();
  // const pathname = usePathname();
  // const id = params.id;
  // const player = usePlayer();
  // const { videoPlayer } = useVideoPlayer();

  // useEffect(() => {
  //   const setInnertube = async () => {
  //     // console.log(id);
  //     const id = pathname.split('/watch/')[1];
  //     if (player.activeId !== id) {
  //       player.setId(id as string);
  //     }
  //     const video = await getDash(id as string);
  //     console.log(video);
  //     setVideoData(video.video);
  //     const uri = 'data:application/dash+xml;charset=utf-8;base64,' + btoa(video.dash);
  //     setDash(uri);
  //   }
  //   setInnertube();
  // }, [player.activeId]);

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
      feed.map((item) => 
        <VideoItem onClick={() => router.push(`/watch/${item.id}`)} data={item} />
      )
    );
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
          from-blue-900
          to-b
          `
        )}>
      </Header>
      {/* <div className="flex mb-2 gap-y-6">
        <div
          className="
            flex 
            items-center 
            justify-center 
            rounded-md 
            overflow-hidden 
            gap-x-4 
            bg-neutral-400/5 
            cursor-pointer 
            hover:bg-neutral-400/10 
            transition 
            p-3
          "
        >
          {(dash !== "") &&  
            <VideoContainer manifestUrl={dash} posterUrl={videoData?.basic_info?.thumbnail[0].url} />
          }
        </div>
      </div> */}
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
            <div className="mb-2 gap-y-6">
              <div
                className="
                  flex 
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
              >
                {Video}
                {/* Put video info and channel info below */}
              </div>
            </div>
            {channelInfo()}
            <div className="flex flex-col items-start w-full pt-4 gap-y-1">
              <p 
                className="
                  text-neutral-400 
                  text-sm 
                  pb-4 
                  w-full 
                  truncate
                "
              >
                {videoData?.secondary_info?.description?.text}
              </p>
            </div>
            <div className="md:hidden flex-col gap-y-6">
              {watchNext(videoData?.watch_next_feed)}
            </div>
          </div>
          <div
            className="hidden md:flex w-1/4 h-auto flex-col gap-y-6"
          >
            {watchNext(videoData?.watch_next_feed)}
          </div>
        </div>
      }
    </div>
  );
};

export default Watch;