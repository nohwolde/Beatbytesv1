import { NextResponse } from 'next/server';
import { chromium } from "playwright";

export async function POST(
  request: Request
) {
  const { playlist } = await request.json();
  try {
    const playlistUrl = "https://soundcloud.com" + playlist.href;
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(playlistUrl, { waitUntil: "networkidle" });
    await page
      .evaluate(() => {
        (document.body.style as any).zoom = 0.01;
      })
      .then(() => console.log("zoomed out"));

    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Scrape
    const artwork = await (
      await (
        await (
          await page.$('div[class="listenArtworkWrapper__artwork"]')
        )?.$("div")
      )?.$("span")
    )?.getAttribute("style");

    // Extract the URL from the style string
    const urlRegex = /url\("([^"]+)"\)/;
    const matches = artwork?.match(urlRegex);
    const backgroundImageUrl = matches? matches[1] : "";

    console.log(backgroundImageUrl);

    const trackSet = new Set();

    const tracks = await page.$$(
      'li[class="trackList__item sc-border-light-bottom sc-px-2x"]'
    );

    for (const trackRow of tracks) {
      const trackImage = await (
        await (
          await (
            await trackRow.$('div[class="trackItem__image sc-py-1x sc-mr-2x"]')
          )?.$("div")
        )?.$("span")
      )?.getAttribute("style");

      // Extract the URL from the style string
      const matchesTrack = trackImage?.match(urlRegex);
      const trackImageUrl =
        matchesTrack && matchesTrack[1] ? matchesTrack[1] : "";

      const track = await trackRow.$(
        'div[class="trackItem__content sc-truncate"]'
      );

      const artist = await track?.$(
        'a[class="trackItem__username sc-link-light sc-link-secondary sc-mr-0.5x"]'
      );
      const artistLink = await artist?.getAttribute("href");
      const artistName = await artist?.innerText();

      console.log(artistLink);
      console.log(artistName);

      const title = await track?.$(
        'a[class="trackItem__trackTitle sc-link-dark sc-link-primary sc-font-light"]'
      );

      const titleLink = await title?.getAttribute("href");
      const titleName = await title?.innerText();

      console.log(titleLink);
      console.log(titleName);

      const playsElement = await trackRow.$(
        'span[class="trackItem__playCount sc-ministats sc-ministats-medium  sc-ministats-plays"]'
      );
      const plays = playsElement ? await playsElement.innerText() : "";

      console.log(plays);

      console.log(trackImageUrl);

      const newTrack = {
        artist: { name: artistName, href: artistLink },
        name: titleName,
        titleLink: titleLink,
        plays: plays,
        image: trackImageUrl,
        platform: "Soundcloud",
      };

      console.log(newTrack);

      trackSet.add(newTrack);
    }

    const trackArray = Array.from(trackSet);

    await browser.close();
    return NextResponse.json(trackArray);
  } catch (error) {
    console.log("Error occurred:", error);
    new NextResponse("An error occurred while fetching the playlist.", { status: 500 });
  }
}