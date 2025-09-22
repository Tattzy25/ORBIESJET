import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from "./ui/button";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Circle,
  Square,
  Triangle,
  X,
  Minimize2,
  Upload,
  Settings,
  Palette
} from 'lucide-react';
import { useAIAudio, getStations, type AIStation } from './ai-audio-service';

const colorThemes = [
  { name: 'Pure White', bg: '#ffffff', text: '#000000', accent: '#000000' },
  { name: 'Soft Gray', bg: '#f8f9fa', text: '#212529', accent: '#495057' },
  { name: 'Warm Cream', bg: '#faf9f6', text: '#2d2a26', accent: '#8b7355' },
  { name: 'Cool Blue', bg: '#f8fafc', text: '#1e293b', accent: '#3b82f6' },
  { name: 'Dark Mode', bg: '#1a1a1a', text: '#ffffff', accent: '#ffffff' }
];

export function MinimalistGeometricRadio({ onClose }: { onClose: () => void }) {
  const [currentStationIndex, setCurrentStationIndex] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [currentTheme, setCurrentTheme] = useState(0);
  const [waveAnimation, setWaveAnimation] = useState<number[]>(Array(8).fill(0));
  const [playTime, setPlayTime] = useState(0);
  const [stations, setStations] = useState<AIStation[]>([]);
  const [stationsLoading, setStationsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const audioService = useAIAudio();
  const station = stations[currentStationIndex];
  const isPlaying = audioService.getIsPlaying();
  const volume = audioService.getVolume();
  const isMuted = audioService.getIsMuted();
  const theme = colorThemes[currentTheme];

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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBackgroundImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Real-time geometric wave animation
  useEffect(() => {
    const interval = setInterval(() => {
      const spectrumData = audioService.getSpectrumData();
      if (spectrumData && spectrumData.length >= 8) {
        setWaveAnimation(spectrumData.slice(0, 8).map(val => val * 0.6));
      } else {
        // Fallback geometric animation
        if (isPlaying && !isMuted) {
          setWaveAnimation(waves => waves.map((_, index) =>
            Math.sin(Date.now() / 200 + index * 0.5) * 20 + 20
          ));
        } else {
          setWaveAnimation(waves => waves.map(wave => Math.max(0, wave - 2)));
        }
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying, isMuted, audioService]);

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

  const handlePlayPause = async () => {
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get geometric shape based on station index
  const getStationShape = (stationIndex: number) => {
    const shapes = ['circle', 'square', 'triangle'];
    return shapes[stationIndex % shapes.length] as 'circle' | 'square' | 'triangle';
  };

  const currentShape = getStationShape(currentStationIndex);

  const ShapeIcon = () => {
    switch (currentShape) {
      case 'circle':
        return <Circle className="w-6 h-6" />;
      case 'square':
        return <Square className="w-6 h-6" />;
      case 'triangle':
        return <Triangle className="w-6 h-6" />;
      default:
        return <Circle className="w-6 h-6" />;
    }
  };

  // Show loading state
  if (stationsLoading || !station) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0, x: -100 }}
        animate={{ scale: 1, opacity: 1, x: 0 }}
        className="fixed top-6 left-6 z-50"
      >
        <div className="w-80 shadow-2xl border border-gray-200 bg-gray-200 flex items-center justify-center h-96 rounded-lg">
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
          className="p-3 shadow-2xl cursor-pointer border border-gray-200 overflow-hidden"
          style={{
            backgroundColor: backgroundImage ? 'transparent' : theme.bg,
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            clipPath: currentShape === 'circle' ? 'circle(50%)' :
                     currentShape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' :
                     'none',
            borderRadius: currentShape === 'square' ? '0' : '24px'
          }}
          onClick={() => setIsMinimized(false)}
          whileHover={{ scale: 1.05 }}
        >
          {backgroundImage && <div className="absolute inset-0 bg-black/20" />}
          <div className="relative flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: isPlaying ? theme.accent : '#e5e5e5' }}
            />
            <div className="text-sm font-light" style={{ color: theme.text }}>{station.name}</div>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, x: -100 }}
      animate={{ scale: 1, opacity: 1, x: 0 }}
      exit={{ scale: 0.8, opacity: 0, x: -100 }}
      className="fixed top-6 left-6 z-50"
    >
      <motion.div
        className="w-80 shadow-2xl border border-gray-200 overflow-hidden relative"
        style={{
          backgroundColor: backgroundImage ? 'transparent' : theme.bg,
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          clipPath: currentShape === 'circle' ? 'circle(50%)' :
                   currentShape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' :
                   'none',
          borderRadius: currentShape === 'square' ? '0' : '24px'
        }}
      >
        {/* Overlay for better readability when image is used */}
        {backgroundImage && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" />
        )}

        <div className="p-8 relative">
          {/* Header Controls */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: isPlaying ? 360 : 0 }}
                transition={{ duration: 2, repeat: isPlaying ? Infinity : 0, ease: "linear" }}
                style={{ color: theme.text }}
              >
                <ShapeIcon />
              </motion.div>
              <span className="font-light tracking-wider" style={{ color: theme.text }}>AI FORM</span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(!showSettings)}
                className="w-8 h-8 hover:bg-black/10"
                style={{ color: theme.text }}
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(true)}
                className="w-8 h-8 hover:bg-black/10"
                style={{ color: theme.text }}
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="w-8 h-8 hover:bg-black/10"
                style={{ color: theme.text }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Settings Panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 border overflow-hidden"
                style={{
                  backgroundColor: backgroundImage ? 'rgba(255,255,255,0.9)' : `${theme.bg}ee`,
                  borderColor: theme.accent + '40',
                  borderRadius: currentShape === 'square' ? '0' : '12px'
                }}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-2 font-light" style={{ color: theme.text }}>
                      Background Image
                    </label>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="ghost"
                        size="sm"
                        className="justify-start gap-2 hover:bg-black/10 flex-1"
                        style={{ color: theme.text }}
                      >
                        <Upload className="w-4 h-4" />
                        Upload Image
                      </Button>
                      {backgroundImage && (
                        <Button
                          onClick={() => setBackgroundImage(null)}
                          variant="ghost"
                          size="sm"
                          className="hover:bg-black/10"
                          style={{ color: theme.text }}
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2 font-light" style={{ color: theme.text }}>
                      Color Theme
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {colorThemes.map((themeOption, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentTheme(index)}
                          className={`w-full h-8 border rounded ${
                            currentTheme === index ? 'ring-2' : ''
                          }`}
                          style={{
                            backgroundColor: themeOption.bg,
                            borderColor: themeOption.text + '40',
                            ringColor: themeOption.accent
                          }}
                        >
                          <span
                            className="text-xs font-light"
                            style={{ color: themeOption.text }}
                          >
                            {themeOption.name.split(' ')[0]}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Station Display */}
          <div className="text-center mb-8">
            <motion.h3
              key={station.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-light tracking-wide mb-2"
              style={{ color: theme.text }}
            >
              {station.name}
            </motion.h3>
            <div className="font-light text-sm" style={{ color: theme.text + 'aa' }}>
              {station.frequency} • {station.genre}
            </div>
          </div>

          {/* Real-time Geometric Visualizer */}
          <div className="flex items-end justify-center gap-2 h-16 mb-8">
            {waveAnimation.map((height, index) => (
              <motion.div
                key={index}
                style={{
                  width: currentShape === 'circle' ? '4px' :
                         currentShape === 'triangle' ? '3px' : '6px',
                  height: `${Math.max(4, height)}px`,
                  borderRadius: currentShape === 'circle' ? '50%' : '0',
                  clipPath: currentShape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none',
                  backgroundColor: theme.accent
                }}
                animate={{
                  height: `${Math.max(4, height)}px`
                }}
                transition={{ duration: 0.1 }}
              />
            ))}
          </div>

          {/* Now Playing with Live Progress */}
          <motion.div
            key={station.track}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mb-8"
          >
            <div
              className="border p-4"
              style={{
                borderColor: theme.accent + '40',
                borderRadius: currentShape === 'square' ? '0' : '12px',
                backgroundColor: backgroundImage ? 'rgba(255,255,255,0.7)' : 'transparent'
              }}
            >
              <div className="font-light mb-1" style={{ color: theme.text }}>{station.track}</div>
              <div className="text-sm font-light" style={{ color: theme.text + 'aa' }}>{station.artist}</div>

              {/* Live Progress Line */}
              <div className="mt-4">
                <div
                  className="w-full h-px overflow-hidden"
                  style={{ backgroundColor: theme.accent + '40' }}
                >
                  <div
                    className="h-full transition-all duration-1000"
                    style={{
                      width: `${(playTime % 160) / 160 * 100}%`,
                      backgroundColor: theme.accent
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs mt-1 font-light" style={{ color: theme.text + '60' }}>
                  <span>{formatTime(playTime % 160)}</span>
                  <span>2:40</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Functional Controls */}
          <div className="flex items-center justify-center gap-6 mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => switchStation('prev')}
              className="w-10 h-10 hover:bg-black/10 rounded-none"
              style={{ color: theme.text }}
            >
              <SkipBack className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="lg"
              onClick={handlePlayPause}
              className="relative w-16 h-16 hover:bg-black/10"
              style={{
                borderRadius: currentShape === 'circle' ? '50%' :
                           currentShape === 'square' ? '0' : '8px',
                border: `2px solid ${theme.accent}`,
                clipPath: currentShape === 'triangle' ? 'polygon(50% 15%, 15% 85%, 85% 85%)' : 'none',
                color: theme.text
              }}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => switchStation('next')}
              className="w-10 h-10 hover:bg-black/10 rounded-none"
              style={{ color: theme.text }}
            >
              <SkipForward className="w-5 h-5" />
            </Button>
          </div>

          {/* Real Volume Control */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMute}
              className="w-8 h-8 hover:bg-black/10 rounded-none"
              style={{ color: theme.text }}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>

            <div className="flex-1 relative">
              <div
                className="w-full h-px"
                style={{ backgroundColor: theme.accent + '40' }}
              />
              <div
                className="absolute top-0 left-0 h-px transition-all duration-300"
                style={{
                  width: `${volume * 100}%`,
                  backgroundColor: theme.accent
                }}
              />
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume * 100}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="absolute inset-0 w-full opacity-0 cursor-pointer"
              />
            </div>

            <span className="text-xs font-light w-8" style={{ color: theme.text }}>{isMuted ? 0 : Math.round(volume * 100)}</span>
          </div>

          {/* Station Indicators */}
          <div className="flex justify-center gap-3 mt-6">
            {stations.slice(0, 6).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStationIndex(index)}
                className={`w-2 h-2 transition-all duration-300 ${
                  index === currentStationIndex ? 'opacity-100' : 'opacity-30'
                }`}
                style={{
                  backgroundColor: theme.accent,
                  borderRadius: getStationShape(index) === 'circle' ? '50%' : '0',
                  clipPath: getStationShape(index) === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none'
                }}
              />
            ))}
          </div>

          {/* Live Status */}
          <div className="flex items-center justify-center mt-6">
            <div className="flex items-center gap-2 px-3 py-1" style={{ backgroundColor: `${theme.accent}10` }}>
              <div
                className={`w-1 h-1 ${isPlaying ? 'animate-pulse' : ''}`}
                style={{
                  backgroundColor: isPlaying ? theme.accent : `${theme.text}50`,
                  borderRadius: currentShape === 'circle' ? '50%' : '0',
                  clipPath: currentShape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none'
                }}
              />
              <span className="text-xs font-light" style={{ color: theme.text }}>
                {isPlaying ? 'STREAMING' : 'PAUSED'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}