import React from 'react';

interface AudioIndicatorProps {
  isPlaying: boolean;
}

export const AudioIndicator: React.FC<AudioIndicatorProps> = ({ isPlaying }) => {
  return (
    <div className="bw-audio-indicator">
      {isPlaying ? (
        <div className="bw-playing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      ) : (
        <div className="bw-paused-icon">⏸</div>
      )}
    </div>
  );
};