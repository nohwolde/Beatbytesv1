"use client";

import React from 'react';
import AccountModalComponent from './AccountModal';
import { useSpotifyAccountModal } from '@/hooks/useAccountModal';
import { postData } from '@/libs/helpers';
import { useSpotifyProfile } from '@/hooks/useProfile';

const SpotifyAccountModal = () => {
  const { onClose, isOpen, platform } = useSpotifyAccountModal();

  const profile = useSpotifyProfile();

  const handleSearchUser = async (value: string) => {
    try {
      const profileResponse = await postData({
        url: '/api/spotify/getProfile',
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
        url: '/api/spotify/getProfile/getPlaylists',
        data: { profile: value.username }
      });
      console.log(playlistResponse);
      return playlistResponse;
    } catch (error) {
      if (error) return alert((error as Error).message);
    }
  }

  return <AccountModalComponent profile={profile} onClose={onClose} isOpen={isOpen} platform={platform} handleSearchUser={handleSearchUser} handleGetPlaylists={handleGetPlaylists}/>;
}

export default SpotifyAccountModal;
