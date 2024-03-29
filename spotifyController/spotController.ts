
import fetch, { Response as FetchResponse } from "node-fetch";

import tryFetch from './tryFetch';

// const tryFetch = async (input: any, init = { headers: {} } ) => {
//   // url
//   const url = typeof input === 'string'
//       ? new URL(input)
//       : input instanceof URL
//       ? input
//       : new URL(input.url);

//   // transform the url for use with our proxy
//   url.searchParams.set('__host', url.host);
//   url.host = process?.env?.NEXT_PUBLIC_BACKEND_URL || "localhost:8080";
//   url.protocol = 'http';

//   console.log(init?.headers);

//   const headers = init?.headers
//       ? new Headers(init.headers)
//       : input instanceof Request
//       ? input.headers
//       : new Headers();

//   // now serialize the headers
//   url.searchParams.set('__headers', JSON.stringify([...headers]));

//   if (input instanceof Request) {
//     // @ts-ignore
//     input.duplex = 'half';
//   }

//   // copy over the request
//   const request = new Request(
//       url,
//       input instanceof Request ? input : undefined,
//   );

//   headers.delete('user-agent');
//   headers.delete('sec-fetch-site');

//   // fetch the url
//   return fetch(request, init ? {
//       ...init,
//       headers
//   } : {
//       headers
//   });
// }

function formatEndpointHref(endpoint: string, key: string, options?: string): string {
  const concatChar = endpoint.includes("?") ? "&" : "?";

  let result = `${endpoint}${concatChar}client_id=${key}`;

  if (options) {
    result += `${options}`;
  }

  return result;
}

const fetchSpotify = async (
  endpoint: string,
  retriesRemaining: number = 1,
  key: string,
  options?: string,
): Promise<Response>  => {
  try {

    
    // const href = formatEndpointHref(endpoint, key);

    const response = await tryFetch(endpoint,  { headers: { Authorization: `Bearer ${key}` }});

    const shouldRetry = response.status === 403 || response.status === 401;

    if (shouldRetry && retriesRemaining > 0) {
      // await KeyService.refreshSoundcloudClientId();

      return fetchSpotify(endpoint, retriesRemaining - 1, key);
    }

    return response;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

const getSpotKey = async () => {
  // link https://open.spotify.com/get_access_token?reason=transport&productType=web_player

  const response = await tryFetch("https://open.spotify.com/get_access_token?reason=transport&productType=web_player");

  console.log(response);
  const data = await response.json();
  
  return data;
}

const getSongData = async (trackId: string, accessToken: string) => {

  // Fetch the track details from the Spotify API
  const response = await fetchSpotify(`https://api.spotify.com/v1/tracks/${trackId}`, 1, accessToken);
  const data = await response.json();
  // Return the track name
  return data;
}

const getSpotifyUserPlaylists = async (userId: string, accessToken: string) => {

  const response = await fetchSpotify(`https://api.spotify.com/v1/users/${userId}/playlists`, 1, accessToken);

  const data = await response.json();

  return data;
}

const getSpotifyPlaylist = async (playlistId: string, accessToken: string) => {

  const response = await fetchSpotify(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, 1, accessToken);

  const data = await response.json();

  return data;
}

export {
  getSpotKey,
  getSongData,
  getSpotifyUserPlaylists,
  getSpotifyPlaylist
}









