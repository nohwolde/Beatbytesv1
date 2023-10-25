"use client";

import { useEffect, useState } from "react";

import AuthModal from "@/components/AuthModal";
import SubscribeModal from "@/components/SubscribeModal";
import UploadModal from "@/components/UploadModal";
import { ProductWithPrice } from "@/types";
import SpotifyAccountModal from "@/components/SpotifyAccountModal";
import YoutubeAccountModal from "@/components/YoutubeAccountModal";
import SoundcloudAccountModal from "@/components/SoundcloudAccountModal";

interface ModalProviderProps {
  products: ProductWithPrice[];
}

const ModalProvider: React.FC<ModalProviderProps> = ({
  products
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <AuthModal />
      <SubscribeModal products={products} />
      <UploadModal />
      <SpotifyAccountModal />
      <YoutubeAccountModal />
      <SoundcloudAccountModal />
    </>
  );
}

export default ModalProvider;