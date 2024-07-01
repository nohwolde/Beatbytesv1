import { NextResponse } from 'next/server';
// import { handleLogin } from '../../../spotifyController/handleLogin';
// import { Spotifly } from 'spotifly';

export async function POST(request: Request) {
  const { cookies } = await request.json();
  // const spotifly = new Spotifly(cookies);
  return new NextResponse(cookies);
}