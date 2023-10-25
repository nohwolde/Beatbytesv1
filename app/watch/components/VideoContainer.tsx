"use client";
import React from 'react';

// import dynamic from 'next/dynamic';
// const Video=dynamic(import ("./Video"),{ssr:false});
import NoSSRWrapper from '@/components/noSSRWrapper';
import Video from '@/components/Video';
const VideoContainer = (props: { manifestUrl: string, posterUrl:string}) => {

    const licenseServer = "https://widevine-proxy.appspot.com/proxy";

    return (
        <Video
            licenseServer={licenseServer}
            manifestUrl={props.manifestUrl}
            posterUrl={props.posterUrl}
        />
    )
}

export default VideoContainer;