"use client";

import { useEffect, useState } from "react";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useSessionContext } from "@supabase/auth-helpers-react";

import { useUser } from "@/hooks/useUser";
import useSongModal from "@/hooks/useSongModal";

import Image from "next/image";

import expand from "@/public/images/expand.svg";

interface AddSongButtonProps {
  song: any;
};

const AddSongButton: React.FC<AddSongButtonProps> = ({
  song
}) => {
  const router = useRouter();
  const {
    supabaseClient
  } = useSessionContext();
  const authModal = useSongModal();
  const { isOpen, onOpen, onClose, setSong} = useSongModal();

  return (
    <button 
      className="
        cursor-pointer 
        hover:opacity-75 
        transition
      "
      onClick={(e) => {
        e.stopPropagation();
        setSong(song);
        if(!isOpen){
          onOpen();
        }
      }}
    >
      <Image 
        className="object-contain"
        onClick={() => {
          setSong(song);
          if(!isOpen){
            onOpen();
          }
        }}
        src={expand}
        style={{ filter: 'invert(100%)' }}
        alt="Image"
        width={25}
        height={25}
      />
    </button>
  );
}

export default AddSongButton;
