import { fetchGeneric } from "./fetchGeneric";
import { cacheValue, loadCachedValue } from "./sessionStorage";
import fetch from "node-fetch";
// import {
//   importLikes,
//   importPlaylistTracks,
//   importPlaylists,
//   setNextPlaylistHref
// } from "./libraryActions";
// import {
//   setArtistResults,
//   setMoreTrackResults,
//   setTrackResults
// } from "./searchActions";
// import { setUserProfile } from "./userActions";

const SC_API_V2 = "https://api-v2.soundcloud.com";

const tryFetch = async (input, init = { headers: {} } ) => {
  // url
  const url = typeof input === 'string'
      ? new URL(input)
      : input instanceof URL
      ? input
      : new URL(input.url);

  // transform the url for use with our proxy
  url.searchParams.set('__host', url.host);
  url.host = process?.env?.BACKEND_URL || "localhost:8080";
  url.protocol = 'http';

  console.log(init?.headers);

  const headers = init?.headers
      ? new Headers(init.headers)
      : input instanceof Request
      ? input.headers
      : new Headers();

  // now serialize the headers
  url.searchParams.set('__headers', JSON.stringify([...headers]));

  if (input instanceof Request) {
    // @ts-ignore
    input.duplex = 'half';
  }

  // copy over the request
  const request = new Request(
      url,
      input instanceof Request ? input : undefined,
  );

  headers.delete('user-agent');
  headers.delete('sec-fetch-site');

  // fetch the url
  return fetch(request, init ? {
      ...init,
      headers
  } : {
      headers
  });
}

function formatEndpointHref(endpoint, key) {
  const concatChar = endpoint.includes("?") ? "&" : "?";

  return `${endpoint}${concatChar}client_id=${key}`;
}

async function fetchSoundcloud(
  endpoint,
  retriesRemaining = 1,
  key,
) {
  try {


    const response = await tryFetch(
      formatEndpointHref(endpoint, key),
    );

    const shouldRetry = response.status === 403 || response.status === 401;

    if (shouldRetry && retriesRemaining > 0) {
      // await KeyService.refreshSoundcloudClientId();

      return fetchSoundcloud(endpoint, retriesRemaining - 1, key);
    }

    return response;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export const fetchSoundcloudProfileAndPlaylists = async (username, key) => {
  const { likes, userId } = await fetchSoundcloudProfile(username, key);
  const playlists = await fetchSoundcloudPlaylists(userId, key);
  const allPlaylists = [likes, ...playlists];
  return allPlaylists;
};

export const fetchSoundcloudProfile = async (username, key) => {
  try {
    // const endpoint = `${SC_API_V2}/user?username=${username}`;
    const userProfileUrl = `https%3A//soundcloud.com/${username}`;
    const endpoint = `${SC_API_V2}/resolve?url=${userProfileUrl}`;

    const response = await fetchSoundcloud(endpoint, 1, key);
    const text = await response.text();
    const json = JSON.parse(text);

    const profile = mapJsonToProfile(json);
    const userLikes = {
      id: "likes",
      title: "Soundcloud Likes",
      images: null,
      source: "soundcloud",
      tracks: [],
      total: json.likes_count,
      next: `/user/${profile.id}/likes`,
      isConnected: true,
      dateSynced: new Date(),
      externalUrl: profile.profileUrl + "/likes",
      isStarred: false
    };

    return { likes: userLikes, userId: profile.id };
  } catch (e) {
    console.error(e);
    // Return a meaningful error object or message
    return { error: 'Failed to fetch Soundcloud profile' };
  }
};

export const fetchSoundcloudLikes = async (next, userId) => {
  if (!next) {
    next = `/user/${userId}/likes`;
  }

  const fetchedTracks = await fetchSoundcloudTracks(next);
  return fetchedTracks;
};

export const fetchSoundcloudPlaylists = async (userId, key) => {
  const playlistEndpoint = `${SC_API_V2}/users/${userId}/playlists`;

  const response = await fetchSoundcloud(playlistEndpoint, 1, key);
  const text = await response.text();
  const data = JSON.parse(text);

  return mapCollectionToPlaylists(data);
};

export const fetchSoundcloudPlaylistTracks = (id, next) => {
  const playlistEndpoint =
    next === "start"
      ? `/playlist/${id}`
      : `?url=${encodeURIComponent(next)}`;

  return fetchGeneric(playlistEndpoint).then((data) => {
    const { tracks, next } = mapTracksAndNextHref(data);

    // dispatch(importPlaylistTracks("soundcloud", id, tracks));
    // dispatch(setNextPlaylistHref("soundcloud", id, next));

    return { tracks };
  });
};

export const searchSoundcloud = (query) => {
  const requests = [searchSoundcloudTracks, searchSoundcloudArtists];

  return Promise.all(requests.map((request) => request(query)));
};

export const searchSoundcloudTracks = (query, limit = 50) => {
  const trackSearchEndpoint = `${SC_API_V2}/search/tracks?q=${query}`;

  const storageKey = `SC:${query}:artists`;

  const cachedSearch = loadCachedValue(storageKey);
  if (cachedSearch) {
    return cachedSearch;
  }

  return fetchSoundcloudTracks(trackSearchEndpoint).then(
    ({ tracks, next }) => {
      cacheValue(storageKey, { list: tracks, next });
      return { list: tracks, next };
    }
  );
};

export const fetchMoreSoundcloudTrackResults = (next) => {
  return fetchSoundcloudTracks(next);
};

export const searchSoundcloudArtists =
  (query, limit = 5) => {
    const artistSearchEndpoint = `/search/artists?q=${query}`;

    return fetchScArtists(artistSearchEndpoint);
  };

function fetchScArtists(endpoint) {
  return fetchGeneric(endpoint).then((json) => mapJsonToArtists(json));
}

export const fetchRelatedSouncloudTracks = (trackId) => {
  const relatedTracksEndpoint = `/track/${trackId}/related`;
  /*
    {collection: SoundcloudTrack[], query_urn: string "soundcloud:similarsounds:80c57193b98543a49c3c8863f43dee3a"
}
  */

  return fetchSoundcloudTracks(relatedTracksEndpoint).then(
    ({ tracks, next }) => tracks
  );
};

export const fetchSoundcloudArtist = (artistId) => {
  return fetchGeneric(`/artist/${artistId}`).then((json) =>
    mapSoundcloudArtist(json)
  );
};

// TODO: Doesn't seem to be used currently
export const fetchSoundcloudSpotlight = (artistId) => {
  const artistSpotlightEndpoint = `${SC_API_V2}/users/${artistId}/spotlight?&limit=20&linked_partitioning=1`;

  return fetchGeneric(artistSpotlightEndpoint).then((json) =>
    mapCollectionToPlaylistsOrTracks(json.collection)
  );
};

export const fetchSoundcloudArtistTopTracks = (artistId) => {
  const artistTopTracksEndpoint = `/artist/${artistId}/toptracks`;

  return fetchSoundcloudTracks(artistTopTracksEndpoint);
};

export const fetchSoundcloudArtistTracks = (artistId) => {
  const artistTracksEndpoint = `/artist/${artistId}/tracks`;

  return fetchSoundcloudTracks(artistTracksEndpoint);
};

export const fetchSoundcloudTracks = (endpoint) => {
  if (endpoint.includes("api-v2")) {
    endpoint = `?url=${encodeURIComponent(endpoint)}`;
  }

  return fetchGeneric(endpoint).then((json) => mapTracksAndNextHref(json));
};

function mapTracksAndNextHref(json) {
  return {
    next: json.next_href,
    tracks: mapCollectionToTracks(json.collection || json.tracks)
  };
}

function mapCollectionToPlaylistsOrTracks(collection) {
  return collection.map((item) =>
    item.kind === "playlist" ? mapSoundcloudPlaylist(item) : mapToTrack(item)
  );
}

function mapSoundcloudPlaylist(playlist) {
  return {
    id: playlist.id,
    url: playlist.permalink_url,
    title: playlist.title,
    artist: {
      id: playlist.user.id,
      img: playlist.user.avatar_url,
      name: playlist.user.username,
      permalink: playlist.user.permalink
    },
    kind: "playlist",
    tracks: mapCollectionToTracks(playlist.tracks)
  };
}

function mapSoundcloudArtist(json) {
  return {
    img: json.avatar_url,
    url: json.permalink_url,
    name: json.username,
    followers_count: json.followers_count,
    track_count: json.track_count,
    source: "soundcloud"
  };
}

export function mapCollectionToTracks(collection) {
  if (!collection) {
    throw new Error("Collection is invalid");
  }

  return collection
    .map((track) => track.track || track.playlist || track)
    .filter((track) => track.title && track.kind === "track")
    .map((track) => mapToTrack(track));
}

export function mapToTrack(track) {
  return {
    title: track.title,
    id: track.id,
    duration: track.duration,
    img: track.artwork_url,
    artist: track.user && {
      name: track.user.username,
      img: track.user.avatar_url,
      id: track.user.id
    },
    permalink: track.user
      ? `${track.user.permalink}/${track.permalink}`
      : track.permalink,
    type: track.type,
    source: "soundcloud",
    streamable: true,
    mediaUrl: track.media.transcodings.find(
      ({ format: { protocol } }) => protocol === "progressive"
    )?.url
  };
}

function mapCollectionToPlaylists(json) {
  if (!json?.collection) {
    throw new Error("Invalid soundcloud collection object");
  }

  return json.collection.map((item) => ({
    id: item.id,
    title: item.title,
    img: item.artwork_url,
    externalUrl: item.permalink_url,
    source: "soundcloud",
    tracks: mapCollectionToTracks(item.tracks),
    total: item.tracks.length,
    isConnected: true,
    dateSynced: null,
    isStarred: false
  }));
}

function mapJsonToProfile(json) {
  return {
    fullName: json.full_name,
    username: json.permalink,
    displayName: json.username,
    id: json.id,
    image: json.avatar_url,
    profileUrl: json.permalink_url,
    isConnected: true
  };
}

function mapJsonToArtists(json) {
  return json.collection.map((artist) => ({
    name: artist.username,
    id: artist.id,
    numFollowers: artist.followers_count,
    img: artist.avatar_url,
    source: "soundcloud"
  }));
}
