import { NextResponse } from 'next/server';
import { load } from "cheerio";
import SoundScraper from '../../../../components/SoundScraper';

export async function POST(
  request: Request
) {
  const { profile } = await request.json();

  try {
    const url = "https://youtube.com/" + profile + "/playlists";

    const page = await SoundScraper.getHtmlFromUrl(url);

    const $ = load(page);

    let res = {};

    // Find script tags
    $("script").each((index, element) => {
      const scriptContent = $(element).html();

      if (scriptContent?.includes("channelMetadataRenderer")) {
        const regex = /"channelMetadataRenderer"\s*:\s*({[^}]*})/;
        const match = scriptContent.match(regex);
        if (match && match[1]) {
          const channelData = match[1];

          // Use regex to extract the information
          const titleMatch = channelData.match(/"title"\s*:\s*"([^"]*)"/);
          const rssUrlMatch = channelData.match(/"rssUrl"\s*:\s*"([^"]*)"/);
          const externalIdMatch = channelData.match(
            /"externalId"\s*:\s*"([^"]*)"/
          );
          const ownerUrlsMatch = channelData.match(
            /"ownerUrls"\s*:\s*\["([^"]*)"\]/
          );
          const avatarMatch = channelData.match(/"url"\s*:\s*"([^"]*)"/);

          const displayName = titleMatch ? titleMatch[1] : null;
          const rssUrl = rssUrlMatch ? rssUrlMatch[1] : null;
          const externalId = externalIdMatch ? externalIdMatch[1] : null;
          const ownerUrls = ownerUrlsMatch ? ownerUrlsMatch[1] : null;
          const avatarUrl = avatarMatch ? avatarMatch[1] : null;

          // Print the extracted information
          console.log(`Name: ${displayName}`);
          console.log(`RSS URL: ${rssUrl}`);
          console.log(`External ID: ${externalId}`);
          console.log(`Owner URLs: ${ownerUrls}`);
          console.log(`Avatar URL: ${avatarUrl}`);

          res = {
            name: displayName,
            photo: avatarUrl,
            externalId: externalId,
            rssUrl: rssUrl,
            ownerUrls: ownerUrls,
            username: profile,
          };

          return;
        }
      }
    });

    return NextResponse.json(res);
  } catch (error) {
    console.log("Error: invalid user", error);
    new NextResponse('Internal Error', { status: 500 })
  }
}