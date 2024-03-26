import { NextResponse } from 'next/server';
import { chromium } from "playwright";
import fetch from "node-fetch";
import spotify from "spotify-url-info";
const { getData, getTracks, getPreview, getDetails, getLink } = spotify(fetch);

export async function POST(
  request: Request
) {
  const { playlist } = await request.json();
  try {
    const playlistUrl = "https://open.spotify.com" + playlist.href;

    const playlistData  = await getData(playlistUrl);
    console.log("Found arist:", playlistData);

    return NextResponse.json(playlistData);

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(playlistUrl, { waitUntil: "networkidle" });
    await page
      .evaluate(() => {
        (document.body.style as any).zoom = 0.01;
      })
      .then(() => console.log("zoomed out"));

    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Scrape song list
    const songList = new Set();
    const songs = await page.$$('div[data-testid="tracklist-row"]');

    for (const song of songs) {
      // Extract track number
      const trackNumberElement = await song.$(
        'span[class="Type__TypeElement-sc-goli3j-0 hkczJp VrRwdIZO0sRX1lsWxJBe"]'
      );
      const trackNumber = trackNumberElement
        ? await song.evaluate((node) => node.textContent)
        : 0;

      // Extract track name
      const trackNameElement = await song.$(
        'div[class="Type__TypeElement-sc-goli3j-0 fZDcWX t_yrXoUO3qGsJS4Y6iXX standalone-ellipsis-one-line"]'
      );
      const trackName = trackNameElement
        ? await trackNameElement.evaluate((node) => node.textContent)
        : "";

      // Extract artists and their hrefs
      const artistSection = await song.$(
        'span[class="Type__TypeElement-sc-goli3j-0 bDHxRN rq2VQ5mb9SDAFWbBIUIn standalone-ellipsis-one-line"]'
      );
      const artistElements = await artistSection?.$$("a");
      const artists = [];
      if(artistElements !== undefined) {
        for (const artistElement of artistElements) {
          const name = await artistElement.evaluate((node) => node.textContent);
          const href = await artistElement.evaluate((node) =>
            node.getAttribute("href")
          );
          artists.push({ name, href });
        }
      }

      // Extract album and its href
      const albumElement = await song.$(
        'a[class="standalone-ellipsis-one-line"]'
      );
      const album = albumElement
        ? {
            name: await albumElement.evaluate((node) => node.textContent),
            href: await albumElement.evaluate((node) =>
              node.getAttribute("href")
            ),
          }
        : null;

      // Extract track photo
      const photoElement = await song.$('img[aria-hidden="false"]');
      const photo = photoElement
        ? await photoElement.evaluate((node) => node.getAttribute("src"))
        : "";

      // Extract track href
      const trackHrefElement = await song.$(
        'a[class="t_yrXoUO3qGsJS4Y6iXX"]'
      );
      const href = trackHrefElement
        ? await trackHrefElement.evaluate((node) => node.getAttribute("href"))
        : "";

      const durationElement = await song.$(
        'div[class="Type__TypeElement-sc-goli3j-0 bDHxRN Btg2qHSuepFGBG6X0yEN"]'
      );
      const duration = durationElement
        ? await durationElement.evaluate((node) => node.textContent)
        : "Duration not found";

      songList.add({
        name: trackName,
        href,
        artists,
        album,
        image: photo,
        duration,
        is_local: false,
        platform: "Spotify",
      });
    }

    const uniqueSongs = Array.from(songList);
    console.log(uniqueSongs);
    console.log("Total songs:", uniqueSongs.length);

    await browser.close();
    return NextResponse.json(uniqueSongs);
  } catch (error) {
    console.log("Error occurred:", error);
    new NextResponse("An error occurred while fetching your profile's playlists.", { status: 500 })
  }
}