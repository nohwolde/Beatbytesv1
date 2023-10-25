import { NextResponse } from 'next/server';
import { Client, VideoCompact, PlaylistVideos } from "youtubei";

import youtube, {Video} from "scrape-youtube";

import { Innertube } from 'youtubei.js';

export async function POST(
  request: Request
) {
  const { searchTerm, type } = await request.json();
  try {
    // const searchResults: {
    //   id: string; name: string; image: string; uploadDate: string; description: string; duration: number;
    //   link: string; channel: { id: string; name: string; }; platform: string;
    // }[] = [];
    // await youtube.search(searchTerm).then((results) => {
    //     results.videos.map((video: Video) => {
    //       searchResults.push({
    //       id: video.id,
    //       name: video.title,
    //       image: video.thumbnail,
    //       uploadDate: video.uploaded,
    //       description: video.description,
    //       duration: video.duration,
    //       link: video.link,
    //       channel: {
    //         id: video.channel.id,
    //         name: video.channel.name,
    //       },
    //       platform: "Youtube",
    //       }
    //     )
    //   })
    // });
    // console.log(searchResults);
    // const body = JSON.stringify(searchResults);
    // return new NextResponse(body, { headers: { 'Content-Type': 'application/json' } });
    const yt = await Innertube.create();
    const searchResults = await yt.search(searchTerm, {
      type: type, // video | playlist | channel | all
    });
    console.log(searchResults);
    const body = JSON.stringify(searchResults);
    return new NextResponse(body, { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.log(error);
    new NextResponse("An error occurred while fetching your profile's playlists.", { status: 500 })
  }
};