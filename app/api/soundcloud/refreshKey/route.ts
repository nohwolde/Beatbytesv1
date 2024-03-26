// pages/api/refreshKey.ts
import { NextResponse } from 'next/server';
import KeyService from '@/soundcloudController/keys';
import { Platform } from '@/hooks/useSearch';
import setKey from '@/actions/setKey';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createOrUpdateKey } from '@/libs/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const newKey = await KeyService.refreshSoundcloudClientId();

    Promise.resolve(await setKey(Platform.Soundcloud, "client_id", newKey));
    
    return new NextResponse(JSON.stringify(newKey), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    console.log(err);
    return new NextResponse('Internal Error', { status: 500 });
  }
}