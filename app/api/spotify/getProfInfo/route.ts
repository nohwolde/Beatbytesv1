import { NextResponse } from 'next/server';
import fetch from "node-fetch";
import spotify from "spotify-url-info";
const { getData, getDataForUser,  getTracks, getPreview, getDetails, getLink } = spotify(fetch);

export async function POST(
  request: Request
) {
  const { url } = await request.json();

  try {
    const itemData  = await getDataForUser(url);
    console.log("Found arist:", itemData);

    return NextResponse.json(itemData);
  } catch (error) {
    console.log("Error searching for tracks:", error);
    new NextResponse('Internal Error', { status: 500 })
  }
};