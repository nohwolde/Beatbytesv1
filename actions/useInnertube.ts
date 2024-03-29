"use client";
// import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
// import { cookies } from "next/headers";
import { searchModule, innertubeModule } from "@/libs/youtube";
import { Innertube, UniversalCache, Utils } from "youtubei.js";

import Jimp from "jimp";

let innertube: Innertube | null = null;

const setInnertube = async (): Promise<void> => {
  if (!innertube)
    innertube = await Innertube.create({
      //   cache: new UniversalCache(false),
      // });
      generate_session_locally: true,
      fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
        const url =
          typeof input === "string"
            ? new URL(input)
            : input instanceof URL
            ? input
            : new URL(input.url);

        // Transform the url for use with our proxy.
        url.searchParams.set("__host", url.host);
        url.host = process?.env?.NEXT_PUBLIC_BACKEND_URL || "localhost:8080";
        url.protocol = "http";

        const headers = init?.headers
          ? new Headers(init.headers)
          : input instanceof Request
          ? input.headers
          : new Headers();

        // Now serialize the headers.
        url.searchParams.set("__headers", JSON.stringify([...headers]));

        if (input instanceof Request) {
          // @ts-ignore
          input.duplex = "half";
        }

        // Copy over the request.
        const request = new Request(
          url,
          input instanceof Request ? input : undefined
        );

        headers.delete("user-agent");

        return fetch(
          request,
          init
            ? {
                ...init,
                headers,
              }
            : {
                headers,
              }
        );
      },
      cache: new UniversalCache(false),
    });
};

const getDash = async (id: any): Promise<any> => {
  if (!innertube) await setInnertube();
  const video = await innertube?.getInfo(id);
  const dash = await video?.toDash();
  return { video: video, dash: dash };
};

const getInnertube = async (): Promise<Innertube | undefined> => {
  if (!innertube)
    setInnertube().then(() => {
      return innertube;
    });
  else return innertube;
};

const search = async (
  searchTerm: string,
  searchType: "video" | "all" | "channel" | "playlist" | "movie"
): Promise<any> => {
  if (!innertube) await setInnertube();
  const search = await innertube?.search(searchTerm, { type: searchType });

  return search;
};

const getVideo = async (id: string): Promise<any> => {
  if (!innertube) await setInnertube();
  const video = await innertube?.getInfo(id);
  console.log("Items",video);
  return video;
};

const getBasicInfo = async (id: string): Promise<any> => {
  if (!innertube) await setInnertube();
  const video = await innertube?.getBasicInfo(id);
  return video;
};

const getPlaylist = async (id: string): Promise<any> => {
  if (!innertube) await setInnertube();
  const playlist = (await innertube?.getPlaylist(id))?.videos;
  return playlist;
};

const getThumbnail = async (
  id: string,
  resolution: string,
  backupThumbnail: Array<any>
): Promise<any> => {
  if (resolution == "max") {
    const url = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const image = await Jimp.read(Buffer.from(buffer));
    if (image.bitmap.height !== 120) return url;
  }
  if (backupThumbnail[backupThumbnail.length - 1])
    return backupThumbnail[backupThumbnail.length - 1].url;
  else return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
};

const getChannel = async (id: string): Promise<any> => {
  if (!innertube) await setInnertube();
  const channel = await innertube?.getChannel(id);
  return channel;
};

const getRecommended = async (): Promise<any> => {
  if (!innertube) await setInnertube();
  const recommended = await innertube?.getHomeFeed();
  return recommended;
};

export {
  getInnertube,
  search,
  getVideo,
  getDash,
  getBasicInfo,
  getThumbnail,
  getChannel,
  getRecommended,
  getPlaylist,
};
