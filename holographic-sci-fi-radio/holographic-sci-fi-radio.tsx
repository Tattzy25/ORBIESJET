import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Pause, SkipBack, SkipForward, Volume2, Zap, Radio, Cpu } from 'lucide-react';
import { Button } from './ui/button';
import { aiAudioService, getStations, AIStation } from './ai-audio-service';

interface HolographicSciFiRadioProps {
  onClose: () => void;
}

export function HolographicSciFiRadio({ onClose }: HolographicSciFiRadioProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStation, setCurrentStation] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [scanningMode, setScanningMode] = useState(false);
  const [powerLevel, setPowerLevel] = useState(100);
  const [hologramIntensity, setHologramIntensity] = useState(0.8);
  const [stations, setStations] = useState<AIStation[]>([]);
  const [loading, setLoading] = useState(true);
  const spectrumRef = useRef<number[]>(new Array(32).fill(0));

  // Load stations from API
  useEffect(() => {
    const loadStations = async () => {
      try {
        setLoading(true);
        const fetchedStations = await getStations();
        setStations(fetchedStations);
        console.log('Holographic radio loaded stations:', fetchedStations);
      } catch (error) {
        console.error('Failed to load stations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStations();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying) {
        setCurrentTime(prev => prev + 1);
        // Simulate power consumption
        setPowerLevel(prev => Math.max(10, prev - 0.1));

        // Generate fake spectrum data
        spectrumRef.current = spectrumRef.current.map(() => Math.random() * 100);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const handlePlay = async () => {
    if (stations.length === 0) return;

    if (!isPlaying) {
      await aiAudioService.playStation(stations[currentStation]);
      setIsPlaying(true);
    } else {
      aiAudioService.pause();
      setIsPlaying(false);
    }
  };

  const handleStationChange = async (direction: 'next' | 'prev') => {
    if (stations.length === 0) return;

    setScanningMode(true);
    setTimeout(() => setScanningMode(false), 1000);

    const newStation = direction === 'next'
      ? (currentStation + 1) % stations.length
      : (currentStation - 1 + stations.length) % stations.length;

    setCurrentStation(newStation);
    if (isPlaying) {
      await aiAudioService.playStation(stations[newStation]);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    aiAudioService.setVolume(newVolume);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentStationData = stations[currentStation];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 50 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ rotateX: -20, z: -100 }}
        animate={{ rotateX: 0, z: 0 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="relative w-[480px] h-[360px] max-w-[90vw] max-h-[80vh]"
        style={{
          perspective: '1000px',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Close Button */}
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="absolute -top-12 right-0 text-cyan-400 hover:bg-cyan-400/20 z-20 border border-cyan-400/30"
        >
          <X className="w-6 h-6" />
        </Button>

        {/* Main Holographic Panel */}
        <motion.div
          animate={{
            rotateY: [0, 1, 0],
            boxShadow: [
              '0 0 30px rgba(0, 255, 255, 0.3)',
              '0 0 50px rgba(0, 255, 255, 0.5)',
              '0 0 30px rgba(0, 255, 255, 0.3)'
            ]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative w-full h-full bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10 rounded-3xl border border-cyan-400/30 backdrop-blur-md"
          style={{
            background: `
              linear-gradient(135deg,
                rgba(0, 255, 255, 0.1) 0%,
                rgba(0, 0, 0, 0.3) 30%,
                rgba(147, 51, 234, 0.1) 70%,
                rgba(0, 255, 255, 0.1) 100%
              ),
              radial-gradient(circle at 20% 20%, rgba(0, 255, 255, 0.2) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(147, 51, 234, 0.2) 0%, transparent 50%)
            `,
            boxShadow: `
              0 0 30px rgba(0, 255, 255, ${hologramIntensity * 0.5}),
              inset 0 0 30px rgba(0, 255, 255, 0.1),
              0 8px 32px rgba(0, 0, 0, 0.3)
            `
          }}
        >
          {/* Holographic Grid Overlay */}
          <div
            className="absolute inset-0 opacity-20 rounded-3xl"
            style={{
              backgroundImage: `
                linear-gradient(cyan 1px, transparent 1px),
                linear-gradient(90deg, cyan 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px',
              animation: 'hologram-grid 3s linear infinite'
            }}
          />

          {/* Main Display Area */}
          <div className="p-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex items-center gap-2"
              >
                <Cpu className="w-6 h-6 text-cyan-400" />
                <span className="text-cyan-400 font-mono text-sm tracking-wider">
                  NEURO-WAVE 3000
                </span>
              </motion.div>

              <div className="flex items-center gap-2">
                <div className="text-cyan-400 font-mono text-xs">
                  PWR: {Math.round(powerLevel)}%
                </div>
                <div
                  className="w-16 h-2 bg-black/50 rounded-full border border-cyan-400/30"
                >
                  <div
                    className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full transition-all duration-300"
                    style={{ width: `${powerLevel}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex gap-6">
              {/* Left Panel - Station Info */}
              <div className="flex-1 space-y-4">
                <div className="bg-black/30 rounded-2xl border border-cyan-400/20 p-4 backdrop-blur-sm">
                  <div className="text-cyan-400 font-mono text-xs mb-2 tracking-wider">
                    CURRENT FREQUENCY
                  </div>
                  <motion.div
                    key={currentStation}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-white text-lg mb-1"
                  >
                    {currentStationData?.name || 'NO SIGNAL'}
                  </motion.div>
                  <div className="text-cyan-400/70 text-sm font-mono">
                    {currentStationData?.frequency || '----.-- MHz'}
                  </div>

                  {scanningMode && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1 }}
                      className="h-0.5 bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 mt-2 rounded"
                    />
                  )}
                </div>

                {/* Spectrum Analyzer */}
                <div className="bg-black/30 rounded-2xl border border-cyan-400/20 p-4 backdrop-blur-sm">
                  <div className="text-cyan-400 font-mono text-xs mb-2 tracking-wider">
                    SPECTRUM ANALYSIS
                  </div>
                  <div className="flex items-end gap-1 h-16">
                    {spectrumRef.current.map((value, index) => (
                      <motion.div
                        key={index}
                        animate={{
                          height: isPlaying ? `${value}%` : '2%',
                          backgroundColor: isPlaying
                            ? `rgb(${Math.floor(value * 2.55)}, ${255 - Math.floor(value * 2.55)}, 255)`
                            : 'rgba(0, 255, 255, 0.3)'
                        }}
                        transition={{ duration: 0.1 }}
                        className="w-2 bg-cyan-400 rounded-t"
                        style={{ minHeight: '2px' }}
                      />
                    ))}
                  </div>
                </div>

                {/* Time Display */}
                <div className="bg-black/30 rounded-2xl border border-cyan-400/20 p-4 backdrop-blur-sm">
                  <div className="text-cyan-400 font-mono text-xs mb-2 tracking-wider">
                    PLAYBACK TIME
                  </div>
                  <div className="text-white text-2xl font-mono">
                    {formatTime(currentTime)}
                  </div>
                </div>
              </div>

              {/* Right Panel - Controls */}
              <div className="w-48 space-y-4">
                {/* Playback Controls */}
                <div className="bg-black/30 rounded-2xl border border-cyan-400/20 p-4 backdrop-blur-sm">
                  <div className="text-cyan-400 font-mono text-xs mb-3 tracking-wider">
                    PLAYBACK
                  </div>
                  <div className="flex justify-center gap-2 mb-4">
                    <motion.button
                      whileHover={{ scale: 1.1, glow: 1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleStationChange('prev')}
                      className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full border border-cyan-400/30 flex items-center justify-center hover:border-cyan-400 transition-all"
                    >
                      <SkipBack className="w-4 h-4 text-cyan-400" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handlePlay}
                      className="w-12 h-12 bg-gradient-to-br from-cyan-500/30 to-purple-500/30 rounded-full border border-cyan-400/50 flex items-center justify-center hover:border-cyan-400 transition-all relative"
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 text-cyan-400" />
                      ) : (
                        <Play className="w-5 h-5 text-cyan-400 ml-0.5" />
                      )}
                      {isPlaying && (
                        <motion.div
                          animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="absolute inset-0 border border-cyan-400 rounded-full"
                        />
                      )}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleStationChange('next')}
                      className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full border border-cyan-400/30 flex items-center justify-center hover:border-cyan-400 transition-all"
                    >
                      <SkipForward className="w-4 h-4 text-cyan-400" />
                    </motion.button>
                  </div>
                </div>

                {/* Volume Control */}
                <div className="bg-black/30 rounded-2xl border border-cyan-400/20 p-4 backdrop-blur-sm">
                  <div className="text-cyan-400 font-mono text-xs mb-3 tracking-wider">
                    VOLUME
                  </div>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      className="w-full h-2 bg-black/50 rounded-lg appearance-none cursor-pointer volume-slider"
                      style={{
                        background: `linear-gradient(to right,
                          cyan 0%,
                          cyan ${volume * 100}%,
                          rgba(0,0,0,0.5) ${volume * 100}%,
                          rgba(0,0,0,0.5) 100%)`
                      }}
                    />
                    <div className="text-cyan-400 font-mono text-sm text-center">
                      {Math.round(volume * 100)}%
                    </div>
                  </div>
                </div>

                {/* Signal Strength */}
                <div className="bg-black/30 rounded-2xl border border-cyan-400/20 p-4 backdrop-blur-sm">
                  <div className="text-cyan-400 font-mono text-xs mb-3 tracking-wider">
                    SIGNAL
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          opacity: i < (isPlaying ? 5 : 2) ? 1 : 0.3,
                          height: `${(i + 1) * 20}%`
                        }}
                        className="w-2 bg-cyan-400 rounded-t"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Holographic Particles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                x: [0, Math.random() * 400, 0],
                y: [0, Math.random() * 300, 0],
                opacity: [0, 0.6, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full pointer-events-none"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                boxShadow: '0 0 10px cyan'
              }}
            />
          ))}
        </motion.div>
      </motion.div>

      <style jsx>{`
        .volume-slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: cyan;
          cursor: pointer;
          box-shadow: 0 0 10px cyan;
        }

        .volume-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: cyan;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px cyan;
        }

        @keyframes hologram-grid {
          0% { transform: translateY(0px); }
          100% { transform: translateY(20px); }
        }
      `}</style>
    </motion.div>
  );
}