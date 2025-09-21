import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

interface FuturisticRadioPlayerProps {
  canvasSize: number;
}

interface Track {
  id: number;
  title: string;
  artist: string;
  duration: number;
}

declare global {
  interface Window {
    SC: any;
  }
}

const Loader = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [tracks] = useState<Track[]>([
    { id: 1, title: "Legendary Tunes", artist: "Digital Hustle Lab", duration: 225 },
    { id: 2, title: "Epic Vibes", artist: "Digital Hustle Lab", duration: 180 },
    { id: 3, title: "Future Sounds", artist: "Digital Hustle Lab", duration: 200 },
  ]);
  
  const widgetRef = useRef<any>(null);

  // Load SoundCloud API for backend audio control only
  useEffect(() => {
    const loadSoundCloud = () => {
      const script = document.createElement('script');
      script.src = 'https://w.soundcloud.com/player/api.js';
      script.onload = () => {
        // Create hidden iframe for audio control
        const iframe = document.createElement('iframe');
        iframe.width = '0';
        iframe.height = '0';
        iframe.style.display = 'none';
        iframe.src = 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/1964027796&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&visual=false';
        document.body.appendChild(iframe);
        
        // Initialize widget for backend control
        if (window.SC) {
          widgetRef.current = window.SC.Widget(iframe);
        }
      };
      document.head.appendChild(script);
    };

    loadSoundCloud();
  }, []);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (widgetRef.current) {
      if (isPlaying) {
        widgetRef.current.pause();
      } else {
        widgetRef.current.play();
      }
    }
  };

  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % tracks.length);
    if (widgetRef.current) {
      widgetRef.current.next();
    }
  };

  const prevTrack = () => {
    setCurrentTrack((prev) => (prev - 1 + tracks.length) % tracks.length);
    if (widgetRef.current) {
      widgetRef.current.prev();
    }
  };

  const stopTrack = () => {
    setIsPlaying(false);
    if (widgetRef.current) {
      widgetRef.current.pause();
      widgetRef.current.seekTo(0);
    }
  };

  const currentTrackData = tracks[currentTrack];

  return (
    <StyledWrapper>
      <div className="loader">
        <div className="loader_cube loader_cube--color" />
        <div className="loader_cube loader_cube--glowing" />
        
        {/* Track Info */}
        <div className="track-info">
          <h3>{currentTrackData.title}</h3>
          <p>{currentTrackData.artist}</p>
        </div>
        
        {/* Control Buttons */}
        <div className="controls">
          <button onClick={prevTrack} className="control-btn" title="Previous">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="19 20 9 12 19 4 19 20" />
              <line x1="5" y1="19" x2="5" y2="5" />
            </svg>
          </button>
          
          <button onClick={togglePlay} className="control-btn play-btn" title={isPlaying ? "Pause" : "Play"}>
            {isPlaying ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            )}
          </button>
          
          <button onClick={stopTrack} className="control-btn" title="Stop">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="6" y="6" width="12" height="12" />
            </svg>
          </button>
          
          <button onClick={nextTrack} className="control-btn" title="Next">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 4 15 12 5 20 5 4" />
              <line x1="19" y1="5" x2="19" y2="19" />
            </svg>
          </button>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .loader {
    width: 150px;
    height: 150px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 15px;
  }

  .loader_cube {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 30px;
    top: 0;
    left: 0;
  }

  .loader_cube--glowing {
    z-index: 2;
    background-color: rgba(255, 255, 255, 0.2);
    border: 2px solid rgba(255, 255, 255, 0.3);
  }

  .loader_cube--color {
    z-index: 1;
    filter: blur(2px);
    background: linear-gradient(135deg, #1afbf0, #da00ff);
    animation: loadtwo 2.5s ease-in-out infinite;
  }

  .track-info {
    z-index: 3;
    text-align: center;
    color: white;
    text-shadow: 0 0 10px rgba(26, 251, 240, 0.5);
    margin-top: 20px;
  }

  .track-info h3 {
    margin: 0;
    font-size: 14px;
    font-weight: bold;
  }

  .track-info p {
    margin: 5px 0 0 0;
    font-size: 12px;
    opacity: 0.8;
  }

  .controls {
    z-index: 3;
    display: flex;
    gap: 10px;
    margin-top: 15px;
  }

  .control-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    color: white;
  }

  .control-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(26, 251, 240, 0.8);
    box-shadow: 0 0 15px rgba(26, 251, 240, 0.3);
    transform: scale(1.1);
  }

  .play-btn {
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #1afbf0, #da00ff);
    border: none;
  }

  .play-btn:hover {
    background: linear-gradient(135deg, #da00ff, #1afbf0);
    box-shadow: 0 0 20px rgba(26, 251, 240, 0.5);
  }

  @keyframes loadtwo {
    50% {
      transform: rotate(-80deg);
    }
  }
`;

export const FuturisticRadioPlayer = ({ canvasSize }: FuturisticRadioPlayerProps) => {
  return <Loader />;
};