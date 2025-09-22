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
  Radio as RadioIcon
} from 'lucide-react';
import { useAIAudio, getStations, type AIStation } from './ai-audio-service';

export function ChromeStereoRadio({ onClose }: { onClose: () => void }) {
  const [currentStationIndex, setCurrentStationIndex] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isPowerOn, setIsPowerOn] = useState(true);
  const [tunerKnob, setTunerKnob] = useState(0);
  const [volumeKnob, setVolumeKnob] = useState(0);
  const [eqBands, setEqBands] = useState([0.5, 0.7, 0.6, 0.8, 0.4, 0.6, 0.5]);
  const [spectrumData, setSpectrumData] = useState<number[]>(Array(20).fill(0));
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

  // Real-time spectrum analyzer
  useEffect(() => {
    const interval = setInterval(() => {
      const realSpectrumData = audioService.getSpectrumData();
      if (realSpectrumData && realSpectrumData.length >= 20) {
        setSpectrumData(realSpectrumData.slice(0, 20));
      } else {
        // Fallback animation
        if (isPlaying) {
          setSpectrumData(prev => prev.map(() => Math.random() * 100));
        } else {
          setSpectrumData(prev => prev.map(val => Math.max(0, val - 5)));
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, audioService]);

  const handleTunerChange = async (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    const degrees = (angle * 180 / Math.PI + 360) % 360;
    setTunerKnob(degrees);

    // Map angle to station
    const stationIndex = Math.floor((degrees / 360) * stations.length);
    const newIndex = Math.min(stationIndex, stations.length - 1);
    setCurrentStationIndex(newIndex);

    if (isPlaying) {
      await audioService.playStation(stations[newIndex]);
    }
  };

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    const degrees = (angle * 180 / Math.PI + 360) % 360;
    setVolumeKnob(degrees);

    // Map angle to volume (0-1)
    const newVolume = degrees / 360;
    audioService.setVolume(newVolume);
    if (newVolume > 0) audioService.setMuted(false);
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

  const handlePowerToggle = async () => {
    if (isPowerOn && isPlaying) {
      await audioService.stop();
    }
    setIsPowerOn(!isPowerOn);
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
        className="fixed top-6 right-1/3 z-50"
      >
        <div className="w-[500px] h-[200px] rounded-xl shadow-2xl border-4 border-gray-400 flex items-center justify-center bg-gray-200">
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
        className="fixed top-6 right-1/3 z-50"
      >
        <motion.div
          className="px-4 py-2 rounded-lg shadow-2xl cursor-pointer border-2 overflow-hidden relative"
          style={{
            background: 'linear-gradient(135deg, #c0c0c0, #e8e8e8, #d4d4d4)',
            borderColor: '#999',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 2px 8px rgba(255,255,255,0.8)'
          }}
          onClick={() => setIsMinimized(false)}
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isPowerOn ? 'bg-blue-400' : 'bg-gray-500'} animate-pulse`} />
            <div className="text-sm text-gray-800 font-mono">{station.name}</div>
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
        className="fixed top-6 right-1/3 z-50"
      >
        <motion.div
          className="w-[500px] h-[200px] rounded-xl shadow-2xl border-4 border-gray-400 overflow-hidden relative"
          style={{
            background: 'linear-gradient(135deg, #a0a0a0, #c8c8c8, #b4b4b4)',
            boxShadow: '0 16px 64px rgba(0,0,0,0.4), inset 0 4px 16px rgba(255,255,255,0.6), inset 0 -4px 16px rgba(0,0,0,0.3)'
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              onClick={() => setIsPowerOn(true)}
              className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-xl"
              style={{
                background: 'radial-gradient(circle at 30% 30%, #ff4444, #cc0000)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.4), inset 0 2px 6px rgba(255,255,255,0.3)'
              }}
            >
              <Power className="w-8 h-8" />
            </Button>
          </div>

          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMinimized(true)}
              className="w-8 h-8 text-gray-600 hover:bg-white/20"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="w-8 h-8 text-gray-600 hover:bg-white/20"
            >
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
      className="fixed top-6 right-1/3 z-50"
    >
      <motion.div
        className="w-[500px] h-[200px] rounded-xl shadow-2xl border-4 border-gray-400 overflow-hidden relative"
        style={{
          background: 'linear-gradient(135deg, #c0c0c0, #e8e8e8, #d4d4d4)',
          boxShadow: '0 16px 64px rgba(0,0,0,0.4), inset 0 4px 16px rgba(255,255,255,0.6), inset 0 -4px 16px rgba(0,0,0,0.3)'
        }}
      >
        {/* Chrome grille effect */}
        <div className="absolute inset-x-4 top-4 bottom-4 border-2 border-gray-500 rounded-lg overflow-hidden"
             style={{
               background: 'linear-gradient(90deg, #b8b8b8, #d8d8d8, #b8b8b8)',
               boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
             }}>

          {/* Top Controls Row */}
          <div className="flex items-center justify-between p-4">
            {/* Power Button */}
            <Button
              onClick={handlePowerToggle}
              className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md"
              style={{
                background: 'radial-gradient(circle at 30% 30%, #ff4444, #cc0000)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 3px rgba(255,255,255,0.3)'
              }}
            >
              <Power className="w-4 h-4" />
            </Button>

            {/* Digital Display */}
            <div
              className="flex-1 mx-4 p-2 rounded-md bg-black overflow-hidden relative"
              style={{
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.8)',
                background: 'linear-gradient(180deg, #000000, #111111)'
              }}
            >
              <div className="text-center">
                <div className="text-cyan-400 text-lg font-mono font-bold tracking-wider mb-1">
                  {station.frequency} MHz
                </div>
                <div className="text-blue-300 text-sm font-mono tracking-wide">
                  {station.name}
                </div>
                <div className="text-green-400 text-xs font-mono mt-1 overflow-hidden">
                  <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: '-100%' }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="whitespace-nowrap"
                  >
                    ♪ {station.track} - {station.artist} • {Math.floor(playTime / 60)}:{(playTime % 60).toString().padStart(2, '0')}
                  </motion.div>
                </div>
              </div>

              {/* LED indicators */}
              <div className="absolute top-1 right-2 flex gap-1">
                <div className={`w-1 h-1 rounded-full ${isPlaying ? 'bg-green-400' : 'bg-gray-600'}`} />
                <div className={`w-1 h-1 rounded-full ${isPowerOn ? 'bg-blue-400' : 'bg-gray-600'}`} />
              </div>
            </div>

            {/* Top Controls */}
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(true)}
                className="w-8 h-8 text-gray-600 hover:bg-white/20"
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="w-8 h-8 text-gray-600 hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Main Controls Row */}
          <div className="flex items-center justify-between px-4 pb-2">
            {/* Functional Tuner Knob */}
            <div className="flex flex-col items-center">
              <div className="text-xs text-gray-700 mb-1 font-mono">TUNER</div>
              <div
                className="w-12 h-12 rounded-full cursor-pointer relative"
                style={{
                  background: 'radial-gradient(circle at 30% 30%, #ffffff, #d0d0d0, #a0a0a0)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 2px 6px rgba(255,255,255,0.8), inset 0 -2px 6px rgba(0,0,0,0.2)'
                }}
                onClick={handleTunerChange}
              >
                <div
                  className="absolute w-1 h-4 bg-red-500 top-1 left-1/2 transform -translate-x-1/2 rounded-full"
                  style={{ transform: `translate(-50%, 0) rotate(${tunerKnob}deg)`, transformOrigin: '50% 20px' }}
                />
                <div className="absolute inset-2 rounded-full border border-gray-400" />
              </div>
            </div>

            {/* Real Spectrum Analyzer */}
            <div className="flex-1 mx-6">
              <div className="text-xs text-gray-700 mb-1 text-center font-mono">SPECTRUM</div>
              <div className="flex items-end justify-center gap-1 h-12 bg-black rounded p-1"
                   style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.8)' }}>
                {spectrumData.map((height, index) => (
                  <div
                    key={index}
                    className="w-1 bg-green-400 rounded-t transition-all duration-100"
                    style={{
                      height: `${Math.max(2, height * 0.4)}px`,
                      backgroundColor: height > 70 ? '#ef4444' : height > 40 ? '#f59e0b' : '#22c55e'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Real Volume Knob */}
            <div className="flex flex-col items-center">
              <div className="text-xs text-gray-700 mb-1 font-mono">VOLUME</div>
              <div
                className="w-12 h-12 rounded-full cursor-pointer relative"
                style={{
                  background: 'radial-gradient(circle at 30% 30%, #ffffff, #d0d0d0, #a0a0a0)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 2px 6px rgba(255,255,255,0.8), inset 0 -2px 6px rgba(0,0,0,0.2)'
                }}
                onClick={handleVolumeChange}
              >
                <div
                  className="absolute w-1 h-4 bg-blue-500 top-1 left-1/2 transform -translate-x-1/2 rounded-full"
                  style={{ transform: `translate(-50%, 0) rotate(${volume * 360}deg)`, transformOrigin: '50% 20px' }}
                />
                <div className="absolute inset-2 rounded-full border border-gray-400" />
              </div>
            </div>
          </div>

          {/* Functional Bottom Controls */}
          <div className="flex items-center justify-center gap-4 px-4 pb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => switchStation('prev')}
              className="w-10 h-10 rounded-full bg-gray-300 hover:bg-gray-400 text-gray-700 shadow-md"
              style={{
                background: 'radial-gradient(circle at 30% 30%, #f0f0f0, #d0d0d0)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 3px rgba(255,255,255,0.8)'
              }}
            >
              <SkipBack className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="lg"
              onClick={handlePlayPause}
              className="w-14 h-14 rounded-full text-gray-700 shadow-lg"
              style={{
                background: 'radial-gradient(circle at 30% 30%, #ffffff, #e0e0e0, #c0c0c0)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.4), inset 0 3px 8px rgba(255,255,255,0.9), inset 0 -3px 8px rgba(0,0,0,0.2)'
              }}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => switchStation('next')}
              className="w-10 h-10 rounded-full bg-gray-300 hover:bg-gray-400 text-gray-700 shadow-md"
              style={{
                background: 'radial-gradient(circle at 30% 30%, #f0f0f0, #d0d0d0)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 3px rgba(255,255,255,0.8)'
              }}
            >
              <SkipForward className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleMute}
              className="w-8 h-8 rounded-full bg-gray-300 hover:bg-gray-400 text-gray-700 shadow-md"
              style={{
                background: 'radial-gradient(circle at 30% 30%, #f0f0f0, #d0d0d0)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 3px rgba(255,255,255,0.8)'
              }}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
          </div>

          {/* Interactive EQ Sliders */}
          <div className="absolute bottom-2 left-4 right-4">
            <div className="flex justify-between items-end h-6">
              {eqBands.map((level, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className="w-2 bg-blue-400 rounded-t cursor-pointer transition-all duration-200"
                    style={{ height: `${level * 20}px` }}
                    onClick={() => {
                      const newBands = [...eqBands];
                      newBands[index] = Math.random();
                      setEqBands(newBands);
                    }}
                  />
                  <div className="w-2 h-px bg-gray-500 mt-1" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chrome borders and details */}
        <div className="absolute inset-0 rounded-xl pointer-events-none">
          <div className="absolute inset-1 rounded-lg border border-white/50" />
          <div className="absolute inset-2 rounded-lg border border-gray-300/30" />
        </div>
      </motion.div>
    </motion.div>
  );
}