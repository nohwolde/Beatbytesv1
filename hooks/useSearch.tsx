
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
  setYtSearcher: (searcher: any) => void;
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
  const [platform, setPlatform] = useState<Platform>(Platform.Spotify);
  const [ytSearch, setYtSearch] = useState<(any)>();
  const [ytSearcher, setYtSearcher] = useState<SearchResult>();
  const [scSearcher, setScSearcher] = useState<any>();
  const { user } = useUser();
  const supabaseClient = useSupabaseClient();

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
    if(platform === Platform.Spotify) getSpotifyResults([googleSearch[0]]);
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

  const getSpotifyResults = async (resultUrls: string[]) => {
    // try {
      if (resultUrls.length === 0) return;
      // iterate through resultUrl and get spotify info for each url
      const results: any[] = [];
      resultUrls.map(async (result: any) => {
        let combinedRes = {};
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
            const ytRes = await postData({
              url: '/api/youtube/search',
              data: { searchTerm: songName + " " + artistNames, type: 'video' }
            });
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
      });
      setResults(results);
  };

  const searchSc = async(searchTerm: string) => {
    const currentSearchType = searchType;
    const type = searchType === SearchType.Top ? 'all' : searchType === SearchType.Songs ? 'track' : searchType === SearchType.Playlists ? 'playlist' : searchType === SearchType.Artists ? 'artist' : 'all';
    const scSearch = await postData({
      url: '/api/soundcloud/search',
      data: { searchTerm: searchTerm, type: type }
    });
    console.log(scSearch);



    // const results = await Promise.all(scSearch.map(async (result: any) => {
    //   await postData({
    //     url: '/api/soundcloud/getInfo',
    //     data: { url: result.url, type: result.type }
    //   })
    // }));
    // do the above in a for loop and wait for each result to come back
    // then set the results

    const res = [];

    for(let i = 0; i < scSearch.length; i++) {
      const result = scSearch[i];
      const info = await postData({
        url: '/api/soundcloud/getInfo',
        data: { url: result.url, type: result.type }
      });
      if(result.type === 'playlist') {
        // wait 1 second
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      console.log(info);
      res.push(info)
    }

    console.log(res);
    // setResults(scSearch);
  }

  
  const searchYt = async(searchTerm: string) => {
    // setIsLoading(true);
    // const searchResults: SearchResult= await youtube.search(searchTerm, {
    //   type: searchType === SearchType.Top ? "all" : searchType === SearchType.Songs ? 'video' : searchType === SearchType.Playlists ? 'playlist' : searchType === SearchType.Artists ? 'channel' : 'all', // video | playlist | channel | all
    // }).then((search: SearchResult) => {
    //   console.log(search.items);
    //   setYtSearch(search.items);
    //   setYtSearcher(search);
    //   return search;
    // });
    const songResults = await search(searchTerm, searchType === SearchType.Top ? "all" : searchType === SearchType.Songs ? 'video' : searchType === SearchType.Playlists ? 'playlist' : searchType === SearchType.Artists ? 'channel' : 'all');
    console.log(songResults);
    setYtSearch(songResults);

    // if(searchType === SearchType.Top || searchType === SearchType.Songs) {
    //   const results = songResults.results.filter((result: any) => result.type === 'video');
    //   console.log("Supabase Results");
    //   console.log(results);
    //   const songConvert = results.map((result: any) => {
    //     return {
    //       // user_id: user?.id,
    //       name: result.title.text,
    //       image_path: result.thumbnails[0].url,
    //       href: "https://youtube.com" + result.endpoint.metadata.url,
    //       yt_href:  "https://youtube.com" + result.endpoint.metadata.url,
    //       platform: "Youtube",
    //     }
    //   }
    //   );
    //   const { error: supabaseError } = await supabaseClient
    //   .from('songs')
    //   .insert(songConvert);
    //   if(supabaseError) console.log(supabaseError)
    // }
    // setSongResults(songResults);
  }



  const getNextPage = async () => {
    if(platform === Platform.Youtube) {
      // const nextPage = ytSearcher?.next();
      // switch(searchType) {
      //   case SearchType.Top:
      //     setTopResults(topResults.concat(nextPage));
      //     break;
      //   case SearchType.Songs:
      //     setSongResults(songResults.concat(nextPage));
      //     break;
      //   case SearchType.Playlists:
      //     setPlaylistResults(playlistResults.concat(nextPage));
      //     break;
      //   case SearchType.Artists:
      //     setArtistResults(artistResults.concat(nextPage));
      //     break;
      //   case SearchType.Albums:
      //     setAlbumResults(albumResults.concat(nextPage));
      //     break;
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
  }, [searchTerm, platform]);

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
  }, []);


  const value = {
    topResults,
    songResults, 
    playlistResults,
    artistResults,
    albumResults,
    searchTerm,
    setYtSearcher,
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