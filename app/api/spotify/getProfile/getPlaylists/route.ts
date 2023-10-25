import { NextResponse } from 'next/server';
import { chromium } from "playwright";

export async function POST(
  request: Request
) {
  const { profile } = await request.json();
  try {
    const playlistUrl = "https://open.spotify.com/user/" + profile + "/playlists";
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(playlistUrl, { waitUntil: "networkidle" });
    await page
      .evaluate(() => {
        (document.body.style as any).zoom = 0.01;
      })
      .then(() => console.log("zoomed out"));

    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Scrape playlist list
    const playlistList = new Set();
    const playlists = await page.$$('div[class="XiVwj5uoqqSFpS4cYOC6"]');

    for (const playlist of playlists) {
      const outerDiv = await playlist.$('div[class="xBV4XgMq0gC5lQICFWY_"]');
      const innerDiv = await outerDiv?.$('div[class="g4PZpjkqEh5g7xDpCr2K"]');
      const wrapperDiv = await innerDiv?.$("div");
      const image = await wrapperDiv?.$("img");
      const src = await image?.getAttribute("src");
      const divAtag = await playlist.$('div[class="E1N1ByPFWo4AJLHovIBQ"]');
      const aTag = await divAtag?.$("a");
      const href = await aTag?.getAttribute("href");
      const name = await aTag?.getAttribute("title");
      const plist = { href, name, image: src, id: href };
      console.log(plist);
      playlistList.add(plist);
    }

    const playlistListArray = Array.from(playlistList);

    // Return the extracted data as a JSON response
    await browser.close();
    return NextResponse.json(playlistListArray);
  } catch (error) {
    console.log("Error getting profile:", error);
    new NextResponse("An error occurred while fetching your profile's playlists.", { status: 500 })
  }
};