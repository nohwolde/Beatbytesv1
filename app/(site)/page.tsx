import getSongs from "@/actions/getSongs";
import Header from "@/components/Header";
import ListItem from "@/components/ListItem";
import Head from "next/head";
import PageContent from "./components/PageContent";
import getKey from "@/actions/getKey";
import { Platform } from "@/hooks/useSearch";
import { useEffect } from "react";
import { useKeyStore, useProfileStore } from "../store.js";
import getNewKey from "@/soundcloudController/keys"
import setKey from "@/actions/setKey";
import PlaylistItem from "@/components/PlaylistItem";
import { twMerge } from "tailwind-merge";

export default async function Home() {

  return (
    <div
      className="
        bg-neutral-900
        rounded-lg 
        h-full 
        w-full 
        overflow-hidden 
        overflow-y-auto
      "
    >
      <Head>
        <link
          rel="preload"
          href="/musive-icons.ttf"
          as="font"
          crossOrigin=""
          type="font/ttf"
        />
      </Head>
      <Header
        className={twMerge(`
        bg-gradient-to-b 
        from-[#31b0ff]
        to-b
        `
      )}>
        <div className="mb-2">
          <h1 
            className="
              text-gray-100
              text-3xl 
              font-semibold
            ">
              Welcome back
          </h1>
          <div 
            className="
              grid 
              grid-cols-1 
              sm:grid-cols-2 
              xl:grid-cols-3
              gap-3 
              mt-4
            "
          >
            <ListItem 
              name="Liked Songs" 
              image="/images/liked.png" 
              href="liked" 
            />
          </div>
        </div>
      </Header>
      <div className="mt-2 mb-7 px-6">
        <div className="flex justify-between items-center">
        </div>
        <PageContent />
      </div>
    </div>
  )
}
