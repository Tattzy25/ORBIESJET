import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

interface BWRadioProps {
  canvasSize: number;
}

declare global {
  interface Window {
    SC: any;
  }
}

const BWRadio = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTrackInfo, setCurrentTrackInfo] = useState({
    title: "",
    artist: ""
  });
  const [audioData, setAudioData] = useState<number[]>(new Array(32).fill(0));
  
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
        iframe.allow = 'autoplay';
        document.body.appendChild(iframe);
        
        // Initialize widget for backend control
        if (window.SC) {
          widgetRef.current = window.SC.Widget(iframe);
          
          // Get current track info when ready
          widgetRef.current.bind(window.SC.Widget.Events.READY, () => {
            widgetRef.current.getCurrentSound((sound: any) => {
              if (sound) {
                setCurrentTrackInfo({
                  title: sound.title || "Loading...",
                  artist: sound.user?.username || "Digital Hustle Lab"
                });
                setDuration(sound.duration || 0);
              }
            });
          });

          // Update progress during playback
          widgetRef.current.bind(window.SC.Widget.Events.PLAY_PROGRESS, (event: any) => {
            setCurrentTime(event.currentPosition || 0);
            
            widgetRef.current.getCurrentSound((sound: any) => {
              if (sound) {
                setCurrentTrackInfo({
                  title: sound.title || "Digital Hustle Lab",
                  artist: sound.user?.username || "Legendary Tunes"
                });
                setDuration(sound.duration || 0);
              }
            });
          });

          // Track play state changes
          widgetRef.current.bind(window.SC.Widget.Events.PLAY, () => {
            setIsPlaying(true);
          });

          widgetRef.current.bind(window.SC.Widget.Events.PAUSE, () => {
            setIsPlaying(false);
          });

          widgetRef.current.bind(window.SC.Widget.Events.FINISH, () => {
            setIsPlaying(false);
            // Auto-play next track when current finishes
            setTimeout(() => {
              widgetRef.current.next();
            }, 500);
          });

          // Handle track changes
          widgetRef.current.bind(window.SC.Widget.Events.TRACK_CHANGE, () => {
            // Update track info when track changes
            widgetRef.current.getCurrentSound((sound: any) => {
              if (sound) {
                setCurrentTrackInfo({
                  title: sound.title || "Digital Hustle Lab",
                  artist: sound.user?.username || "Legendary Tunes"
                });
                setDuration(sound.duration || 0);
                setCurrentTime(0);
              }
            });
          });
        }
      };
      document.head.appendChild(script);
    };

    loadSoundCloud();
  }, []);

  const togglePlay = () => {
    if (widgetRef.current) {
      if (isPlaying) {
        widgetRef.current.pause();
      } else {
        widgetRef.current.play();
      }
    }
  };

  const nextTrack = () => {
    if (widgetRef.current) {
      widgetRef.current.next();
    }
  };

  const prevTrack = () => {
    if (widgetRef.current) {
      widgetRef.current.prev();
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = e.currentTarget;
    const clickX = e.nativeEvent.offsetX;
    const width = progressBar.offsetWidth;
    const percentage = clickX / width;
    const newTime = percentage * duration;
    
    if (widgetRef.current) {
      widgetRef.current.seekTo(newTime);
      setCurrentTime(newTime);
    }
  };

  // Simple visualizer simulation
  useEffect(() => {
    let animationId: number;
    
    const simulateVisualization = () => {
      if (isPlaying) {
        const simulatedData = Array.from({ length: 32 }, () => 
          Math.random() * 0.8 + 0.2
        );
        setAudioData(simulatedData);
      } else {
        setAudioData(new Array(32).fill(0.1));
      }
      animationId = requestAnimationFrame(simulateVisualization);
    };
    
    simulateVisualization();
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <BlueWaveRadioWrapper>
      <div className="bw-radio">
        <div className="bw-radio-cube bw-radio-cube--glowing" />
        
        {/* Track Info */}
        {currentTrackInfo.title && (
          <div className="bw-track-info">
            <h3>{currentTrackInfo.title}</h3>
            <p>{currentTrackInfo.artist}</p>
          </div>
        )}

        {/* Blue Wave Audio Visualizer */}
        <div className="bw-visualizer">
          {audioData.map((value, index) => (
            <div
              key={index}
              className="bw-visualizer-bar"
              style={{ 
                height: `${Math.max(value * 100, 5)}%`,
                animationDelay: `${index * 0.05}s`
              }}
            />
          ))}
        </div>

        {/* Progress Bar */}
        {duration > 0 && (
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
        )}
        
        {/* Control Buttons */}
        <div className="bw-controls">
          <button onClick={prevTrack} className="bw-control-btn" title="Previous">
            ⏮
          </button>
          
          <button onClick={togglePlay} className="bw-control-btn bw-play-btn" title={isPlaying ? "Pause" : "Play"}>
            {isPlaying ? "⏸" : "▶"}
          </button>
          
          <button onClick={nextTrack} className="bw-control-btn" title="Next">
            ⏭
          </button>
        </div>
      </div>
    </BlueWaveRadioWrapper>
  );
};

const BlueWaveRadioWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  pointer-events: auto;

  .bw-radio {
    width: 200px;
    height: 220px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-direction: column;
    padding: 20px 0;
    box-sizing: border-box;
  }

  .bw-radio-cube {
    position: absolute;
    width: 200px;
    height: 200px;
    border-radius: 30px;
    top: 10px;
    left: 0;
  }

  .bw-radio-cube--glowing {
    z-index: 1;
    background-color: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }

  .bw-track-info {
    z-index: 3;
    text-align: center;
    color: white;
    text-shadow: 0 0 10px rgba(26, 251, 240, 0.5);
    margin-top: 15px;
    margin-bottom: 10px;
    width: 180px;
    min-height: 35px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
  }

  .bw-track-info h3 {
    margin: 0;
    font-size: 14px;
    font-weight: bold;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    line-height: 1.2;
  }

  .bw-track-info p {
    margin: 3px 0 0 0;
    font-size: 11px;
    opacity: 0.8;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  .bw-visualizer {
    z-index: 3;
    display: flex;
    align-items: end;
    justify-content: center;
    gap: 2px;
    height: 40px;
    width: 160px;
    margin: 5px 0;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    padding: 5px;
    backdrop-filter: blur(10px);
  }

  .bw-visualizer-bar {
    background: linear-gradient(to top, #1afbf0, #da00ff);
    width: 3px;
    border-radius: 2px;
    min-height: 3px;
    transition: height 0.1s ease;
    animation: bw-pulse 0.3s ease-in-out infinite alternate;
    box-shadow: 0 0 5px rgba(26, 251, 240, 0.3);
  }

  @keyframes bw-pulse {
    0% { opacity: 0.7; transform: scaleY(0.8); }
    100% { opacity: 1; transform: scaleY(1.2); }
  }

  .bw-progress-section {
    z-index: 3;
    width: 100%;
    padding: 0 10px;
    margin-top: 8px;
  }

  .bw-time-display {
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 4px;
  }

  .bw-progress-bar {
    width: 100%;
    height: 4px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
    cursor: pointer;
    position: relative;
  }

  .bw-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #1afbf0, #da00ff);
    border-radius: 2px;
    transition: width 0.1s ease;
  }

  .bw-controls {
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    margin-top: 15px;
    width: 100%;
    padding: 0 10px;
  }

  .bw-control-btn {
    background: linear-gradient(145deg, rgba(26, 251, 240, 0.2), rgba(218, 0, 255, 0.2));
    border: 2px solid transparent;
    background-clip: padding-box;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    color: white;
    flex-shrink: 0;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    font-size: 16px;
  }

  .bw-control-btn:hover {
    transform: scale(1.1) translateY(-2px);
    box-shadow: 0 8px 25px rgba(26, 251, 240, 0.4);
    border: 2px solid rgba(26, 251, 240, 0.6);
  }

  .bw-play-btn {
    width: 50px;
    height: 50px;
    background: linear-gradient(145deg, #1afbf0, #da00ff);
    border: none;
    box-shadow: 0 6px 20px rgba(26, 251, 240, 0.5);
  }

  .bw-play-btn:hover {
    background: linear-gradient(145deg, #da00ff, #1afbf0);
    transform: scale(1.15) translateY(-3px);
    box-shadow: 0 10px 30px rgba(26, 251, 240, 0.6);
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .bw-control-btn {
      width: 45px;
      height: 45px;
    }
    
    .bw-play-btn {
      width: 55px;
      height: 55px;
    }
    
    .bw-controls {
      gap: 25px;
      padding: 0 15px;
    }
  }

  @media (max-width: 480px) {
    .bw-radio {
      width: 180px;
      height: 200px;
    }
    
    .bw-radio-cube {
      width: 180px;
      height: 180px;
    }
    
    .bw-control-btn {
      width: 42px;
      height: 42px;
    }
    
    .bw-play-btn {
      width: 52px;
      height: 52px;
    }
    
    .bw-visualizer {
      width: 140px;
      height: 35px;
    }
    
    .bw-track-info {
      width: 160px;
    }
  }
`;

export const BlueWaveRadio = ({ canvasSize }: BWRadioProps) => {
  return <BWRadio />;
};

export default BlueWaveRadio;