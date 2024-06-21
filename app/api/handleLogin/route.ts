import { NextResponse } from 'next/server';
import { handleLogin } from '../../../spotifyController/handleLogin';

export async function POST(request: Request) {
  const { login } = await request.json();
  const result = await handleLogin();
  console.log(result);
  return NextResponse.json(result);
}