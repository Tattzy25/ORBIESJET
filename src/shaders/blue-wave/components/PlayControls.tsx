import React from 'react';

interface PlayControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onPrevTrack: () => void;
  onNextTrack: () => void;
}

export const PlayControls: React.FC<PlayControlsProps> = ({
  isPlaying,
  onTogglePlay,
  onPrevTrack,
  onNextTrack
}) => {
  return (
    <div className="bw-controls">
      <button onClick={onPrevTrack} className="bw-control-btn" title="Previous">
        ⏮
      </button>
      
      <button onClick={onTogglePlay} className="bw-control-btn bw-play-btn" title={isPlaying ? "Pause" : "Play"}>
        {isPlaying ? "⏸" : "▶"}
      </button>
      
      <button onClick={onNextTrack} className="bw-control-btn" title="Next">
        ⏭
      </button>
    </div>
  );
};