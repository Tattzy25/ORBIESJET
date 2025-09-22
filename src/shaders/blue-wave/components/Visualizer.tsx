import React from 'react';

interface VisualizerProps {
  audioData: number[];
  isPlaying: boolean;
}

export const Visualizer: React.FC<VisualizerProps> = ({ audioData, isPlaying }) => {
  return (
    <div className="bw-visualizer">
      {audioData.slice(0, 16).map((value, index) => (
        <div
          key={index}
          className="bw-visualizer-bar"
          style={{
            height: `${Math.max(value * 100, 8)}%`,
            opacity: isPlaying ? 0.8 + value * 0.2 : 0.3
          }}
        />
      ))}
    </div>
  );
};