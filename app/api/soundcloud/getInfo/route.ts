import { NextResponse } from 'next/server';
import { Client } from "soundcloud-scraper";
import metascraper from 'metascraper-soundcloud';
import SoundScraper from '@/components/SoundScraper';

export async function POST(
  request: Request
) {
  const { url, type } = await request.json();
  try {
    const sc = new Client();

    const getData = await SoundScraper.getHtmlFromUrl(url);

    const getInfo = type === "track" ? await sc.getSongInfo(url) : type === "playlist" ? await metascraper({html: getData, url: url}) : type === "artist" ? await sc.getUser(url): null;
    
    console.log(getInfo);

    const body = JSON.stringify({...getInfo, type});
    return new NextResponse(body, { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.log(error);
    new NextResponse("An error occurred while fetching your profile's playlists.", { status: 500 })
  }
};