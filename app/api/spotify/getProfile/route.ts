import { NextResponse } from 'next/server';
import { load } from "cheerio";
import SoundScraper from '../../../../components/SoundScraper';

export async function POST(
  request: Request
) {
  const { profile } = await request.json();

  try {
    const profileData = await SoundScraper.getHtmlFromUrl('https://open.spotify.com/user/' + profile);

    // Use cheerio to extract playlist and profile information
    const $ = load(profileData);
    const playlists: { href: string | undefined; name: string | undefined; image: string | undefined; }[] = [];

    $("a.pfJ1uhWbYq36smVI4WVK").each((index, element) => {
      const href = $(element).attr("href");
      const name = $(element)
        .find("div.tPxjZCy430xy6YWpHkkG")
        .find(
          'span[class="Type__TypeElement-sc-goli3j-0 bGcjcI UTGU5SUg8Jy_wLgfBCIj"]'
        )
        .text();
      const image = $(element).find("img").attr("src");
      console.log({ href, name, image });
      playlists.push({ href, name, image });
    });

    // $("div.LunqxlFIupJw_Dkx6mNx").each((index, element) => {
    //   console.log(element);
    // });

    // Extract display name and profile picture
    const displayName = $('meta[property="og:title"]').attr("content");
    const profilePicture = $('meta[property="og:image"]').attr("content");
    return NextResponse.json({ name: displayName, photo: profilePicture, playlists, username: profile });
  } catch (error) {
    console.log("Error searching for tracks:", error);
    new NextResponse('Internal Error', { status: 500 })
  }
};
