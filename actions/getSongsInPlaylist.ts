import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const getSongsInPlaylist = async (playlistId: string): Promise<any[]> => {
  const supabase = createServerComponentClient({
    cookies: cookies
  });

  const { data: playlistSongs, error: playlistSongsError } = await supabase
    .from("playlists_songs")
    .select("song_id, song_order, yt") // Include 'yt' in the select
    .eq("playlistId", playlistId)
    .order("song_order", { ascending: true });

  if (playlistSongsError) {
    console.error(playlistSongsError.message);
  }

  const songIds = playlistSongs?.map((song) => song.song_id);

  const { data: songs, error: songsError } = await supabase
    .from("songs")
    .select("*")
    .in("id", songIds);

  if (songsError) {
    console.error(songsError.message);
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

  return (songs as any) || [];
};

export default getSongsInPlaylist;