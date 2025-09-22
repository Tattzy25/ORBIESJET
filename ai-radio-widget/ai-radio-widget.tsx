import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
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
  X
} from 'lucide-react';
import { useAIAudio, getStations, type AIStation } from './ai-audio-service';

export function AIRadioWidget({ onClose }: { onClose: () => void }) {
  const [currentStationIndex, setCurrentStationIndex] = useState(0);
  const [visualizerBars, setVisualizerBars] = useState<number[]>(Array(20).fill(0));
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
        console.log('AI Radio loaded stations:', fetchedStations);
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
      if (spectrumData && spectrumData.length >= 20) {
        setVisualizerBars(spectrumData.slice(0, 20));
      } else {
        // Fallback animated bars when no real data
        if (isPlaying && !isMuted) {
          setVisualizerBars(bars => bars.map(() => Math.random() * 80 + 20));
        } else {
          setVisualizerBars(bars => bars.map(bar => Math.max(5, bar - 8)));
        }
      }
    }, 100);

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

  const handleStationSelect = async (stationIndex: number) => {
    if (stations.length === 0) return;
    
    setCurrentStationIndex(stationIndex);
    if (isPlaying) {
      await audioService.playStation(stations[stationIndex]);
    }
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
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-3xl p-8 max-w-md w-full mx-auto border border-gray-700 shadow-2xl">
          <div className="text-center text-white">Loading stations...</div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, y: 50 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.8, opacity: 0, y: 50 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Radio Widget */}
      <motion.div
        className="relative bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-3xl p-8 max-w-md w-full mx-auto border border-gray-700 shadow-2xl"
        style={{
          boxShadow: `0 0 50px ${stationColor}40, inset 0 0 50px rgba(255,255,255,0.05)`
        }}
      >
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
        >
          <X className="w-5 h-5" />
        </Button>

        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            animate={{ 
              boxShadow: `0 0 20px ${stationColor}`,
              borderColor: stationColor 
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-black/50 backdrop-blur-sm"
          >
            <Radio className="w-5 h-5" style={{ color: stationColor }} />
            <span className="text-white font-medium">AI RADIO PRO</span>
            <Wifi className={`w-4 h-4 ${isPlaying ? 'text-green-400' : 'text-gray-500'}`} />
          </motion.div>
        </div>

        {/* Station Display */}
        <div className="text-center mb-6">
          <motion.h2
            key={station.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold mb-2"
            style={{ color: stationColor }}
          >
            {station.name}
          </motion.h2>
          <div className="flex items-center justify-center gap-4 text-gray-300">
            <span className="font-mono text-lg">{station.frequency} MHz</span>
            <Badge variant="outline" className="border-gray-600 text-gray-300">
              {station.genre}
            </Badge>
          </div>
        </div>

        {/* Real-time Spectrum Visualizer */}
        <div className="flex items-end justify-center gap-1 h-16 mb-6 px-4">
          {visualizerBars.map((height, index) => (
            <motion.div
              key={index}
              className="w-2 rounded-full"
              style={{
                height: `${Math.max(8, height * 0.8)}%`,
                backgroundColor: stationColor,
                boxShadow: `0 0 10px ${stationColor}80`
              }}
              animate={{ height: `${Math.max(8, height * 0.8)}%` }}
              transition={{ duration: 0.1 }}
            />
          ))}
        </div>

        {/* Now Playing */}
        <motion.div
          key={station.track}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-center mb-8"
        >
          <div className="bg-black/30 rounded-2xl p-4 border border-gray-700">
            <div className="text-white font-semibold mb-1">{station.track}</div>
            <div className="text-gray-400">{station.artist}</div>
            
            {/* Live Progress Bar */}
            <div className="mt-3">
              <div className="w-full bg-gray-700 rounded-full h-1 overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${(playTime % 240) / 240 * 100}%`,
                    backgroundColor: stationColor,
                    boxShadow: `0 0 10px ${stationColor}60`
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{formatTime(playTime % 240)}</span>
                <span>4:00</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Functional Controls */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => switchStation('prev')}
            className="text-gray-400 hover:text-white"
          >
            <SkipBack className="w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="lg"
            onClick={handlePlayPause}
            className="relative"
            style={{
              backgroundColor: `${stationColor}20`,
              borderColor: stationColor,
              color: stationColor
            }}
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            <motion.div
              className="absolute inset-0 rounded-lg"
              animate={{
                boxShadow: isPlaying ? `0 0 20px ${stationColor}40` : 'none'
              }}
            />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => switchStation('next')}
            className="text-gray-400 hover:text-white"
          >
            <SkipForward className="w-5 h-5" />
          </Button>
        </div>

        {/* Real Volume Control */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleMute}
            className="text-gray-400 hover:text-white"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>
          
          <div className="flex-1">
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume * 100}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${stationColor} 0%, ${stationColor} ${volume * 100}%, #374151 ${volume * 100}%, #374151 100%)`
              }}
            />
          </div>
          
          <span className="text-sm text-gray-400 w-8">{isMuted ? 0 : Math.round(volume * 100)}</span>
        </div>

        {/* Live Signal Info */}
        <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Signal className="w-3 h-3" />
            <span>Signal: {isPlaying ? '98%' : '85%'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3" style={{ color: stationColor }} />
            <span>{station.isLive ? 'LIVE' : 'STREAM'}</span>
          </div>
        </div>

        {/* Interactive Station Selector */}
        <div className="flex justify-center gap-2 mt-6">
          {stations.map((_, index) => (
            <button
              key={index}
              onClick={() => handleStationSelect(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentStationIndex 
                  ? 'w-6 opacity-100' 
                  : 'opacity-40 hover:opacity-70'
              }`}
              style={{
                backgroundColor: index === currentStationIndex ? stationColor : '#666'
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}