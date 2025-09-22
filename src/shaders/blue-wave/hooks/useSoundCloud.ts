import { useState, useRef, useEffect } from 'react';
import type { SoundCloudWidget, TrackInfo, AudioState } from '../types';

export const useSoundCloud = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTrackInfo, setCurrentTrackInfo] = useState<TrackInfo>({
    title: "",
    artist: ""
  });
  const [audioData, setAudioData] = useState<number[]>(new Array(32).fill(0));
  
  const widgetRef = useRef<SoundCloudWidget | null>(null);

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
          
          if (widgetRef.current) {
            // Get current track info when ready
            widgetRef.current.bind(window.SC.Widget.Events.READY, () => {
              widgetRef.current?.getCurrentSound((sound: any) => {
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
              
              widgetRef.current?.getCurrentSound((sound: any) => {
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
                widgetRef.current?.next();
              }, 500);
            });

            // Handle track changes
            widgetRef.current.bind(window.SC.Widget.Events.TRACK_CHANGE, () => {
              // Update track info when track changes
              widgetRef.current?.getCurrentSound((sound: any) => {
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
        }
      };
      document.head.appendChild(script);
    };

    loadSoundCloud();
  }, []);

  // Enhanced visualizer simulation with more dynamic movement
  useEffect(() => {
    let animationId: number;
    
    const simulateVisualization = () => {
      if (isPlaying) {
        // Create more dynamic and varied bars
        const simulatedData = Array.from({ length: 32 }, (_, index) => {
          // Create wave-like pattern with random variations
          const baseWave = Math.sin((Date.now() / 500) + (index * 0.2)) * 0.4 + 0.5;
          const randomVariation = Math.random() * 0.6 + 0.2;
          const rhythmPattern = Math.sin((Date.now() / 200) + (index * 0.1)) * 0.3 + 0.7;
          
          return Math.max(baseWave * randomVariation * rhythmPattern, 0.1);
        });
        setAudioData(simulatedData);
      } else {
        // Gentle idle animation when paused
        const idleData = Array.from({ length: 32 }, (_, index) => 
          Math.sin((Date.now() / 2000) + (index * 0.3)) * 0.1 + 0.15
        );
        setAudioData(idleData);
      }
      animationId = requestAnimationFrame(simulateVisualization);
    };
    
    simulateVisualization();
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying]);

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

  const seekTo = (position: number) => {
    if (widgetRef.current) {
      widgetRef.current.seekTo(position);
      setCurrentTime(position);
    }
  };

  return {
    // State
    isPlaying,
    currentTime,
    duration,
    currentTrackInfo,
    audioData,
    
    // Actions
    togglePlay,
    nextTrack,
    prevTrack,
    seekTo
  };
};