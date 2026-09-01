import { FC } from 'react';

import {
  TahtiJamConnecting,
  TahtiJamConnectingLabels,
} from './TahtiJamConnecting';
import { TahtiJamContent, TahtiJamContentProps } from './TahtiJamContent';
import { TahtiJamControls, TahtiJamControlsProps } from './TahtiJamControls';
import { TahtiJamEmptyQueueLabels } from './TahtiJamEmptyQueue';
import { TahtiJamError, TahtiJamErrorLabels } from './TahtiJamError';
import {
  ConnectionStatus,
  ConnectionStatusLabels,
  TahtiJamHeader,
  TahtiJamHeaderProps,
} from './TahtiJamHeader';
import {
  TahtiJamNowPlaying,
  TahtiJamNowPlayingProps,
} from './TahtiJamNowPlaying';
import {
  TahtiJamQueue,
  TahtiJamQueueLabels,
  TahtiJamQueueProps,
} from './TahtiJamQueue';
import { TahtiJamProps, TahtiJamRoot } from './TahtiJamRoot';
import {
  TahtiJamSearchBar,
  TahtiJamSearchBarLabels,
  TahtiJamSearchBarProps,
} from './TahtiJamSearchBar';
import {
  TahtiJamSearchDrawer,
  TahtiJamSearchDrawerProps,
} from './TahtiJamSearchDrawer';
import {
  TahtiJamSearchDrawerEmpty,
  TahtiJamSearchDrawerEmptyLabels,
} from './TahtiJamSearchDrawerEmpty';
import {
  TahtiJamSearchDrawerError,
  TahtiJamSearchDrawerErrorLabels,
} from './TahtiJamSearchDrawerError';
import { TahtiJamSearchDrawerResults } from './TahtiJamSearchDrawerResults';
import {
  TahtiJamSearchResultTrack,
  TahtiJamSearchResultTrackProps,
} from './TahtiJamSearchResultTrack';

type TahtiJamSearchDrawerComponent = typeof TahtiJamSearchDrawer & {
  Empty: typeof TahtiJamSearchDrawerEmpty;
  Error: typeof TahtiJamSearchDrawerError;
  Results: typeof TahtiJamSearchDrawerResults;
};

const SearchDrawer = TahtiJamSearchDrawer as TahtiJamSearchDrawerComponent;
SearchDrawer.Empty = TahtiJamSearchDrawerEmpty;
SearchDrawer.Error = TahtiJamSearchDrawerError;
SearchDrawer.Results = TahtiJamSearchDrawerResults;

type TahtiJamComponent = FC<TahtiJamProps> & {
  Connecting: typeof TahtiJamConnecting;
  Error: typeof TahtiJamError;
  Header: typeof TahtiJamHeader;
  Content: typeof TahtiJamContent;
  NowPlaying: typeof TahtiJamNowPlaying;
  Controls: typeof TahtiJamControls;
  Queue: typeof TahtiJamQueue;
  SearchBar: typeof TahtiJamSearchBar;
  SearchDrawer: TahtiJamSearchDrawerComponent;
  SearchResultTrack: typeof TahtiJamSearchResultTrack;
};

export const TahtiJam = TahtiJamRoot as TahtiJamComponent;
TahtiJam.Connecting = TahtiJamConnecting;
TahtiJam.Error = TahtiJamError;
TahtiJam.Header = TahtiJamHeader;
TahtiJam.Content = TahtiJamContent;
TahtiJam.NowPlaying = TahtiJamNowPlaying;
TahtiJam.Controls = TahtiJamControls;
TahtiJam.Queue = TahtiJamQueue;
TahtiJam.SearchBar = TahtiJamSearchBar;
TahtiJam.SearchDrawer = SearchDrawer;
TahtiJam.SearchResultTrack = TahtiJamSearchResultTrack;

export type {
  TahtiJamProps,
  TahtiJamHeaderProps,
  TahtiJamContentProps,
  TahtiJamNowPlayingProps,
  TahtiJamControlsProps,
  TahtiJamConnectingLabels,
  TahtiJamErrorLabels,
  TahtiJamEmptyQueueLabels,
  TahtiJamQueueLabels,
  TahtiJamQueueProps,
  TahtiJamSearchBarLabels,
  TahtiJamSearchBarProps,
  TahtiJamSearchDrawerProps,
  TahtiJamSearchDrawerEmptyLabels,
  TahtiJamSearchDrawerErrorLabels,
  TahtiJamSearchResultTrackProps,
  ConnectionStatus,
  ConnectionStatusLabels,
};
