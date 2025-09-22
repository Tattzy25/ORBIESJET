import React from 'react';
import type { TrackInfo } from '../types';

interface TrackInfoDisplayProps {
  currentTrackInfo: TrackInfo;
}

export const TrackInfoDisplay: React.FC<TrackInfoDisplayProps> = ({ currentTrackInfo }) => {
  if (!currentTrackInfo.title) return null;

  return (
    <div className="bw-track-info">
      <h3>{currentTrackInfo.title}</h3>
      <p>{currentTrackInfo.artist}</p>
    </div>
  );
};