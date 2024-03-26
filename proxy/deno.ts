import { serve } from 'https://deno.land/std@0.148.0/http/server.ts';
// import { HLSProxy }  from "@warren-bank/hls-proxy"
// import { createProxyMiddleware } from 'http-proxy-middleware';

const port = 8080;

function copyHeader(headerName: string, to: Headers, from: Headers) {
  const hdrVal = from.get(headerName);
  if (hdrVal) {
    to.set(headerName, hdrVal);
  }
}
// deno run --allow-net deno.ts
const handler = async (request: Request): Promise<Response> => {
  // if options send do CORS preflight
  if (request.method === 'OPTIONS') {
    const response = new Response('', {
      status: 200,
      headers: new Headers({
        'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Headers':
          'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-goog-visitor-id, x-origin, x-youtube-client-version, Accept-Language, Range, Referer',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'true',
      }),
    });

    // Log the request URL and headers
    console.log('Request URL:', request.url);
    console.log('Request Headers:', request.headers);

    // Log the response status and headers
    console.log('Response Status:', response.status);
    console.log('Response Headers:', response.headers);

    return response;
  }

  const url = new URL(request.url, `http://localhost/`);
  if (!url.searchParams.has('__host')) {
    return new Response(
      'Request is formatted incorrectly. Please include __host in the query string.',
      { status: 400 },
    );
  }

  // Function to fetch with a timeout
  async function fetchWithTimeout(resource:any , options: any) {
    const { timeout = 8000 } = options;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);

    return response;
  }

  // If the request is for the SoundCloud API, make the request from the server
  if (url.host === 'api-v2.soundcloud.com' || url.host === 'api.soundcloud.com') {
    const response = await fetch(url.toString());
    const data = await response.json();

    // Return the response to the client
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
  else if (url.host.includes('cf-hls-media.sndcdn.com')) {
    console.log('Fetching HLS content...');
    // Make a request to the target server
    const targetResponse = await fetchWithTimeout(url.toString(), { timeout: 5000 })
    console.log('Received response:', targetResponse);

    // Forward the response from the target server to the client
    return new Response(targetResponse.body, {
      headers: targetResponse.headers,
      status: targetResponse.status,
      statusText: targetResponse.statusText,
    });
  }

  // Set the URL host to the __host parameter
  url.host = url.searchParams.get('__host')!;
  url.protocol = 'https';
  url.port = '443';
  url.searchParams.delete('__host');

  // Copy headers from the request to the new request
  const request_headers = new Headers(
    JSON.parse(url.searchParams.get('__headers') || '{}'),
  );
  
  copyHeader('range', request_headers, request.headers);
  !request_headers.has('user-agent') && copyHeader('user-agent', request_headers, request.headers);
  url.searchParams.delete('__headers');

  // Make the request to YouTube
  const fetchRes = await fetch(url, {
    method: request.method,
    headers: request_headers,
    body: request.body,
  });

  // Construct the return headers
  const headers = new Headers();

  // copy content headers
  copyHeader('content-length', headers, fetchRes.headers);
  copyHeader('content-type', headers, fetchRes.headers);
  copyHeader('content-disposition', headers, fetchRes.headers);
  copyHeader('accept-ranges', headers, fetchRes.headers);
  copyHeader('content-range', headers, fetchRes.headers);

  // add cors headers
  headers.set(
    'Access-Control-Allow-Origin',
    request.headers.get('origin') || '*',
  );
  headers.set('Access-Control-Allow-Headers', '*');
  headers.set('Access-Control-Allow-Methods', '*');
  headers.set('Access-Control-Allow-Credentials', 'true');

  // Return the proxied response
  return new Response(fetchRes.body, {
    status: fetchRes.status,
    headers: headers,
  });
};

await serve(handler, { port });
