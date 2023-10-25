"use client";

import React from 'react';
import AccountModalComponent from './AccountModal';
import { useSoundcloudAccountModal } from '@/hooks/useAccountModal';
import { postData } from '@/libs/helpers';
import { useSoundcloudProfile } from '@/hooks/useProfile';

const SoundcloudAccountModal = () => {
  const { onClose, isOpen, platform } = useSoundcloudAccountModal();

  const profile = useSoundcloudProfile();

  const handleSearchUser = async (value: string) => {
    try {
      const profileResponse = await postData({
        url: '/api/soundcloud/getProfile',
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
        url: '/api/soundcloud/getProfile/getPlaylists',
        data: { profile: value.username }
      });
      console.log(playlistResponse);
      return playlistResponse;
    } catch (error) {
      if (error) return alert((error as Error).message);
    }
  }

  return <AccountModalComponent profile={profile} onClose={onClose} isOpen={isOpen} platform={platform} handleSearchUser={handleSearchUser} handleGetPlaylists={handleGetPlaylists} />;
}

export default SoundcloudAccountModal;
