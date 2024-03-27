"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation"
import MediaItem from "@/components/MediaItem";
import { usePlayerStore } from "../store";
import YoutubeSong from "@/components/YoutubeSong";
import LikeButton from "@/components/LikeButton";
import * as QueueIcon from "@/public/images/queue.svg";
import Image from "next/image";
import Header from "@/components/Header";
import { twMerge } from "tailwind-merge";
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import showSong from "@/components/ScSong";
import { Reorder, AnimatePresence } from 'framer-motion'


// The following is the queue page component that will be rendered when the user navigates to /queue
// This component will be responsible for rendering the queue and allowing the user to interact with it
// The queue will be a list of videos and tracks that the user has added to the queue
// The user will be able to remove videos from the queue, play videos from the queue, and reorder videos in the queue
// The queue will be persisted across sessions, so the user will see the same queue when they return to the app
// The queue will be stored in the user's db document, and will be updated whenever the user adds or removes a video from the queue
// Each Video in the Queue will be represented by either a YoutubeSong or a MediaItem component, depending on the platform of the video (Youtube, Spotify, or Soundcloud)
// The user will be able to play the videos in the queue by clicking on them, and the currently playing video's title will be highlighted in a different color
// The user will be able to remove videos from the queue by clicking on the remove button next to the video
// The user will be able to reorder videos in the queue by dragging and dropping them

const QueuePage: React.FC = () => {
  const { queue, setQueue, currentTrack, setCurrentTrack, removeFromQueue, currentPlaylist, removeTrackFromPlaylist, updatePlaylist } = usePlayerStore();
  const router = useRouter();

  const [active, setActive] = useState(0);
  const [startPosition, setStartPosition] = useState<any>(null);
  const [lastPosition, setLastPosition] = useState<any>(null);


  const playTrack = (track: any) => {
    console.log("Playing track", track);
    setCurrentTrack(track);
  };

  const removeTrack = (track: any) => {
    console.log("Removing track from Queue", track);
    removeFromQueue(track.id);
  };

  const values = [currentTrack? {...currentTrack, position:`c-0`} : [], ...queue.map((item: any, index: number) => {return {...item, position: `q-${index}`} }), ...currentPlaylist.songs.map((item: any, index: number) => {return {...item, position: `p-${index}`} })];
  

  useEffect(() => {
    console.log("Current Playlist", currentPlaylist);
  }, [currentPlaylist]);
  
  return (
    <div className="
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
        from-blue-950
        to-b
        `
      )}>
        <div
          className="
            flex 
            items-center 
            justify-between 
            mb-4 
            p-4 
            rounded 
            shadow
          "
        
        ><h1 className="text-4xl font-bold mb-4">Queue</h1>
        <Image 
          className="object-contain"
          style={{ filter: 'invert(100%)' }}
          src={QueueIcon}
          alt="Image"
          width={45}
          height={45}
        />
        </div>
      </Header>
      <Reorder.Group values={values}
        onReorder={(e) => {
          // this is the reordered list
          console.log("Reorder Event", e);  

          // starting index of the dragged item
          console.log("Active",active); 

          // the current track is being dragged meaning we cant change the current track since it is playing
          if (active === 0) {
            // find out where the current track has been moved to in the queue or the playlist if the queue is empty 
            // // 
            // e.map((item, index) => {
            //   if (item.position === "c-0") {
            //     console.log("Current Track", item);
            //     console.log("Current Track New Position", index);
            //     // make a copy of the current track at the new current Track position
            //     if (index === 0) {
            //       console.log("Current Track is still at the top");
            //       return;
            //     }
            //     if(index <= queue.length) {
            //       console.log("Current Track is in the queue");
            //       console.log("Queue", queue);
            //       const newQueue = [...queue];

            //       newQueue.splice(index - 1, 0, currentTrack);
            //       console.log("New Queue", newQueue);
            //       setQueue(newQueue);
            //     } else {
            //       console.log("Current Track is in the playlist");
            //       console.log("Playlist", currentPlaylist.songs);
            //       const newPlaylist = [...currentPlaylist.songs];
            //       newPlaylist.splice(index - queue.length - 1, 0, currentTrack);
            //       updatePlaylist({ ...currentPlaylist, songs: newPlaylist });
            //     }
            //   }
            // }
            // );
            return;

          } else {
            // find out which track is being dragged based on the active index and the position variable which is "q-{index}" for queue and "p-{index}" for playlist

            const draggedTrack = e[active];

            console.log("Dragged Track", draggedTrack);
            console.log("Dragged Track Position", draggedTrack.position);
            // find out where the dragged track has been moved to in the queue or the playlist
            e.map((item, index) => {
              if (item.position === draggedTrack.position) {
                console.log("Dragged Track New Position", index);
                setActive(index);
                // make a copy of the dragged track at the new position

                // if (index === 0) {
                //   console.log("Dragged Track is still at the top");
                //   return;
                // }
                // if(index <= queue.length) {
                //   console.log("Dragged Track is in the queue");
                //   console.log("Queue", queue);
                //   const newQueue = [...queue];
                //   newQueue.splice(index - 1, 0, draggedTrack);
                //   newQueue.splice(active, 1);
                //   console.log("New Queue", newQueue);
                //   setQueue(newQueue);
                // } else {
                //   console.log("Dragged Track is in the playlist");
                //   console.log("Playlist", currentPlaylist.songs);
                //   const newPlaylist = [...currentPlaylist.songs];
                //   newPlaylist.splice(index - queue.length - 1, 0, draggedTrack);
                //   newPlaylist.splice(active, 1);
                //   updatePlaylist({ ...currentPlaylist, songs: newPlaylist });
                // }
              }
            }
            );
            const newCurrentTrack = e[0];
            const newQueue = e.slice(1, queue.length + 1);
            const newPlaylist = e.slice(queue.length + 1, e.length);

            console.log("New Current Track", newCurrentTrack);
            console.log("New Queue", newQueue);
            console.log("New Playlist", newPlaylist);
            setQueue(newQueue);
            updatePlaylist({ ...currentPlaylist, songs: newPlaylist });
          }
        }}
      >
        <div className="mb-8 w-full bg-neutral-900 p-4 rounded shadow">
          {currentTrack && (currentTrack?.platform === "Youtube" ? (
            <>
            <h2 className="text-xl font-semibold mb-2">Now Playing</h2>
            
            <Reorder.Item
              key={currentTrack.id+"-1"}
              id={currentTrack.id}
              value={values[0]}
              onDragStart={(event, info) => {
                setActive(0);
                setStartPosition(info.point);
                console.log("Drag Start", info);
              }}
              onDrag={(event, info) => {
                console.log(event, info);
                setLastPosition(info.point);
              }}
              onDragEnd={() => console.log("Drag End")}
            >
              <div key={currentTrack.id} className="flex justify-between items-center w-full mb-2 p-4 rounded shadow">
                <div className="pr-2 text-white">1</div>
                <YoutubeSong song={{
                  id: currentTrack.id,
                  author: currentTrack.author,
                  name: currentTrack.title?.text,
                  href: "youtube.com" + currentTrack.endpoint?.metadata?.url,
                  image_path: currentTrack.thumbnails[0]?.url,
                  views: currentTrack.short_view_count?.text,
                  platform: "Youtube",
                }} onPlay={() => playTrack(currentTrack)} />
              </div>
            </Reorder.Item>
            </>
          ) : (
            <>
            <h2 className="text-xl font-semibold mb-2">Now Playing</h2>
            <Reorder.Item 
              key={currentTrack.id+"-1"}
              id={currentTrack.id}
              value={values[0]}
              onDragStart={(event, info) => {
                setActive(0);
                setStartPosition(info.point);
              }}
              onDrag={(event, info) => {
                console.log(event, info);
                setLastPosition(info.point);
              }}
            >
              <div className="pr-2 text-white">1</div>
              {showSong(currentTrack, () => playTrack(currentTrack))}
            </Reorder.Item>
            </>
          ))
          }
        </div>
        {/* <DndProvider backend={HTML5Backend}> */}
          {queue.length !== 0 && 
            <div className="mb-8 w-full bg-neutral-900 p-4 rounded shadow">
              <h2 className="text-xl font-semibold mb-2">Next in Queue</h2>

            {/* <QueueContainer queue={queue} /> */}
            {queue.map((track: any, index: number) => {
              if (track.platform === "Youtube") {
                return (
                  <Reorder.Item
                    key={`${track.id}-${index + 1}`}
                    id={track.id}
                    value={values[index + 1]}
                    onDragStart={() => setActive(index + 1)}
                    onDragEnd={(e) => {console.log(e); console.log(index + 1)}}
                  >
                    <div key={track.id} className="flex justify-between items-center w-full mb-2 p-4 rounded">
                      <div className="pr-2">
                        {index + 2}
                      </div>
                      <YoutubeSong song={{
                        id: track.id,
                        author: track.author,
                        name: track.title?.text,
                        href: "youtube.com" + track.endpoint?.metadata?.url,
                        image_path: track.thumbnails[0]?.url,
                        views: track.short_view_count?.text,
                        platform: "Youtube",
                      }} onPlay={() => {}} />
                      <button onClick={() => removeTrack(track)} className="ml-2 bg-red-500 text-white rounded px-2 py-1">Remove</button>
                    </div>
                  </Reorder.Item>
                );
              } else {
                return (
                  <Reorder.Item
                    key={`${track.id}-${index + 1}`}
                    id={track.id}
                    value={values[index + 1]}
                    onDragStart={() => setActive(index + 1)}
                    onDragEnd={() => console.log("Drag End")}
                  >
                    <div key={track.id} className="flex justify-between items-center w-full mb-2 p-4 rounded">
                      <div>{index + 1}</div>
                      {showSong(track, () => {})}
                      <button onClick={() => removeTrack(track)} className="ml-2 bg-red-500 text-white rounded px-2 py-1">Remove</button>
                    </div>
                  </Reorder.Item>
                );
              }
            })}
          </div>
        }
        {(currentPlaylist?.songs.length !== 0) &&
          <div className="mb-8 w-full bg-neutral-900 p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Next up</h2>
            {/* <PlaylistContainer queue={currentPlaylist.songs} /> */}
            {currentPlaylist?.songs.map((track: any, index: number) => {
              if (track.platform === "Youtube") {
                return (
                  <Reorder.Item
                    key={`${track.id}-${index + queue.length + 1}`} 
                    id={track.id}
                    value={values[index + queue.length + 1]}
                    onDragStart={() => setActive(index + queue.length + 1)}
                    onDragEnd={() => console.log("Drag End")}
                  >
                    <div key={track.id} className="flex justify-between items-center w-full mb-2 p-4 rounded">
                      <div 
                        className="pr-2
                        "
                      >{index + queue.length + 2}</div>
                      <YoutubeSong song={{
                        id: track.id,
                        author: track.author,
                        name: track.title?.text,
                        href: "youtube.com" + track.endpoint?.metadata?.url,
                        image_path: track.thumbnails[0]?.url,
                        views: track.short_view_count?.text,
                        platform: "Youtube",
                      }} onPlay={() => {playTrack(track)}} />
                      <button onClick={() => removeTrackFromPlaylist(track?.id)} className="ml-2 bg-red-500 text-white rounded px-2 py-1">Remove</button>
                    </div>
                  </Reorder.Item>
                );
              } else {
                return (
                  <Reorder.Item
                    key={`${track.id}-${index + queue.length + 1}`} 
                    id={track.id}
                    value={values[index + queue.length + 1]}
                    onDragStart={(e) => {console.log(e); setActive(index + queue.length + 1)}}
                    onDragEnd={(e) => console.log(e)}
                  >
                    <div key={track.id} className="flex justify-between items-center w-full mb-2 p-4 rounded">
                        <div>{index + 2}</div>
                        <div key={track.id} className="flex-1 items-center gap-x-4 w-full">
                        {showSong(track, () => playTrack(track))}
                        </div>
                        <button onClick={() => removeTrackFromPlaylist(track?.id)} className="ml-2 bg-red-500 text-white rounded px-2 py-1">Remove</button>
                    </div>
                  </Reorder.Item>
                );
              }
            }
            )}
          </div>
        }
        </Reorder.Group>
      {/* </DndProvider> */}
    </div>
  );
};

export default QueuePage;
