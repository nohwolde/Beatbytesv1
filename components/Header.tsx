"use client";

import { twMerge } from "tailwind-merge";
import { RxCaretLeft, RxCaretRight } from "react-icons/rx";
import { useRouter } from "next/navigation";
import { FaUserAlt } from "react-icons/fa";
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { toast } from "react-hot-toast";
import { HiHome } from "react-icons/hi";
import { BiSearch } from "react-icons/bi";

import Image from "next/image";
import useAuthModal from "@/hooks/useAuthModal";
// useYoutubeAccountModal, useSoundcloudAccountModal 
import { useUser } from "@/hooks/useUser";
import usePlayer from "@/hooks/usePlayer";

import Button from "./Button";
import { useSpotifyAccountModal, useSoundcloudAccountModal, useYoutubeAccountModal } from "@/hooks/useAccountModal";
import SearchInput from "./SearchInput";

interface HeaderProps {
  children?: React.ReactNode;
  className?: string;
  displaySearch?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  children,
  className,
  displaySearch = false
}) => {
  const player = usePlayer();
  const router = useRouter();
  const authModal = useAuthModal();

  // account modals
  const spotifyModal = useSpotifyAccountModal();
  const ytModal = useYoutubeAccountModal();
  const scModal = useSoundcloudAccountModal();

  const supabaseClient = useSupabaseClient();
  const { user } = useUser();

  // logo paths
  const spotifyLogoPath = '/images/logos/spot.svg';
  const ytLogoPath = '/images/logos/yt.svg';
  const scLogoPath = '/images/logos/soundcloud.png';
  
  const handleLogout = async () => {
    const { error } = await supabaseClient.auth.signOut();
    player.reset();
    router.refresh();

    if (error) {
      toast.error(error.message);
    }
  }

  return (
    <div
      className={twMerge(`
        h-fit 
        bg-gradient-to-b 
        from-sky-500
        p-6
        `,
        className
      )}>
      <div className="w-full mb-4 flex items-center justify-between">
        <div className="hidden md:flex gap-x-2 items-center">
          <button 
            onClick={() => router.back()} 
            className="
              rounded-full 
              bg-black 
              flex 
              items-center 
              justify-center 
              cursor-pointer 
              hover:opacity-75 
              transition
            "
          >
            <RxCaretLeft className="text-white" size={35} />
          </button>
          <button 
            onClick={() => router.forward()} 
            className="
              rounded-full 
              bg-black 
              flex 
              items-center 
              justify-center 
              cursor-pointer 
              hover:opacity-75 
              transition
            "
          >
            <RxCaretRight className="text-white" size={35} />
          </button>
        </div>
        <div className="flex md:hidden gap-x-2 items-center">
          <button 
            onClick={() => router.push('/')} 
            className="
              rounded-full 
              p-2 
              bg-white 
              flex 
              items-center 
              justify-center 
              cursor-pointer 
              hover:opacity-75 
              transition
            "
          >
            <HiHome className="text-black" size={20} />
          </button>
          <button 
            onClick={() => router.push('/search')} 
            className="
              rounded-full 
              p-2 
              bg-white 
              flex 
              items-center 
              justify-center 
              cursor-pointer 
              hover:opacity-75 
              transition
            "
          >
            <BiSearch className="text-black" size={20} />
          </button>
        </div>
        <div className="flex justify-between items-center gap-x-4">
          {displaySearch &&
            <SearchInput />
          }
          <div className="flex gap-x-2 items-center bg-sky-900 mx-1 px-2 rounded-full">
            <Image
              src={spotifyLogoPath}
              width={35}
              height={35}
              alt='Spotify'
              className="cursor-pointer"
              onClick={spotifyModal.onOpen}
            />
            <Image
              src={ytLogoPath}
              width={50}
              height={50}
              alt='Youtube'
              className="cursor-pointer shadow-lg"
              onClick={ytModal.onOpen}
            />
            <Image
              src={scLogoPath}
              width={42}
              height={42}
              alt='Soundcloud'
              className="cursor-pointer"
              onClick={scModal.onOpen}
            />
          </div>
          {user ? (
            <div className="flex gap-x-4 items-center">
              <Button 
                onClick={handleLogout} 
                className="bg-white px-6 py-2"
              >
                Logout
              </Button>
              <Button 
                onClick={() => router.push('/account')} 
                className="bg-white"
              >
                <FaUserAlt />
              </Button>
            </div>
          ) : (
            <>
              <div>
                <Button 
                  onClick={authModal.onOpen} 
                  className="
                    bg-transparent 
                    text-neutral-300 
                    font-medium
                  "
                >
                  Sign up
                </Button>
              </div>
              <div>
                <Button 
                  onClick={authModal.onOpen} 
                  className="bg-white px-6 py-2"
                >
                  Log in
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

export default Header;
