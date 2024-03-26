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

  const values = [currentTrack? {...currentTrack, position:`c-0`} : [], ...queue.map((item, index) => {return {...item, position: `q-${index}`} }), ...currentPlaylist.songs.map((item, index) => {return {...item, position: `p-${index}`} })];
  

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
            {queue.map((track, index) => {
              if (track.platform === "Youtube") {
                return (
                  <Reorder.Item
                    key={`${track.id}-${index + 1}`}
                    id={track.id}
                    value={values[index + 1]}
                    onDragStart={() => setActive(index + 1)}
                    onDragEnd={(e) => {console.log(e); console.log(index + 1)}}
                  >
                    <div key={track.id} className="flex justify-between items-center w-full mb-2 p-4 rounded shadow">
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
                    <div key={track.id} className="flex justify-between items-center w-full mb-2 bg-white p-4 rounded shadow">
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
            {currentPlaylist?.songs.map((track, index) => {
              if (track.platform === "Youtube") {
                return (
                  <Reorder.Item
                    key={`${track.id}-${index + queue.length + 1}`} 
                    id={track.id}
                    value={values[index + queue.length + 1]}
                    onDragStart={() => setActive(index + queue.length + 1)}
                    onDragEnd={() => console.log("Drag End")}
                  >
                    <div key={track.id} className="flex justify-between items-center w-full mb-2 p-4 rounded shadow">
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
                    <div key={track.id} className="flex justify-between items-center w-full mb-2 bg-white p-4 rounded shadow">
                      <div>{index + 2}</div>
                      {showSong(track, () => playTrack(track))}
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




  // // const reorderQueue = (dragIndex, dropIndex) => {
  // //   // Create a copy of the queue
  // //   const newQueue = [...queue];
    
  // //   // Extract the dragged item
  // //   const draggedItem = newQueue[dragIndex];
    
  // //   // Remove dragged item from its current position
  // //   newQueue.splice(dragIndex, 1);
    
  // //   // Insert dragged item at the new drop position
  // //   newQueue.splice(dropIndex, 0, draggedItem);
    
  // //   // Update the state with the reordered queue
  // //   setQueue(newQueue);
  // // };

  // interface DraggableItemProps {
  //   data: any;
  //   index: number;
  //   type: string;
  //   // onReorder: () => void;
  // };

  // const DraggableItem: React.FC<DraggableItemProps> = ({data, type, index}) => {
  //   // ... render item content based on type and data
  //   const ref = useRef<HTMLDivElement>(null);
  //   const [dragEnd, setDragEnd] = useState(false);  // state to indicate when a drag operation has ended
  //   const [endItem, setEndItem] = useState(null);  // state to store the item from the end function
  //   const [dropResult, setDropResult] = useState<any>(null);  // state to store the dropResult from the end function  


    

  //   const hoverIndexRef = useRef(index);

  //   const [{ isDragging }, drag] = useDrag(() => ({
  //     type,
  //     item: {...data, type, index},
  //     collect: (monitor) => ({
  //       isDragging: monitor.isDragging(),
  //     }),
  //     end: (item, monitor) => {
  //       const dropResult = monitor.getDropResult();
  //       if (dropResult && item) {
  //         setEndItem(item);  // store the item from the end function
  //         setDropResult(dropResult);  // store the dropResult from the end function
  //         setDragEnd(true);  // set dragEnd to true when a drag operation has ended
  //       }
  //     },
  //   }));
  
  //   // const [{ handlerId }, drop] = useDrop({
  //   //   accept: type,
  //   //   drop: (item, monitor) => handleDrop(item, { droppableId: type, hoverIndex: index }),  // pass the correct arguments to handleDrop  
  //   //   collect: (monitor) => ({
  //   //     handlerId: monitor.getHandlerId(),
  //   //   }),
  //   // });

  // useEffect(() => {
  //   if (dragEnd) {
  //     const hoverIndex = hoverIndexRef.current;  // get the most recent value of hoverIndexRef.current
  //     console.log("Calling Drop Function", hoverIndex);
  //     handleDrop(endItem, { droppableId: dropResult.droppableId, hoverIndex: hoverIndexRef.current });
  //     setDragEnd(false);  // reset dragEnd to false after calling handleDrop
  //   }
  // }, [dragEnd]);  // call this useEffect hook whenever dragEnd changes

  // const [, drop] = useDrop({
  //   accept: type,
  //   // hover: (item, monitor) => {
  //   //   if (!ref.current) {
  //   //     return;
  //   //   }
    
  //   //   const dragIndex = item.index;
    
  //   //   // Determine rectangle on screen
  //   //   const hoverBoundingRect = ref.current?.getBoundingClientRect();
    
  //   //   // Determine mouse position
  //   //   const clientOffset = monitor.getClientOffset();
    
  //   //   // Get pixels to the top
  //   //   const hoverClientY = clientOffset.y - hoverBoundingRect.top;
    
  //   //   // Compute the hover index based on the exact position of the cursor
  //   //   const hoverIndex = Math.floor(hoverClientY / (hoverBoundingRect.bottom - hoverBoundingRect.top) * numberOfItems);
    
  //   //   if (dragIndex === hoverIndex) {
  //   //     return;
  //   //   }
    
  //   //   console.log("Hover Index", hoverIndex);
  //   //   hoverIndexRef.current = hoverIndex;
  //   //   console.log("Hover Index Ref", hoverIndexRef.current);
  //   // },
  //   // hover: (item, monitor) => {
  //   //   if (!ref.current) {
  //   //     return;
  //   //   }
    
  //   //   const dragIndex = item.index;
    
  //   //   // Determine rectangle on screen
  //   //   const hoverBoundingRect = ref.current?.getBoundingClientRect();
    
  //   //   // Get vertical middle
  //   //   const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
    
  //   //   // Determine mouse position
  //   //   const clientOffset = monitor.getClientOffset();
    
  //   //   // Get pixels to the top
  //   //   const hoverClientY = clientOffset.y - hoverBoundingRect.top;
    
  //   //   // Compute the hover index
  //   //   const hoverIndex = hoverClientY < hoverMiddleY ? dragIndex - 1 : dragIndex + 1;
    
  //   //   if (dragIndex === hoverIndex) {
  //   //     return;
  //   //   }
    
  //   //   console.log("Hover Index", hoverIndex);
  //   //   hoverIndexRef.current = hoverIndex;
  //   //   console.log("Hover Index Ref", hoverIndexRef.current);
  //   // },
  //   // hover: (item, monitor) => {
  //   //   if (!ref.current) {
  //   //     return;
  //   //   }

  //   //   const dragIndex = item.index;
  //   //   let hoverIndex = index;

  //   //   if (dragIndex === hoverIndex) {
  //   //     return;
  //   //   }

  //   //   const hoverBoundingRect = ref.current?.getBoundingClientRect();
  //   //   const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
  //   //   const clientOffset = monitor.getClientOffset();
  //   //   const hoverClientY = clientOffset.y - hoverBoundingRect.top;

  //   //   // if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
  //   //   //   return;
  //   //   // }

  //   //   // if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
  //   //   //   return;
  //   //   // }
  //   //   console.log("Hover Index", hoverIndex);
  //   //   hoverIndexRef.current = hoverIndex
  //   //   console.log("Hover Index Ref", hoverIndexRef.current);
  //   // },
  //   hover: (item, monitor) => {
  //     if (!ref.current) {
  //       return;
  //     }
    
  //     const dragIndex = item.index;
    
  //     // Determine rectangle on screen
  //     const hoverBoundingRect = ref.current?.getBoundingClientRect();
    
  //     // Determine mouse position
  //     const clientOffset = monitor.getClientOffset();
    
  //     // Get pixels to the top
  //     const hoverClientY = clientOffset.y - hoverBoundingRect.top;

  //     const numberOfItems = type === "QUEUE_ITEM" ? queue.length : currentPlaylist.songs.length;
    
  //     // Compute the hover index based on the exact position of the cursor
  //     const hoverIndex = Math.floor(hoverClientY / (hoverBoundingRect.bottom - hoverBoundingRect.top) * numberOfItems);
    
  //     if (dragIndex === hoverIndex) {
  //       return;
  //     }
    
  //     console.log("Hover Index", hoverIndex);
  //     hoverIndexRef.current = hoverIndex;
  //     console.log("Hover Index Ref", hoverIndexRef.current);
  //   },
  //   // drop: (item, monitor) => {
  //   //   if (monitor.isOver({ shallow: false })) {  // check if the item is over any target
  //   //     handleDrop(item, { droppableId: type, hoverIndex });  // use the hover index as the destination index
  //   //   }
  //   // },
  //   collect: (monitor) => ({
  //     handlerId: monitor.getHandlerId(),
  //   }),
  // });

  //   useEffect(() => {
  //     drag(drop(ref));
  //   }, [drag, drop, ref]);
  
  //   return (
  //     <div ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }}>
  //       {(data.platform === "Youtube") ? (
  //           <div key={data.id} className="flex justify-between items-center w-full mb-2 p-4 rounded shadow">
  //             <div 
  //               className="pr-2
  //               "
  //             >{index + 2}</div>
  //             <YoutubeSong song={{
  //               id: data.id,
  //               author: data.author,
  //               name: data.title.text,
  //               href: "youtube.com" + data.endpoint?.metadata?.url,
  //               image_path: data.thumbnails[0].url,
  //               views: data.short_view_count.text,
  //               platform: "Youtube",
  //             }} onPlay={() => playTrack(data)} />
  //             {/* Need logic to check if the song is in the queue or playlist to know which removeTrack function to call*/}
  //             {/* <button onClick={() => removeTrack(data)} className="ml-2 bg-red-500 text-white rounded px-2 py-1">Remove</button> */}
  //           </div>
  //         )
  //       :
  //         (
  //             <div key={data.id} className="flex justify-between items-center w-full mb-2 bg-white p-4 rounded shadow">
  //               <div>{index + 2}</div>
  //               {showSong(data, () => playTrack(data))}
  //               {/* <button onClick={() => removeTrack(data)} className="ml-2 bg-red-500 text-white rounded px-2 py-1">Remove</button> */}
  //             </div>
  //         )
  //       }
  //     </div>
  //   );
  // };


  // interface DroppableContainerProps {
  //   children: any;
  //   type: string;
  //   onDrop: (item: any, monitor: any) => void;
  // };

  // const DroppableContainer: React.FC<DroppableContainerProps> = ({ children, type, onDrop }) => {
  //   const ref = useRef<HTMLDivElement>(null);
  //   const [hoverIndex, setHoverIndex] = useState(null);
  //   const [{ isOver }, drop] = useDrop({
  //     accept: "QUEUE_ITEM" || "PLAYLIST_ITEM",
  //     // hover: (item: any, monitor: DropTargetMonitor) => {
  //     //   if (!ref.current) {
  //     //     return;
  //     //   }
  
  //     //   const dragIndex = item.index;
  //     //   const hoverBoundingRect = ref.current?.getBoundingClientRect();
  //     //   const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
  //     //   const clientOffset = monitor.getClientOffset();
  //     //   const hoverClientY = clientOffset.y - hoverBoundingRect.top;
  
  //     //   if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
  //     //     return;
  //     //   }
  
  //     //   if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
  //     //     return;
  //     //   }
  //     //   console.log("Hover Index", hoverIndex);
  //     //   setHoverIndex(dragIndex);
  //     // },
  //     drop: (item, monitor) => {
  //       console.log('Drop function called', item, monitor);
  //       const dropResult = { droppableId: type};  // include the hover index in the drop result
  //       // onDrop(item, dropResult);
  //       return dropResult;
  //     },
  //     collect: (monitor) => ({
  //       isOver: monitor.isOver(),
  //     }),
  //   });

  //   useEffect(() => {
  //     drop(ref);
  //   }, [drop]);
  
  //   return (
  //     <div ref={ref} style={{ opacity: isOver ? 0.8 : 1 }}>
  //       {children}
  //       {/* {React.Children.map(children, (child, index) => {
  //         return React.cloneElement(child, { index, setHoverIndex });  // pass the index and setHoverIndex to each child
  //       })} */}
  //     </div>
  //   );
  // };

  // interface ContainerProps {
  //   queue: any;
  //   // currentTrackId: string;
  //   // onReorder: () => void;
  // };
  
  // const QueueContainer: React.FC<ContainerProps> = ({ queue }) => {
  //   return (
  //     <DroppableContainer type="QUEUE_CONTAINER" onDrop={handleDrop}>
  //       {queue.map((track: any, index: number) => (
  //         <DraggableItem
  //           data={track}
  //           index={index}
  //           type="QUEUE_ITEM"
  //           key={index}
  //         />
  //       ))}
  //     </DroppableContainer>
  //   );
  // };

  // const PlaylistContainer: React.FC<ContainerProps> = ({ queue }) => {
  //   return (
  //     <DroppableContainer type="PLAYLIST_CONTAINER" onDrop={handleDrop}>
  //       {queue.map((track: any, index: number) => (
  //         <DraggableItem
  //           data={track}
  //           index={index}
  //           type="PLAYLIST_ITEM"
  //           key={index}
  //         />
  //       ))}
  //     </DroppableContainer>
  //   );
  // }

  

  // const handleDrop = (item: any , dropResult: any) => {
  
  //   console.log("RESULT", dropResult);
  //   const { droppableId, hoverIndex } = dropResult;
  //   console.log("Item dropped", item, "Droppable ID", droppableId);
  //   console.log("Item dropped", item, "Droppable ID", droppableId);

  //   const destinationIndex = hoverIndex;
  //   const sourceIndex = item.index;

  //   console.log("Destination Index", destinationIndex, "Source Index", sourceIndex);
  
  //   if (item.type === "QUEUE_ITEM") {
  //     if (droppableId === "QUEUE_CONTAINER") {
  //       // Item dropped within the queue
  //       // Update queue based on drop location 
  //       console.log("Item dropped within the queue");
  
  //       // const destinationIndex = hoverIndex;
  //       // const sourceIndex = item.index;
      
  //       // Handle different drop scenarios within the queue:
  //       if (destinationIndex === sourceIndex) {
  //         // Item dropped at the same position, no need to update
  //         return;
  //       } else {
  //         // Item moved:
  //         const updatedQueue = [...queue];
  //         const [removed] = updatedQueue.splice(sourceIndex, 1);
  //         updatedQueue.splice(destinationIndex, 0, removed);
  //         setQueue(updatedQueue);
  //       }
  
  //     } else if (droppableId === "PLAYLIST_CONTAINER") {
  //       // Item moved from queue to playlist
  //       // Remove from queue, add to playlist
  
  //       // const destinationIndex = hoverIndex;
  //       const updatedSongs = [...currentPlaylist.songs];
  //       updatedSongs.splice(destinationIndex, 0, item);
  
  //       updatePlaylist({ ...currentPlaylist, songs: updatedSongs});
  //       removeFromQueue(item.id);
  
  //     }
  //   } else if (item.type === "PLAYLIST_ITEM") {
  //     // ... handle other item types and droppable IDs
  //     if (droppableId === "QUEUE_CONTAINER") {
  //       // Item moved from playlist to queue
  //       // Remove from playlist, add to queue
  
  //       // const destinationIndex = hoverIndex;
  //       const updatedSongs = [...queue];
  //       updatedSongs.splice(destinationIndex, 0, item);
  
  //       setQueue(updatedSongs);
  
  //       removeTrackFromPlaylist(item.id);
  
  //     } else if (droppableId === "PLAYLIST_CONTAINER") {
  //       // Item dropped within the playlist
  //       // Update playlist based on drop location
  
  //       // const destinationIndex = hoverIndex;
  //       // const sourceIndex = item.index;
  
  //       // Handle different drop scenarios within the playlist:
  //       if (destinationIndex === sourceIndex) {
  //         // Item dropped at the same position, no need to update
  //         return;
  //       } else {
  //         // Item moved:
  //         const updatedSongs = [...currentPlaylist.songs];
  //         const [removed] = updatedSongs.splice(sourceIndex, 1);
  //         updatedSongs.splice(destinationIndex, 0, removed);
  //         updatePlaylist({ ...currentPlaylist, songs: updatedSongs});
  //       }
  //     }
  //   }
  // };