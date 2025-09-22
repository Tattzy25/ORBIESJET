import React from 'react';
import type { BWRadioProps } from './types';
import { useSoundCloud } from './hooks/useSoundCloud';
import { BlueWaveRadioWrapper } from './styles/StyledComponents';
import { AudioIndicator, TrackInfoDisplay, ProgressBar, PlayControls, Visualizer } from './components';

const BWRadio = () => {
  const {
    isPlaying,
    currentTime,
    duration,
    currentTrackInfo,
    audioData,
    togglePlay,
    nextTrack,
    prevTrack,
    seekTo
  } = useSoundCloud();

  return (
    <BlueWaveRadioWrapper>
      <div className="bw-radio">
        <div className="bw-radio-cube bw-radio-cube--glowing" />
        
        <TrackInfoDisplay currentTrackInfo={currentTrackInfo} />
        
        {/* Choose between simple indicator or full visualizer */}
        <Visualizer audioData={audioData} isPlaying={isPlaying} />
        {/* <AudioIndicator isPlaying={isPlaying} /> */}

        <ProgressBar 
          currentTime={currentTime}
          duration={duration}
          onSeek={seekTo}
        />
        
        <PlayControls
          isPlaying={isPlaying}
          onTogglePlay={togglePlay}
          onPrevTrack={prevTrack}
          onNextTrack={nextTrack}
        />
      </div>
    </BlueWaveRadioWrapper>
  );
};

export const BlueWaveRadio = ({ canvasSize }: BWRadioProps) => {
  return <BWRadio />;
};

export default BlueWaveRadio;