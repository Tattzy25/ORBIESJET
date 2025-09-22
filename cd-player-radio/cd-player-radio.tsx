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
  RotateCcw,
  X,
  Minimize2,
  Power
} from 'lucide-react';
import { useAIAudio, getStations, type AIStation } from './ai-audio-service';

export function CDPlayerRadio({ onClose }: { onClose: () => void }) {
  const [currentStationIndex, setCurrentStationIndex] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [cdRotation, setCdRotation] = useState(0);
  const [ledBlink, setLedBlink] = useState(false);
  const [isLidOpen, setIsLidOpen] = useState(true); // Start with lid open for channel selection
  const [isInitializing, setIsInitializing] = useState(true);
  const [showInstructions, setShowInstructions] = useState(true);
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

  // Initial animation sequence
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
      // Hide instructions after 4 seconds
      setTimeout(() => setShowInstructions(false), 4000);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // CD rotation animation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && !isLidOpen) {
      interval = setInterval(() => {
        setCdRotation(prev => (prev + 2) % 360);
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isLidOpen]);

  // LED blinking effect
  useEffect(() => {
    const interval = setInterval(() => {
      setLedBlink(prev => !prev);
    }, 800);
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

  const handlePlay = async () => {
    if (isLidOpen) {
      // Close lid and start playing
      setIsLidOpen(false);
      setTimeout(async () => {
        await audioService.playStation(station);
      }, 800);
    } else {
      // Toggle play/pause when lid is closed
      if (isPlaying) {
        await audioService.pause();
      } else {
        await audioService.playStation(station);
      }
    }
  };

  const handleStop = async () => {
    await audioService.stop();
    setIsLidOpen(true);
    setShowInstructions(true);
    setTimeout(() => setShowInstructions(false), 3000);
  };

  const handleVolumeChange = (newVolume: number) => {
    audioService.setVolume(newVolume / 100);
  };

  const handleMute = () => {
    audioService.setMuted(!isMuted);
  };

  const handleStationSelect = async (stationIndex: number) => {
    setCurrentStationIndex(stationIndex);
    if (isPlaying) {
      await audioService.playStation(stations[stationIndex]);
    }
  };

  // Color scheme based on station
  const getStationColor = (station: AIStation) => {
    const colors: Record<string, string> = {
      'neuro-wave': '#4facfe',
      'cyber-beats': '#43e97b',
      'void-tech': '#fa709a',
      'neural-jazz': '#ff8800',
      'quantum-rock': '#ff4444',
      'code-chill': '#44ff88'
    };
    return colors[station.id] || '#4facfe';
  };

  // Show loading state
  if (stationsLoading || !station) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 100 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <div className="w-96 h-96 rounded-full shadow-2xl border-8 border-gray-300 flex items-center justify-center bg-gray-200">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4" />
            <div className="text-gray-600 font-mono">Loading AI Stations...</div>
          </div>
        </div>
      </motion.div>
    );
  }

  const stationColor = getStationColor(station);

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <motion.div
          className="w-16 h-16 rounded-full shadow-2xl cursor-pointer border-4 border-gray-300 overflow-hidden relative"
          style={{
            background: 'radial-gradient(circle at 30% 30%, #ffffff, #e0e0e0, #c0c0c0)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 3px rgba(255,255,255,0.8)'
          }}
          onClick={() => setIsMinimized(false)}
          whileHover={{ scale: 1.1 }}
        >
          {/* Mini CD */}
          <div
            className="absolute inset-2 rounded-full"
            style={{
              background: `radial-gradient(circle, ${stationColor}, ${stationColor}90, transparent 70%)`,
              transform: `rotate(${cdRotation}deg)`
            }}
          >
            <div className="absolute inset-0 rounded-full border border-white/30" />
            <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-gray-800 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
          </div>

          {/* LED indicator */}
          <div
            className={`absolute top-1 right-1 w-2 h-2 rounded-full transition-opacity duration-200 ${
              isPlaying && ledBlink ? 'opacity-100' : 'opacity-30'
            }`}
            style={{ backgroundColor: '#00ff00', boxShadow: '0 0 6px #00ff00' }}
          />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, y: 100 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.8, opacity: 0, y: 100 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <motion.div
        className="w-96 h-96 rounded-full shadow-2xl border-8 border-gray-300 overflow-hidden relative"
        style={{
          background: 'radial-gradient(circle at 30% 30%, #ffffff, #e0e0e0, #c0c0c0)',
          boxShadow: '0 16px 64px rgba(0,0,0,0.4), inset 0 2px 8px rgba(255,255,255,0.8), inset 0 -2px 8px rgba(0,0,0,0.2)'
        }}
      >
        {/* Instructions Overlay */}
        <AnimatePresence>
          {showInstructions && isLidOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-50 bg-black/90 text-white p-3 rounded-lg shadow-xl border border-cyan-400"
              style={{ boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)' }}
            >
              <div className="text-center">
                <div className="text-sm font-mono text-cyan-400 mb-1">🎵 AI CD PLAYER OPENED</div>
                <div className="text-xs text-white">Choose a station & press PLAY to close lid</div>
              </div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent border-t-black/90" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chrome ring */}
        <div className="absolute inset-4 rounded-full border-4 border-gray-400"
             style={{
               background: 'conic-gradient(from 0deg, #f0f0f0, #d0d0d0, #f0f0f0, #d0d0d0)',
               boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)'
             }}>

          {/* CD Area with Lid Animation */}
          <div className="absolute inset-8 rounded-full bg-black/90 overflow-hidden">
            {/* Lid */}
            <motion.div
              className="absolute inset-0 rounded-full z-20"
              style={{
                background: 'radial-gradient(circle at 30% 30%, #ffffff, #e8e8e8, #d0d0d0)',
                boxShadow: 'inset 0 2px 8px rgba(255,255,255,0.9), 0 4px 16px rgba(0,0,0,0.3)'
              }}
              initial={{ rotateX: 0 }}
              animate={{
                rotateX: isLidOpen ? -120 : 0,
                originY: "top"
              }}
              transition={{
                duration: 0.8,
                ease: "easeInOut",
                delay: isInitializing ? 0.5 : 0
              }}
            >
              {/* Lid logo/text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-gray-600 text-xl font-bold tracking-widest transform rotate-0">
                  AI Y2K PLAYER
                </div>
              </div>

              {/* Lid hinges */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-2 bg-gray-400 rounded-b-full" />

              {/* Lid handle/indent */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gray-500 rounded-full" />
            </motion.div>

            {/* Channel Selection Interface (visible when lid is open) */}
            <AnimatePresence>
              {isLidOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: 0.8 }}
                  className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10"
                  style={{
                    background: 'radial-gradient(circle, #1a1a1a, #0a0a0a)',
                  }}
                >
                  <div className="text-center mb-4">
                    <div className="text-cyan-400 text-xs font-mono mb-2 animate-pulse">◉ SELECT AI STATION</div>
                    <div className="text-white text-base font-bold mb-1">{station.name}</div>
                    <div className="text-gray-400 text-xs">{station.frequency} MHz • {station.genre}</div>
                  </div>

                  {/* Station Grid */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {stations.slice(0, 6).map((st, index) => (
                      <button
                        key={st.id}
                        onClick={() => handleStationSelect(index)}
                        className={`w-12 h-12 rounded-lg border-2 transition-all duration-300 ${
                          index === currentStationIndex
                            ? 'border-cyan-400 bg-cyan-400/30 shadow-lg'
                            : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                        }`}
                        style={{
                          boxShadow: index === currentStationIndex
                            ? `0 0 15px ${getStationColor(st)}60, inset 0 0 8px ${getStationColor(st)}30`
                            : 'none'
                        }}
                      >
                        <div
                          className="w-6 h-6 rounded-full mx-auto mb-1"
                          style={{ backgroundColor: getStationColor(st) }}
                        />
                        <div className="text-xs text-white font-mono">{st.frequency}</div>
                      </button>
                    ))}
                  </div>

                  {/* Play Button */}
                  <Button
                    onClick={handlePlay}
                    className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-xl relative group"
                    style={{
                      boxShadow: '0 0 25px rgba(6, 182, 212, 0.6), inset 0 2px 8px rgba(255,255,255,0.2)'
                    }}
                  >
                    <Play className="w-6 h-6" />
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-cyan-300"
                      animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </Button>

                  <div className="text-xs text-gray-400 mt-2 font-mono animate-pulse">▶ PRESS TO CLOSE & PLAY</div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Playing CD (visible when lid is closed) */}
            <AnimatePresence>
              {!isLidOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `radial-gradient(circle, ${stationColor}, ${stationColor}90, transparent 70%),
                               conic-gradient(from 0deg, rgba(255,255,255,0.1), transparent 10%, rgba(255,255,255,0.1) 20%, transparent 30%)`,
                    transform: `rotate(${cdRotation}deg)`
                  }}
                >
                  {/* CD ridges */}
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute border border-white/20 rounded-full"
                      style={{
                        top: `${10 + i * 10}%`,
                        left: `${10 + i * 10}%`,
                        right: `${10 + i * 10}%`,
                        bottom: `${10 + i * 10}%`
                      }}
                    />
                  ))}

                  {/* Center hole */}
                  <div className="absolute top-1/2 left-1/2 w-6 h-6 bg-gray-800 rounded-full transform -translate-x-1/2 -translate-y-1/2 border-2 border-gray-600" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* External Controls (always visible) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="pointer-events-auto">
              {/* Top - Station Info */}
              <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 text-center">
                <div
                  className="px-3 py-1 rounded-full text-xs font-mono bg-black text-green-400 mb-1"
                  style={{
                    boxShadow: 'inset 0 0 8px rgba(0,255,0,0.3), 0 0 8px rgba(0,0,0,0.5)',
                    border: '1px solid #333'
                  }}
                >
                  {station.frequency} MHz
                </div>
                <div className="text-xs text-gray-600 font-bold tracking-wider">{station.name}</div>
              </div>

              {/* Side Controls - Only show when lid is closed */}
              {!isLidOpen && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => switchStation('prev')}
                    className="absolute -left-16 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 shadow-lg"
                    style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 3px rgba(255,255,255,0.8)' }}
                  >
                    <SkipBack className="w-5 h-5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => switchStation('next')}
                    className="absolute -right-16 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 shadow-lg"
                    style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 3px rgba(255,255,255,0.8)' }}
                  >
                    <SkipForward className="w-5 h-5" />
                  </Button>
                </>
              )}

              {/* Central Control Button - Only when lid is closed */}
              {!isLidOpen && (
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={handlePlay}
                  className="w-16 h-16 rounded-full text-gray-700 shadow-xl relative z-30"
                  style={{
                    background: 'radial-gradient(circle at 30% 30%, #ffffff, #e8e8e8, #d0d0d0)',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.4), inset 0 2px 6px rgba(255,255,255,0.9), inset 0 -2px 6px rgba(0,0,0,0.2)'
                  }}
                >
                  {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                </Button>
              )}

              {/* Stop/Open Button (when playing) */}
              {!isLidOpen && isPlaying && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleStop}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-8 w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg"
                  style={{ marginTop: '60px' }}
                >
                  <RotateCcw className="w-5 h-5" />
                </Button>
              )}

              {/* Bottom - Track Info (only when playing) */}
              {!isLidOpen && (
                <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 text-center w-80">
                  <div
                    className="px-4 py-2 rounded-lg bg-black text-cyan-400 mb-1 font-mono text-sm overflow-hidden"
                    style={{
                      boxShadow: 'inset 0 0 15px rgba(0,255,255,0.3), 0 0 15px rgba(0,0,0,0.5)',
                      border: '1px solid #333'
                    }}
                  >
                    <motion.div
                      initial={{ x: '100%' }}
                      animate={{ x: '-100%' }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      className="whitespace-nowrap"
                    >
                      ♪ {station.track} - {station.artist} ♪ Playing: {Math.floor(playTime / 60)}:{(playTime % 60).toString().padStart(2, '0')}
                    </motion.div>
                  </div>
                  <div className="text-xs text-gray-500 font-bold tracking-wide">{station.genre}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* LED Indicators */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 flex gap-2">
          <div
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              isPlaying ? 'bg-green-400' : 'bg-gray-400'
            }`}
            style={{
              boxShadow: isPlaying ? '0 0 8px #4ade80' : 'none',
              opacity: isPlaying && ledBlink ? 1 : 0.3
            }}
          />
          <div
            className="w-2 h-2 rounded-full bg-red-400"
            style={{
              boxShadow: '0 0 8px #f87171',
              opacity: 0.8
            }}
          />
          <div
            className="w-2 h-2 rounded-full bg-blue-400"
            style={{
              boxShadow: '0 0 8px #60a5fa',
              opacity: 0.6
            }}
          />
        </div>

        {/* Top Controls */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(true)}
            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 shadow-md"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.8)' }}
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 shadow-md"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.8)' }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Real Volume Control - Only when playing */}
        {!isLidOpen && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-3 px-4 py-2 rounded-full bg-black/80 backdrop-blur-sm">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMute}
              className="w-6 h-6 text-cyan-400 hover:bg-white/20"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>

            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume * 100}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #00ffff 0%, #00ffff ${volume * 100}%, #4a5568 ${volume * 100}%, #4a5568 100%)`
              }}
            />

            <span className="text-xs text-cyan-400 font-mono w-8">{isMuted ? 0 : Math.round(volume * 100)}</span>
          </div>
        )}

        {/* Station Indicators */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex gap-2">
          {stations.slice(0, 6).map((st, index) => (
            <button
              key={index}
              onClick={() => handleStationSelect(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentStationIndex ? 'opacity-100' : 'opacity-40'
              }`}
              style={{
                backgroundColor: getStationColor(st),
                boxShadow: index === currentStationIndex ? `0 0 6px ${getStationColor(st)}` : 'none'
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}