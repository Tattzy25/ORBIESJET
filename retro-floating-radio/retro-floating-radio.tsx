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
  Radio,
  Power,
  X,
  Minimize2
} from 'lucide-react';
import { useAIAudio, getStations, type AIStation } from './ai-audio-service';

export function RetroFloatingRadio({ onClose }: { onClose: () => void }) {
  const [currentStationIndex, setCurrentStationIndex] = useState(0);
  const [isPowered, setIsPowered] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [frequency, setFrequency] = useState(101.5);
  const [tuningAnimation, setTuningAnimation] = useState(false);
  const [playTime, setPlayTime] = useState(0);
  const [stations, setStations] = useState<AIStation[]>([]);
  const [stationsLoading, setStationsLoading] = useState(true);

  const audioService = useAIAudio();
  const station = stations[currentStationIndex];
  const isPlaying = audioService.getIsPlaying() && isPowered;
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

  // Update frequency display when station changes
  useEffect(() => {
    if (isPowered && station) {
      setFrequency(Number(station.frequency));
    }
  }, [currentStationIndex, station?.frequency, isPowered]);

  const switchStation = async (direction: 'next' | 'prev') => {
    if (!isPowered) return;

    setTuningAnimation(true);
    setTimeout(() => setTuningAnimation(false), 500);

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
    if (!isPowered) return;

    if (isPlaying) {
      await audioService.pause();
    } else {
      await audioService.playStation(station);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    if (!isPowered) return;
    audioService.setVolume(newVolume / 100);
  };

  const handleMute = () => {
    if (!isPowered) return;
    audioService.setMuted(!isMuted);
  };

  const handlePowerToggle = async () => {
    if (isPowered && isPlaying) {
      await audioService.stop();
    }
    setIsPowered(!isPowered);
  };

  // Show loading state
  if (stationsLoading || !station) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0, x: -100 }}
        animate={{ scale: 1, opacity: 1, x: 0 }}
        className="fixed bottom-6 left-6 z-50"
      >
        <div className="bg-gradient-to-b from-amber-900 to-amber-800 rounded-2xl p-6 w-80 border-4 border-amber-700 shadow-2xl bg-gray-200 flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4" />
            <div className="text-amber-100 font-mono">Loading AI Stations...</div>
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
          className="bg-gradient-to-b from-amber-900 to-amber-800 rounded-2xl p-3 border-4 border-amber-700 shadow-2xl cursor-pointer"
          onClick={() => setIsMinimized(false)}
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex items-center gap-3">
            {isPowered && (
              <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
            )}
            <div className="text-amber-100 text-sm font-medium">
              {isPowered ? station.name : 'OFF'}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                if (isPowered) handlePlayPause();
              }}
              className="w-6 h-6 text-amber-100 hover:text-white"
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </Button>
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
        className="bg-gradient-to-b from-amber-900 to-amber-800 rounded-2xl p-6 w-80 border-4 border-amber-700 shadow-2xl"
      >
        {/* Header Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-amber-100 font-bold text-lg">AI RETRO FM</div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMinimized(true)}
              className="w-8 h-8 text-amber-100 hover:text-white"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="w-8 h-8 text-amber-100 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Radio Face */}
        <div className="bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl p-4 mb-4 border-2 border-amber-600">
          <div className="text-center mb-3">
            <div className="text-lg font-bold text-amber-900 mb-1">AI STEREO FM</div>
            <div className="text-xs text-amber-700">VINTAGE RADIO 2025</div>
          </div>

          {/* Digital Display */}
          <div className="bg-black rounded-lg p-3 mb-3">
            <div className="text-green-400 font-mono text-xl text-center mb-1">
              {isPowered ? `${frequency.toFixed(1)} MHz` : '---.-'}
            </div>
            {isPowered && (
              <div className="text-green-300 font-mono text-xs text-center">
                {tuningAnimation ? 'TUNING...' : station.name}
              </div>
            )}
          </div>

          {/* Now Playing */}
          {isPowered && (
            <motion.div
              key={station.track}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mb-3"
            >
              <div className="text-amber-900 font-medium text-sm">{station.track}</div>
              <div className="text-amber-700 text-xs">{station.artist}</div>
              {isPlaying && (
                <div className="text-amber-600 text-xs mt-1">
                  Playing: {Math.floor(playTime / 60)}:{(playTime % 60).toString().padStart(2, '0')}
                </div>
              )}
            </motion.div>
          )}

          {/* Tuning Dial */}
          <div className="relative mb-3">
            <div className="w-full h-2 bg-amber-600 rounded-full">
              <motion.div
                className="h-full bg-green-400 rounded-full transition-all duration-500"
                style={{
                  width: `${((frequency - 88) / (108 - 88)) * 100}%`,
                  boxShadow: tuningAnimation ? '0 0 10px #10b981' : 'none'
                }}
                animate={{
                  boxShadow: tuningAnimation ? ['0 0 10px #10b981', '0 0 20px #10b981', '0 0 10px #10b981'] : 'none'
                }}
                transition={{ duration: 0.5, repeat: tuningAnimation ? Infinity : 0 }}
              />
            </div>
            {/* Frequency markers */}
            <div className="flex justify-between text-xs text-amber-700 mt-1">
              <span>88</span>
              <span>98</span>
              <span>108</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePowerToggle}
            className={`text-amber-100 hover:text-white rounded-full ${isPowered ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'}`}
          >
            <Power className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => switchStation('prev')}
              className="text-amber-100 hover:text-white"
              disabled={!isPowered}
            >
              <SkipBack className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="lg"
              onClick={handlePlayPause}
              className="text-amber-100 hover:text-white bg-amber-700 hover:bg-amber-600"
              disabled={!isPowered}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => switchStation('next')}
              className="text-amber-100 hover:text-white"
              disabled={!isPowered}
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          {/* Speaker Grilles with Visual Feedback */}
          <div className="flex gap-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-1 h-6 bg-amber-600 rounded-full"
                animate={isPlaying ? {
                  opacity: [0.5, 1, 0.5],
                  scaleY: [1, 1.2, 1]
                } : {}}
                transition={{
                  duration: 0.5,
                  repeat: isPlaying ? Infinity : 0,
                  delay: i * 0.1
                }}
              />
            ))}
          </div>
        </div>

        {/* Real Volume Control */}
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleMute}
            className="w-8 h-8 text-amber-100 hover:text-white"
            disabled={!isPowered}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>

          <div className="flex-1">
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume * 100}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-full h-2 bg-amber-600 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${volume * 100}%, #92400e ${volume * 100}%, #92400e 100%)`
              }}
              disabled={!isPowered}
            />
          </div>

          <span className="text-xs text-amber-100 w-8">{isMuted ? 0 : Math.round(volume * 100)}</span>
        </div>

        {/* Status Lights */}
        <div className="flex justify-center gap-4">
          <div className={`w-2 h-2 rounded-full ${isPowered ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
          <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-red-400 animate-pulse' : 'bg-gray-600'}`} />
          <div className={`w-2 h-2 rounded-full ${station.isLive && isPowered ? 'bg-yellow-400 animate-pulse' : 'bg-gray-600'}`} />
        </div>
      </motion.div>
    </motion.div>
  );
}