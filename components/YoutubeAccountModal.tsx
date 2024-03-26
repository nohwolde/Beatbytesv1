"use client";

import React, { useEffect, useState } from 'react';
import AccountModalComponent from './AccountModal';
import { useYoutubeAccountModal } from '@/hooks/useAccountModal';
import { postData } from '@/libs/helpers';
import { useYoutubeProfile } from '@/hooks/useProfile';
import { getPlaylist, getChannel } from '@/actions/useInnertube';
import { useProfileStore } from '@/app/store';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

const YoutubeAccountModal = () => {
  const { onClose, isOpen, platform } = useYoutubeAccountModal();

  const profile = useYoutubeProfile();


  const { ytPlaylists, setYtPlaylists, addYtPlaylist, setYtProfile} = useProfileStore();

  const supabase = useSupabaseClient();

  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
    };

    fetchSession();
  }, []);

  const handleSearchUser = async (value: string) => {
    try {
      const profileResponse = await postData({
        url: '/api/youtube/getProfile',
        data: { profile: value }
      });
      console.log(profileResponse);
      const { error } = await supabase.from("profiles").insert({
        profile_id: profileResponse?.externalId,
        platform: "Youtube",
        user_id: session?.user?.id,
        username: profileResponse?.username,
        image: profileResponse?.photo,
      });
      setYtProfile({profile_id: profileResponse?.externalId,
        platform: "Youtube",
        user_id: session?.user?.id,
        username: profileResponse?.username,
        image: profileResponse?.photo,
      })
      return profileResponse;
    } catch (error) {
      if (error) return alert((error as Error).message);
    }
  }

  const handleGetPlaylists = async (value: any) => {
    try {
      const playlistResponse = await postData({
        url: '/api/youtube/getProfile/getPlaylists',
        data: { profile: value.externalId }
      });
      console.log(playlistResponse);
      const channel = await getChannel(value.externalId);
      console.log("Channel", channel.current_tab.content.contents[0].contents);
      console.log("Profile", channel.metadata);
      // filter out any shelfs that are not created Playlists
      await Promise.all(channel.current_tab.content.contents[0].contents.filter((shelf: any) => 
       shelf.title.text === "Created playlists"
      )[0].content.items.map(async (playlist: any) => {

        const songs = await getPlaylist(playlist.id);

        const { error } = await supabase.from("playlists").insert({
          id: playlist.id,
          platform: "Youtube",
          name: playlist.title?.text,
          href: `https://www.youtube.com/playlist?list=${playlist.id}`,
          image: playlist.thumbnails[0]?.url,
          author: {
            name: channel.metadata.title, 
            id: channel.metadata.externalId,  
            image: channel.metadata.avatar[0].url
          },
          user_id: session?.user.id,
        });

        if (error) {
          console.log("Error", error);
        }

        await Promise.all(songs.map(async (song: any) => {
          const { error } = await supabase.from("songs").insert({
            id: song.id,
            author: {
              id: song.author?.id, 
              name: song.author?.name,
            },
            album: {},
            name: song.title?.text,
            image: song.thumbnails[0]?.url,
            platform: "Youtube",
          });

          if (error) {
            console.log("Error", error);
          }
          const { data: currentSongs, error: currentSongsError } =
          await supabase
            .from("playlists_songs")
            .select("*")
            .filter("playlistId", "eq", playlist?.id);

          console.log("Current songs", currentSongs?.length);

          if (currentSongsError) {
            console.error(
              "Error getting current songs:",
              currentSongsError
            );
            return;
          }

          // Calculate the next song order
          const nextSongOrder =
            currentSongs.length > 0 ? currentSongs.length + 1 : 1;

          const { error: error2 } = await supabase.from("playlists_songs").insert({
            playlistId: playlist.id,
            song_id: song.id,
            song_order: nextSongOrder,
            
          });

          if (error2) {
            console.log("Error", error2);
          }
        }));


        const ytList = {
          id: playlist.id,
          platform: "Youtube",
          name: playlist.title?.text,
          href: `https://www.youtube.com/playlist?list=${playlist.id}`,
          image: playlist.thumbnails[0]?.url,
          author: {
            name: channel.metadata.title, 
            id: channel.metadata.externalId,  
            image: channel.metadata.avatar[0].url
          },
          user_id: session?.user.id,
          songs: songs
        };
        console.log(ytList);



      }));
      return playlistResponse;

    } catch (error) {
      if (error) return alert((error as Error).message);
    }
  }

  // const handleGetPlaylists = async (value: any) => {
  //   try {
  //     const playlistResponse = await getChannel(value.externalId);
  //     //   postData({
  //     //   url: '/api/youtube/getProfile/getPlaylists',
  //     //   data: { profile: value.externalId }
  //     // });
  //     console.log(playlistResponse);
  //     return playlistResponse;
  //   } catch (error) {
  //     if (error) return alert((error as Error).message);
  //   }
  // }
  
  return <AccountModalComponent profile={profile} onClose={onClose} isOpen={isOpen} platform={platform} handleSearchUser={handleSearchUser} handleGetPlaylists={handleGetPlaylists}/>;
}

export default YoutubeAccountModal;
