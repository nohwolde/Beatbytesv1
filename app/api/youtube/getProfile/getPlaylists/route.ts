import { NextResponse } from 'next/server';
import { Client, PlaylistCompact } from "youtubei";

const youtubeClient = new Client();

export async function POST(
  request: Request
) {
  const { profile } = await request.json();
  try {
    const channelVideos = await youtubeClient.getChannel(profile);

    console.log(channelVideos);

    channelVideos?.shelves.filter(
      (shelf) => shelf.title !== "Created playlists"
    );

    const playlists = channelVideos?.shelves.map((shelf) => {
      return {
        title: shelf.title,
        subtitle: shelf.subtitle,
        items: shelf.items.map((item) => {
          const playlist = item as PlaylistCompact;
          return {
            id: item.id,
            name: playlist ? playlist.title : null,
            image: item.thumbnails ? item.thumbnails[item.thumbnails.length - 1].url : null,
            videoCount: playlist ? playlist.videoCount : null,
          };
        }),
      };
    })[0]?.items;
        // shelf.items.map((item) => {
        //   return {
        //     id: item.id,
        //     name: item.title,
        //     image: item.thumbnails?[item.thumbnails.length - 1].url,
        //     videoCount: item.videoCount,
        //   };
        // }),

    console.log(playlists);
    const body = JSON.stringify(playlists);
    return new NextResponse(body, { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.log("Error getting profile:", error);
    new NextResponse("An error occurred while fetching your profile's playlists.", { status: 500 })
  }
};