import { NextResponse } from 'next/server';
import { MusicClient, Client, VideoCompact, PlaylistVideos } from "youtubei";

// import youtube from "scrape-youtube";
const youtube = new Client();
const music = new MusicClient();

export async function POST(
  request: Request
) {
  const { searchTerm } = await request.json();
  try {
    // const searchResults: {
    //   id: string; name: string; image: string; uploadDate: string; description: string; duration: number;
    //   // isLive: video.isLive,
    //   // viewCount: video.viewCount,
    //   link: string; channel: { id: string; name: string; }; platform: string;
    // }[] = [];
    // await youtube.search(searchTerm).then((results) => {
    //     results.videos.map((video) => {
    //       searchResults.push({
    //       id: video.id,
    //       name: video.title,
    //       image: video.thumbnail,
    //       uploadDate: video.uploaded,
    //       description: video.description,
    //       duration: video.duration,
    //       // isLive: video.isLive,
    //       // viewCount: video.viewCount,
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
    // console.log(searchResults.slice(0, 10));
    // const body = JSON.stringify(searchResults.slice(0, 10));
    const searchResults = await youtube.search(searchTerm, {
      type: "all", // video | playlist | channel | all
    });
    console.log(searchResults);
    const body = JSON.stringify(searchResults);
    return new NextResponse(body, { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.log(error);
    new NextResponse("An error occurred while fetching your profile's playlists.", { status: 500 })
  }
};