"use client";

import React, { use, useEffect, useState } from "react";
import AccountModalComponent from "./AccountModal";
import { useSpotifyAccountModal } from "@/hooks/useAccountModal";
import { postData } from "@/libs/helpers";
import { useSpotifyProfile } from "@/hooks/useProfile";
import {
  getSpotKey,
  getSpotifyUserPlaylists,
  getSpotifyPlaylist,
} from "@/spotifyController/spotController";
import { useProfileStore } from "@/app/store";
import {
  search,
  getVideo,
  getBasicInfo,
  getDash,
  getChannel,
} from "@/actions/useInnertube";
import {
  useSessionContext,
  useSupabaseClient,
} from "@supabase/auth-helpers-react";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

import getPlaylists from "@/actions/getPlaylists";

const SpotifyAccountModal = () => {
  const { onClose, isOpen, platform } = useSpotifyAccountModal();

  const profile = useSpotifyProfile();

  const { setSpotProfile, spotPlaylists, setSpotPlaylists, addSpotPlaylist,  updateSpotPlaylist, setYtPlaylists, updateScPlaylist, updateYtPlaylist, setScPlaylists } =
    useProfileStore();

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
    console.log(session);

    const fetchPlaylists = async () => {
      if (session) {
        // const { data: playlists, error } = await getSongsInUserPlaylists(
        //   session?.user?.id
        // );
        // console.log(playlists);
        // if (error) {
        //   console.error("Error fetching user playlists:", error);
        //   return;
        // }

        // Fetch all playlists for the user
        const { data: playlists, error: playlistsError } = await supabase
          .from("playlists")
          .select("*")
          .eq("user_id", session?.user?.id);

        if (playlistsError) {
          console.error("Error fetching user playlists:", playlistsError);
          return;
        }


        setSpotPlaylists(playlists.filter((playlist) => playlist.platform === "Spotify"));

        setYtPlaylists(playlists.filter((playlist) => playlist.platform === "Youtube"));

        setScPlaylists(playlists.filter((playlist) => playlist.platform === "Soundcloud"));

        const songs = [];

        for (const playlist of playlists) {
          const playlistSongs = await getSongsInPlaylist(playlist.id);
          songs.push(playlistSongs);
          if (playlist.platform === "Spotify") {
            updateSpotPlaylist(playlist.id, playlistSongs);
          }
          else if (playlist.platform === "Youtube") {
            updateYtPlaylist(playlist.id, playlistSongs);
          }
          else if (playlist.platform === "Soundcloud") {
            updateScPlaylist(playlist.id, playlistSongs);
          }
        }

      }
    };

    fetchPlaylists();
  }, [session]);

  const searchYtEquivalent = async (title: string, artist: string) => {
    try {
      const searchResults = await search(title + " " + artist, "video");
      return searchResults;
    } catch (error) {
      console.error("Error searching for song:", error);
      return [];
    }
  }


      

  async function getSongsInPlaylist(playlistId: string) {
    try {
      const { data: playlistSongs, error: playlistSongsError } = await supabase
        .from("playlists_songs")
        .select("song_id, song_order, yt") // Include 'yt' in the select
        .eq("playlistId", playlistId)
        .order("song_order", { ascending: true });

      if (playlistSongsError) {
        console.error("Error fetching songs in playlist:", playlistSongsError);
        return;
      }

      const songIds = playlistSongs.map((song) => song.song_id);

      const { data: songs, error: songsError } = await supabase
        .from("songs")
        .select("*")
        .in("id", songIds);

      if (songsError) {
        console.error("Error fetching song details:", songsError);
        return;
      }

      // Add 'yt' to each song
      for (const song of songs) {
        const playlistSong = playlistSongs.find((ps) => ps.song_id === song.id);
        song.yt = playlistSong?.yt;
      }

      // Sort the songs based on the order in the playlist
      songs.sort((a, b) => {
        const orderA = playlistSongs.find(
          (song) => song.song_id === a.id
        ).song_order;
        const orderB = playlistSongs.find(
          (song) => song.song_id === b.id
        ).song_order;
        return orderA - orderB;
      });

      return songs;
    } catch (error) {
      console.error("Error fetching songs in playlist:", error);
    }
  }

  async function getSongsInUserPlaylists(userId: string) {
    try {
      // Fetch all playlists for the user
      const { data: playlists, error: playlistsError } = await supabase
        .from("playlists")
        .select("*")
        .eq("user_id", userId);

      if (playlistsError) {
        console.error("Error fetching user playlists:", playlistsError);
        return;
      }

      // Fetch songs for each playlist
      const playlistsWithSongs = [];
      for (const playlist of playlists) {
        const songs = await getSongsInPlaylist(playlist.id);
        playlistsWithSongs.push({
          ...playlist,
          songs: songs,
        });
      }

      console.log(playlistsWithSongs);
      setSpotPlaylists(playlistsWithSongs.filter((playlist) => playlist.platform === "Spotify"));

      setYtPlaylists(playlistsWithSongs.filter((playlist) => playlist.platform === "Youtube"));

      setScPlaylists(playlistsWithSongs.filter((playlist) => playlist.platform === "Soundcloud"));

      return playlistsWithSongs;
    } catch (error) {
      console.error("Error fetching songs in user playlists:", error);
    }
  }

  const handleSearchUser = async (value: string) => {
    try {
      // the old way of getting profile info through scraping
      const profileResponse = await postData({
        url: "/api/spotify/getProfile",
        data: { profile: value },
      });
      console.log(profileResponse);

      const { error } = await supabase.from("profiles").insert({
        profile_id: profileResponse?.username,
        platform: "Spotify",
        user_id: session?.user?.id,
        username: profileResponse?.username,
        image: profileResponse?.photo,
      });
      setSpotProfile({
        platform: "Spotify",
        user_id: session?.user?.id,
        username: profileResponse?.username,
        image: profileResponse?.photo,
      })


 

      return profileResponse;
    } catch (error) {
      if (error) return alert((error as Error).message);
    }
  };

  const handleGetPlaylists = async (value: any) => {
    try {
      
      const getSpotKeyResponse = await getSpotKey();
      console.log(getSpotKeyResponse);
      const accessToken = getSpotKeyResponse.accessToken;
      const playlistsResponse = await getSpotifyUserPlaylists(
        "nohwolde",
        accessToken
      );
      console.log(playlistsResponse);
      const playlistData = await Promise.all(
        playlistsResponse.items.map(async (playlist: any) => {
          const {  error } = await supabase.from("playlists").insert({
            id: playlist?.id,
            platform: "Spotify",
            name: playlist?.name,
            href: playlist?.href,
            image: playlist?.images[0]?.url,
            author: playlist?.owner,
            user_id: session?.user?.id,
          });
          if(error) {
            console.error("Error inserting playlist:", error);
            return;
          }
          else {
            console.log("Playlist inserted");
            addSpotPlaylist({
              id: playlist?.id,
              platform: "Spotify",
              name: playlist?.name,
              href: playlist?.href,
              image: playlist?.images[0]?.url,
              author: playlist?.owner,
              user_id: session?.user?.id,
            });
          }
          const getPlaylists = await getSpotifyPlaylist(
            playlist.id,
            accessToken
          );
          const songs = await Promise.all(
            getPlaylists.items.map(async (song: any) => {
              const yt = await searchYtEquivalent(
                song?.track?.name,
                song?.track?.artists ? song?.track?.artists[0]?.name : ""
              );

              if (song?.track?.is_local) {
                console.log("Local song", song);
                const { error } = await supabase.from("songs").insert({
                  id: yt?.results[0]?.id,
                  author: yt?.results[0]?.author,
                  name: yt?.results[0]?.title?.text,
                  image: yt?.results[0]?.thumbnails[0]?.url,
                  platform: "Youtube",
                });

                // Check if there was an error inserting the song
                if (error) {
                  console.error("Error inserting song:", error);
                  return;
                }

                // Get the current number of songs in the playlist

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

                // Insert into playlists_songs table

                const { error: playlistError } = await supabase
                  .from("playlists_songs")
                  .insert({
                    song_id: yt?.results[0]?.id,
                    playlistId: playlist?.id,
                    yt: yt.results ? yt.results[0] : {},
                    song_order: nextSongOrder, // Add the song order here
                  });

                // Check if there was an error inserting the playlist song
                if (playlistError) {
                  console.error(
                    "Error inserting playlist song:",
                    playlistError
                  );
                  return;
                }

                return {
                  id: yt?.results[0]?.id,
                  author: yt?.results[0]?.author,
                  album: {},
                  name: yt?.results[0]?.title?.text,
                  image: yt?.results[0]?.thumbnails[0]?.url,
                  platform: "Youtube",
                };
              } else {
                const { error } = await supabase.from("songs").insert({
                  id: song?.track?.id,
                  author: song?.track?.artists ? song.track.artists[0] : [],
                  album: song?.track?.album,
                  name: song?.track?.name,
                  image: song?.track?.album?.images[0]?.url,
                  platform: "Spotify",
                });
                // Check if there was an error inserting the song
                // if (error) {
                //   console.error('Error inserting song:', error);
                //   return;
                // }

                // Get the current number of songs in the playlist
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

                // Insert into playlists_songs table
                const { error: playlistError } = await supabase
                  .from("playlists_songs")
                  .insert({
                    song_id: song?.track?.id,
                    playlistId: playlist?.id,
                    yt: yt.results
                      ? {
                          id: yt?.results[0]?.id,
                          author: yt?.results[0]?.author,
                          album: {},
                          name: yt?.results[0]?.title?.text,
                          image: yt?.results[0]?.thumbnails[0]?.url,
                          platform: "Youtube",
                        }
                      : {},
                    song_order: nextSongOrder, // Add the song order here
                  });

                // Check if there was an error inserting the playlist song
                if (playlistError) {
                  console.error(
                    "Error inserting playlist song:",
                    playlistError
                  );
                  return;
                }

                return {
                  ...song.track,
                  platform: "Spotify",
                  yt: yt.results
                    ? {
                        id: yt?.results[0]?.id,
                        author: yt?.results[0]?.author,
                        album: {},
                        name: yt?.results[0]?.title?.text,
                        image: yt?.results[0]?.thumbnails[0]?.url,
                        platform: "Youtube",
                      }
                    : {},
                };
              }
            })
          );
          const data = { ...playlist, songs };
          // addSpotPlaylist(data);

          console.log("Playlist", data);
          // setSpotPlaylists(data);
          onClose();
          return data;
        })
      );
      // setSpotPlaylists(playlistData);
      console.log(playlistData);
      // push playlistData to supabase
      return spotPlaylists;
      
    } catch (error) {
      if (error) return alert((error as Error).message);
    }
  };

  return (
    <AccountModalComponent
      profile={profile}
      onClose={onClose}
      isOpen={isOpen}
      platform={platform}
      handleSearchUser={handleSearchUser}
      handleGetPlaylists={handleGetPlaylists}
    />
  );
};

export default SpotifyAccountModal;
