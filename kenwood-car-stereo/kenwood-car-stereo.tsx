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
  Power,
  X,
  Minimize2,
  Bluetooth,
  Usb
} from 'lucide-react';
import { useAIAudio, getStations, type AIStation } from './ai-audio-service';

export function KenwoodCarStereo({ onClose }: { onClose: () => void }) {
  const [currentStation, setCurrentStation] = useState(0);
  const [volume, setVolume] = useState(18);
  const [displayMode, setDisplayMode] = useState<'freq' | 'time' | 'track'>('freq');
  const [currentTime, setCurrentTime] = useState('12:34');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isPowerOn, setIsPowerOn] = useState(true);
  const [stations, setStations] = useState<AIStation[]>([]);
  const [stationsLoading, setStationsLoading] = useState(true);

  const audioService = useAIAudio();
  const station = stations[currentStation];
  const isPlaying = audioService.getIsPlaying();
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

  // Update time
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Audio service listener
  useEffect(() => {
    const handleAudioUpdate = (data: any) => {
      // Force re-render when audio state changes
    };

    audioService.addListener(handleAudioUpdate);
    return () => audioService.removeListener(handleAudioUpdate);
  }, [audioService]);

  const handleVolumeKnob = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerY = rect.top + rect.height / 2;
    const deltaY = e.clientY - centerY;
    const newVolume = Math.max(0, Math.min(35, volume + (deltaY > 0 ? -1 : 1)));
    setVolume(newVolume);
    audioService.setVolume(newVolume / 35);
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      audioService.pause();
    } else {
      audioService.playStation(station);
    }
  };

  const handleStationChange = (newIndex: number) => {
    setCurrentStation(newIndex);
    if (isPlaying) {
      audioService.playStation(stations[newIndex]);
    }
  };

  const handleMute = () => {
    audioService.setMuted(!isMuted);
  };

  // Show loading state
  if (stationsLoading || !station) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <div className="w-[600px] h-[180px] rounded-lg shadow-2xl border-2 border-gray-800 bg-gray-200 flex items-center justify-center">
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
        className="fixed bottom-6 right-6 z-50"
      >
        <motion.div
          className="px-4 py-2 rounded-lg shadow-2xl cursor-pointer border overflow-hidden relative"
          style={{
            background: 'linear-gradient(135deg, #1a1a1a, #2a2a2a)',
            borderColor: '#333',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)'
          }}
          onClick={() => setIsMinimized(false)}
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex items-center gap-3">
            <div className="text-cyan-400 text-xs font-mono">KENWOOD</div>
            <div className="text-cyan-400 text-sm font-mono">{station.frequency}</div>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  if (!isPowerOn) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <motion.div
          className="w-[600px] h-[180px] rounded-lg shadow-2xl border-2 border-gray-800 overflow-hidden relative"
          style={{
            background: 'linear-gradient(135deg, #0a0a0a, #1a1a1a)',
            boxShadow: '0 20px 80px rgba(0,0,0,0.8)'
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              onClick={() => setIsPowerOn(true)}
              className="w-16 h-16 rounded-full text-white shadow-2xl"
              style={{
                background: 'radial-gradient(circle at 30% 30%, #333, #111)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.8)'
              }}
            >
              <Power className="w-8 h-8" />
            </Button>
          </div>

          <div className="absolute top-4 right-4 flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => setIsMinimized(true)} className="w-8 h-8 text-gray-400">
              <Minimize2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="w-8 h-8 text-gray-400">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, y: 50 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.8, opacity: 0, y: 50 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <motion.div
        className="w-[600px] h-[180px] rounded-lg shadow-2xl border-2 border-gray-800 overflow-hidden relative"
        style={{
          background: 'linear-gradient(135deg, #1a1a1a, #2a2a2a, #1a1a1a)',
          boxShadow: '0 20px 80px rgba(0,0,0,0.8), inset 0 2px 4px rgba(255,255,255,0.1)'
        }}
      >
        {/* Top Controls */}
        <div className="absolute top-2 right-2 flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => setIsMinimized(true)} className="w-6 h-6 text-gray-400 hover:text-white">
            <Minimize2 className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsPowerOn(false)} className="w-6 h-6 text-gray-400 hover:text-white">
            <Power className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} className="w-6 h-6 text-gray-400 hover:text-white">
            <X className="w-3 h-3" />
          </Button>
        </div>

        {/* Main Layout */}
        <div className="flex h-full p-4 gap-4">
          {/* Left Side - Large Volume Knob */}
          <div className="flex flex-col items-center justify-center">
            <div className="text-xs text-gray-400 mb-2 font-mono">VOL</div>
            <div
              className="w-20 h-20 rounded-full cursor-pointer relative shadow-xl border-4 border-gray-600"
              style={{
                background: 'conic-gradient(from 0deg, #333, #555, #333, #555)',
                boxShadow: '0 8px 20px rgba(0,0,0,0.6), inset 0 4px 8px rgba(255,255,255,0.1), inset 0 -4px 8px rgba(0,0,0,0.5)'
              }}
              onClick={handleVolumeKnob}
            >
              {/* Volume indicators */}
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className={`absolute w-1 h-3 rounded-full ${i < volume / 3 ? 'bg-cyan-400' : 'bg-gray-600'}`}
                  style={{
                    top: '6px',
                    left: '50%',
                    transformOrigin: '50% 34px',
                    transform: `translateX(-50%) rotate(${-150 + (i * 25)}deg)`,
                    boxShadow: i < volume / 3 ? '0 0 4px #22d3ee' : 'none'
                  }}
                />
              ))}

              {/* Center with volume display */}
              <div className="absolute inset-4 rounded-full bg-black border border-gray-500 flex items-center justify-center">
                <div className="text-cyan-400 text-xs font-mono">{volume}</div>
              </div>
            </div>
          </div>

          {/* Center - Digital Display */}
          <div className="flex-1 flex flex-col">
            {/* Brand */}
            <div className="text-center mb-2">
              <div className="text-gray-300 text-sm font-bold tracking-widest">NEUROWAVE</div>
            </div>

            {/* Main Display */}
            <div
              className="flex-1 bg-black rounded border-2 border-gray-700 p-3 relative overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, #000814, #001122)',
                boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.8)'
              }}
            >
              {/* Main Info Display */}
              <div className="text-center mb-2">
                <div className="flex items-center justify-center gap-4 mb-1">
                  <div className="text-cyan-400 text-2xl font-mono font-bold tracking-wider">
                    {displayMode === 'freq' ? station.frequency : displayMode === 'time' ? currentTime : 'TRACK 01'}
                  </div>
                  <div className="text-orange-400 text-lg font-mono font-bold">
                    AI
                  </div>
                </div>

                {/* Station name */}
                <div className="text-green-400 text-sm font-mono tracking-wide">
                  {station.name}
                </div>
              </div>

              {/* Mode indicators */}
              <div className="flex justify-between items-center text-xs">
                <div className="flex gap-3">
                  <span className="font-mono text-cyan-400">AI</span>
                  <span className="font-mono text-blue-400">BT</span>
                  <span className="font-mono text-green-400">NET</span>
                  <span className="font-mono text-yellow-400">LIVE</span>
                </div>

                <div className="flex gap-2">
                  <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-400' : 'bg-gray-600'}`} />
                  <div className={`w-2 h-2 rounded-full ${!isMuted ? 'bg-blue-400' : 'bg-gray-600'}`} />
                </div>
              </div>

              {/* Bottom status bar */}
              <div className="absolute bottom-1 left-2 right-2 flex justify-between text-xs text-gray-400">
                <span className="font-mono">ST</span>
                <span className="font-mono">AUTO</span>
                <span className="font-mono">SCAN</span>
              </div>
            </div>

            {/* Preset Buttons */}
            <div className="flex gap-1 mt-2">
              {[1,2,3,4,5,6].map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleStationChange(preset - 1)}
                  className={`flex-1 h-6 text-xs font-mono rounded border transition-all ${
                    currentStation === preset - 1
                      ? 'bg-cyan-900 text-cyan-400 border-cyan-600'
                      : 'bg-gray-800 text-gray-400 border-gray-600 hover:bg-gray-700'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Right Side - Controls */}
          <div className="flex flex-col justify-between w-24">
            {/* Transport Controls */}
            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleStationChange(currentStation === 0 ? stations.length - 1 : currentStation - 1)}
                className="w-8 h-8 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 shadow-md"
              >
                <SkipBack className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="lg"
                onClick={handlePlayPause}
                className="w-10 h-10 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 shadow-lg"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleStationChange((currentStation + 1) % stations.length)}
                className="w-8 h-8 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 shadow-md"
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>

            {/* Mode/Function Buttons */}
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setDisplayMode(prev => prev === 'freq' ? 'time' : prev === 'time' ? 'track' : 'freq')}
                className="h-6 text-xs font-mono bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-600"
              >
                DISP
              </button>
              <button
                onClick={handleMute}
                className="h-6 text-xs font-mono bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-600"
              >
                MUTE
              </button>
              <button className="h-6 text-xs font-mono bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-600">
                SRC
              </button>
            </div>
          </div>
        </div>

        {/* Brand accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 opacity-60" />
      </motion.div>
    </motion.div>
  );
}