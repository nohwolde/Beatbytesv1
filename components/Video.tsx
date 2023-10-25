import React, { useEffect } from 'react';
const shaka = require('shaka-player/dist/shaka-player.ui.js');
import 'shaka-player/dist/controls.css'; /* Shaka player CSS import */
import dynamic from 'next/dynamic';
import NoSSRWrapper from '@/components/noSSRWrapper';
import PropTypes from 'prop-types';


interface VideoProps {
  licenseServer: string,
  manifestUrl: string,
  posterUrl: string
}

const Video = (props: VideoProps) => {
  const video = React.useRef(null);
  const videoContainer = React.useRef(null);

  // useEffect hook to load shaka player
  useEffect(() => {
    const manifestUri = props.manifestUrl;
    const licenseServer = props.licenseServer;
    const posterUrl = props.posterUrl;

    let vid = video.current;
    let vidContainer = videoContainer.current;

    shaka.polyfill.installAll();

    var player = new shaka.Player(vid);

    const ui = new shaka.ui.Overlay(player, vidContainer, vid);
    const controls = ui.getControls();

    console.log(Object.keys(shaka.ui));

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

      if (url.pathname === "/videoplayback") {
        if (headers.Range) {
          request.headers = {};
          url.searchParams.set("range", headers.Range.split("=")[1]);
          url.searchParams.set("alr", "yes");
        }
      }

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

    player.load(manifestUri).then(function() {
      // This runs if the asynchronous load is successful.
      console.log('The video has now been loaded!');
    }).catch(onError);  // onError is executed if the asynchronous load fails.
  }, []);

  return (
    <div className="shadow-lg mx-auto max-w-full" ref={videoContainer}>
      <video id="video" ref={video} className="w-full h-full"
      poster={props.posterUrl}>
      </video>
    </div>
  );
}
export default dynamic(() => Promise.resolve(Video), {
  ssr: false
})
// export default Video;

// export default class Video extends React.PureComponent{
//     video: React.RefObject<any>;
//     videoContainer: React.RefObject<any>;

//     constructor(props: VideoProps){

//         super(props);

//         this.video = React.createRef();
//         this.videoContainer = React.createRef();
//     }

//     componentDidMount(){

//         var manifestUri = this.props.manifestUrl;
//         var licenseServer = this.props.licenseServer;
        
//         let video = this.video.current;
//         let videoContainer = this.videoContainer.current;

//         var player = new shaka.Player(video);

//         const ui = new shaka.ui.Overlay(player, videoContainer, video);
//         const controls = ui.getControls();

//         console.log(Object.keys(shaka.ui));

//         player.configure({
//             drm: {
//               servers: { 'com.widevine.alpha': licenseServer }
//             }
//           });


//         const onError = (error) => {
//             // Log the error.
//             console.error('Error code', error.code, 'object', error);
//         }

//         player.load(manifestUri).then(function() {
//             // This runs if the asynchronous load is successful.
//             console.log('The video has now been loaded!');
//           }).catch(onError);  // onError is executed if the asynchronous load fails.
//     }

//     render(){

//         return(
//             <div className="shadow-lg mx-auto max-w-full" ref={this.videoContainer} style={{"width": "800px"}}>
//             <video id="video" ref={this.video} className="w-full h-full"
//             poster={this.props.posterUrl}></video>
//             </div>
//         );

//     }
// }

// Video.propTypes = {
//     licenseServer: PropTypes.string,
//     manifestUrl: PropTypes.string,
//     posterUrl: PropTypes.string
// }
