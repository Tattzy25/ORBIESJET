import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipForward, SkipBack, Volume2 } from "lucide-react";
// import "../styles/futuristic-radio.css"; // CSS file doesn't exist

interface FuturisticRadioPlayerProps {
  canvasSize: number;
}

export const FuturisticRadioPlayer = ({ canvasSize }: FuturisticRadioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Demo tracks (using placeholder audio for now - SoundCloud requires special integration)
  const tracks = [
    { id: 1, title: "Station Alpha", artist: "ORBIEJET", url: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmvBCAAAP4EAAa0KS4O8fSUAAAAPAACFnoelj82jbwAQAhAAJ4Q9gUt9gwEBAPqABINGfigAQz8AA1aE8zGPOCJTGwMaAAAAYQA1gUJ+CX5AdgAOYAAAAUGFUH4XuAACAGKFLIFKfXWr+QJKghd/vAJJAoAEj8qOAwJMi0WDOHwQgwMCAKUNAQCHkoeCNH3KAwQPAAA4gQOKAQAyIAABAAGJZQULOzGODgACtgUQCQRdOINJfSiAAG+KEX4QAACUBAV9YAApQgQBQYFKfgJ+fgOAB4pHgUl9S3tFgAOFA38BgQeABYxJgQV+XoEOAACA/lIA/kEKgdqkRAIXjKyHJ3xHhCh+CIE7fUl/AoAGBgBhgAKFAwUOAA6DIH5SgICIeX1qgwOKgAKEYn1QhAAEARAABID/gAGE/4BKdwQBgAGGA4J+fgOAA4AAgf8BAQCPAQAkhggBAo6agSh+AAGCeoQcfUR7aoAXigGEAX6FgoFJevGA/H0HAU6AOHwAAA6HT3xHgdaAAIAMgJSACIFBfUl/BYAMgMKB/ntKhgQBABcAgASGA/1EfQOBAAL+jAQBjQmAgHkAAIAPfAJ9gQGOAwAAAcMAAAQAAAAAwgAAAkMDg4B5e0p+ZAAAAACUA8EEoEAAAACHgAONP3v5AHwAAAAA" },
    { id: 2, title: "Station Beta", artist: "ORBIEJET", url: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmvBCAAAP4EAAa0KS4O8fSUAAAAPAACFnoelj82jbwAQAhAAJ4Q9gUt9gwEBAPqABINGfigAQz8AA1aE8zGPOCJTGwMaAAAAYQA1gUJ+CX5AdgAOYAAAAUGFUH4XuAACAGKFLIFKfXWr+QJKghd/vAJJAoAEj8qOAwJMi0WDOHwQgwMCAKUNAQCHkoeCNH3KAwQPAAA4gQOKAQAyIAABAAGJZQULOzGODgACtgUQCQRdOINJfSiAAG+KEX4QAACUBAV9YAApQgQBQYFKfgJ+fgOAB4pHgUl9S3tFgAOFA38BgQeABYxJgQV+XoEOAACA/lIA/kEKgdqkRAIXjKyHJ3xHhCh+CIE7fUl/AoAGBgBhgAKFAwUOAA6DIH5SgICIeX1qgwOKgAKEYn1QhAAEARAABID/gAGE/4BKdwQBgAGGA4J+fgOAA4AAgf8BAQCPAQAkhggBAo6agSh+AAGCeoQcfUR7aoAXigGEAX6FgoFJevGA/H0HAU6AOHwAAA6HT3xHgdaAAIAMgJSACIFBfUl/BYAMgMKB/ntKhgQBABcAgASGA/1EfQOBAAL+jAQBjQmAgHkAAIAPfAJ9gQGOAwAAAcMAAAQAAAAAwgAAAkMDg4B5e0p+ZAAAAACUA8EEoEAAAACHgAONP3v5AHwAAAAA" },
    { id: 3, title: "Station Gamma", artist: "ORBIEJET", url: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmvBCAAAP4EAAa0KS4O8fSUAAAAPAACFnoelj82jbwAQAhAAJ4Q9gUt9gwEBAPqABINGfigAQz8AA1aE8zGPOCJTGwMaAAAAYQA1gUJ+CX5AdgAOYAAAAUGFUH4XuAACAGKFLIFKfXWr+QJKghd/vAJJAoAEj8qOAwJMi0WDOHwQgwMCAKUNAQCHkoeCNH3KAwQPAAA4gQOKAQAyIAABAAGJZQULOzGODgACtgUQCQRdOINJfSiAAG+KEX4QAACUBAV9YAApQgQBQYFKfgJ+fgOAB4pHgUl9S3tFgAOFA38BgQeABYxJgQV+XoEOAACA/lIA/kEKgdqkRAIXjKyHJ3xHhCh+CIE7fUl/AoAGBgBhgAKFAwUOAA6DIH5SgICIeX1qgwOKgAKEYn1QhAAEARAABID/gAGE/4BKdwQBgAGGA4J+fgOAA4AAgf8BAQCPAQAkhggBAo6agSh+AAGCeoQcfUR7aoAXigGEAX6FgoFJevGA/H0HAU6AOHwAAA6HT3xHgdaAAIAMgJSACIFBfUl/BYAMgMKB/ntKhgQBABcAgASGA/1EfQOBAAL+jAQBjQmAgHkAAIAPfAJ9gQGOAwAAAcMAAAQAAAAAwgAAAkMDg4B5e0p+ZAAAAACUA8EEoEAAAACHgAONP3v5AHwAAAAA" },
  ];

  // Helper function to get blur overlay size class with futuristic styling
  const getPlayerClass = () => {
    let baseSize = "";
    if (canvasSize <= 180) baseSize = "w-[120px] h-[120px]";
    else if (canvasSize <= 250) baseSize = "w-[165px] h-[165px]";
    else if (canvasSize <= 350) baseSize = "w-[198px] h-[198px]";
    else if (canvasSize <= 450) baseSize = "w-[264px] h-[264px]";
    else baseSize = "w-[330px] h-[330px]";
    
    return `${baseSize} futuristic-radio-player`;
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % tracks.length);
  };

  const prevTrack = () => {
    setCurrentTrack((prev) => (prev - 1 + tracks.length) % tracks.length);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Update audio time
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateTime);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateTime);
    };
  }, []);

  // Format time for display
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={getPlayerClass()}>
      {/* Hidden audio element */}
      <audio 
        ref={audioRef}
        src={tracks[currentTrack].url}
      />
      
      {/* Station Display */}
      <div className="station-display">
        <div className="station-text">
          <div className="station-title">{tracks[currentTrack].title}</div>
          <div className="station-artist">{tracks[currentTrack].artist}</div>
        </div>
        <div className="station-number">
          {String(currentTrack + 1).padStart(2, '0')}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="time-display">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="control-buttons">
        <button onClick={prevTrack} className="control-btn" title="Previous Track" aria-label="Previous Track">
          <SkipBack size={16} />
        </button>
        
        <button onClick={togglePlay} className="control-btn play-btn" title={isPlaying ? "Pause" : "Play"} aria-label={isPlaying ? "Pause" : "Play"}>
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        
        <button onClick={nextTrack} className="control-btn" title="Next Track" aria-label="Next Track">
          <SkipForward size={16} />
        </button>
      </div>

      {/* Volume Control */}
      <div className="volume-control">
        <Volume2 size={14} className="volume-icon" />
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={handleVolumeChange}
          className="volume-slider"
          title="Volume Control"
          aria-label="Volume Control"
        />
      </div>
    </div>
  );
};