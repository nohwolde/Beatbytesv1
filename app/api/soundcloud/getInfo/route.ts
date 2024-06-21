import { NextResponse } from 'next/server';
import { Client } from "soundcloud-scraper";
import SoundScraper from '@/components/SoundScraper';

export async function POST(
  request: Request
) {
  const { url, type } = await request.json();
  try {
    const sc = new Client();

    const getData = await SoundScraper.getHtmlFromUrl(url);

    console.log(getData);

    const body = JSON.stringify(getData);
    return new NextResponse(body, { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.log(error);
    return new NextResponse("An error occurred while fetching your profile's playlists.", { status: 500 })
  }
};