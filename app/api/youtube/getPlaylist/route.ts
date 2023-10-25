import { NextResponse } from 'next/server';
import { Client, VideoCompact, PlaylistVideos } from "youtubei";

const youtubeClient = new Client();

export async function POST(
  request: Request
) {
  const { playlist } = await request.json();
  try {
    const playlistObj = await youtubeClient.getPlaylist(playlist.id);
    const playlistData = playlistObj?.videos!;

    const videos: { id: string; name: string; image: string; uploadDate: string | undefined; description: string; duration: number | null; isLive: boolean; viewCount: number | null | undefined; channel: { id: string | undefined; name: string | undefined; } | { id: string | undefined; name: string | undefined; }; platform: string; }[] = [];

    playlistData instanceof PlaylistVideos ?
      playlistData.items.map((video: VideoCompact) => {
        const song = {
          id: video.id,
          name: video.title,
          image: video.thumbnails[video.thumbnails.length - 1].url,
          uploadDate: video.uploadDate,
          description: video.description,
          duration: video.duration,
          isLive: video.isLive,
          viewCount: video.viewCount,
          channel: {
            id: video.channel?.id,
            name: video.channel?.name,
          },
          platform: "Youtube",
        };
        videos.push(song);
      }) 
    :
      playlistData?.map((video: VideoCompact) => {
        const song ={
          id: video.id,
          name: video.title,
          image: video.thumbnails[video.thumbnails.length - 1].url,
          uploadDate: video.uploadDate,
          description: video.description,
          duration: video.duration,
          isLive: video.isLive,
          viewCount: video.viewCount,
          channel: {
            id: video.channel?.id,
            name: video.channel?.name,
          },
          platform: "Youtube",
        };
        videos.push(song);
      });

    console.log(videos);
    const body = JSON.stringify(videos);
    return new NextResponse(body, { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.log(error);
    new NextResponse("An error occurred while fetching your profile's playlists.", { status: 500 })
  }
};