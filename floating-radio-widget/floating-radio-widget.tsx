import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Radio,
  Zap,
  Wifi,
  Signal,
  X,
  Minimize2
} from 'lucide-react';
import { useAIAudio, getStations, type AIStation } from './ai-audio-service';

export function FloatingRadioWidget({ onClose }: { onClose: () => void }) {
  const [currentStationIndex, setCurrentStationIndex] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [visualizerBars, setVisualizerBars] = useState<number[]>(Array(12).fill(0));
  const [playTime, setPlayTime] = useState(0);
  const [stations, setStations] = useState<AIStation[]>([]);
  const [loading, setLoading] = useState(true);

  const audioService = useAIAudio();
  const isPlaying = audioService.getIsPlaying();
  const volume = audioService.getVolume();
  const isMuted = audioService.getIsMuted();

  // Load stations from API
  useEffect(() => {
    const loadStations = async () => {
      try {
        setLoading(true);
        const fetchedStations = await getStations();
        setStations(fetchedStations);
        console.log('Floating Radio loaded stations:', fetchedStations);
      } catch (error) {
        console.error('Failed to load stations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStations();
  }, []);

  const station = stations[currentStationIndex];

  // Audio service listener for real-time updates
  useEffect(() => {
    const handleAudioUpdate = (data: any) => {
      // Force component re-render when audio state changes
    };

    audioService.addListener(handleAudioUpdate);
    return () => audioService.removeListener(handleAudioUpdate);
  }, [audioService]);

  // Real-time spectrum visualizer
  useEffect(() => {
    const interval = setInterval(() => {
      const spectrumData = audioService.getSpectrumData();
      if (spectrumData && spectrumData.length >= 12) {
        setVisualizerBars(spectrumData.slice(0, 12));
      } else {
        // Fallback animated bars when no real data
        if (isPlaying && !isMuted) {
          setVisualizerBars(bars => bars.map(() => Math.random() * 80 + 20));
        } else {
          setVisualizerBars(bars => bars.map(bar => Math.max(5, bar - 8)));
        }
      }
    }, 200);

    return () => clearInterval(interval);
  }, [isPlaying, isMuted, audioService]);

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

  const switchStation = async (direction: 'next' | 'prev') => {
    if (stations.length === 0) return;

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
    if (stations.length === 0) return;

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Color scheme based on station
  const getStationColor = (station?: AIStation) => {
    if (!station) return '#00ff88';
    const colors: Record<string, string> = {
      'neuro-wave': '#ff0080',
      'cyber-beats': '#00ff88',
      'void-tech': '#8800ff',
      'neural-jazz': '#ff8800',
      'quantum-rock': '#ff4444',
      'code-chill': '#44ff88'
    };
    return colors[station.id] || '#00ff88';
  };

  const stationColor = getStationColor(station);

  // Don't render until stations are loaded
  if (loading || !station) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0, x: 100 }}
        animate={{ scale: 1, opacity: 1, x: 0 }}
        exit={{ scale: 0.8, opacity: 0, x: 100 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <div className="bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-3xl p-6 w-80 border border-gray-700 shadow-2xl">
          <div className="text-center text-white">Loading stations...</div>
        </div>
      </motion.div>
    );
  }

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <motion.div
          className="bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-2xl p-4 border border-gray-700 shadow-2xl cursor-pointer"
          style={{
            boxShadow: `0 0 30px ${stationColor}30, inset 0 0 30px rgba(255,255,255,0.05)`
          }}
          onClick={() => setIsMinimized(false)}
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {visualizerBars.slice(0, 6).map((height, index) => (
                <motion.div
                  key={index}
                  className="w-1 rounded-full"
                  style={{
                    height: `${Math.max(4, height / 4)}px`,
                    backgroundColor: stationColor,
                    boxShadow: `0 0 5px ${stationColor}80`
                  }}
                  animate={{ height: `${Math.max(4, height / 4)}px` }}
                  transition={{ duration: 0.1 }}
                />
              ))}
            </div>
            <div className="text-white text-sm font-medium">{station.name}</div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handlePlayPause();
              }}
              className="w-8 h-8 text-white hover:text-white/80"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, x: 100 }}
      animate={{ scale: 1, opacity: 1, x: 0 }}
      exit={{ scale: 0.8, opacity: 0, x: 100 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <motion.div
        className="bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-3xl p-6 w-80 border border-gray-700 shadow-2xl"
        style={{
          boxShadow: `0 0 40px ${stationColor}40, inset 0 0 40px rgba(255,255,255,0.05)`
        }}
      >
        {/* Header Controls */}
        <div className="flex items-center justify-between mb-4">
          <motion.div
            animate={{
              boxShadow: `0 0 15px ${stationColor}`,
              borderColor: stationColor
            }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-black/50 backdrop-blur-sm"
          >
            <Radio className="w-4 h-4" style={{ color: stationColor }} />
            <span className="text-white text-sm font-medium">AI FLOATING</span>
            <Wifi className={`w-3 h-3 ${isPlaying ? 'text-green-400' : 'text-gray-500'}`} />
          </motion.div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMinimized(true)}
              className="w-8 h-8 text-gray-400 hover:text-white"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="w-8 h-8 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Station Display */}
        <div className="text-center mb-4">
          <motion.h3
            key={station.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-bold mb-1"
            style={{ color: stationColor }}
          >
            {station.name}
          </motion.h3>
          <div className="flex items-center justify-center gap-3 text-gray-300 text-sm">
            <span className="font-mono">{station.frequency} MHz</span>
            <Badge variant="outline" className="border-gray-600 text-gray-300 text-xs">
              {station.genre}
            </Badge>
          </div>
        </div>

        {/* Real-time Spectrum Visualizer */}
        <div className="flex items-end justify-center gap-1 h-12 mb-4">
          {visualizerBars.map((height, index) => (
            <motion.div
              key={index}
              className="w-2 rounded-full"
              style={{
                height: `${Math.max(4, height)}%`,
                backgroundColor: stationColor,
                boxShadow: `0 0 8px ${stationColor}80`
              }}
              animate={{ height: `${Math.max(4, height)}%` }}
              transition={{ duration: 0.1 }}
            />
          ))}
        </div>

        {/* Now Playing with Live Progress */}
        <motion.div
          key={station.track}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mb-4"
        >
          <div className="bg-black/30 rounded-xl p-3 border border-gray-700">
            <div className="text-white font-medium text-sm mb-1">{station.track}</div>
            <div className="text-gray-400 text-xs">{station.artist}</div>

            {/* Live Progress Bar */}
            <div className="mt-2">
              <div className="w-full bg-gray-700 rounded-full h-1 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${(playTime % 180) / 180 * 100}%`,
                    backgroundColor: stationColor,
                    boxShadow: `0 0 8px ${stationColor}60`
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{formatTime(playTime % 180)}</span>
                <span>3:00</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Functional Controls */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => switchStation('prev')}
            className="w-8 h-8 text-gray-400 hover:text-white"
          >
            <SkipBack className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="lg"
            onClick={handlePlayPause}
            className="relative w-12 h-12"
            style={{
              backgroundColor: `${stationColor}20`,
              borderColor: stationColor,
              color: stationColor
            }}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            <motion.div
              className="absolute inset-0 rounded-lg"
              animate={{
                boxShadow: isPlaying ? `0 0 15px ${stationColor}40` : 'none'
              }}
            />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => switchStation('next')}
            className="w-8 h-8 text-gray-400 hover:text-white"
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>

        {/* Real Volume Control */}
        <div className="flex items-center gap-3 mb-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleMute}
            className="w-8 h-8 text-gray-400 hover:text-white"
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
              className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${stationColor} 0%, ${stationColor} ${volume * 100}%, #374151 ${volume * 100}%, #374151 100%)`
              }}
            />
          </div>

          <span className="text-xs text-gray-400 w-8">{isMuted ? 0 : Math.round(volume * 100)}</span>
        </div>

        {/* Live Signal Info */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Signal className="w-3 h-3" />
            <span>{isPlaying ? '95%' : '87%'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3" style={{ color: stationColor }} />
            <span>{station.isLive ? 'LIVE' : 'STREAM'}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}