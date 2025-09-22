export interface BWRadioProps {
  canvasSize: number;
}

export interface TrackInfo {
  title: string;
  artist: string;
}

declare global {
  interface Window {
    SC: any;
  }
}

export interface SoundCloudWidget {
  bind: (event: string, callback: Function) => void;
  getCurrentSound: (callback: (sound: any) => void) => void;
  getPosition: (callback: (position: number) => void) => void;
  getDuration: (callback: (duration: number) => void) => void;
  play: () => void;
  pause: () => void;
  isPaused: (callback: (paused: boolean) => void) => void;
  seekTo: (position: number) => void;
  setVolume: (volume: number) => void;
  getVolume: (callback: (volume: number) => void) => void;
  next: () => void;
  prev: () => void;
}

export interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  currentTrackInfo: TrackInfo;
  audioData: number[];
}