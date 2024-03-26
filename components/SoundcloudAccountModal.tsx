"use client";

import React, { useEffect, useState } from 'react';
import AccountModalComponent from './AccountModal';
import { useSoundcloudAccountModal } from '@/hooks/useAccountModal';
import { postData } from '@/libs/helpers';
import { useSoundcloudProfile } from '@/hooks/useProfile';
import getNewKey from "@/soundcloudController/keys"
import { fetchSoundcloudProfileAndPlaylists, fetchSoundcloudPlaylists } from '@/soundcloudController/soundcloudActions';
import { getSoundcloudUser, getSoundcloudUserLikes, getSoundcloudUserPlaylists, getTrackStream, getSoundcloudImage } from '@/soundcloudController/api-controller';
import { useKeyStore, useProfileStore } from '@/app/store';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

const SoundcloudAccountModal = () => {
  const { onClose, isOpen, platform } = useSoundcloudAccountModal();

  const profile = useSoundcloudProfile();

  const {scKey, setScKey} = useKeyStore();

  const {scProfile, setScProfile, setSpotProfile, setYtProfile} = useProfileStore();


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

  useEffect(() => {
    if(session) {
      // get all profiles for this user

      const fetchProfiles = async () => {
        const { data: profiles, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", session?.user?.id);

        if (error) {
          console.error("Error getting profiles:", error);
          return;
        }
        else {
          console.log("Profiles", profiles);
          // set all profiles based on platform 

          profiles.map((prof: any) => {
            if(prof.platform === "Soundcloud") {
              setScProfile(prof);
            }
            else if(prof.platform === "Youtube") {
              setYtProfile(prof);
            }
            else if(prof.platform === "Spotify") {
              setSpotProfile(prof);
            }
          });
        }

        console.log("Profiles", profiles);
      };

      fetchProfiles();
    }
  }, [session])



  const handleSearchUser = async (value: string) => {
    try {
      // const key = await getNewKey.refreshSoundcloudClientId();
      // console.log(key);
      console.log(scKey);
      // const profRes = await fetchSoundcloudProfileAndPlaylists(value);
      // console.log(profRes);
      if(scKey !== null) {
        // const profRes = await fetchSoundcloudProfileAndPlaylists(value, scKey);
        // console.log(profRes);
        // const user = JSON.parse(profRes);
        const newProf = await getSoundcloudUser(value, scKey);
        const user = (newProf).response;
        console.log(newProf);

        if(newProf.newKey) {
          if(newProf.newKey !== scKey) {
            console.log("Setting new key");
            setScKey(newProf.newKey);
          }
        }

        const profImage = await getSoundcloudImage(user.avatar_url);
        console.log(user);
        const newProfile = {...user, photo: profImage, name: user.username};
        const { error } = await supabase.from("profiles").insert({
          profile_id: user.id,
          platform: "Soundcloud",
          user_id: session?.user?.id,
          username: user.username,
          image: profImage,
        });

        if (error) {
          console.log("Error", error);
        }

        setScProfile(newProfile);
        return newProfile;
      }
      return {};
    } catch (error) {
      if (error) return alert((error as Error).message);
    }
  }

  const handleGetPlaylists = async (value: any) => {
    try {
      if (scKey !== null && scProfile !== null) {
        console.log("Value", value);
        let nextUrl = null;
        let newPlaylists: any[] = [];
        let offset = 0;
  
        do {
          console.log("Offset", offset);
          const response = await getSoundcloudUserPlaylists(scProfile.id, scKey, offset);
          console.log(response);
          newPlaylists = [...newPlaylists, ...response.collection];
          console.log(response.collection);
          nextUrl = response.next_href;
          offset = offset + 10;
        } while (nextUrl);

        newPlaylists.map(async (playlist: any) => {
          const pImage = await getSoundcloudImage(playlist?.artwork_url ? playlist.artwork_url : playlist?.tracks[0]?.artwork_url)

          const { error } = await supabase.from("playlists").insert({
            id: playlist?.id,
            platform: "Soundcloud",
            name: playlist?.title,
            href: playlist?.permalink_url,
            image: pImage,
            author: {
              name: playlist?.user?.username,
              id: playlist?.user?.id,
              image: playlist?.user?.avatar_url
            },
            user_id: session?.user.id,
          });

          if (error) {
            console.log("Error", error);
          }

          playlist.tracks.map(async (track: any) => {
            const { error } = await supabase.from("songs").insert({
              id: track?.id,
              author: {
                name: track?.user?.username,
                id: track?.user?.id,
                image: track?.user?.avatar_url
              },
              name: track?.title,
              image: track?.artwork_url,
              media: {
                transcodings: track?.media?.transcodings,
                track_authorization: track?.track_authorization,
              },
              platform: "Soundcloud"
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
              song_id: track.id,
              song_order: nextSongOrder,
            });

            if (error2) {
              console.log("Error", error2);
            }
          });
        });

        console.log(newPlaylists);  
        return newPlaylists;
      }
    } catch (error) {
      if (error) return alert((error as Error).message);
    }
  }

  return <AccountModalComponent profile={profile} onClose={onClose} isOpen={isOpen} platform={platform} handleSearchUser={handleSearchUser} handleGetPlaylists={handleGetPlaylists} />;
}

export default SoundcloudAccountModal;
