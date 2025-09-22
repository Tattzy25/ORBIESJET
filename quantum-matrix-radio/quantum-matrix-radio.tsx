import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, SkipBack, SkipForward, Atom } from 'lucide-react';
import { Button } from './ui/button';
import { AIAudioService, AIStation } from './ai-audio-service';

const QuantumMatrixRadio: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStation, setCurrentStation] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [waveformData, setWaveformData] = useState<number[]>(Array(32).fill(5));
  const [matrixEffect, setMatrixEffect] = useState(true);
  const [quantumPhase, setQuantumPhase] = useState(0);
  const [matrixChars, setMatrixChars] = useState<string[]>([]);
  const [quantumParticles, setQuantumParticles] = useState<Array<{id: number, x: number, y: number}>>([]);

  const audioServiceRef = useRef<AIAudioService | null>(null);
  const animationRef = useRef<number>();
  const matrixRef = useRef<number>();

  const stations: AIStation[] = [
    { id: 'quantum-1', name: 'Quantum Echo', frequency: '142.857 QHz', genre: 'Electronic', artist: 'AI Composer', track: 'Quantum Waves' },
    { id: 'quantum-2', name: 'Matrix Stream', frequency: '314.159 QHz', genre: 'Ambient', artist: 'Matrix AI', track: 'Digital Rain' },
    { id: 'quantum-3', name: 'Entangled Waves', frequency: '271.828 QHz', genre: 'Experimental', artist: 'Quantum Labs', track: 'Entanglement' },
  ];

  const currentStationData = stations[currentStation];

  useEffect(() => {
    const initAudio = async () => {
      try {
        audioServiceRef.current = new AIAudioService();
        await audioServiceRef.current.initialize();
      } catch (error) {
        console.error('Failed to initialize audio service:', error);
      }
    };

    initAudio();

    return () => {
      if (audioServiceRef.current) {
        audioServiceRef.current.cleanup();
      }
    };
  }, []);

  useEffect(() => {
    if (matrixEffect) {
      const generateMatrixChars = () => {
        const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const newChars = Array(50).fill('').map(() => chars[Math.floor(Math.random() * chars.length)]);
        setMatrixChars(newChars);
      };

      generateMatrixChars();
      const interval = setInterval(generateMatrixChars, 100);
      matrixRef.current = interval;

      return () => clearInterval(interval);
    } else {
      setMatrixChars([]);
      if (matrixRef.current) {
        clearInterval(matrixRef.current);
      }
    }
  }, [matrixEffect]);

  useEffect(() => {
    const updateQuantumPhase = () => {
      setQuantumPhase(prev => (prev + 0.1) % (Math.PI * 2));
    };

    const interval = setInterval(updateQuantumPhase, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const generateParticles = () => {
      const particles = Array(15).fill(null).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100
      }));
      setQuantumParticles(particles);
    };

    generateParticles();
    const interval = setInterval(() => {
      setQuantumParticles(prev => prev.map(p => ({
        ...p,
        x: (p.x + (Math.random() - 0.5) * 2) % 100,
        y: (p.y + (Math.random() - 0.5) * 2) % 100
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateWaveform = () => {
      if (isPlaying) {
        const newData = waveformData.map(() => Math.random() * 80 + 10);
        setWaveformData(newData);
      }
      animationRef.current = requestAnimationFrame(updateWaveform);
    };

    animationRef.current = requestAnimationFrame(updateWaveform);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, waveformData]);

  const handlePlay = async () => {
    if (!audioServiceRef.current) return;

    try {
      if (isPlaying) {
        await audioServiceRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioServiceRef.current.playStation(currentStationData);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Playback error:', error);
    }
  };

  const handleStationChange = (direction: 'next' | 'prev') => {
    setCurrentStation(prev => {
      if (direction === 'next') {
        return (prev + 1) % stations.length;
      } else {
        return prev === 0 ? stations.length - 1 : prev - 1;
      }
    });
  };

  const handleVolumeChange = async (newVolume: number) => {
    setVolume(newVolume);
    if (audioServiceRef.current) {
      await audioServiceRef.current.setVolume(newVolume);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-4xl h-96 bg-black/90 rounded-2xl border border-green-400/50 overflow-hidden relative"
      style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(0,20,0,0.8) 100%)',
        boxShadow: '0 0 50px rgba(0, 255, 0, 0.3)'
      }}
    >
      {/* Matrix Background Effect */}
      {matrixEffect && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {matrixChars.map((char, index) => (
            <motion.div
              key={index}
              initial={{
                x: Math.random() * 100 + '%',
                y: -20,
                opacity: 0
              }}
              animate={{
                y: '120vh',
                opacity: [0, 1, 1, 0]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 3
              }}
              className="absolute text-green-400/20 font-mono text-xs"
              style={{
                left: `${Math.random() * 100}%`,
                textShadow: '0 0 5px rgba(0, 255, 0, 0.5)'
              }}
            >
              {char}
            </motion.div>
          ))}
        </div>
      )}

      {/* Quantum Particles */}
      {quantumParticles.map((particle) => (
        <motion.div
          key={particle.id}
          animate={{
            x: `${particle.x}%`,
            y: `${particle.y}%`,
            scale: [0.5, 1.5, 0.5],
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{
            duration: 4 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 2
          }}
          className="absolute w-2 h-2 bg-green-400 rounded-full pointer-events-none"
          style={{
            boxShadow: '0 0 10px rgba(0, 255, 0, 0.8)',
            filter: 'blur(0.5px)'
          }}
        />
      ))}

      {/* Main Content */}
      <div className="relative z-10 p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <motion.div
            animate={{
              opacity: [0.6, 1, 0.6],
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="flex items-center gap-3"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <Atom className="w-7 h-7 text-green-400" />
            </motion.div>
            <span className="text-green-400 font-mono text-lg tracking-wider">
              QUANTUM MATRIX
            </span>
          </motion.div>

          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => setMatrixEffect(!matrixEffect)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="text-green-400 text-xs font-mono hover:text-green-300 transition-colors"
            >
              MATRIX: {matrixEffect ? 'ON' : 'OFF'}
            </motion.button>
            <div className="text-green-400 font-mono text-xs">
              PHASE: {quantumPhase.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="flex-1 flex gap-6">
          {/* Left Panel */}
          <div className="flex-1 space-y-4">
            {/* Station Display */}
            <div className="bg-black/50 rounded-xl border border-green-400/30 p-4 backdrop-blur-sm">
              <div className="text-green-400 font-mono text-xs mb-2 tracking-wider">
                QUANTUM FREQUENCY
              </div>
              <motion.div
                key={currentStation}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-green-300 text-xl mb-1 font-mono"
              >
                {currentStationData?.name || 'NO SIGNAL'}
              </motion.div>
              <div className="text-green-400/70 text-sm font-mono">
                {currentStationData?.frequency || '----.-- QHz'}
              </div>
            </div>

            {/* Quantum Waveform */}
            <div className="bg-black/50 rounded-xl border border-green-400/30 p-4 backdrop-blur-sm">
              <div className="text-green-400 font-mono text-xs mb-3 tracking-wider">
                QUANTUM WAVEFORM
              </div>
              <div className="flex items-end gap-1 h-20">
                {waveformData.map((value, index) => (
                  <motion.div
                    key={index}
                    animate={{
                      height: isPlaying ? `${value}%` : '5%',
                      backgroundColor: isPlaying
                        ? `rgba(0, ${Math.floor(255 * (value / 100))}, 0, ${0.6 + (value / 200)})`
                        : 'rgba(0, 255, 0, 0.3)'
                    }}
                    transition={{ duration: 0.15 }}
                    className="w-1.5 bg-green-400 rounded-t"
                    style={{
                      minHeight: '3px',
                      boxShadow: isPlaying ? '0 0 5px rgba(0, 255, 0, 0.8)' : 'none'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Quantum Data */}
            <div className="bg-black/50 rounded-xl border border-green-400/30 p-4 backdrop-blur-sm">
              <div className="text-green-400 font-mono text-xs mb-2 tracking-wider">
                QUANTUM DATA
              </div>
              <div className="space-y-1 font-mono text-xs">
                <div className="text-green-300">
                  TIME: <span className="text-green-400">{formatTime(currentTime)}</span>
                </div>
                <div className="text-green-300">
                  ENTANGLEMENT: <span className="text-green-400">{(Math.sin(quantumPhase) * 50 + 50).toFixed(1)}%</span>
                </div>
                <div className="text-green-300">
                  COHERENCE: <span className="text-green-400">{isPlaying ? 'STABLE' : 'INACTIVE'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Controls */}
          <div className="w-48 space-y-4">
            {/* Playback Controls */}
            <div className="bg-black/50 rounded-xl border border-green-400/30 p-4 backdrop-blur-sm">
              <div className="text-green-400 font-mono text-xs mb-3 tracking-wider">
                QUANTUM CONTROL
              </div>
              <div className="flex justify-center gap-2 mb-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleStationChange('prev')}
                  className="w-10 h-10 bg-green-400/20 rounded-lg border border-green-400/40 flex items-center justify-center hover:bg-green-400/30 transition-all"
                >
                  <SkipBack className="w-4 h-4 text-green-400" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handlePlay}
                  className="w-12 h-12 bg-green-400/30 rounded-lg border border-green-400/50 flex items-center justify-center hover:bg-green-400/40 transition-all relative"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-green-400" />
                  ) : (
                    <Play className="w-5 h-5 text-green-400 ml-0.5" />
                  )}
                  {isPlaying && (
                    <motion.div
                      animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute inset-0 border border-green-400 rounded-lg"
                    />
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleStationChange('next')}
                  className="w-10 h-10 bg-green-400/20 rounded-lg border border-green-400/40 flex items-center justify-center hover:bg-green-400/30 transition-all"
                >
                  <SkipForward className="w-4 h-4 text-green-400" />
                </motion.button>
              </div>
            </div>

            {/* Volume Control */}
            <div className="bg-black/50 rounded-xl border border-green-400/30 p-4 backdrop-blur-sm">
              <div className="text-green-400 font-mono text-xs mb-3 tracking-wider">
                AMPLITUDE
              </div>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-black/50 rounded-lg appearance-none cursor-pointer quantum-slider"
                  style={{
                    background: `linear-gradient(to right,
                      #00ff00 0%,
                      #00ff00 ${volume * 100}%,
                      rgba(0,0,0,0.5) ${volume * 100}%,
                      rgba(0,0,0,0.5) 100%)`
                  }}
                />
                <div className="text-green-400 font-mono text-sm text-center">
                  {Math.round(volume * 100)}%
                </div>
              </div>
            </div>

            {/* Quantum Status */}
            <div className="bg-black/50 rounded-xl border border-green-400/30 p-4 backdrop-blur-sm">
              <div className="text-green-400 font-mono text-xs mb-3 tracking-wider">
                QUANTUM STATE
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-green-300 text-xs font-mono">SUPERPOSITION</span>
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-2 h-2 bg-green-400 rounded-full"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-300 text-xs font-mono">ENTANGLED</span>
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-2 h-2 bg-green-400 rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .quantum-slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #00ff00;
          cursor: pointer;
          box-shadow: 0 0 15px #00ff00;
        }

        .quantum-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #00ff00;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 15px #00ff00;
        }
      `}</style>
    </motion.div>
  );
};

export default QuantumMatrixRadio;