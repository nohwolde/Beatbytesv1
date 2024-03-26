
"use client";
import { postData } from '@/libs/helpers';
import { channel } from 'diagnostics_channel';
import { useEffect, useState, createContext, useContext } from 'react';
import { BaseChannel, Client, MusicClient, PlaylistCompact, SearchResult, VideoCompact } from "youtubei";
import fetch from "node-fetch";
import spotify from "spotify-url-info";
import { Search } from 'youtubei.js/dist/src/parser/youtube';
import { useUser } from "@/hooks/useUser";
import { useSupabaseClient } from '@supabase/auth-helpers-react';
// import { getInnertube, search } from '@/actions/useInnertube';
// import { searchModule, innertubeModule } from '@/libs/youtube';
import { search, getVideo, getBasicInfo, getDash, getChannel} from '@/actions/useInnertube';
import { searchSoundcloud } from '@/soundcloudController/api-controller';
import { useKeyStore, useSearchStore } from '@/app/store';
import getNewKey from "@/soundcloudController/keys"

// import { Client as SoundClient } from "soundcloud-scraper";

// const sc = new SoundClient();

const { getData, getTracks, getPreview, getDetails, getLink } = spotify(fetch);

const youtube = new Client();

// async function createInnertube() {
//   const youtube = await Innertube.create();
//   return youtube;
// }

type SearchContextType = {
  topResults: any[] | [];
  songResults: any[] | [];
  playlistResults: any[] | [];
  artistResults: any[] | [];
  albumResults: any[] | [];
  searchTerm: string;
  searchType: SearchType;
  setYtSearch: (searcher: any) => void;
  ytSearch: any | undefined;
  setSearchType: (searchType: SearchType) => void;
  setSearchTerm: (searchTerm: string) => void;
  searchResults: string[] | [];
  isLoading: boolean;
  getNextPage: () => void;
  searchPage: number;
  platform: Platform;
  setPlatform: (platform: Platform) => void;
};

export const SearchContext = createContext<SearchContextType | undefined>(undefined);

export interface Props {
  [propName: string]: any;
}

export enum Platform {
  Spotify = 'Spotify',
  Youtube = 'Youtube',
  Soundcloud = 'Soundcloud'
}

export enum SearchType {
  Top = 'Top',
  Songs = 'Songs',
  Playlists = 'Playlists',
  Artists = 'Artists', 
  Albums = 'Albums'
}

export const MySearchContextProvider = (props: Props) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [topResults, setTopResults] = useState<any[]>([]);
  const [searchType, setSearchType] = useState<SearchType>(SearchType.Top);
  const [songResults, setSongResults] = useState<any[]>([]);
  const [playlistResults, setPlaylistResults] = useState<any[]>([]);
  const [artistResults, setArtistResults] = useState<any[]>([]);
  const [albumResults, setAlbumResults] = useState<any[]>([]);
  const [searchPage, setSearchPage] = useState(0);
  const [platform, setPlatform] = useState<Platform>(Platform.Youtube);
  const [ytSearch, setYtSearch] = useState<(any)>();
  const [ytSearcher, setYtSearcher] = useState<SearchResult>();
  const [scSearcher, setScSearcher] = useState<any>();
  const { user } = useUser();
  const supabaseClient = useSupabaseClient();
  const {scKey, setScKey} = useKeyStore();
  const {
    scResults, setScResults, 
    spotResults, setSpotResults, 
    ytResults, setYtResults
  } = useSearchStore();

  const site = platform === Platform.Spotify ? 'site:open.spotify.com' : platform === Platform.Youtube ? 'site:youtube.com' : 'site:soundcloud.com';
  const getSearchType: () => string = () => {
    switch(searchType) {
      case SearchType.Top:
        return site;
      case SearchType.Songs:
        return site + '/track';
      case SearchType.Playlists:
        return site + '/playlist';
      case SearchType.Artists:
        return site + '/artist';
      case SearchType.Albums:
        return site + '/album';
    }
  }

  const getGoogleSearchData = async (searchTerm: string, start: number) => {
    try {
      const googleSearch = await postData({
        url: '/api/google-search',
        data: { searchTerm: searchTerm + " " + getSearchType(), start: start * searchPage }
      });
      console.log(googleSearch);
      return googleSearch;
    } catch (error) {
      if (error) return alert((error as Error).message);
    }
  };

  const searchGoogle = async (searchTerm: string) => {
    setIsLoading(true);
    const googleSearch = await getGoogleSearchData(searchTerm, searchPage);
    console.log(googleSearch);
    setSearchResults(googleSearch);
    if(platform === Platform.Spotify) getSpotifyResults(googleSearch.slice(0, 1));
  };

  const setResults = (results: any[]) => {
    switch(searchType) {
      case SearchType.Top:
        setTopResults(results);
        break;
      case SearchType.Songs:
        console.log(results);
        setSongResults(results);
        break;
      case SearchType.Playlists:
        setPlaylistResults(results);
        break;
      case SearchType.Artists:
        setArtistResults(results);
        break;
      case SearchType.Albums:
        setAlbumResults(results);
        break;
    }
    setIsLoading(false);
  }

  const getArtist = async (url: string) => {
    const artist = await postData({
      url: '/api/spotify/getInfo',
      data: { url }
    });
    console.log(artist);
  }


  const getSpotifyResults = async (resultUrls: string[]) => {
    // try {
      if (resultUrls.length === 0) return;
      // iterate through resultUrl and get spotify info for each url
      const results: any[] = [];
      Promise.all(resultUrls.map(async (result: any) => {
        let combinedRes = {};
        // const jkResult = await postData({
        //   url: '/api/spotify/getProfInfo',
        //   data: { url: "https://open.spotify.com/user/nohwolde"}
        // });
        // console.log(jkResult);
        const spotifyResult = await postData({
          url: '/api/spotify/getInfo',
          data: { url: result.link}
        });
        console.log(spotifyResult);
        if(result.link.startsWith("https://open.spotify.com/track")){
          const regex = /^(?<song>.+?)\s+-\s+(?:song\s+and\s+lyrics\s+by\s+)?(?<artist>.+?)(?:\s+feat\..+)?$/;
          const match = result.title.match(regex);
          if (match) {
            const songName = match.groups.song.trim();
            const artistNames = match.groups.artist.split(',')[0].trim() + '';
            console.log(`Song name: ${songName}`);
            console.log(`Artist name: ${artistNames}`);
            // const ytRes = await postData({
            //   url: '/api/youtube/search',
            //   data: { searchTerm: songName + " " + artistNames, type: 'video' }
            // });
            const ytRes = await search(songName + " " + artistNames, 'video');
            console.log(ytRes);
            combinedRes = {...spotifyResult, ytSearch: ytRes};
          } else {
            console.log('No match found');
            combinedRes = {...spotifyResult};
          }
        } else {
          combinedRes = {...spotifyResult};
        }
        console.log(combinedRes);
        results.push(combinedRes);
      })).then(() => {
        setSpotResults(results);
      });
  };

  const searchSc = async(searchTerm: string) => {
    const currentSearchType = searchType;

    if(scKey !== null) {
      const scSearch = await searchSoundcloud(searchTerm, currentSearchType, scKey);
      // const res = JSON.parse(await scSearch.response.text());
      console.log(scSearch);
      setScResults(scSearch.response);
      if(scSearch.newKey){
        if(scSearch.newKey !== scKey) {
          console.log("Setting new key");
          setScKey(scSearch.newKey);
        }
      } 
    }
  }

  
  const searchYt = async(searchTerm: string) => {
    const songResults = await search(searchTerm, searchType === SearchType.Top ? "all" : searchType === SearchType.Songs ? 'video' : searchType === SearchType.Playlists ? 'playlist' : searchType === SearchType.Artists ? 'channel' : 'all');
    console.log(songResults);

    //deprecate and remove this
    setYtSearch(songResults);

    //new search storage method
    setYtResults(songResults.results);
  }



  const getNextPage = async () => {
    if(platform === Platform.Youtube) {
      console.log(ytSearch);
      console.log(ytResults);
      // if (ytSearch?.results?.length > 0) {
        console.log(ytSearch);
        if(ytSearch?.has_continuation) {
          console.log("Getting Next Page");
          const nextPage = await ytSearch?.getContinuation();
          console.log(nextPage);
        }
      // }

    }
    else {
      setSearchPage(searchPage + 1);
      const googleSearch = await getGoogleSearchData(searchTerm, searchPage);
      setSearchResults(googleSearch); 
      if(platform === Platform.Spotify) getSpotifyResults([googleSearch[0]]);
    }
  };

  useEffect(() => {
    if (searchTerm !== '') {
      if(platform === Platform.Spotify) searchGoogle(searchTerm);
      else if(platform === Platform.Soundcloud) searchSc(searchTerm);
      else searchYt(searchTerm);
    }
  }, [searchTerm, platform, searchType]);

  useEffect(() => {
    console.log("Setting Innertube");
    const setInnertube = async () => {
      console.log(await search("Alex Hormozi", "video"));
      console.log(await getChannel("UCoDcFZ5KZ0KwBC_omalJuiA"))
      // const dash = await getDash("eQkSArQxYJg");
      // console.log(dash);
      // const uri = 'data:application/dash+xml;charset=utf-8;base64,' + btoa(dash.dash.value);
      // console.log(uri);

    }
    setInnertube();
    
    const fetchData = async () => {
      const { data, error } = await supabaseClient
        .from('keys')
        .select('key')
        .single();
      
      if (!error && data) {
        console.log("KEY:", data.key);
        setScKey(data.key);

        // setKey(Platform.Soundcloud, "client_id", data.key);
      }
      // const newKey = await getKey(Platform.Soundcloud, "client_id");

      // const newKey = await getNewKey.refreshSoundcloudClientId();
      // console.log("NEW KEY:", newKey);
      // setScKey(newKey);
      // setScKey(await getNewKey.refreshSoundcloudClientId())
    }

    fetchData();

    // get spotify access token
    // getSpotifyToken();
    // https://open.spotify.com/get_access_token?reason=transport&productType=web_player

    

  }, []);




  const value = {
    topResults,
    songResults, 
    playlistResults,
    artistResults,
    albumResults,
    searchTerm,
    setYtSearch,
    ytSearch,
    setSearchTerm,
    searchType,
    setSearchType,
    searchResults,
    isLoading,
    getNextPage,
    searchPage, 
    platform,
    setPlatform
  };

  return (
    <SearchContext.Provider value={value} {...props} />
  );
}

export const useSearch = () => {
  const context = useContext(SearchContext);

  if (context === undefined) {
    throw new Error('useSearchContext must be used within a SearchContextProvider');
  }

  return context;
}