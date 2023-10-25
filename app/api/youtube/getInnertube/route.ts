import { NextResponse } from 'next/server';
import { MusicClient, Client, VideoCompact, PlaylistVideos } from "youtubei";

import { Innertube } from 'youtubei.js';

export async function POST(
  request: Request
) {
  try {
    const youtube = await Innertube.create();

    const body = JSON.stringify(youtube);
    return new NextResponse(body, { headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.log(error);
    new NextResponse("An error occurred while fetching your profile's playlists.", { status: 500 })
  }
};