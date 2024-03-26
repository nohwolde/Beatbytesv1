import React, { useEffect } from 'react';
const shaka = require('shaka-player/dist/shaka-player.ui.js');
import 'shaka-player/dist/controls.css'; /* Shaka player CSS import */
import usePlayer from '@/hooks/usePlayer';
import { getDash } from '@/actions/useInnertube';

interface VideoProps {
  licenseServer: string,
  manifestUrl: string,
  setManifestUrl: any,
  posterUrl: string, 
  currentId: string,
  setCurrentId: any,
}

const Video: React.FC<VideoProps> = ({licenseServer, manifestUrl, setManifestUrl, posterUrl, currentId, setCurrentId}) => {
  const video = React.useRef(null);
  const videoContainer = React.useRef(null);
  let currPlayer: any = null;

  const playerState = usePlayer();

  useEffect(() => {
    const setInnertube = async () => {
      const id = playerState.activeId;
      console.log(id);
      if(currentId !== id) {
        setCurrentId(id as string);
        const video = await getDash(id);
        console.log(video);
        const uri = 'data:application/dash+xml;charset=utf-8;base64,' + btoa(video.dash);
        setManifestUrl(uri);
      }
    }
    setInnertube();
  }, [playerState.activeId]);


  // useEffect hook to load shaka player
  useEffect(() => {
    let vid = video.current;
    let vidContainer = videoContainer.current;

    shaka.polyfill.installAll();

    var player = new shaka.Player(vid);

    currPlayer = player;

    const ui = new shaka.ui.Overlay(player, vidContainer, vid);
    const config = {
      seekBarColors: {
        base: 'rgba(255,255,255,.2)',
        buffered: 'rgba(255,255,255,.4)',
        played: 'rgb(64, 224, 208)',
      },
      fadeDelay: 0,
      // controlPanelElements: ['rewind', 'fast_forward']
    };

    ui.configure(config);
    // const controls = ui.getControls();


    // console.log(Object.keys(shaka.ui));

    player.configure({
      streaming: {
        bufferingGoal: 180,
        rebufferingGoal: 0.02,
        bufferBehind: 300
      },
      drm: {
        servers: { 'com.widevine.alpha': licenseServer }
      }
    });

    player.getNetworkingEngine()?.registerRequestFilter((_type: any, request: any) => {
      const uri = request.uris[0];
      const url = new URL(uri);
      const headers = request.headers;

      if (url.host.endsWith(".googlevideo.com") || headers.Range) {
        url.searchParams.set('__host', url.host);
        url.host = 'localhost:8080';
        url.protocol = 'http';
      }

      request.method = 'POST';

      // protobuf - { 15: 0 }
      request.body = new Uint8Array([120, 0]);

      // if (url.pathname === "/watch") {
        if (headers.Range) {
          request.headers = {};
          url.searchParams.set("range", headers.Range.split("=")[1]);
          url.searchParams.set("alr", "yes");
        }
      // }

      request.uris[0] = url.toString();
    });

    // The UTF-8 characters "h", "t", "t", and "p".
    const HTTP_IN_HEX = 0x68747470;

    const RequestType = shaka.net.NetworkingEngine.RequestType;


    player.getNetworkingEngine()?.registerResponseFilter(async (type: any, response: any) => {
      const dataView = new DataView(response.data);
      
      if (response.data.byteLength < 4 ||
        dataView.getUint32(0) != HTTP_IN_HEX) {
        // This doesn't start with "http", so it is not an ALR.
        return;
      }

      // Interpret the response data as a URL string.
      const response_as_string = shaka.util.StringUtils.fromUTF8(response.data);

      let retry_parameters;

      if (type == RequestType.MANIFEST) {
        retry_parameters = player!.getConfiguration().manifest.retryParameters;
      } else if (type == RequestType.SEGMENT) {
        retry_parameters = player!.getConfiguration().streaming.retryParameters;
      } else if (type == RequestType.LICENSE) {
        retry_parameters = player!.getConfiguration().drm.retryParameters;
      } else {
        retry_parameters = shaka.net.NetworkingEngine.defaultRetryParameters();
      }

      // Make another request for the redirect URL.
      const uris = [response_as_string];
      const redirect_request = shaka.net.NetworkingEngine.makeRequest(uris, retry_parameters);
      const request_operation = player!.getNetworkingEngine()!.request(type, redirect_request);
      const redirect_response = await request_operation.promise;

      // Modify the original response to contain the results of the redirect
      // response.
      response.data = redirect_response.data;
      response.headers = redirect_response.headers;
      response.uri = redirect_response.uri;
    });

    const onError = (error: { code: any; }) => {
      // Log the error.
      console.error('Error code', error.code, 'object', error);
    }

    player.load(manifestUrl).then(function() {
      showUI({ hidePlayer: false });
      // currPlayer = player;
      // console.log("Player", player);
      // console.log(currPlayer);
      // This runs if the asynchronous load is successful.
      console.log('The video has now been loaded!');
    }).catch(onError);  // onError is executed if the asynchronous load fails.
  }, []);

  function showUI(args: { hidePlayer?: boolean } = {
    hidePlayer: true,
  }) {
    const ytplayer = document.getElementById('video') as HTMLDivElement;
  
    ytplayer.style.display = args.hidePlayer ? 'none' : 'block';
  
    const video_container = document.getElementById('shaka-container') as HTMLDivElement;
    video_container.animate({ opacity: [0, 1] }, { duration: 300, easing: 'ease-in-out' });
    video_container.style.display = 'block';
  
    // loader.style.display = 'none';
  }

  return (
    <div 
      className="shadow-lg mx-auto max-w-full" 
      ref={videoContainer} id="shaka-container">
      <video id="video" ref={video} 
      className="w-full h-full"
      poster={posterUrl}>
      </video>
    </div>
  );
}

export default Video;
