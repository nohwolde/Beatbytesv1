"use client"

import { Song } from "@/types";
import useOnPlay from "@/hooks/useOnPlay";
import SongItem from "@/components/SongItem";
import { Platform } from "@/hooks/useSearch";
import { useKeyStore, useProfileStore } from '@/app/store';
import getNewKey from "@/soundcloudController/keys"
import setKey from "@/actions/setKey";
import { useEffect, useState } from "react";

import { useSessionContext } from "@supabase/auth-helpers-react";
import getKey from "@/actions/getKey";

import Profile from "@/components/Profile";
import PlaylistItem from "@/components/PlaylistItem";

import playlistImage from "@/public/images/playlist.jpeg";
import { useRouter } from "next/navigation";

import { getChannel, getHomeFeed } from "@/actions/useInnertube";

import Image from "next/image";

import ChannelContent from "@/app/channel/components/ChannelContent";

interface PageContentProps {
  songs?: Song[];
}

const PageContent: React.FC<PageContentProps> = ({
  songs, 
  // key
}) => {
  const router = useRouter();
  const {
    supabaseClient
  } = useSessionContext();
  const { scKey, setScKey } = useKeyStore();

  const [channelData, setChannelData] = useState({
    header: 
      {author:{name: ''},banner: [{url: ''}], channel_handle:{text: ''}, subscribers:{text:''}, videos_count:{text:'0'}}
    , 
    current_tab: 
      {content: {contents: []}}, metadata: {avatar: [{url: ''}], description: ''}});
  const id = "UC-9-kyTW8ZkZNDHQJ6FgpwQ"
  console.log(id);
  useEffect(() => {
    const setInnertube = async () => {
      console.log(id);
      const channel = await getChannel(id as string);
      console.log(channel);
      setChannelData(channel);
      console.log(channel?.current_tab.content.contents.filter((shelf: any) => shelf.contents[0].type === "Shelf" || shelf.contents[0].type === "ChannelVideoPlayer"));

      const homeFeed = await getHomeFeed();

      console.log("Home", homeFeed);
    }
    setInnertube();
  }, []);

  

  const { spotPlaylists, scPlaylists, ytPlaylists } = useProfileStore();

  return (
    <>
      {channelData && 
        <ChannelContent contents={channelData?.current_tab.content.contents.filter(
          (shelf: any) => shelf.contents[0].type === "Shelf" || shelf.contents[0].type === "ChannelVideoPlayer")} />
      }
    </>
  );
}
 
export default PageContent;