import { NextResponse } from 'next/server';
import SoundScraper from '../../../../components/SoundScraper';

export async function POST(
  request: Request
) {
  const { profile } = await request.json();

  try {
    // Get the profile HTML from the provided URL
    const profileHtml = await SoundScraper.getHtmlFromUrl("https://soundcloud.com/" + profile);

    // Extract the script content from profileHTML
    const scriptContentRegex =
      /<script>window\.__sc_hydration = (.*?);<\/script>/;

    const scriptContentMatch = profileHtml.match(scriptContentRegex);
    const scriptContent = scriptContentMatch && scriptContentMatch[1];

    // Extract the avatar_url and username from the script content
    const avatarUrlRegex = /"avatar_url":"(.*?)"/;
    const usernameRegex = /"username":"(.*?)"/;

    const avatarUrlMatch = scriptContent.match(avatarUrlRegex);
    const usernameMatch = scriptContent.match(usernameRegex);

    const avatarUrl = avatarUrlMatch && avatarUrlMatch[1];
    const username = usernameMatch && usernameMatch[1];

    console.log("Avatar URL:", avatarUrl);
    console.log("Username:", username);

    // Return the extracted playlists as a JSON response
    return NextResponse.json({
      name: username,
      photo: avatarUrl,
      playlists: [],
      username: profile,
    });
  } catch (error) {
    console.log("Error getting profile:", error);
    new NextResponse('Internal Error', { status: 500 })
  }
};