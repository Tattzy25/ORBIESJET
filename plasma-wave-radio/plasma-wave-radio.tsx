import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Pause, SkipBack, SkipForward, Volume2, Zap, Radio, Flame } from 'lucide-react';
import { Button } from './ui/button';
import { aiAudioService, getStations, AIStation } from './ai-audio-service';

interface PlasmaWaveRadioProps {
  onClose: () => void;
}

export function PlasmaWaveRadio({ onClose }: PlasmaWaveRadioProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStation, setCurrentStation] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [plasmaIntensity, setPlasmaIntensity] = useState(0.8);
  const [energyLevel, setEnergyLevel] = useState(75);
  const [plasmaBolts, setPlasmaBolts] = useState<Array<{id: number, x: number, y: number, size: number}>>([]);
  const [stations, setStations] = useState<AIStation[]>([]);
  const [loading, setLoading] = useState(true);
  const spectrumRef = useRef<number[]>(new Array(48).fill(0));

  // Load stations from API
  useEffect(() => {
    const loadStations = async () => {
      try {
        setLoading(true);
        const fetchedStations = await getStations();
        setStations(fetchedStations);
        console.log('Plasma radio loaded stations:', fetchedStations);
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
        setEnergyLevel(prev => Math.max(20, Math.min(100, prev + (Math.random() - 0.5) * 10)));

        // Generate plasma bolts
        if (Math.random() < 0.3) {
          setPlasmaBolts(prev => [
            ...prev.slice(-8),
            {
              id: Date.now(),
              x: Math.random() * 100,
              y: Math.random() * 100,
              size: Math.random() * 30 + 10
            }
          ]);
        }

        // Update spectrum
        spectrumRef.current = spectrumRef.current.map(() => Math.random() * 100);
      }
    }, 150);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Remove old plasma bolts
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPlasmaBolts(prev => prev.slice(-6));
    }, 2000);
    return () => clearTimeout(timeout);
  }, [plasmaBolts]);

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

    // Create plasma burst effect
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        setPlasmaBolts(prev => [
          ...prev,
          {
            id: Date.now() + i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 40 + 20
          }
        ]);
      }, i * 100);
    }

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
    setPlasmaIntensity(newVolume);
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ rotateX: -30, z: -150 }}
        animate={{ rotateX: 0, z: 0 }}
        transition={{ duration: 1, type: "spring" }}
        className="relative w-[520px] h-[380px] max-w-[90vw] max-h-[80vh]"
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
          className="absolute -top-12 right-0 text-purple-400 hover:bg-purple-400/20 z-20 border border-purple-400/30"
        >
          <X className="w-6 h-6" />
        </Button>

        {/* Main Plasma Panel */}
        <motion.div
          animate={{
            rotateY: [0, -2, 2, 0],
            boxShadow: [
              '0 0 50px rgba(147, 51, 234, 0.4)',
              '0 0 80px rgba(147, 51, 234, 0.6)',
              '0 0 50px rgba(147, 51, 234, 0.4)'
            ]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative w-full h-full rounded-3xl border border-purple-500/50 backdrop-blur-md overflow-hidden"
          style={{
            background: `
              radial-gradient(circle at 20% 30%, rgba(147, 51, 234, 0.15) 0%, transparent 40%),
              radial-gradient(circle at 80% 70%, rgba(236, 72, 153, 0.15) 0%, transparent 40%),
              radial-gradient(circle at 50% 50%, rgba(59, 7, 100, 0.8) 0%, rgba(0, 0, 0, 0.9) 70%)
            `,
            boxShadow: `
              0 0 50px rgba(147, 51, 234, ${plasmaIntensity * 0.6}),
              inset 0 0 50px rgba(147, 51, 234, 0.1),
              0 15px 50px rgba(0, 0, 0, 0.4)
            `
          }}
        >
          {/* Plasma Background Effects */}
          <div className="absolute inset-0">
            {/* Plasma Bolts */}
            {plasmaBolts.map((bolt) => (
              <motion.div
                key={bolt.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 1.5],
                  rotate: [0, 180, 360]
                }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="absolute pointer-events-none"
                style={{
                  left: `${bolt.x}%`,
                  top: `${bolt.y}%`,
                  width: `${bolt.size}px`,
                  height: `${bolt.size}px`,
                  background: `
                    radial-gradient(circle,
                      rgba(236, 72, 153, 0.8) 0%,
                      rgba(147, 51, 234, 0.6) 30%,
                      rgba(59, 7, 100, 0.4) 60%,
                      transparent 100%
                    )
                  `,
                  borderRadius: '50%',
                  filter: 'blur(2px)',
                  boxShadow: '0 0 20px rgba(236, 72, 153, 0.6)'
                }}
              />
            ))}

            {/* Flowing plasma streams */}
            <div className="absolute inset-0">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    pathLength: [0, 1],
                    opacity: [0, 0.6, 0]
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 3
                  }}
                  className="w-full h-full"
                >
                  <svg className="w-full h-full">
                    <motion.path
                      d={`M${Math.random() * 100},${Math.random() * 100} Q${Math.random() * 500},${Math.random() * 300} ${Math.random() * 500},${Math.random() * 400}`}
                      stroke={`rgba(${147 + Math.random() * 100}, ${51 + Math.random() * 100}, 234, 0.6)`}
                      strokeWidth="2"
                      fill="none"
                      filter="blur(1px)"
                    />
                  </svg>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="relative z-10 p-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <motion.div
                animate={{
                  opacity: [0.7, 1, 0.7],
                  scale: [1, 1.02, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex items-center gap-3"
              >
                <motion.div
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    rotate: { duration: 6, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity }
                  }}
                >
                  <Flame className="w-8 h-8 text-purple-400" />
                </motion.div>
                <span className="text-purple-300 font-mono text-xl tracking-wider">
                  PLASMA WAVE
                </span>
              </motion.div>

              <div className="flex items-center gap-4">
                <div className="text-purple-400 font-mono text-xs">
                  ENERGY: {Math.round(energyLevel)}%
                </div>
                <div
                  className="w-20 h-3 bg-black/50 rounded-full border border-purple-400/30 overflow-hidden"
                >
                  <motion.div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${energyLevel}%`,
                      background: `linear-gradient(90deg,
                        rgba(236, 72, 153, 0.8) 0%,
                        rgba(147, 51, 234, 0.8) 50%,
                        rgba(59, 7, 100, 0.8) 100%
                      )`,
                      boxShadow: `0 0 10px rgba(147, 51, 234, 0.6)`
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex-1 flex gap-6">
              {/* Left Panel */}
              <div className="flex-1 space-y-4">
                {/* Station Display */}
                <div className="bg-black/40 rounded-2xl border border-purple-500/30 p-4 backdrop-blur-sm">
                  <div className="text-purple-400 font-mono text-xs mb-2 tracking-wider">
                    PLASMA FREQUENCY
                  </div>
                  <motion.div
                    key={currentStation}
                    initial={{ opacity: 0, x: -20, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    className="text-purple-200 text-xl mb-1 font-mono"
                  >
                    {currentStationData?.name || 'NO SIGNAL'}
                  </motion.div>
                  <div className="text-purple-400/70 text-sm font-mono">
                    {currentStationData?.frequency || '----.-- PHz'}
                  </div>
                </div>

                {/* Plasma Spectrum */}
                <div className="bg-black/40 rounded-2xl border border-purple-500/30 p-4 backdrop-blur-sm">
                  <div className="text-purple-400 font-mono text-xs mb-3 tracking-wider">
                    PLASMA SPECTRUM
                  </div>
                  <div className="flex items-end gap-0.5 h-20">
                    {spectrumRef.current.map((value, index) => (
                      <motion.div
                        key={index}
                        animate={{
                          height: isPlaying ? `${value}%` : '8%',
                          backgroundColor: isPlaying
                            ? `rgba(${147 + (value * 0.5)}, ${51 + (value * 0.8)}, 234, ${0.6 + (value / 300)})`
                            : 'rgba(147, 51, 234, 0.3)'
                        }}
                        transition={{ duration: 0.2 }}
                        className="w-2 bg-purple-400 rounded-t"
                        style={{
                          minHeight: '4px',
                          boxShadow: isPlaying ? `0 0 8px rgba(147, 51, 234, ${value / 200})` : 'none',
                          filter: isPlaying ? 'blur(0.5px)' : 'none'
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Plasma Data */}
                <div className="bg-black/40 rounded-2xl border border-purple-500/30 p-4 backdrop-blur-sm">
                  <div className="text-purple-400 font-mono text-xs mb-2 tracking-wider">
                    PLASMA METRICS
                  </div>
                  <div className="space-y-1 font-mono text-xs">
                    <div className="text-purple-300">
                      DURATION: <span className="text-purple-400">{formatTime(currentTime)}</span>
                    </div>
                    <div className="text-purple-300">
                      IONIZATION: <span className="text-purple-400">{(energyLevel * 1.2).toFixed(1)}%</span>
                    </div>
                    <div className="text-purple-300">
                      STATE: <span className="text-purple-400">{isPlaying ? 'ACTIVE PLASMA' : 'DORMANT'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Panel - Controls */}
              <div className="w-48 space-y-4">
                {/* Playback Controls */}
                <div className="bg-black/40 rounded-2xl border border-purple-500/30 p-4 backdrop-blur-sm">
                  <div className="text-purple-400 font-mono text-xs mb-3 tracking-wider">
                    PLASMA CONTROL
                  </div>
                  <div className="flex justify-center gap-2 mb-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleStationChange('prev')}
                      className="w-10 h-10 bg-purple-500/20 rounded-xl border border-purple-400/40 flex items-center justify-center hover:bg-purple-500/30 transition-all"
                      style={{
                        boxShadow: '0 0 15px rgba(147, 51, 234, 0.3)'
                      }}
                    >
                      <SkipBack className="w-4 h-4 text-purple-400" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handlePlay}
                      className="w-12 h-12 bg-purple-500/30 rounded-xl border border-purple-400/50 flex items-center justify-center hover:bg-purple-500/40 transition-all relative"
                      style={{
                        boxShadow: '0 0 20px rgba(147, 51, 234, 0.4)'
                      }}
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 text-purple-300" />
                      ) : (
                        <Play className="w-5 h-5 text-purple-300 ml-0.5" />
                      )}
                      {isPlaying && (
                        <motion.div
                          animate={{ scale: [1, 1.4, 1], opacity: [1, 0, 1] }}
                          transition={{ duration: 1.2, repeat: Infinity }}
                          className="absolute inset-0 border border-purple-400 rounded-xl"
                        />
                      )}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleStationChange('next')}
                      className="w-10 h-10 bg-purple-500/20 rounded-xl border border-purple-400/40 flex items-center justify-center hover:bg-purple-500/30 transition-all"
                      style={{
                        boxShadow: '0 0 15px rgba(147, 51, 234, 0.3)'
                      }}
                    >
                      <SkipForward className="w-4 h-4 text-purple-400" />
                    </motion.button>
                  </div>
                </div>

                {/* Volume Control */}
                <div className="bg-black/40 rounded-2xl border border-purple-500/30 p-4 backdrop-blur-sm">
                  <div className="text-purple-400 font-mono text-xs mb-3 tracking-wider">
                    PLASMA INTENSITY
                  </div>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      className="w-full h-2 bg-black/50 rounded-lg appearance-none cursor-pointer plasma-slider"
                      style={{
                        background: `linear-gradient(to right,
                          #9333ea 0%,
                          #9333ea ${volume * 100}%,
                          rgba(0,0,0,0.5) ${volume * 100}%,
                          rgba(0,0,0,0.5) 100%)`
                      }}
                    />
                    <div className="text-purple-400 font-mono text-sm text-center">
                      {Math.round(volume * 100)}%
                    </div>
                  </div>
                </div>

                {/* Plasma Status */}
                <div className="bg-black/40 rounded-2xl border border-purple-500/30 p-4 backdrop-blur-sm">
                  <div className="text-purple-400 font-mono text-xs mb-3 tracking-wider">
                    PLASMA STATUS
                  </div>
                  <div className="space-y-2">
                    {['CONTAINMENT', 'STABILITY', 'FUSION'].map((status, i) => (
                      <div key={status} className="flex justify-between items-center">
                        <span className="text-purple-300 text-xs font-mono">{status}</span>
                        <motion.div
                          animate={{
                            opacity: [0.4, 1, 0.4],
                            scale: [0.8, 1.1, 0.8]
                          }}
                          transition={{
                            duration: 1 + i * 0.3,
                            repeat: Infinity,
                            delay: i * 0.2
                          }}
                          className="w-2 h-2 bg-purple-400 rounded-full"
                          style={{
                            boxShadow: '0 0 8px rgba(147, 51, 234, 0.8)'
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <style jsx>{`
        .plasma-slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #9333ea;
          cursor: pointer;
          box-shadow: 0 0 15px #9333ea;
        }

        .plasma-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #9333ea;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 15px #9333ea;
        }
      `}</style>
    </motion.div>
  );
}