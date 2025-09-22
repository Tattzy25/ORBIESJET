import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { AIAudioService, AIStation } from './ai-audio-service';

const PioneerClassicStereo: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [balance, setBalance] = useState(0);
  const [currentStationIndex, setCurrentStationIndex] = useState(0);
  const [stations, setStations] = useState<AIStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayMode, setDisplayMode] = useState<'freq' | 'time'>('freq');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMuted, setIsMuted] = useState(false);
  const [isPowered, setIsPowered] = useState(true);
  const audioServiceRef = useRef<AIAudioService | null>(null);

  useEffect(() => {
    const initAudio = async () => {
      try {
        audioServiceRef.current = new AIAudioService();
        await audioServiceRef.current.initialize();
        const stationData = await audioServiceRef.current.getStations();
        setStations(stationData);
        setLoading(false);
      } catch (error) {
        console.error('Failed to initialize audio:', error);
        setLoading(false);
      }
    };

    initAudio();

    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timeInterval);
      if (audioServiceRef.current) {
        audioServiceRef.current.cleanup();
      }
    };
  }, []);

  const handlePlayPause = async () => {
    if (!audioServiceRef.current || !stations.length) return;

    try {
      if (isPlaying) {
        await audioServiceRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioServiceRef.current.playStation(stations[currentStationIndex]);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Play/pause error:', error);
    }
  };

  const handleStationChange = async (index: number) => {
    if (!audioServiceRef.current || !stations.length) return;

    try {
      setCurrentStationIndex(index);
      if (isPlaying) {
        await audioServiceRef.current.playStation(stations[index]);
      }
    } catch (error) {
      console.error('Station change error:', error);
    }
  };

  const handleVolumeChange = (delta: number) => {
    const newVolume = Math.max(0, Math.min(100, volume + delta));
    setVolume(newVolume);
    if (audioServiceRef.current) {
      audioServiceRef.current.setVolume(newVolume / 100);
    }
  };

  const handleBalanceChange = (delta: number) => {
    const newBalance = Math.max(-10, Math.min(10, balance + delta));
    setBalance(newBalance);
    if (audioServiceRef.current) {
      audioServiceRef.current.setBalance(newBalance / 10);
    }
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
    if (audioServiceRef.current) {
      audioServiceRef.current.setMuted(!isMuted);
    }
  };

  const handleKnobRotate = (type: 'volume' | 'balance', event: React.MouseEvent) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(event.clientY - centerY, event.clientX - centerX);
    const degrees = (angle * 180) / Math.PI;

    if (type === 'volume') {
      const normalizedAngle = ((degrees + 90) % 360 + 360) % 360;
      const newVolume = Math.round((normalizedAngle / 360) * 100);
      setVolume(newVolume);
      if (audioServiceRef.current) {
        audioServiceRef.current.setVolume(newVolume / 100);
      }
    } else {
      const normalizedAngle = ((degrees + 90) % 360 + 360) % 360;
      const newBalance = Math.round(((normalizedAngle / 360) * 20) - 10);
      setBalance(newBalance);
      if (audioServiceRef.current) {
        audioServiceRef.current.setBalance(newBalance / 10);
      }
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const currentStation = stations[currentStationIndex];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <motion.div
        className="relative bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 rounded-lg p-6 shadow-2xl border border-gray-600"
        style={{
          background: 'linear-gradient(135deg, #2d3748 0%, #4a5568 50%, #2d3748 100%)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.3)'
        }}
      >
        {/* Power LED */}
        <div className="absolute top-2 right-2">
          <div className={`w-2 h-2 rounded-full ${isPowered ? 'bg-green-400 shadow-lg shadow-green-400/50' : 'bg-gray-500'}`} />
        </div>

        {/* Display Area */}
        <div className="mb-6 bg-black rounded border border-gray-600 p-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-blue-400/10" />
          
          {/* Station Info */}
          <div className="text-center mb-2">
            <div className="text-green-400 font-mono text-lg font-bold tracking-wider">
              {displayMode === 'freq' && currentStation ? 
                `${currentStation.frequency} MHz` : 
                formatTime(currentTime)
              }
            </div>
            <div className="text-green-300 font-mono text-sm">
              {loading ? 'Loading stations...' : (currentStation?.name || 'No station selected')}
            </div>
          </div>

          {/* Spectrum Bars */}
          <div className="flex justify-center items-end gap-1 h-8 mb-2">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-green-400 rounded-t"
                animate={{ height: isPlaying ? Math.random() * 24 + 4 : 4 }}
                transition={{ duration: 0.1 }}
              />
            ))}
          </div>

          {/* Status Indicators */}
          <div className="flex justify-between text-xs text-green-400 font-mono">
            <div>STEREO</div>
            <div>{isPlaying ? 'PLAY' : 'STOP'}</div>
            <div>{isMuted ? 'MUTE' : 'VOL'}</div>
          </div>
        </div>

        {/* Control Knobs */}
        <div className="flex justify-between items-center mb-4">
          {/* Left Side - Volume Knob */}
          <div className="flex flex-col items-center justify-center">
            <div className="text-xs text-gray-700 mb-1 font-mono tracking-wide">VOLUME</div>
            <div
              className="w-16 h-16 rounded-full cursor-pointer relative shadow-lg border-2 border-gray-500"
              style={{
                background: 'radial-gradient(circle at 30% 30%, #ffffff, #e0e0e0, #c0c0c0)',
                boxShadow: '0 6px 18px rgba(0,0,0,0.4), inset 0 3px 8px rgba(255,255,255,0.9), inset 0 -3px 8px rgba(0,0,0,0.3)'
              }}
              onClick={(e) => handleKnobRotate('volume', e)}
            >
              {/* Volume markings */}
              {[...Array(11)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-px h-2 bg-gray-600"
                  style={{
                    top: '4px',
                    left: '50%',
                    transformOrigin: '50% 28px',
                    transform: `translateX(-50%) rotate(${-90 + (i * 30)}deg)`
                  }}
                />
              ))}
              
              {/* Center line */}
              <div className="absolute w-px h-3 bg-red-600 top-2 left-1/2 transform -translate-x-1/2" />
              
              {/* Pointer */}
              <div 
                className="absolute w-1 h-5 bg-blue-600 top-1 left-1/2 transform -translate-x-1/2 rounded-full"
                style={{ 
                  transform: `translate(-50%, 0) rotate(${(volume / 100) * 270}deg)`, 
                  transformOrigin: '50% 26px'
                }}
              />
              
              {/* Center */}
              <div className="absolute inset-4 rounded-full border border-gray-400 bg-gray-200 flex items-center justify-center">
                <div className="text-gray-800 text-xs font-mono">{volume}</div>
              </div>
            </div>
            
            {/* Volume buttons */}
            <div className="flex flex-col gap-1 mt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleVolumeChange(5)}
                className="w-6 h-6 p-0 bg-gray-300 hover:bg-gray-400 border-gray-500"
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleVolumeChange(-5)}
                className="w-6 h-6 p-0 bg-gray-300 hover:bg-gray-400 border-gray-500"
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Center - Play/Pause */}
          <div className="flex flex-col items-center justify-center">
            <Button
              onClick={handlePlayPause}
              size="lg"
              className="w-12 h-12 rounded-full bg-gray-600 hover:bg-gray-500 border-2 border-gray-400 shadow-lg"
              style={{
                boxShadow: '0 4px 12px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.2), inset 0 -2px 4px rgba(0,0,0,0.3)'
              }}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 text-white" />
              ) : (
                <Play className="w-6 h-6 text-white" />
              )}
            </Button>
            
            {/* Balance buttons */}
            <div className="flex gap-1 mt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBalanceChange(-1)}
                className="w-6 h-6 p-0 bg-gray-300 hover:bg-gray-400 border-gray-500"
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBalanceChange(1)}
                className="w-6 h-6 p-0 bg-gray-300 hover:bg-gray-400 border-gray-500"
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Right Side - Balance Knob */}
          <div className="flex flex-col items-center justify-center">
            <div className="text-xs text-gray-700 mb-1 font-mono tracking-wide">BALANCE</div>
            <div
              className="w-16 h-16 rounded-full cursor-pointer relative shadow-lg border-2 border-gray-500"
              style={{
                background: 'radial-gradient(circle at 30% 30%, #ffffff, #e0e0e0, #c0c0c0)',
                boxShadow: '0 6px 18px rgba(0,0,0,0.4), inset 0 3px 8px rgba(255,255,255,0.9), inset 0 -3px 8px rgba(0,0,0,0.3)'
              }}
              onClick={(e) => handleKnobRotate('balance', e)}
            >
              {/* Balance markings */}
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-px h-2 bg-gray-600"
                  style={{
                    top: '4px',
                    left: '50%',
                    transformOrigin: '50% 28px',
                    transform: `translateX(-50%) rotate(${-90 + (i * 30)}deg)`
                  }}
                />
              ))}
              
              {/* Center line */}
              <div className="absolute w-px h-3 bg-red-600 top-2 left-1/2 transform -translate-x-1/2" />
              
              {/* Pointer */}
              <div 
                className="absolute w-1 h-5 bg-blue-600 top-1 left-1/2 transform -translate-x-1/2 rounded-full"
                style={{ 
                  transform: `translate(-50%, 0) rotate(${(balance / 10) * 90}deg)`, 
                  transformOrigin: '50% 26px'
                }}
              />
              
              {/* Center */}
              <div className="absolute inset-4 rounded-full border border-gray-400 bg-gray-200 flex items-center justify-center">
                <div className="text-gray-800 text-xs font-mono">
                  {balance === 0 ? 'C' : balance > 0 ? `R${balance}` : `L${Math.abs(balance)}`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Function Buttons */}
        <div className="absolute bottom-2 left-4 right-4 flex justify-between">
          <div className="flex gap-1">
            {[1,2,3,4,5,6].map((num) => (
              <button
                key={num}
                onClick={() => handleStationChange((num - 1) % stations.length)}
                className={`w-6 h-4 text-xs font-mono rounded border transition-all ${
                  currentStationIndex === (num - 1) % stations.length
                    ? 'bg-gray-600 text-green-400 border-gray-800' 
                    : 'bg-gray-300 text-gray-700 border-gray-500 hover:bg-gray-400'
                }`}
                style={{
                  boxShadow: currentStationIndex === (num - 1) % stations.length
                    ? 'inset 0 1px 3px rgba(0,0,0,0.5)'
                    : '0 1px 3px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.8)'
                }}
              >
                {num}
              </button>
            ))}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setDisplayMode(prev => prev === 'freq' ? 'time' : 'freq')}
              className="px-2 h-4 text-xs font-mono bg-gray-300 hover:bg-gray-400 text-gray-700 rounded border border-gray-500"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.8)' }}
            >
              DISP
            </button>
            <button
              onClick={handleMute}
              className="px-2 h-4 text-xs font-mono bg-gray-300 hover:bg-gray-400 text-gray-700 rounded border border-gray-500"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.8)' }}
            >
              MUTE
            </button>
          </div>
        </div>

        {/* Chrome accent details */}
        <div className="absolute inset-0 rounded-lg pointer-events-none">
          <div className="absolute inset-1 rounded border border-white/40" />
          <div className="absolute inset-2 rounded border border-gray-300/30" />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PioneerClassicStereo;