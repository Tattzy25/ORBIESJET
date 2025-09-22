import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { Button } from './ui/button';
import { aiAudioService, getStations, AIStation } from './ai-audio-service';

interface ClassiciPodRadioProps {
  onClose: () => void;
}

export function ClassiciPodRadio({ onClose }: ClassiciPodRadioProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStation, setCurrentStation] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedMenuItem, setSelectedMenuItem] = useState(0);
  const [showMenu, setShowMenu] = useState(true);
  const [clickWheelAngle, setClickWheelAngle] = useState(0);
  const [stations, setStations] = useState<AIStation[]>([]);
  const [loading, setLoading] = useState(true);
  const clickWheelRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const menuItems = [
    'Now Playing',
    'Music',
    'Stations',
    'Settings'
  ];

  // Load stations from API
  useEffect(() => {
    const loadStations = async () => {
      try {
        setLoading(true);
        const fetchedStations = await getStations();
        setStations(fetchedStations);
        console.log('iPod loaded stations:', fetchedStations);
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
      }
    }, 1000);

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

    const newStation = direction === 'next'
      ? (currentStation + 1) % stations.length
      : (currentStation - 1 + stations.length) % stations.length;

    setCurrentStation(newStation);
    if (isPlaying) {
      await aiAudioService.playStation(stations[newStation]);
    }
  };

  const handleVolumeChange = (delta: number) => {
    const newVolume = Math.max(0, Math.min(1, volume + delta));
    setVolume(newVolume);
    aiAudioService.setVolume(newVolume);
  };

  const handleClickWheelMove = (e: React.MouseEvent) => {
    if (!clickWheelRef.current || !isDragging.current) return;

    const rect = clickWheelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    const normalizedAngle = (angle + 360) % 360;

    const deltaAngle = normalizedAngle - clickWheelAngle;
    setClickWheelAngle(normalizedAngle);

    if (Math.abs(deltaAngle) > 10) {
      if (showMenu) {
        const direction = deltaAngle > 0 ? 1 : -1;
        setSelectedMenuItem(prev => (prev + direction + menuItems.length) % menuItems.length);
      } else {
        const direction = deltaAngle > 0 ? 0.1 : -0.1;
        handleVolumeChange(direction);
      }
    }
  };

  const handleCenterClick = () => {
    if (showMenu) {
      if (selectedMenuItem === 0) {
        setShowMenu(false);
      } else if (selectedMenuItem === 1) {
        handleStationChange('next');
      } else if (selectedMenuItem === 2) {
        setShowMenu(false);
      }
    } else {
      handlePlay();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 50 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ rotateY: -15 }}
        animate={{ rotateY: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="relative w-56 h-96 bg-gradient-to-b from-gray-100 via-white to-gray-50 rounded-3xl shadow-2xl"
        style={{
          background: `
            linear-gradient(145deg, #f8f9fa 0%, #ffffff 15%, #f1f3f5 85%, #e9ecef 100%)
          `,
          boxShadow: `
            0 20px 40px rgba(0,0,0,0.15),
            0 8px 16px rgba(0,0,0,0.1),
            inset 0 1px 0 rgba(255,255,255,0.8),
            inset 0 -1px 0 rgba(0,0,0,0.05)
          `,
          border: '1px solid rgba(0,0,0,0.08)'
        }}
      >
        {/* Close Button */}
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="absolute -top-12 right-0 text-white hover:bg-white/20 z-10"
        >
          <X className="w-6 h-6" />
        </Button>

        {/* iPod Header */}
        <div className="text-center pt-4 pb-3">
          <div className="text-gray-500 text-xs tracking-[3px] font-light">iPod nano</div>
        </div>

        {/* Screen - Much more realistic proportions */}
        <div className="mx-4 mb-4 h-24 bg-gradient-to-b from-gray-900 to-black rounded-lg border border-gray-300 relative overflow-hidden">
          <div className="absolute inset-0.5 bg-black rounded-md">
            {/* Realistic LCD backlight */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-transparent rounded-md" />

            {/* Screen Content */}
            <div className="p-2 h-full flex flex-col text-white text-xs font-sans">
              {showMenu ? (
                <div className="space-y-0.5">
                  <div className="text-center text-xs mb-1 text-gray-300">iPod</div>
                  {menuItems.map((item, index) => (
                    <div
                      key={item}
                      className={`px-1.5 py-0.5 text-xs ${
                        selectedMenuItem === index
                          ? 'bg-blue-500 text-white rounded'
                          : 'text-gray-300'
                      }`}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col justify-between h-full">
                  <div className="text-center">
                    <div className="text-xs text-gray-400 mb-0.5">Now Playing</div>
                    <div className="text-xs text-white truncate">
                      {stations[currentStation]?.name || 'No Station'}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {stations[currentStation]?.artist || 'Unknown Artist'}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="flex justify-center items-center mb-1">
                      {isPlaying ? (
                        <motion.div className="flex gap-0.5">
                          <motion.div
                            animate={{ scaleY: [0.3, 1, 0.3] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                            className="w-0.5 h-2 bg-white"
                          />
                          <motion.div
                            animate={{ scaleY: [0.3, 1, 0.3] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
                            className="w-0.5 h-2 bg-white"
                          />
                          <motion.div
                            animate={{ scaleY: [0.3, 1, 0.3] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                            className="w-0.5 h-2 bg-white"
                          />
                        </motion.div>
                      ) : (
                        <div className="w-2 h-2 border border-gray-400 rounded-full" />
                      )}
                    </div>
                    <div className="text-xs text-gray-300">{formatTime(currentTime)}</div>
                  </div>

                  <div className="flex justify-center items-center gap-2">
                    <Volume2 className="w-3 h-3 text-gray-400" />
                    <div className="w-12 h-1 bg-gray-700 rounded">
                      <div
                        className="h-full bg-white rounded transition-all duration-200"
                        style={{ width: `${volume * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Click Wheel - More realistic design */}
        <div className="flex justify-center">
          <div
            ref={clickWheelRef}
            className="relative w-36 h-36 rounded-full cursor-pointer"
            style={{
              background: `
                linear-gradient(145deg, #f1f3f5 0%, #e9ecef 50%, #dee2e6 100%)
              `,
              boxShadow: `
                inset 0 2px 8px rgba(0,0,0,0.1),
                inset 0 -2px 4px rgba(255,255,255,0.7),
                0 2px 8px rgba(0,0,0,0.05)
              `,
              border: '1px solid rgba(0,0,0,0.1)'
            }}
            onMouseDown={() => { isDragging.current = true; }}
            onMouseUp={() => { isDragging.current = false; }}
            onMouseLeave={() => { isDragging.current = false; }}
            onMouseMove={handleClickWheelMove}
          >
            {/* Touch Ring with subtle texture */}
            <div
              className="absolute inset-3 rounded-full"
              style={{
                background: `
                  conic-gradient(from ${clickWheelAngle}deg,
                    rgba(255,255,255,0.4),
                    rgba(0,0,0,0.05),
                    rgba(255,255,255,0.4)
                  )
                `,
                border: '1px solid rgba(0,0,0,0.08)'
              }}
            />

            {/* Center Button - More realistic */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCenterClick}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-150"
              style={{
                background: `
                  linear-gradient(145deg, #ffffff 0%, #f8f9fa 50%, #e9ecef 100%)
                `,
                boxShadow: `
                  inset 0 1px 3px rgba(255,255,255,0.8),
                  inset 0 -1px 2px rgba(0,0,0,0.1),
                  0 1px 3px rgba(0,0,0,0.1)
                `,
                border: '1px solid rgba(0,0,0,0.08)'
              }}
            >
              {!showMenu && (
                isPlaying ? (
                  <Pause className="w-5 h-5 text-gray-600" />
                ) : (
                  <Play className="w-5 h-5 text-gray-600 ml-0.5" />
                )
              )}
            </motion.button>

            {/* Click wheel labels - positioned precisely on the wheel ring */}
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="absolute top-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 hover:text-gray-700 transition-colors font-medium w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200/50"
            >
              MENU
            </button>

            <button
              onClick={() => handleStationChange('prev')}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 hover:scale-110 transition-transform w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200/50"
            >
              <SkipBack className="w-3 h-3 text-gray-500 hover:text-gray-700" />
            </button>

            <button
              onClick={() => handleStationChange('next')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 hover:scale-110 transition-transform w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200/50"
            >
              <SkipForward className="w-3 h-3 text-gray-500 hover:text-gray-700" />
            </button>

            <button
              onClick={handlePlay}
              className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 hover:text-gray-700 transition-colors font-medium w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200/50"
            >
              PLAY
            </button>
          </div>
        </div>

        {/* Apple Logo - More realistic */}
        <div className="text-center mt-4">
          <div className="inline-block w-4 h-4 relative">
            <svg viewBox="0 0 24 24" className="w-full h-full text-gray-400">
              <path fill="currentColor" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}