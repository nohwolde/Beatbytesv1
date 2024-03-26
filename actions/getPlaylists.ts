import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

import getSongsInPlaylist from "./getSongsInPlaylist"

const getPlaylists = async (): Promise<any[]> => {
  const supabase = createServerComponentClient({
    cookies: cookies
  });

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    console.log(sessionError.message);
  }

  const { data: playlists, error: playlistsError } = await supabase
  .from("playlists")
  .select("*")
  .eq("user_id", sessionData.session?.user.id);

  if (playlistsError) {
    console.error(playlistsError.message);
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

  return (playlistsWithSongs as any) || [];
};

export default getPlaylists;