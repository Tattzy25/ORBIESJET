import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Upload,
  Settings,
  X,
  Minimize2,
  Image as ImageIcon,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAIAudio, getStations, type AIStation } from './ai-audio-service';

export function CustomizableImageRadio({ onClose }: { onClose: () => void }) {
  const [currentStationIndex, setCurrentStationIndex] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [textColor, setTextColor] = useState('#ffffff');
  const [accentColor, setAccentColor] = useState('#ff6b6b');
  const [overlayOpacity, setOverlayOpacity] = useState(0.3);
  const [enableBlur, setEnableBlur] = useState(false);
  const [playTime, setPlayTime] = useState(0);
  const [stations, setStations] = useState<AIStation[]>([]);
  const [stationsLoading, setStationsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Show loading state
  if (stationsLoading || !station) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: -50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="fixed top-6 right-6 z-50"
      >
        <div className="rounded-3xl w-96 border border-white/20 shadow-2xl bg-gray-200 flex items-center justify-center h-64">
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
        className="fixed top-6 right-6 z-50"
      >
        <motion.div
          className="rounded-2xl p-3 border border-white/20 shadow-2xl cursor-pointer overflow-hidden"
          style={{
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
          onClick={() => setIsMinimized(false)}
          whileHover={{ scale: 1.05 }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: `rgba(0,0,0,${overlayOpacity})`,
              backdropFilter: enableBlur ? 'blur(4px)' : 'none'
            }}
          />
          <div className="relative flex items-center gap-3">
            <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
            <div className="text-sm" style={{ color: textColor }}>
              {station.name}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handlePlayPause();
              }}
              className="w-6 h-6 hover:bg-white/20"
              style={{ color: textColor }}
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, y: -50 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.8, opacity: 0, y: -50 }}
      className="fixed top-6 right-6 z-50"
    >
      <motion.div
        className="rounded-3xl w-96 border border-white/20 shadow-2xl overflow-hidden relative"
        style={{
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Customizable overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: `rgba(0,0,0,${overlayOpacity})`,
            backdropFilter: enableBlur ? 'blur(4px)' : 'none'
          }}
        />

        <div className="relative p-6">
          {/* Header Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/20">
                <ImageIcon className="w-4 h-4" style={{ color: textColor }} />
              </div>
              <span style={{ color: textColor }}>AI CUSTOM RADIO</span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(!showSettings)}
                className="w-8 h-8 hover:bg-white/20"
                style={{ color: textColor }}
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(true)}
                className="w-8 h-8 hover:bg-white/20"
                style={{ color: textColor }}
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="w-8 h-8 hover:bg-white/20"
                style={{ color: textColor }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Enhanced Settings Panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-4 rounded-2xl border border-white/20 overflow-hidden"
                style={{ backgroundColor: `rgba(0,0,0,${Math.max(0.4, overlayOpacity)})` }}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-2" style={{ color: textColor }}>Background Image</label>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="ghost"
                        className="justify-start gap-2 hover:bg-white/20 flex-1"
                        style={{ color: textColor }}
                      >
                        <Upload className="w-4 h-4" />
                        Upload Image
                      </Button>
                      {backgroundImage && (
                        <Button
                          onClick={() => setBackgroundImage(null)}
                          variant="ghost"
                          className="hover:bg-white/20"
                          style={{ color: textColor }}
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
                    <label className="block text-sm mb-2" style={{ color: textColor }}>Text Color</label>
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-full h-8 rounded-lg border border-white/20 bg-transparent cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2" style={{ color: textColor }}>Accent Color</label>
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-full h-8 rounded-lg border border-white/20 bg-transparent cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2" style={{ color: textColor }}>
                      Overlay Darkness: {Math.round(overlayOpacity * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="0.8"
                      step="0.1"
                      value={overlayOpacity}
                      onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                      className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm" style={{ color: textColor }}>Background Blur</label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEnableBlur(!enableBlur)}
                        className="h-8 w-16 hover:bg-white/20"
                        style={{ color: textColor }}
                      >
                        {enableBlur ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Station Display */}
          <div className="text-center mb-6">
            <motion.h3
              key={station.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl mb-2"
              style={{ color: textColor }}
            >
              {station.name}
            </motion.h3>
            <div className="flex items-center justify-center gap-3 text-sm">
              <span className="font-mono" style={{ color: textColor }}>{station.frequency} MHz</span>
              <Badge
                variant="outline"
                className="border-white/30 text-xs"
                style={{ color: textColor, borderColor: `${textColor}50` }}
              >
                {station.genre}
              </Badge>
            </div>
          </div>

          {/* Now Playing with Live Progress */}
          <motion.div
            key={station.track}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mb-6"
          >
            <div
              className="rounded-2xl p-4 border border-white/20"
              style={{ backgroundColor: `rgba(0,0,0,${Math.max(0.2, overlayOpacity * 0.8)})` }}
            >
              <div className="mb-1" style={{ color: textColor }}>{station.track}</div>
              <div className="text-sm opacity-75" style={{ color: textColor }}>{station.artist}</div>

              {/* Live Progress Bar */}
              <div className="mt-3">
                <div className="w-full bg-white/20 rounded-full h-1 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${(playTime % 200) / 200 * 100}%`,
                      backgroundColor: accentColor,
                      boxShadow: `0 0 10px ${accentColor}60`
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs mt-1" style={{ color: textColor, opacity: 0.7 }}>
                  <span>{formatTime(playTime % 200)}</span>
                  <span>3:20</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Functional Controls */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => switchStation('prev')}
              className="w-10 h-10 hover:bg-white/20"
              style={{ color: textColor }}
            >
              <SkipBack className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="lg"
              onClick={handlePlayPause}
              className="relative w-14 h-14 rounded-full hover:bg-white/20"
              style={{
                backgroundColor: `${accentColor}30`,
                borderColor: accentColor,
                color: textColor
              }}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{
                  boxShadow: isPlaying ? `0 0 20px ${accentColor}60` : 'none'
                }}
              />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => switchStation('next')}
              className="w-10 h-10 hover:bg-white/20"
              style={{ color: textColor }}
            >
              <SkipForward className="w-5 h-5" />
            </Button>
          </div>

          {/* Real Volume Control */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMute}
              className="w-8 h-8 hover:bg-white/20"
              style={{ color: textColor }}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>

            <div className="flex-1">
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume * 100}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${accentColor} 0%, ${accentColor} ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%, rgba(255,255,255,0.2) 100%)`
                }}
              />
            </div>

            <span className="text-xs w-8" style={{ color: textColor }}>{isMuted ? 0 : Math.round(volume * 100)}</span>
          </div>

          {/* Live Status Indicator */}
          <div className="flex items-center justify-center mt-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10">
              <div
                className={`w-2 h-2 rounded-full transition-all duration-300 ${isPlaying ? 'animate-pulse' : ''}`}
                style={{ backgroundColor: isPlaying ? accentColor : `${textColor}50` }}
              />
              <span className="text-xs" style={{ color: textColor }}>
                {isPlaying ? 'LIVE STREAMING' : 'PAUSED'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}