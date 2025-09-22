import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Radio, Power, Settings, Minimize2 } from 'lucide-react';
import { Button } from './ui/button';
import { aiAudioService, getStations, AIStation } from './ai-audio-service';

interface BrushedMetalRadioProps {
  onClose: () => void;
}

export function BrushedMetalRadio({ onClose }: BrushedMetalRadioProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStation, setCurrentStation] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [stations, setStations] = useState<AIStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPowerOn, setIsPowerOn] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [tunerAngle, setTunerAngle] = useState(0);
  const [bassLevel, setBassLevel] = useState(0.5);
  const [trebleLevel, setTrebleLevel] = useState(0.5);
  const [waveformData, setWaveformData] = useState<number[]>(Array(24).fill(0));

  // Load stations from API
  useEffect(() => {
    const loadStations = async () => {
      try {
        setLoading(true);
        const fetchedStations = await getStations();
        setStations(fetchedStations);
        console.log('Brushed Metal radio loaded stations:', fetchedStations);
      } catch (error) {
        console.error('Failed to load stations:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadStations();
  }, []);

  // Update waveform and time
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying) {
        setCurrentTime(prev => prev + 1);
        setWaveformData(prev => prev.map(() => Math.random() * 100));
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Don't render until stations are loaded
  if (loading || stations.length === 0) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        className="fixed top-6 left-1/3 z-50"
      >
        <div className="w-[520px] h-[220px] rounded-2xl shadow-2xl border-4 border-gray-600 bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
          <div className="text-center text-white">Loading stations...</div>
        </div>
      </motion.div>
    );
  }

  const handleTunerRotate = async (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    const degrees = (angle * 180 / Math.PI + 450) % 360;
    const stationIndex = Math.floor((degrees / 360) * stations.length);
    const newIndex = Math.min(stationIndex, stations.length - 1);
    setCurrentStation(newIndex);
    
    if (isPlaying) {
      await aiAudioService.playStation(stations[newIndex]);
    }
  };

  const handleVolumeRotate = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    const degrees = (angle * 180 / Math.PI + 450) % 360;
    const newVolume = degrees / 360;
    setVolume(newVolume);
    if (newVolume > 0) aiAudioService.setMuted(false);
  };

  const switchStation = async (direction: 'next' | 'prev') => {
    const newIndex = direction === 'next' 
      ? (currentStation + 1) % stations.length
      : currentStation === 0 ? stations.length - 1 : currentStation - 1;
    
    setCurrentStation(newIndex);
    
    if (isPlaying) {
      await aiAudioService.playStation(stations[newIndex]);
    }
  };

  const handlePlayPause = async () => {
    if (!isPlaying) {
      await aiAudioService.playStation(stations[currentStation]);
    } else {
      await aiAudioService.pause();
    }
  };

  const handlePowerToggle = async () => {
    if (isPlaying && isPlaying) {
      await aiAudioService.stop();
    }
    setIsPowerOn(!isPowerOn);
  };

  const handleMute = () => {
    aiAudioService.setMuted(!isMuted);
  };

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed top-6 left-1/3 z-50"
      >
        <motion.div
          className="px-4 py-2 rounded-lg shadow-2xl cursor-pointer border-2 overflow-hidden relative"
          style={{
            background: 'linear-gradient(135deg, #8a8a8a, #b8b8b8, #969696)',
            borderColor: '#666',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 2px 8px rgba(255,255,255,0.3)'
          }}
          onClick={() => setIsMinimized(false)}
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isPowerOn ? 'bg-orange-400' : 'bg-gray-600'} animate-pulse`} />
            <div className="text-sm text-gray-200 font-mono">{stations[currentStation].name}</div>
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
        className="fixed top-6 left-1/3 z-50"
      >
        <motion.div
          className="w-[520px] h-[220px] rounded-2xl shadow-2xl border-4 border-gray-600 overflow-hidden relative"
          style={{
            background: 'linear-gradient(145deg, #6a6a6a, #8a8a8a, #747474)',
            boxShadow: '0 20px 80px rgba(0,0,0,0.5), inset 0 4px 16px rgba(255,255,255,0.2), inset 0 -4px 16px rgba(0,0,0,0.4)'
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              onClick={() => setIsPowerOn(true)}
              className="w-20 h-20 rounded-full text-white shadow-2xl"
              style={{
                background: 'radial-gradient(circle at 30% 30%, #ff6600, #cc4400)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5), inset 0 3px 8px rgba(255,255,255,0.3)'
              }}
            >
              <Power className="w-10 h-10" />
            </Button>
          </div>
          
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMinimized(true)}
              className="w-8 h-8 text-gray-300 hover:bg-white/10"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="w-8 h-8 text-gray-300 hover:bg-white/10"
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
      className="fixed top-6 left-1/3 z-50"
    >
      <motion.div
        className="w-[520px] h-[220px] rounded-2xl shadow-2xl border-4 border-gray-600 overflow-hidden relative"
        style={{
          background: 'linear-gradient(145deg, #8a8a8a, #b8b8b8, #969696)',
          boxShadow: '0 20px 80px rgba(0,0,0,0.5), inset 0 4px 16px rgba(255,255,255,0.3), inset 0 -4px 16px rgba(0,0,0,0.4)'
        }}
      >
        {/* Brushed metal texture overlay */}
        <div className="absolute inset-0 opacity-30 pointer-events-none"
             style={{
               background: 'repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(255,255,255,0.1) 1px, rgba(255,255,255,0.1) 2px)'
             }} />

        {/* Main Panel */}
        <div className="relative h-full p-4">
          {/* Top Row - Power, Display, Controls */}
          <div className="flex items-start justify-between mb-4">
            {/* Power & Logo */}
            <div className="flex flex-col items-center">
              <Button
                onClick={handlePowerToggle}
                className="w-10 h-10 rounded-full mb-2 text-white shadow-lg"
                style={{
                  background: 'radial-gradient(circle at 30% 30%, #ff6600, #cc4400)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.4), inset 0 2px 6px rgba(255,255,255,0.3)'
                }}
              >
                <Power className="w-5 h-5" />
              </Button>
              <div className="text-xs text-gray-300 font-mono">AI METAL</div>
            </div>

            {/* Central Display */}
            <div 
              className="flex-1 mx-4 p-4 rounded-xl bg-black relative overflow-hidden"
              style={{
                boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.8), 0 2px 8px rgba(0,0,0,0.5)',
                background: 'linear-gradient(180deg, #000000, #1a1a1a)'
              }}
            >
              {/* Main Display Text */}
              <div className="text-center mb-2">
                <div className="text-orange-400 text-xl font-mono font-bold tracking-wider">
                  {stations[currentStation].frequency}
                </div>
                <div className="text-amber-300 text-sm font-mono tracking-wide">
                  {stations[currentStation].name}
                </div>
              </div>

              {/* Real Waveform Display */}
              <div className="flex items-end justify-center gap-px h-8 mb-2">
                {waveformData.map((height, index) => (
                  <div
                    key={index}
                    className="w-1 rounded-t transition-all duration-75"
                    style={{ 
                      height: `${Math.max(2, height * 0.3)}px`,
                      backgroundColor: height > 50 ? '#f97316' : height > 25 ? '#fbbf24' : '#22c55e'
                    }}
                  />
                ))}
              </div>

              {/* Track Info with Live Time */}
              <div className="text-center">
                <div className="text-green-400 text-xs font-mono overflow-hidden">
                  <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: '-100%' }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    className="whitespace-nowrap"
                  >
                    {stations[currentStation].track} • {stations[currentStation].artist} • Playing: {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')}
                  </motion.div>
                </div>
              </div>

              {/* Status LEDs */}
              <div className="absolute top-2 right-2 flex gap-1">
                <div className={`w-1 h-1 rounded-full ${isPlaying ? 'bg-green-400' : 'bg-gray-600'}`} />
                <div className={`w-1 h-1 rounded-full ${isPowerOn ? 'bg-orange-400' : 'bg-gray-600'}`} />
                <div className={`w-1 h-1 rounded-full ${stations[currentStation].isLive ? 'bg-red-400' : 'bg-gray-600'}`} />
              </div>
            </div>

            {/* Top Controls */}
            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(true)}
                className="w-8 h-8 text-gray-300 hover:bg-white/10"
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="w-8 h-8 text-gray-300 hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Control Row */}
          <div className="flex items-center justify-between">
            {/* Functional Tuner Knob */}
            <div className="flex flex-col items-center">
              <div className="text-xs text-gray-300 mb-2 font-mono">TUNER</div>
              <div
                className="w-16 h-16 rounded-full cursor-pointer relative"
                style={{
                  background: 'conic-gradient(from 0deg, #666, #999, #666, #999)',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.4), inset 0 3px 8px rgba(255,255,255,0.2), inset 0 -3px 8px rgba(0,0,0,0.3)'
                }}
                onClick={handleTunerRotate}
              >
                {/* Knob indicators */}
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-px h-2 bg-white/60"
                    style={{
                      top: '4px',
                      left: '50%',
                      transformOrigin: '50% 28px',
                      transform: `translateX(-50%) rotate(${i * 45}deg)`
                    }}
                  />
                ))}
                
                {/* Pointer */}
                <div 
                  className="absolute w-1 h-5 bg-orange-400 top-2 left-1/2 transform -translate-x-1/2 rounded-full"
                  style={{ 
                    transform: `translate(-50%, 0) rotate(${tunerAngle}deg)`, 
                    transformOrigin: '50% 24px',
                    boxShadow: '0 0 4px #ff6600'
                  }}
                />
                
                {/* Center */}
                <div className="absolute inset-4 rounded-full bg-gray-700 border border-gray-500" />
              </div>
            </div>

            {/* Functional Transport Controls */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => switchStation('prev')}
                className="w-12 h-12 rounded-full text-gray-300 shadow-lg"
                style={{
                  background: 'radial-gradient(circle at 30% 30%, #a0a0a0, #808080)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4), inset 0 2px 6px rgba(255,255,255,0.3)'
                }}
              >
                <SkipBack className="w-5 h-5" />
              </Button>

              <Button
                variant="ghost"
                size="lg"
                onClick={handlePlayPause}
                className="w-16 h-16 rounded-full text-gray-200 shadow-xl"
                style={{
                  background: 'radial-gradient(circle at 30% 30%, #c0c0c0, #909090, #808080)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5), inset 0 4px 12px rgba(255,255,255,0.4), inset 0 -4px 12px rgba(0,0,0,0.3)'
                }}
              >
                {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => switchStation('next')}
                className="w-12 h-12 rounded-full text-gray-300 shadow-lg"
                style={{
                  background: 'radial-gradient(circle at 30% 30%, #a0a0a0, #808080)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4), inset 0 2px 6px rgba(255,255,255,0.3)'
                }}
              >
                <SkipForward className="w-5 h-5" />
              </Button>
            </div>

            {/* Real Volume Knob */}
            <div className="flex flex-col items-center">
              <div className="text-xs text-gray-300 mb-2 font-mono">VOLUME</div>
              <div
                className="w-16 h-16 rounded-full cursor-pointer relative"
                style={{
                  background: 'conic-gradient(from 0deg, #666, #999, #666, #999)',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.4), inset 0 3px 8px rgba(255,255,255,0.2), inset 0 -3px 8px rgba(0,0,0,0.3)'
                }}
                onClick={handleVolumeRotate}
              >
                {/* Volume indicators */}
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-px h-2 bg-white/60"
                    style={{
                      top: '4px',
                      left: '50%',
                      transformOrigin: '50% 28px',
                      transform: `translateX(-50%) rotate(${i * 45}deg)`
                    }}
                  />
                ))}
                
                {/* Pointer */}
                <div 
                  className="absolute w-1 h-5 bg-blue-400 top-2 left-1/2 transform -translate-x-1/2 rounded-full"
                  style={{ 
                    transform: `translate(-50%, 0) rotate(${volume * 360}deg)`, 
                    transformOrigin: '50% 24px',
                    boxShadow: '0 0 4px #3b82f6'
                  }}
                />
                
                {/* Center */}
                <div className="absolute inset-4 rounded-full bg-gray-700 border border-gray-500" />
              </div>
            </div>

            {/* EQ & Extras */}
            <div className="flex flex-col items-center gap-2">
              <div className="text-xs text-gray-300 font-mono">EQ</div>
              
              {/* Bass/Treble mini knobs */}
              <div className="flex gap-2">
                <div className="flex flex-col items-center">
                  <div
                    className="w-6 h-6 rounded-full cursor-pointer relative"
                    style={{
                      background: 'radial-gradient(circle at 30% 30%, #999, #666)',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.4), inset 0 1px 3px rgba(255,255,255,0.3)'
                    }}
                    onClick={() => setBassLevel(Math.random())}
                  >
                    <div 
                      className="absolute w-px h-2 bg-red-400 top-1 left-1/2 transform -translate-x-1/2"
                      style={{ transform: `translate(-50%, 0) rotate(${bassLevel * 270}deg)`, transformOrigin: '50% 10px' }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 font-mono">B</div>
                </div>
                
                <div className="flex flex-col items-center">
                  <div
                    className="w-6 h-6 rounded-full cursor-pointer relative"
                    style={{
                      background: 'radial-gradient(circle at 30% 30%, #999, #666)',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.4), inset 0 1px 3px rgba(255,255,255,0.3)'
                    }}
                    onClick={() => setTrebleLevel(Math.random())}
                  >
                    <div 
                      className="absolute w-px h-2 bg-yellow-400 top-1 left-1/2 transform -translate-x-1/2"
                      style={{ transform: `translate(-50%, 0) rotate(${trebleLevel * 270}deg)`, transformOrigin: '50% 10px' }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 font-mono">T</div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleMute}
                className="w-8 h-8 text-gray-300 hover:bg-white/10"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Brushed metal edge details */}
        <div className="absolute inset-0 rounded-2xl pointer-events-none">
          <div className="absolute inset-1 rounded-xl border border-white/20" />
          <div className="absolute inset-2 rounded-xl border border-gray-400/20" />
        </div>
      </motion.div>
    </motion.div>
  );
}