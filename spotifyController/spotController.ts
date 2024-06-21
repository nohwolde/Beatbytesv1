
import fetch, { Response as FetchResponse } from "node-fetch";

import tryFetch from './tryFetch';

import axios from 'axios';

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
//   url.protocol = 'https';

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

const fetchSpotifyProfile = async (username: string, accessToken: string) => {
  const url = `https://spclient.wg.spotify.com/user-profile-view/v3/profile/${username}?playlist_limit=50&artist_limit=50&episode_limit=10&market=from_token`;

  const headers = {
    'accept': 'application/json',
    'accept-language': 'en',
    'app-platform': 'WebPlayer',
    'authorization': 'Bearer ' + accessToken,
    'content-type': 'application/json;charset=UTF-8',
    'origin': 'https://open.spotify.com',
    'priority': 'u=1, i',
    'referer': 'https://open.spotify.com/',
    'sec-ch-ua': '"Chromium";v="124", "Microsoft Edge";v="124", "Not-A.Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': 'macOS',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
    'spotify-app-version': '1.2.39.87.g51668b79',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
    'Cookie': 'sp_t=3dcb36776d095e2c00e2920c816d5c0f'
  };

  try {
    // const response = await axios.get(url, { headers });
    // console.log(response.data);
    // return response.data;

    const response = await fetchSpotify(url, 1, accessToken);

    console.log(await response.json());

    return response;
  } catch (error) {
    console.error('Error fetching Spotify profile:', error);
    throw error;
  }
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

const getClientToken = async () => {
  const url = "https://clienttoken.spotify.com/v1/clienttoken"
  const headers = {
    'accept': 'application/json',
    'accept-language': 'en',
    'Content-Type': 'application/json;charset=UTF-8',
    'Origin': 'https://open.spotify.com',
    'Priority': 'u=1, i',
    'Referer': 'https://open.spotify.com/',
    'sec-ch-ua': '"Chromium";v="124", "Microsoft Edge";v="124", "Not-A.Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
    'spotify-app-version': '1.2.39.87.g51668b79',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
  };

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: headers
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching private Spotify Client token:', error);
  }

}

const getDefaultSpotifyUser = async (clientToken: string, accessToken: string) => {

}

const getPrivateSpotifyPlaylists = async (clientToken: string, accessToken: string) => {
  const url = 'https://api-partner.spotify.com/pathfinder/v1/query?operationName=libraryV3&variables=%7B%22filters%22%3A%5B%22Playlists%22%5D%2C%22order%22%3Anull%2C%22textFilter%22%3A%22%22%2C%22features%22%3A%5B%22LIKED_SONGS%22%2C%22YOUR_EPISODES%22%2C%22PRERELEASES%22%5D%2C%22limit%22%3A50%2C%22offset%22%3A0%2C%22flatten%22%3Afalse%2C%22expandedFolders%22%3A%5B%5D%2C%22folderUri%22%3Anull%2C%22includeFoldersWhenFlattening%22%3Atrue%7D&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%2230695bca0ce164be315d1f599e1260471799170729f266fa925b5be3677a2718%22%7D%7D';

  const headers = {
    'accept': 'application/json',
    'accept-language': 'en',
    'app-platform': 'WebPlayer',
    'authorization': `Bearer ${accessToken}`,
    'client-token': clientToken,
    'Content-Type': 'application/json;charset=UTF-8',
    'Origin': 'https://open.spotify.com',
    'Priority': 'u=1, i',
    'Referer': 'https://open.spotify.com/',
    'sec-ch-ua': '"Chromium";v="124", "Microsoft Edge";v="124", "Not-A.Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
    'spotify-app-version': '1.2.39.87.g51668b79',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
  };

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: headers
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching private Spotify playlists:', error);
  }
};


export {
  getSpotKey,
  getSongData,
  getSpotifyUserPlaylists,
  getSpotifyPlaylist, 
  fetchSpotifyProfile
}









