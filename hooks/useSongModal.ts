import { create } from 'zustand';

interface SongModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  song: any;
  setSong: (song: any) => void;
}

const useSongModal = create<SongModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
  song: null,
  setSong: (song: any) => set({song}),
}));



export default useSongModal;