import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from "./ui/button";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Wifi,
  Zap,
  X,
  Minimize2,
  Monitor
} from 'lucide-react';
import { useAIAudio, getStations, type AIStation } from './ai-audio-service';

export function Y2KDigitalRadio({ onClose }: { onClose: () => void }) {
  const [currentStationIndex, setCurrentStationIndex] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [glitchEffect, setGlitchEffect] = useState(false);
  const [digitalTime, setDigitalTime] = useState('');
  const [matrixChars, setMatrixChars] = useState<string[]>([]);
  const [playTime, setPlayTime] = useState(0);
  const [stations, setStations] = useState<AIStation[]>([]);
  const [stationsLoading, setStationsLoading] = useState(true);

  const audioService = useAIAudio();
  const station = stations[currentStationIndex];
  const isPlaying = audioService.getIsPlaying();
  const volume = audioService.getVolume();
  const isMuted = audioService.getIsMuted();

  // Load stations on component mount
  useEffect(() => {
    const loadStations = async () => {
      try {
        const loadedStations = await getStations();
        setStations(loadedStations);
      } catch (error) {
        console.error('Failed to load stations:', error);
      } finally {
        setStationsLoading(false);
      }
    };
    loadStations();
  }, []);

  // Audio service listener for real-time updates
  useEffect(() => {
    const handleAudioUpdate = (data: any) => {
      // Force component re-render when audio state changes
    };

    audioService.addListener(handleAudioUpdate);
    return () => audioService.removeListener(handleAudioUpdate);
  }, [audioService]);

  // Play time counter
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlayTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Reset play time when station changes
  useEffect(() => {
    setPlayTime(0);
  }, [currentStationIndex]);

  // Get Y2K neon color based on station
  const getStationColor = (station: AIStation) => {
    const colors: Record<string, string> = {
      'neuro-wave': '#00ff41',
      'cyber-beats': '#ff0080',
      'void-tech': '#00d4ff',
      'neural-jazz': '#ffff00',
      'quantum-rock': '#ff4000',
      'code-chill': '#40ff00'
    };
    return colors[station.id] || '#00ff41';
  };

  const neonColor = station ? getStationColor(station) : '#00ff41';

  // Digital clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setDigitalTime(now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Random glitch effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.1) {
        setGlitchEffect(true);
        setTimeout(() => setGlitchEffect(false), 150);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Matrix-style falling characters
  useEffect(() => {
    const chars = ['0', '1', 'A', 'B', 'C', 'X', 'Y', 'Z', '@', '#', '$', '%'];
    const interval = setInterval(() => {
      setMatrixChars(Array(6).fill(0).map(() =>
        chars[Math.floor(Math.random() * chars.length)]
      ));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const switchStation = async (direction: 'next' | 'prev') => {
    const newIndex = direction === 'next'
      ? (currentStationIndex + 1) % stations.length
      : currentStationIndex === 0 ? stations.length - 1 : currentStationIndex - 1;

    setCurrentStationIndex(newIndex);

    // Switch to new station if currently playing
    if (isPlaying) {
      await audioService.playStation(stations[newIndex]);
    }
  };

  const handlePlayPause = async () => {
    if (isPlaying) {
      await audioService.pause();
    } else {
      await audioService.playStation(station);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    audioService.setVolume(newVolume / 100);
  };

  const handleMute = () => {
    audioService.setMuted(!isMuted);
  };

  // Show loading state
  if (stationsLoading || !station) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0, x: -100 }}
        animate={{ scale: 1, opacity: 1, x: 0 }}
        className="fixed bottom-6 left-6 z-50"
      >
        <div className="w-[420px] h-64 rounded-2xl shadow-2xl border-4 border-cyan-500 bg-gray-200 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4" />
            <div className="text-gray-600 font-mono">Loading AI Stations...</div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-6 left-6 z-50"
      >
        <motion.div
          className="px-4 py-2 rounded-lg shadow-2xl cursor-pointer border-2 overflow-hidden relative"
          style={{
            background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
            borderColor: neonColor,
            boxShadow: `0 0 20px ${neonColor}40, inset 0 0 20px rgba(0,0,0,0.5)`
          }}
          onClick={() => setIsMinimized(false)}
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-sm animate-pulse"
              style={{
                backgroundColor: neonColor,
                boxShadow: `0 0 6px ${neonColor}`
              }}
            />
            <div
              className="text-sm font-mono tracking-wider"
              style={{ color: neonColor }}
            >
              {station.name}
            </div>
          </div>

          {/* Scan lines */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="absolute w-full h-px bg-cyan-400 opacity-20"
                style={{ top: `${25 + i * 25}%` }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, x: -100 }}
      animate={{ scale: 1, opacity: 1, x: 0 }}
      exit={{ scale: 0.8, opacity: 0, x: -100 }}
      className="fixed bottom-6 left-6 z-50"
    >
      <motion.div
        className={`w-[420px] h-64 rounded-2xl shadow-2xl border-4 overflow-hidden relative ${
          glitchEffect ? 'animate-pulse' : ''
        }`}
        style={{
          background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
          borderColor: neonColor,
          boxShadow: `0 0 40px ${neonColor}40, inset 0 0 40px rgba(0,0,0,0.8)`
        }}
      >
        {/* Scan lines overlay */}
        <div className="absolute inset-0 pointer-events-none z-10">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-full h-px bg-cyan-400 opacity-10"
              style={{ top: `${i * 7}%` }}
            />
          ))}
        </div>

        {/* Matrix background effect */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-30">
          {matrixChars.map((char, i) => (
            <motion.div
              key={`${char}-${i}`}
              className="text-xs font-mono"
              style={{ color: neonColor }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {char}
            </motion.div>
          ))}
        </div>

        <div className="relative p-4 h-full flex flex-col">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center border-2"
                style={{
                  backgroundColor: `${neonColor}20`,
                  borderColor: neonColor,
                  boxShadow: `inset 0 0 10px ${neonColor}40`
                }}
              >
                <Monitor className="w-5 h-5" style={{ color: neonColor }} />
              </div>
              <div>
                <div
                  className="text-lg font-mono tracking-wider font-bold"
                  style={{ color: neonColor }}
                >
                  AI Y2K RADIO
                </div>
                <div className="text-xs text-cyan-400 font-mono">{digitalTime}</div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(true)}
                className="w-8 h-8 hover:bg-white/10"
                style={{ color: neonColor }}
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="w-8 h-8 hover:bg-white/10"
                style={{ color: neonColor }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Main Display */}
          <div className="flex-1 flex gap-4">
            {/* Left Panel - Station Info */}
            <div className="flex-1 space-y-3">
              <div
                className="p-3 rounded-lg border-2"
                style={{
                  backgroundColor: `${neonColor}10`,
                  borderColor: `${neonColor}60`,
                  boxShadow: `inset 0 0 15px ${neonColor}20`
                }}
              >
                <div
                  className="text-xl font-mono font-bold mb-1"
                  style={{ color: neonColor }}
                >
                  {station.name}
                </div>
                <div className="text-sm text-cyan-400 font-mono">{station.frequency} MHZ</div>
                <div className="text-xs text-gray-400 uppercase tracking-widest">{station.genre}</div>
              </div>

              {/* Track Display with Live Progress */}
              <div
                className="p-3 rounded-lg border bg-black/60"
                style={{ borderColor: `${neonColor}40` }}
              >
                <div className="text-xs text-gray-400 mb-1 font-mono">NOW PLAYING:</div>
                <div
                  className="text-sm font-mono font-bold mb-1 overflow-hidden"
                  style={{ color: neonColor }}
                >
                  <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: '-100%' }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    className="whitespace-nowrap"
                  >
                    {station.track} • PLAYING: {Math.floor(playTime / 60)}:{(playTime % 60).toString().padStart(2, '0')}
                  </motion.div>
                </div>
                <div className="text-xs text-cyan-400 font-mono">{station.artist}</div>

                {/* Real-time progress bars */}
                <div className="mt-2 space-y-1">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-1">
                      {[...Array(20)].map((_, j) => (
                        <div
                          key={j}
                          className={`w-1 h-1 ${
                            j < (isPlaying ? Math.min(15 - i * 2, Math.floor((playTime % 30) / 2)) : 0) ? 'opacity-100' : 'opacity-20'
                          }`}
                          style={{
                            backgroundColor: neonColor,
                            boxShadow: j < (isPlaying ? Math.min(15 - i * 2, Math.floor((playTime % 30) / 2)) : 0) ? `0 0 2px ${neonColor}` : 'none'
                          }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Panel - Functional Controls */}
            <div className="flex flex-col justify-between items-center w-24">
              {/* Station switching */}
              <div className="flex flex-col gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => switchStation('prev')}
                  className="w-10 h-10 rounded-lg border-2 hover:bg-white/10"
                  style={{
                    borderColor: neonColor,
                    color: neonColor,
                    boxShadow: `0 0 10px ${neonColor}40`
                  }}
                >
                  <SkipBack className="w-5 h-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="lg"
                  onClick={handlePlayPause}
                  className="w-14 h-14 rounded-lg border-2 hover:bg-white/10 relative"
                  style={{
                    borderColor: neonColor,
                    color: neonColor,
                    backgroundColor: `${neonColor}20`,
                    boxShadow: `0 0 20px ${neonColor}60`
                  }}
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                  {isPlaying && (
                    <motion.div
                      className="absolute inset-0 rounded-lg border-2"
                      style={{ borderColor: neonColor }}
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => switchStation('next')}
                  className="w-10 h-10 rounded-lg border-2 hover:bg-white/10"
                  style={{
                    borderColor: neonColor,
                    color: neonColor,
                    boxShadow: `0 0 10px ${neonColor}40`
                  }}
                >
                  <SkipForward className="w-5 h-5" />
                </Button>
              </div>

              {/* Status indicators */}
              <div className="flex flex-col gap-2 items-center">
                <div className="flex gap-1">
                  {stations.slice(0, 6).map((st, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStationIndex(index)}
                      className={`w-2 h-2 rounded-sm transition-all duration-300 ${
                        index === currentStationIndex ? 'opacity-100' : 'opacity-30'
                      }`}
                      style={{
                        backgroundColor: getStationColor(st),
                        boxShadow: index === currentStationIndex ? `0 0 4px ${getStationColor(st)}` : 'none'
                      }}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-1">
                  <Wifi className={`w-3 h-3 ${isPlaying ? 'text-cyan-400' : 'text-gray-600'}`} />
                  <Zap className={`w-3 h-3 ${station.isLive ? 'text-green-400' : 'text-gray-600'}`} />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Real Volume Control */}
          <div className="flex items-center gap-3 mt-3 p-2 rounded-lg bg-black/40 relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMute}
              className="w-6 h-6 hover:bg-white/10"
              style={{ color: neonColor }}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>

            <div className="flex-1 flex gap-1 items-center">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-2 ${
                    i < Math.floor((volume * 100) / 10) && !isMuted ? 'opacity-100' : 'opacity-20'
                  } transition-opacity duration-200`}
                  style={{
                    backgroundColor: neonColor,
                    boxShadow: i < Math.floor((volume * 100) / 10) && !isMuted ? `0 0 3px ${neonColor}` : 'none'
                  }}
                />
              ))}
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume * 100}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="absolute left-10 right-14 h-1 bg-transparent appearance-none cursor-pointer opacity-0"
            />

            <span
              className="text-xs font-mono w-6"
              style={{ color: neonColor }}
            >
              {isMuted ? 0 : Math.round(volume * 100)}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}