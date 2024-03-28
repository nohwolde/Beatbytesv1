import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";
import { isString, keyBy, set } from "lodash";
import fetch, { Response as FetchResponse } from "node-fetch";
import {
  SoundcloudGetUserPlaylistsResponse,
  SoundcloudPlaylist,
  SoundcloudTrack,
  SoundcloudTrackLite,
} from "./soundcloudTypes";


import { SearchType } from "@/hooks/useSearch";

import KeyService from "./keys";

import setKey from "@/actions/setKey";

import { Platform } from "@/hooks/useSearch";
import { postData } from "@/libs/helpers";

const SC_API_V2_BASE = "https://api-v2.soundcloud.com";

const SC_STREAM_BASE = "https://api.soundcloud.com";

import tryFetch from "@/spotifyController/tryFetch";

// const tryFetch = async (input: any, init = { headers: {} } ) => {
//   // url
//   const url = typeof input === 'string'
//       ? new URL(input)
//       : input instanceof URL
//       ? input
//       : new URL(input.url);

//   // transform the url for use with our proxy
//   url.searchParams.set('__host', url.host);
//   url.host = 'localhost:8080';
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

async function fetchSoundcloud(
  endpoint: string,
  retriesRemaining: number = 1,
  key: string,
  options?: string,
): Promise<any> {
  try {
    const href = options
    ? formatEndpointHref(endpoint, key, options)
    : formatEndpointHref(endpoint, key);
 
    const response = await tryFetch(href);

    const shouldRetry = response.status === 403 || response.status === 401;

    if (shouldRetry && retriesRemaining > 0) {
      if (response.status === 401) {
        const newKey = await postData({url: '/api/soundcloud/refreshKey', data: {}});
        // const { newKey } = await refreshResponse.json();
        console.log(newKey);
        // const newKey = await KeyService.refreshSoundcloudClientId();
        // await setKey(Platform.Soundcloud, "client_id", newKey);
        return fetchSoundcloud(endpoint, retriesRemaining - 1, newKey);
      }
      else {
        return {newKey: key, response: await fetchSoundcloud(endpoint, retriesRemaining - 1, key)};
      }
    }

    return { newKey: key, response: JSON.parse(await response.text()) };
  } catch (e) {
    console.error(e);
    throw e;
  }
}

async function fetchSoundcloudAndPipeResponse(
  endpoint: string,
  res: ExpressResponse,
): Promise<ExpressResponse> {
  try {
    const response = await fetchSoundcloud(endpoint, 1, "");
    return response.body.pipe(res);
  } catch (e) {
    console.error(e);
    return res.status(500).end();
  }
}

function getSoundcloudSearchResults(
  req: ExpressRequest,
  res: ExpressResponse,
): ExpressResponse | Promise<ExpressResponse> {
  const {
    query: { url },
  } = req;

  if (typeof url !== "string" || !url) {
    return res.status(500);
  }

  const decodedUrl = decodeURIComponent(url);

  const urlObject = new URL(decodedUrl);

  const isSoundcloudApiEndpoint = urlObject.origin === SC_API_V2_BASE;
  const isHttps = urlObject.protocol === "https:";

  if (!isSoundcloudApiEndpoint || !isHttps) {
    return res.status(500).end();
  }

  return fetchSoundcloudAndPipeResponse(decodedUrl, res);
}

async function getSuggestedAutocomplete(
  req: ExpressRequest,
  res: ExpressResponse,
): Promise<ExpressResponse> {
  const {
    query: { q },
  } = req;
  const searchAutocompleteEndpoint =
    "http://suggestqueries.google.com/complete/search?client=chrome&ds=yt";

  if (!isString(q) || !q) {
    return res.status(500);
  }

  const autoCompleteResponse = await fetch(
    `${searchAutocompleteEndpoint}&q=${encodeURIComponent(q)}`,
  );

  return autoCompleteResponse.body.pipe(res);
}

async function getSoundcloudTrack(
  trackId: string,
  key: string,
): Promise<any> {
  const trackInfoEndpoint = `${SC_API_V2_BASE}/tracks/${trackId}`;

  const response = await fetchSoundcloud(trackInfoEndpoint, 1, key);

  return response;
}

async function getSoundcloudUser(
  username: string,
  key: string,
): Promise<any> {

  const userProfileUrl = `https%3A//soundcloud.com/${username}`;
  const userProfileEndpoint = `${SC_API_V2_BASE}/resolve?url=${userProfileUrl}`;

  const response = await fetchSoundcloud(userProfileEndpoint, 1, key);
  return response;
}

async function getSoundcloudUserById(
  username: string,
  key: string,
): Promise<any> {
  const userProfileEndpoint = `${SC_API_V2_BASE}/users/${username}`;

  const response = await fetchSoundcloud(userProfileEndpoint, 1, key);
  return response;
}

async function getSoundcloudUserLikes(
  username: string,
  key: string,
): Promise<any> {
  const likesEndpoint = `${SC_API_V2_BASE}/users/${username}/likes?&limit=30&offset=0&linked_partitioning=1`;

  const response =  await fetchSoundcloud(likesEndpoint, 1, key);
  return response;
  // return fetchSoundcloudAndPipeResponse(likesEndpoint, res);
}

async function getSoundcloudTrackInfo(ids: number[], key: string): Promise<FetchResponse> {
  const trackInfoEndpoint = `${SC_API_V2_BASE}/tracks?ids=${encodeURIComponent(
    ids.join(","),
  )}`;

  const data = await fetchSoundcloud(trackInfoEndpoint, 1, key);

  return data.response;
}

/**
 * Sometimes soundcloud api returns only the first 5 tracks as full objects
 * so we use this to fill in the rest of the infomation for the remaining tracks
 * @param tracks list of tracks that may be either SoundcloudTrack or SoundcloudTrackLite
 * @return a list of SoundcloudTracks that have replaced the lite version with the full versions
 */
async function getMissingSoundcloudTrackInfo(
  tracks: (SoundcloudTrack | SoundcloudTrackLite)[], key: string,
): Promise<SoundcloudTrack[]> {
  const tracksThatNeedInfo: SoundcloudTrackLite[] = tracks.filter(
    (track) => !("title" in track),
  );

  /**
   * Response object containing Soundcloud track information.
   * @type {SoundcloudTrackInfoResponse}
   */
  const soundcloudTrackInfoResponse = await getSoundcloudTrackInfo(
    tracksThatNeedInfo.map((track) => track.id), key
  );

  const tracksWithInfo = soundcloudTrackInfoResponse;
  const tracksByIdMap = keyBy(tracksWithInfo, "id");

  return tracks.map((track) => tracksByIdMap[track.id] as unknown as SoundcloudTrack || track as SoundcloudTrack);
}

async function getSoundcloudUserPlaylists(
  username: string,
  key: string,
  offset: number,
): Promise<any> {
  try {
    const playlistsEndpoint = offset === 0 ? `${SC_API_V2_BASE}/users/${username}/playlists` : `${SC_API_V2_BASE}/users/${username}/playlists?offset=${offset}&limit=10`;
    const playlistsResponse = await fetchSoundcloud(playlistsEndpoint, 1, key);
    const playlistCollections: SoundcloudGetUserPlaylistsResponse =
      playlistsResponse.response;

    // Start all fetches at once with Promise.all
    const trackInfoPromises = playlistCollections.collection.map(playlist =>
      getMissingSoundcloudTrackInfo(playlist.tracks, key)
    );
    const allTrackInfo = await Promise.all(trackInfoPromises);

    // Add the track info to the playlists
    for (let i = 0; i < playlistCollections.collection.length; i++) {
      set(playlistCollections.collection[i], "tracks", allTrackInfo[i]);
    }

    return playlistCollections;
  } catch (e) {
    console.error(e);
  }
}

async function getTrackStream(
  streamUrl: string,
  track_authorization: string,
  key: string,
): Promise<any> {
  const trackEndpoint = `${streamUrl}?client_id=${key}&track_authorization=${track_authorization}`;

  const response = await tryFetch(trackEndpoint);
  return JSON.parse(await response.text());
}

async function getSoundcloudPlaylist(
   playlistId: string,
   key: string,
): Promise<SoundcloudPlaylist> {
  const playlistEndpoint = `${SC_API_V2_BASE}/playlists/${playlistId}?limit=`;

  try {
    const data = await fetchSoundcloud(playlistEndpoint, 1, key);
    const playlistResponse = data.response;
    const soundcloudPlaylist: SoundcloudPlaylist =
      playlistResponse;

    set(
      soundcloudPlaylist,
      "tracks",
      await getMissingSoundcloudTrackInfo(soundcloudPlaylist.tracks, key),
    );

    console.log(soundcloudPlaylist);

    return soundcloudPlaylist;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

async function getSoundcloudImage (url: string) {
  const urls = [
    url.replace('-large', '-t500x500'),
    url.replace('-large', '-crop'), // 400x400
    url.replace('-large', '-t300x300'),
    url.replace('-large', '-large') // 100x100
  ];

  // get the highest quality image by starting at the top most quality and working down
  for (let i = 0; i < urls.length; i++) {
    try {
      const response = await fetch(urls[i]);
      if (response.status === 200) { // Check if the response is a 200 response
        return urls[i]; // Return the corresponding URL
      }
    } catch (e) {
      console.error(e);
    }
  }
  return url;
}

async function searchSoundcloud(
  query: string,
  searchType: SearchType = SearchType.Top,
  key: string,
): Promise<ExpressResponse> {
  const trackSearchEndpoint = searchType === SearchType.Songs ? `${SC_API_V2_BASE}/search/tracks?q=${query}` 
  : searchType === SearchType.Artists ? `${SC_API_V2_BASE}/search/users?q=${query}` 
  : searchType === SearchType.Playlists ? `${SC_API_V2_BASE}/search/playlists?q=${query}` 
  : searchType === SearchType.Albums ? `${SC_API_V2_BASE}/search/albums?q=${query}` 
  : `${SC_API_V2_BASE}/search?q=${query}`;

  const response  = await fetchSoundcloud(trackSearchEndpoint, 1, key);
  return response;
}

function searchSoundcloudArtists(
  req: ExpressRequest,
  res: ExpressResponse,
): Promise<ExpressResponse> {
  const {
    query: { q },
  } = req;
  const userSearchEndpoint = `${SC_API_V2_BASE}/search/users?q=${q}`;

  return fetchSoundcloudAndPipeResponse(userSearchEndpoint, res);
}

function getSoundcloudArtist(
  req: ExpressRequest,
  res: ExpressResponse,
): Promise<ExpressResponse> {
  const {
    params: { soundcloudArtistId },
  } = req;

  const userEndpoint = `${SC_API_V2_BASE}/users/${soundcloudArtistId}`;

  return fetchSoundcloudAndPipeResponse(userEndpoint, res);
}



function getSoundcloudArtistTracks(
  req: ExpressRequest,
  res: ExpressResponse,
): Promise<ExpressResponse> {
  const {
    params: { soundcloudArtistId },
  } = req;

  const artistTracksEndpoint = `${SC_API_V2_BASE}/stream/users/${soundcloudArtistId}?limit=30&linked_partitioning=1`;

  return fetchSoundcloudAndPipeResponse(artistTracksEndpoint, res);
}

async function getSoundcloudArtistRecentTracks(
  artistId: string,
  key: string,
): Promise<any> {

  const artistSpotlightEndpoint = `${SC_API_V2_BASE}/users/${artistId}/tracks?representation=`;

  const response = await fetchSoundcloud(artistSpotlightEndpoint, 1, key);

  return response;
}

async function getSoundcloudArtistTopTracks(
  artistId: string,
  key: string,
): Promise<any> {

  const artistSpotlightEndpoint = `${SC_API_V2_BASE}/users/${artistId}/toptracks?`;

  const response = await fetchSoundcloud(artistSpotlightEndpoint, 1, key, "limit=10&offset=0&linked_partitioning=1");

  return response;
}
async function getSoundcloudArtistAlbums(
  artistId: string,
  key: string,
): Promise<any> {

  const artistSpotlightEndpoint = `${SC_API_V2_BASE}/users/${artistId}/albums?`;

  const response = await fetchSoundcloud(artistSpotlightEndpoint, 1, key, "limit=10&offset=0&linked_partitioning=1");

  return response;
}

async function getSoundcloudArtistLikes(
  artistId: string,
  key: string,
): Promise<any> {

  const artistSpotlightEndpoint = `${SC_API_V2_BASE}/users/${artistId}/likes?`;

  const response = await fetchSoundcloud(artistSpotlightEndpoint, 1, key, "limit=10&offset=0&linked_partitioning=1");

  return response;
}

async function getSoundcloudArtistPlaylists(
  artistId: string,
  key: string,
): Promise<any> {

  const artistSpotlightEndpoint = `${SC_API_V2_BASE}/users/${artistId}/playlists_without_albums?`;

  const response = await fetchSoundcloud(artistSpotlightEndpoint, 1, key, "limit=10&offset=0&linked_partitioning=1");

  return response;
}

async function getSoundcloudArtistReposts(
  artistId: string,
  key: string,
): Promise<any> {

  const artistSpotlightEndpoint = `${SC_API_V2_BASE}/users/${artistId}/reposts?`;

  const response = await fetchSoundcloud(artistSpotlightEndpoint, 1, key, "limit=10&offset=0&linked_partitioning=1");

  return  response;
}





async function getRelatedSoundcloudTracksStation(
  trackId: string,
  key: string,
): Promise<any> {

  const relatedTracksEndpoint = `${SC_API_V2_BASE}/stations/soundcloud:track-stations:${trackId}/tracks`;

  const response = await fetchSoundcloud(relatedTracksEndpoint, 1, key);

  return response;
}

async function getRelatedSoundcloudTracks(
  trackId: string,
  key: string,
): Promise<any> {

  const relatedTracksEndpoint = `${SC_API_V2_BASE}/tracks/${trackId}/related?`;

  const response = await fetchSoundcloud(relatedTracksEndpoint, 1, key);

  return response;
}

export {
  fetchSoundcloud,
  getSoundcloudSearchResults,
  getSuggestedAutocomplete,
  getSoundcloudUser,
  getSoundcloudUserById,
  getSoundcloudUserPlaylists,
  getSoundcloudPlaylist,
  searchSoundcloud,
  searchSoundcloudArtists,
  getSoundcloudArtist,
  getSoundcloudUserLikes,
  getRelatedSoundcloudTracks,
  getRelatedSoundcloudTracksStation,
  getSoundcloudArtistTracks,
  getSoundcloudArtistRecentTracks,
  getSoundcloudArtistTopTracks,
  getSoundcloudArtistAlbums,
  getSoundcloudArtistPlaylists,
  getSoundcloudArtistLikes,
  getSoundcloudTrack,
  getTrackStream,
  getSoundcloudImage
};
