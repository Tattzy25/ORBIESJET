import React from 'react';
import { formatTime, calculateProgressPercentage, calculateSeekPosition } from '../utilities/audioUtils';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (position: number) => void;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  currentTime, 
  duration, 
  onSeek 
}) => {
  const progressPercentage = calculateProgressPercentage(currentTime, duration);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = e.currentTarget;
    const clickX = e.nativeEvent.offsetX;
    const width = progressBar.offsetWidth;
    const newTime = calculateSeekPosition(clickX, width, duration);
    onSeek(newTime);
  };

  if (duration <= 0) return null;

  return (
    <div className="bw-progress-section">
      <div className="bw-time-display">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
      <div className="bw-progress-bar" onClick={handleProgressClick}>
        <div 
          className="bw-progress-fill" 
          style={{ width: `${Math.min(progressPercentage, 100)}%` }}
        />
      </div>
    </div>
  );
};