"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { persistNSync } from "persist-and-sync"

const useProfileStore = create(
  persistNSync(
    (set, get) => 
      ({
        scProfile: null,
        setScProfile: (profile) => set({ scProfile: profile }),
        spotProfile: null,
        setSpotProfile: (profile) => set({ spotProfile: profile }),
        ytProfile: null,
        setYtProfile: (profile) => set({ ytProfile: profile }),
        scPlaylists: [],
        setScPlaylists: (playlists) => set({ scPlaylists: playlists }),
        addScPlaylist: (playlist) => set({ scPlaylists: [...get().scPlaylists, playlist] }),
        getScPlaylist: (id) => get().scPlaylists.find((playlist) => playlist.id === id),
        updateScPlaylist: (playlistId, songs) => {
          const playlist = get().scPlaylists.find((playlist) => playlist.id === playlistId);
          const index = get().scPlaylists.indexOf(playlist);
          const updatedPlaylist = { ...playlist, songs: songs };
          const updatedPlaylists = get().scPlaylists;
          updatedPlaylists[index] = updatedPlaylist;
          set({ scPlaylists: updatedPlaylists });
        },
        spotPlaylists: [],
        setSpotPlaylists: (playlists) => set({ spotPlaylists: playlists }),
        addSpotPlaylist: (playlist) => set({ spotPlaylists: [...get().spotPlaylists, playlist] }),
        getSpotPlaylist: (id) => get().spotPlaylists.find((playlist) => playlist.id === id),
        updateSpotPlaylist: (playlistId, songs) => { 
          const playlist = get().spotPlaylists.find((playlist) => playlist.id === playlistId);
          const index = get().spotPlaylists.indexOf(playlist);
          const updatedPlaylist = { ...playlist, songs: songs };
          const updatedPlaylists = get().spotPlaylists;
          updatedPlaylists[index] = updatedPlaylist;
          set({ spotPlaylists: updatedPlaylists });
        },
        ytPlaylists: [],
        setYtPlaylists: (playlists) => set({ ytPlaylists: playlists }),
        addYtPlaylist: (playlist) => set({ ytPlaylists: [...get().ytPlaylists, playlist] }),
        getYtPlaylist: (id) => get().ytPlaylists.find((playlist) => playlist.id === id),
        updateYtPlaylist: (playlistId, songs) => { 
          const playlist = get().ytPlaylists.find((playlist) => playlist.id === playlistId);
          const index = get().ytPlaylists.indexOf(playlist);
          const updatedPlaylist = { ...playlist, songs: songs };
          const updatedPlaylists = get().ytPlaylists;
          updatedPlaylists[index] = updatedPlaylist;
          set({ ytPlaylists: updatedPlaylists });
        },
      }), 
      {
        name: "profile-storage"
      }
  )
);

// const useProfileStore = create(profileStore);

let keyStore = (set, get) => ({
  scKey: null,
  setScKey: (key) => set({ scKey: key }),
});

const useKeyStore = create(keyStore);

let searchStore = (set, get) => ({
  scResults: {collection: [], next_href: ""},
  setScResults: (results) => set({ scResults: results }),
  spotResults: [],
  setSpotResults: (results) => set({ spotResults: results }),
  ytResults: [],  
  setYtResults: (results) => set({ ytResults: results }),
});

const useSearchStore = create(searchStore);

const usePlayerStore = create(
    (set, get) => ({
  queue: [],
  setQueue: (queue) => set({ queue: queue }),
  addToQueue: (track) => set({ queue: [...get().queue, track] }),
  addToFront: (track) => set({ queue: [track, ...get().queue] }),
  removeFromQueue: (id) => set({ queue: get().queue.filter((track) => track.id !== id) }),
  currentPlaylist: {songs:[]},
  unshuffledPlaylist: { songs: [] },
  setUnshuffledPlaylist: (playlist) => set({ unshuffledPlaylist: playlist }),
  updatePlaylist: (playlist) => set({ currentPlaylist: playlist }),
  setCurrentPlaylist: (playlist) => {
    set({ currentPlaylist: playlist, unshuffledPlaylist: playlist });
  },
  playNext: () => {
    if(get().queue.length > 0) {
      // update history
      set({ history: [...get().history, get().currentTrack] });
      const nextSong = get().queue[0];
      set({ queue: get().queue.slice(1) });
      set({ currentTrack: nextSong });
    } else if (get().currentPlaylist.songs.length > 0) {
      // update history
      set({ history: [...get().history, get().currentTrack] });
      const nextSong = get().currentPlaylist.songs[0];
      set({ currentPlaylist: { ...get().currentPlaylist, songs: [...get().currentPlaylist.songs.slice(1), nextSong] } }); // Rotate the songs
      set({ currentTrack: nextSong });
    }
    return;
  },
  playPrev: () => {
    if(get().history.length > 0) {
      const prevSong = get().history[get().history.length - 1];
      set({ history: get().history.slice(0, -1) });
      set({ queue: [get().currentTrack, ...get().queue] });
      set({ currentTrack: prevSong });
    }
  },
  shufflePlaylist: () => {
    let shuffled = [...get().currentPlaylist.songs];
    // Shuffle the 'shuffled' array
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    set({ currentPlaylist: { songs: shuffled } });
  },
  unshufflePlaylist: () => {
    set({ currentPlaylist: { songs: [...get().unshuffledPlaylist.songs] } });
  },
  removeTrackFromPlaylist: (id) => {
    set({ currentPlaylist: { songs: get().currentPlaylist.songs.filter((track) => track.id !== id) } });
  },
  clearQueue: () => set({ queue: [] }),
  history: [],
  addToHistory: (track) => set({ history: [...get().history, track] }),
  currentTrack: null,
  setCurrentTrack: (track) => {
    // update history
    // if(get().currentTrack){
    //   set({ history: [...get().history, get().currentTrack] });
    // }
    set({ currentTrack: track })
  },
  isPlaying: false,
  setIsPlaying: (bool) => set({ isPlaying: bool }),
  isPaused: false,
  setIsPaused: (bool) => set({ isPaused: bool }),
  isShuffled: false,
  setIsShuffled: (bool) => {
    set({ isShuffled: bool });
    // if(get().currentPlaylist && get().currentPlaylist.songs?.length > 0) {
    //   if (bool) {
    //     get().shufflePlaylist();
    //   } else {
    //     get().unshufflePlaylist();
    //   }
    // }
  },
  isLooped: false,
  setIsLooped: (bool) => set({ isLooped: bool }),
  isMuted: false,
  setIsMuted: (bool) => set({ isMuted: bool }),
  volume: 1,
  setVolume: (vol) => set({ volume: vol }),
  progress: 0,
  setProgress: (prog) => set({ progress: prog }),
  duration: 0,
  setDuration: (dur) => set({ duration: dur }),
  seek: 0,
  setSeek: (seek) => set({ seek: seek }),
}
)
);


export { useProfileStore, useKeyStore, useSearchStore, usePlayerStore };