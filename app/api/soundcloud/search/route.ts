import { NextResponse } from 'next/server';
import { Client } from "soundcloud-scraper";

export async function POST(
  request: Request
) {
  const { searchTerm, type } = await request.json();
  try {
    const sc = new Client();
    const searchResults = await sc.search(searchTerm, type);
    // .then(async (results) => results.map(async (result) => {
    //   if(result.type === "track") {
    //     return await sc.getSongInfo(result.url);
    //   } else if(result.type === "playlist") {
    //     return await sc.getPlaylist(result.url);
    //   } else if(result.type === "artist") {
    //     return await sc.getUser(result.url);
    //   }
    // }));

    // const getInfo = await Promise.all(searchResults.map(async (result) => {
    //   if(result.type === "track") {
    //     return await sc.getSongInfo(result.url);
    //   } else if(result.type === "playlist") {
    //     return await sc.getPlaylist(result.url);
    //   } else if(result.type === "artist") {
    //     return await sc.getUser(result.url);
    //   }
    // }));

    // console.log(getInfo);

    const body = JSON.stringify(searchResults);
    return new NextResponse(body, { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.log(error);
    new NextResponse("An error occurred while fetching your profile's playlists.", { status: 500 })
  }
};