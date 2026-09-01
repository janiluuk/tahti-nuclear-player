import { FC } from 'react';

import { PlayerBar } from '@tahti-player/ui';

import { ConnectedControls } from './ConnectedControls';
import { ConnectedNowPlaying } from './ConnectedNowPlaying';
import { ConnectedSeekBar } from './ConnectedSeekBar';
import { ConnectedVolume } from './ConnectedVolume';

export const ConnectedPlayerBar: FC = () => {
  return (
    <>
      <ConnectedSeekBar />
      <PlayerBar
        left={<ConnectedNowPlaying />}
        center={<ConnectedControls />}
        right={<ConnectedVolume />}
      />
    </>
  );
};
