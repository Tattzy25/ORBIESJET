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
  Smartphone,
  Disc
} from 'lucide-react';
import { useAIAudio, getStations, type AIStation } from './ai-audio-service';

export function PioneerModernStereo({ onClose }: { onClose: () => void }) {
  const [currentStationIndex, setCurrentStationIndex] = useState(0);
  const [bass, setBass] = useState(0);
  const [treble, setTreble] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isPowerOn, setIsPowerOn] = useState(true);
  const [currentTime, setCurrentTime] = useState('12:34');
  const [playTime, setPlayTime] = useState(0);
  const [stations, setStations] = useState<AIStation[]>([]);
  const [stationsLoading, setStationsLoading] = useState(true);

  const audioService = useAIAudio();
  const station = stations[currentStationIndex];
  const isPlaying = audioService.getIsPlaying() && isPowerOn;
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

  const handleKnobRotate = (type: 'volume' | 'bass' | 'treble', e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerY = rect.top + rect.height / 2;
    const deltaY = e.clientY - centerY;
    const change = deltaY > 0 ? -1 : 1;

    if (type === 'volume') {
      const newVolume = Math.max(0, Math.min(1, volume + (change * 0.05)));
      audioService.setVolume(newVolume);
      if (newVolume > 0) audioService.setMuted(false);
    } else if (type === 'bass') {
      setBass(prev => Math.max(-10, Math.min(10, prev + change)));
    } else if (type === 'treble') {
      setTreble(prev => Math.max(-10, Math.min(10, prev + change)));
    }
  };

  const switchStation = async (direction: 'next' | 'prev') => {
    const newIndex = direction === 'next'
      ? (currentStationIndex + 1) % stations.length
      : currentStationIndex === 0 ? stations.length - 1 : currentStationIndex - 1;

    setCurrentStationIndex(newIndex);

    if (isPlaying) {
      await audioService.playStation(stations[newIndex]);
    }
  };

  const handlePlayPause = async () => {
    if (!isPowerOn) return;

    if (isPlaying) {
      await audioService.pause();
    } else {
      await audioService.playStation(station);
    }
  };

  const handleStationChange = async (index: number) => {
    const newIndex = index % stations.length;
    setCurrentStationIndex(newIndex);
    if (isPlaying) {
      await audioService.playStation(stations[newIndex]);
    }
  };

  const handleMute = () => {
    audioService.setMuted(!isMuted);
  };

  const handlePowerToggle = async () => {
    if (isPowerOn && isPlaying) {
      await audioService.stop();
    }
    setIsPowerOn(!isPowerOn);
  };

  // Show loading state
  if (stationsLoading || !station) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="fixed top-6 left-6 z-50"
      >
        <div className="w-[650px] h-[200px] rounded-xl shadow-2xl border-2 border-blue-600 bg-gray-200 flex items-center justify-center">
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
        className="fixed top-6 left-6 z-50"
      >
        <motion.div
          className="px-4 py-2 rounded-lg shadow-2xl cursor-pointer border overflow-hidden relative"
          style={{
            background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
            borderColor: '#2563eb',
            boxShadow: '0 8px 32px rgba(37, 99, 235, 0.3)'
          }}
          onClick={() => setIsMinimized(false)}
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex items-center gap-3">
            <div className="text-blue-400 text-xs font-mono">PIONEER AI</div>
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
        className="fixed top-6 left-6 z-50"
      >
        <motion.div
          className="w-[650px] h-[200px] rounded-xl shadow-2xl border-2 overflow-hidden relative"
          style={{
            background: 'linear-gradient(135deg, #0f0f23, #1a1a2e)',
            borderColor: '#1e40af',
            boxShadow: '0 25px 100px rgba(0,0,0,0.8)'
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              onClick={() => setIsPowerOn(true)}
              className="w-20 h-20 rounded-full text-white shadow-2xl"
              style={{
                background: 'radial-gradient(circle at 30% 30%, #2563eb, #1e40af)',
                boxShadow: '0 10px 30px rgba(37, 99, 235, 0.4)'
              }}
            >
              <Power className="w-10 h-10" />
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
      className="fixed top-6 left-6 z-50"
    >
      <motion.div
        className="w-[650px] h-[200px] rounded-xl shadow-2xl border-2 overflow-hidden relative"
        style={{
          background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
          borderColor: '#2563eb',
          boxShadow: '0 25px 100px rgba(0,0,0,0.8), 0 0 50px rgba(37, 99, 235, 0.2)'
        }}
      >
        {/* Top Controls */}
        <div className="absolute top-3 right-3 flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => setIsMinimized(true)} className="w-6 h-6 text-gray-300 hover:text-white">
            <Minimize2 className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handlePowerToggle} className="w-6 h-6 text-gray-300 hover:text-white">
            <Power className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} className="w-6 h-6 text-gray-300 hover:text-white">
            <X className="w-3 h-3" />
          </Button>
        </div>

        {/* Brand Logo */}
        <div className="absolute top-4 left-6">
          <div className="text-blue-400 text-lg font-bold tracking-wider">Pioneer AI</div>
          <div className="text-xs text-gray-400 font-mono">AI-X8700BS</div>
        </div>

        {/* Main Layout */}
        <div className="flex h-full pt-16 pb-4 px-6 gap-6">
          {/* Left - Display Section */}
          <div className="flex-1">
            {/* Main Display */}
            <div
              className="h-20 bg-black rounded-lg border-2 border-blue-900 p-3 mb-3 relative overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, #000428, #004e92)',
                boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.8), 0 0 20px rgba(59, 130, 246, 0.3)'
              }}
            >
              {/* Display Content */}
              <div className="flex justify-between items-start h-full">
                <div>
                  <div className="text-cyan-300 text-xl font-mono font-bold">
                    {station.frequency}
                  </div>
                  <div className="text-blue-300 text-sm font-mono">
                    {station.name}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-orange-400 text-lg font-mono font-bold">
                    AI
                  </div>
                  <div className="text-gray-300 text-xs font-mono">
                    {Math.floor(playTime / 60)}:{(playTime % 60).toString().padStart(2, '0')}
                  </div>
                </div>
              </div>

              {/* Mode indicators */}
              <div className="absolute bottom-1 left-3 flex gap-3 text-xs">
                <span className="font-mono text-cyan-400">AI</span>
                <span className="font-mono text-blue-400">NET</span>
                <span className={`font-mono ${station.isLive ? 'text-green-400' : 'text-gray-600'}`}>LIVE</span>
                <span className={`font-mono ${isPlaying ? 'text-green-400' : 'text-gray-600'}`}>♪</span>
              </div>
            </div>

            {/* Functional Transport Controls */}
            <div className="flex justify-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => switchStation('prev')}
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 text-blue-300 shadow-lg border border-blue-900"
              >
                <SkipBack className="w-5 h-5" />
              </Button>

              <Button
                variant="ghost"
                size="lg"
                onClick={handlePlayPause}
                className="w-14 h-14 rounded-full bg-blue-900 hover:bg-blue-800 text-cyan-300 shadow-xl border-2 border-blue-700"
                style={{ boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)' }}
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => switchStation('next')}
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 text-blue-300 shadow-lg border border-blue-900"
              >
                <SkipForward className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Right - Three Functional Control Knobs */}
          <div className="flex gap-4 items-center">
            {/* Real Volume Knob */}
            <div className="flex flex-col items-center">
              <div className="text-xs text-gray-300 mb-2 font-mono">VOLUME</div>
              <div
                className="w-20 h-20 rounded-full cursor-pointer relative shadow-xl border-4 border-blue-900"
                style={{
                  background: 'conic-gradient(from 0deg, #1e40af, #3b82f6, #1e40af, #3b82f6)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.6), inset 0 4px 12px rgba(59, 130, 246, 0.2), inset 0 -4px 12px rgba(0,0,0,0.5)'
                }}
                onClick={(e) => handleKnobRotate('volume', e)}
              >
                {/* Volume level ring */}
                <div
                  className="absolute inset-2 rounded-full border-4 border-cyan-400"
                  style={{
                    background: `conic-gradient(from -90deg, #22d3ee 0%, #22d3ee ${volume * 100}%, transparent ${volume * 100}%, transparent 100%)`,
                    opacity: 0.7
                  }}
                />

                {/* Center display */}
                <div className="absolute inset-6 rounded-full bg-black border border-blue-800 flex items-center justify-center">
                  <div className="text-cyan-400 text-sm font-mono font-bold">{Math.round(volume * 35)}</div>
                </div>
              </div>
            </div>

            {/* Bass Knob */}
            <div className="flex flex-col items-center">
              <div className="text-xs text-gray-300 mb-2 font-mono">BASS</div>
              <div
                className="w-16 h-16 rounded-full cursor-pointer relative shadow-lg border-4 border-blue-900"
                style={{
                  background: 'conic-gradient(from 0deg, #1e40af, #3b82f6, #1e40af, #3b82f6)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.5), inset 0 3px 8px rgba(59, 130, 246, 0.2)'
                }}
                onClick={(e) => handleKnobRotate('bass', e)}
              >
                {/* Pointer */}
                <div
                  className="absolute w-1 h-6 bg-orange-400 top-1 left-1/2 transform -translate-x-1/2 rounded-full"
                  style={{
                    transform: `translate(-50%, 0) rotate(${(bass + 10) * 9}deg)`,
                    transformOrigin: '50% 26px',
                    boxShadow: '0 0 6px #fb923c'
                  }}
                />

                <div className="absolute inset-4 rounded-full bg-black border border-blue-800 flex items-center justify-center">
                  <div className="text-orange-400 text-xs font-mono">{bass > 0 ? `+${bass}` : bass}</div>
                </div>
              </div>
            </div>

            {/* Treble Knob */}
            <div className="flex flex-col items-center">
              <div className="text-xs text-gray-300 mb-2 font-mono">TREBLE</div>
              <div
                className="w-16 h-16 rounded-full cursor-pointer relative shadow-lg border-4 border-blue-900"
                style={{
                  background: 'conic-gradient(from 0deg, #1e40af, #3b82f6, #1e40af, #3b82f6)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.5), inset 0 3px 8px rgba(59, 130, 246, 0.2)'
                }}
                onClick={(e) => handleKnobRotate('treble', e)}
              >
                {/* Pointer */}
                <div
                  className="absolute w-1 h-6 bg-green-400 top-1 left-1/2 transform -translate-x-1/2 rounded-full"
                  style={{
                    transform: `translate(-50%, 0) rotate(${(treble + 10) * 9}deg)`,
                    transformOrigin: '50% 26px',
                    boxShadow: '0 0 6px #4ade80'
                  }}
                />

                <div className="absolute inset-4 rounded-full bg-black border border-blue-800 flex items-center justify-center">
                  <div className="text-green-400 text-xs font-mono">{treble > 0 ? `+${treble}` : treble}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Function Buttons */}
        <div className="absolute bottom-3 left-6 right-6 flex justify-between">
          <div className="flex gap-2">
            {[1,2,3,4,5,6].map((num) => (
              <button
                key={num}
                onClick={() => handleStationChange((num - 1) % stations.length)}
                className={`w-8 h-6 text-xs font-mono rounded border transition-all ${
                  currentStationIndex === (num - 1) % stations.length
                    ? 'bg-blue-900 text-cyan-400 border-blue-600'
                    : 'bg-gray-800 text-gray-400 border-gray-600 hover:bg-gray-700'
                }`}
              >
                {num}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleMute}
              className="px-3 h-6 text-xs font-mono bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-600"
            >
              {isMuted ? 'UNMUTE' : 'MUTE'}
            </button>
            <button className="px-3 h-6 text-xs font-mono bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-600">
              SRC
            </button>
          </div>
        </div>

        {/* Pioneer accent lighting */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60" />
      </motion.div>
    </motion.div>
  );
}