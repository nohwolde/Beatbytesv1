"use client";

import React from 'react';
import AccountModalComponent from './AccountModal';
import { useYoutubeAccountModal } from '@/hooks/useAccountModal';
import { postData } from '@/libs/helpers';
import { useYoutubeProfile } from '@/hooks/useProfile';
import { getPlaylist } from '@/actions/useInnertube';
import { getChannel } from '@/actions/useInnertube';

const YoutubeAccountModal = () => {
  const { onClose, isOpen, platform } = useYoutubeAccountModal();

  const profile = useYoutubeProfile();

  const handleSearchUser = async (value: string) => {
    try {
      const profileResponse = await postData({
        url: '/api/youtube/getProfile',
        data: { profile: value }
      });
      console.log(profileResponse);
      return profileResponse;
    } catch (error) {
      if (error) return alert((error as Error).message);
    }
  }

  const handleGetPlaylists = async (value: any) => {
    try {
      const playlistResponse = await postData({
        url: '/api/youtube/getProfile/getPlaylists',
        data: { profile: value.externalId }
      });
      console.log(playlistResponse);
      return playlistResponse;
    } catch (error) {
      if (error) return alert((error as Error).message);
    }
  }

  // const handleGetPlaylists = async (value: any) => {
  //   try {
  //     const playlistResponse = await getChannel(value.externalId);
  //     //   postData({
  //     //   url: '/api/youtube/getProfile/getPlaylists',
  //     //   data: { profile: value.externalId }
  //     // });
  //     console.log(playlistResponse);
  //     return playlistResponse;
  //   } catch (error) {
  //     if (error) return alert((error as Error).message);
  //   }
  // }
  
  return <AccountModalComponent profile={profile} onClose={onClose} isOpen={isOpen} platform={platform} handleSearchUser={handleSearchUser} handleGetPlaylists={handleGetPlaylists}/>;
}

export default YoutubeAccountModal;
