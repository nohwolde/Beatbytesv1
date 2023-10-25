import { NextResponse } from 'next/server';
import { chromium } from "playwright";

export async function POST(
  request: Request
) {
  const { profile } = await request.json();
  try {
    const profileUrl = "https://soundcloud.com/" + profile + "/sets";
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(profileUrl, { waitUntil: "networkidle" });
    await page
      .evaluate(() => {
        (document.body.style as any).zoom = 0.01;
      })
      .then(() => console.log("zoomed out"));

    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Scrape
    const playlistSet = new Set();
    const playlists = await page.$$('div[class="sound__body"]');

    for (const playlist of playlists) {
      const styleString = await (
        await (
          await (await playlist.$('a[class="sound__coverArt"]'))?.$("div")
        )?.$("span")
      )?.getAttribute("style");

      // Extract the URL from the style string
      const urlRegex = /url\("([^"]+)"\)/;
      const matches = styleString?.match(urlRegex);
      const backgroundImageUrl = matches? matches[1] : "";

      console.log(backgroundImageUrl);

      const username = await (
        await playlist.$('span[class="soundTitle__usernameText"]')
      )?.innerText();

      console.log(username);

      const title = await playlist.$(
        'a[class="sc-link-primary soundTitle__title sc-link-dark sc-text-h4"]'
      );

      const link = await title?.getAttribute("href");
      const name = await title?.innerText();

      const newPlaylist = {
        name: name,
        href: link,
        image: backgroundImageUrl,
        username: username,
      };

      console.log(newPlaylist);

      playlistSet.add({
        name: name,
        href: link,
        image: backgroundImageUrl,
        username: username,
        platform: "Soundcloud",
      });
      console.log(playlistSet);
    }

    const playlistArray = Array.from(playlistSet);

    console.log(playlistArray);
    return NextResponse.json(playlistArray);
  } catch (error) {
    console.log("Error occurred:", error);
    new NextResponse("An error occurred while fetching your profile's playlists.", { status: 500 });
  }
}