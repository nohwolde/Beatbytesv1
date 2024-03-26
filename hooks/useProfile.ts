import { create } from "zustand";

export interface ProfileStore {
  user: any | null;
  username: string;
  setUsername: (username: string) => void;
  name: string;
  setName: (name: string) => void;
  image: string;
  setImage: (image: string) => void;
  playlists: any[] | null;
  setPlaylists: (playlists: any[]) => void;
  addPlaylist: (playlist: any) => void;
  getPlaylist: (id: string) => any;
}

export const useSpotifyProfile = create<ProfileStore>((set, get) => ({
  user: null,
  setUser: (user: any) => set({ user }),
  username: "",
  setUsername: (username: string) => set({ username }),
  name: "",
  setName: (name: string) => set({ name }),
  image: "",
  setImage: (image: string) => set({ image }),
  playlists: null,
  setPlaylists: (playlists: any[]) => set({ playlists }),
  addPlaylist: (playlist: any) =>
    set((state) => ({
      playlists: state.playlists ? [...state.playlists, playlist] : [playlist],
    })),
  getPlaylist: (id: string) => {
    const { playlists } = get();
    if (playlists) {
      return playlists.find((playlist) => playlist.id === "/playlist/" + id);
    }
    return null;
  }
}));

export const useYoutubeProfile = create<ProfileStore>((set, get) => ({
  user: null,
  setUser: (user: any) => set({ user }),
  username: "",
  setUsername: (username: string) => set({ username }),
  name: "",
  setName: (name: string) => set({ name }),
  image: "",
  setImage: (image: string) => set({ image }),
  playlists: null,
  setPlaylists: (playlists: any[]) => set({ playlists }),
  addPlaylist: (playlist: any) =>
    set((state) => ({
      playlists: state.playlists ? [...state.playlists, playlist] : [playlist],
    })),
  getPlaylist: (id: string) => {
    const { playlists } = get();
    if (playlists) {
      return playlists.find((playlist) => playlist.id === id);
    }
    return null;
  }
}));

export const useSoundcloudProfile = create<ProfileStore>((set, get) => ({
  user: null,
  setUser: (user: any) => set({ user }),
  username: "",
  setUsername: (username: string) => set({ username }),
  name: "",
  setName: (name: string) => set({ name }),
  image: "",
  setImage: (image: string) => set({ image }),
  playlists: null,
  setPlaylists: (playlists: any[]) => set({ playlists }),
  addPlaylist: (playlist: any) =>
    set((state) => ({
      playlists: state.playlists ? [...state.playlists, playlist] : [playlist],
    })),
  getPlaylist: (id: string) => {
    const { playlists } = get();
    if (playlists) {
      return playlists.find((playlist) => playlist.id === id);
    }
    return null;
  }
}));
