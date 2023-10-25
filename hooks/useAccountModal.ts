import { create } from 'zustand';

interface AccountModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const useAccountModal = create<AccountModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false })
}));

export default useAccountModal;

interface PlatformAccountModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  platform: string;
}

export const useSpotifyAccountModal = create<PlatformAccountModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
  platform: 'Spotify'
}));

export const useYoutubeAccountModal = create<PlatformAccountModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
  platform: 'Youtube'
}));

export const useSoundcloudAccountModal = create<PlatformAccountModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
  platform: 'Soundcloud'
}));