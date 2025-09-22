// AI Audio Service - Handles all audio playback for AI radios
export interface AIStation {
  id: string;
  name: string;
  frequency: string;
  genre: string;
  artist: string;
  track: string;
  audioUrl?: string;
  isLive?: boolean;
  streamUrl?: string;
  description?: string;
}

// API endpoint for real radio stations
const RADIO_API_URL = 'https://five-radio.vercel.app/stations.json';

let AI_STATIONS: AIStation[] = [];
let stationsLoaded = false;

// Fallback stations in case API fails - these have real audio URLs
const FALLBACK_STATIONS: AIStation[] = [
  {
    id: 'fallback-1',
    name: 'Jazz Radio',
    frequency: '88.5',
    genre: 'Jazz',
    artist: 'Various Artists',
    track: 'Live Jazz Stream',
    audioUrl: 'https://jazz-wr01.ice.infomaniak.ch/jazz-wr01-128.mp3',
    streamUrl: 'https://jazz-wr01.ice.infomaniak.ch/jazz-wr01-128.mp3',
    isLive: true
  },
  {
    id: 'fallback-2',
    name: 'Classical Radio',
    frequency: '95.7',
    genre: 'Classical',
    artist: 'Various Artists',
    track: 'Live Classical Stream',
    audioUrl: 'https://streaming.radio.co/s2c5d4b83f/listen',
    streamUrl: 'https://streaming.radio.co/s2c5d4b83f/listen',
    isLive: true
  }
];

// Function to fetch stations from API
async function fetchStations(): Promise<AIStation[]> {
  if (stationsLoaded && AI_STATIONS.length > 0) {
    return AI_STATIONS;
  }

  try {
    console.log('Fetching stations from:', RADIO_API_URL);
    const response = await fetch(RADIO_API_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Fetched stations data:', data);
    
    // Handle different possible API response formats
    const stations = Array.isArray(data) ? data : data.stations || data.data || [];
    
    // Transform API data to our format
    AI_STATIONS = stations.map((station: any, index: number) => ({
      id: station.id || station.name?.toLowerCase().replace(/\s+/g, '-') || `station-${index}`,
      name: station.name || station.title || `Station ${index + 1}`,
      frequency: station.frequency || `${88 + Math.random() * 20}`,
      genre: station.genre || station.category || 'Music',
      artist: station.artist || station.currentArtist || 'Live Radio',
      track: station.track || station.currentTrack || station.description || 'Now Playing',
      audioUrl: station.audioUrl || station.streamUrl || station.url || station.stream,
      streamUrl: station.streamUrl || station.url || station.stream,
      isLive: station.isLive !== undefined ? station.isLive : true,
      description: station.description || station.desc
    }));
    
    stationsLoaded = true;
    console.log('Processed stations:', AI_STATIONS);
    
    if (AI_STATIONS.length === 0) {
      throw new Error('No stations found in API response');
    }
    
    return AI_STATIONS;
  } catch (error) {
    console.error('Failed to fetch stations from API:', error);
    console.log('Using fallback stations');
    AI_STATIONS = FALLBACK_STATIONS;
    stationsLoaded = true;
    return AI_STATIONS;
  }
}

// Export function to get stations (async)
export async function getStations(): Promise<AIStation[]> {
  return await fetchStations();
}

class AIAudioService {
  private audioContext: AudioContext | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private gainNode: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private currentStation: AIStation | null = null;
  private isPlaying = false;
  private volume = 0.7;
  private isMuted = false;
  private listeners: Array<(data: any) => void> = [];

  constructor() {
    this.initializeAudioContext();
  }

  private async initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.analyser = this.audioContext.createAnalyser();
      
      this.analyser.fftSize = 256;
      this.gainNode.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
    } catch (error) {
      console.warn('Web Audio API not supported, falling back to HTML5 audio');
    }
  }

  async playStation(station: AIStation) {
    await this.stop();
    
    this.currentStation = station;
    
    try {
      // Resume audio context if suspended
      if (this.audioContext?.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Create new audio element and try to load the stream
      this.currentAudio = new Audio();
      
      // Use the stream URL from the station
      const streamUrl = station.streamUrl || station.audioUrl;
      if (!streamUrl) {
        throw new Error('No stream URL available for station');
      }

      console.log(`Attempting to play station: ${station.name} with URL: ${streamUrl}`);
      
      this.currentAudio.src = streamUrl;
      this.currentAudio.crossOrigin = 'anonymous';
      this.currentAudio.volume = this.isMuted ? 0 : this.volume;
      
      // Set up error handling
      this.currentAudio.addEventListener('error', (e) => {
        console.error(`Failed to load stream for ${station.name}:`, e);
        this.isPlaying = false;
        this.notifyListeners({
          type: 'error',
          message: `Failed to load stream for ${station.name}`
        });
      });

      this.currentAudio.addEventListener('loadstart', () => {
        console.log(`Loading stream for ${station.name}...`);
      });

      this.currentAudio.addEventListener('canplay', () => {
        console.log(`Stream for ${station.name} is ready to play`);
        this.connectAudioToAnalyser();
      });

      this.currentAudio.addEventListener('playing', () => {
        console.log(`Now playing: ${station.name}`);
        this.isPlaying = true;
        this.notifyListeners({
          type: 'stationChanged',
          station: this.currentStation,
          isPlaying: this.isPlaying
        });
      });

      this.currentAudio.addEventListener('pause', () => {
        this.isPlaying = false;
        this.notifyListeners({
          type: 'playStateChanged',
          isPlaying: this.isPlaying
        });
      });
      
      // Try to play the stream
      await this.currentAudio.play();
      
    } catch (error) {
      console.error('Failed to play station:', error);
      this.isPlaying = false;
      this.notifyListeners({
        type: 'error',
        message: `Failed to play ${station.name}: ${error.message}`
      });
    }
  }

  private connectAudioToAnalyser() {
    if (this.audioContext && this.currentAudio && this.gainNode) {
      try {
        const source = this.audioContext.createMediaElementSource(this.currentAudio);
        source.connect(this.gainNode);
      } catch (error) {
        // Already connected or other error
        console.warn('Could not connect audio to analyser:', error);
      }
    }
  }

  async stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio.src = '';
      this.currentAudio = null;
    }
    
    this.isPlaying = false;
    this.notifyListeners({
      type: 'playStateChanged',
      isPlaying: this.isPlaying
    });
  }

  async pause() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.isPlaying = false;
      this.notifyListeners({
        type: 'playStateChanged',
        isPlaying: this.isPlaying
      });
    }
  }

  async resume() {
    if (this.currentAudio) {
      try {
        await this.currentAudio.play();
        this.isPlaying = true;
        this.notifyListeners({
          type: 'playStateChanged',
          isPlaying: this.isPlaying
        });
      } catch (error) {
        console.warn('Could not resume audio:', error);
      }
    }
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.currentAudio) {
      this.currentAudio.volume = this.isMuted ? 0 : this.volume;
    }
    if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.audioContext!.currentTime);
    }
    this.notifyListeners({
      type: 'volumeChanged',
      volume: this.volume
    });
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.currentAudio) {
      this.currentAudio.volume = muted ? 0 : this.volume;
    }
    if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(muted ? 0 : this.volume, this.audioContext!.currentTime);
    }
    this.notifyListeners({
      type: 'muteChanged',
      isMuted: this.isMuted
    });
  }

  getAnalyserData(): Uint8Array | null {
    if (!this.analyser) return null;
    
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  getSpectrumData(): number[] {
    const data = this.getAnalyserData();
    if (!data) {
      // Return fake spectrum data if no analyser
      return Array(20).fill(0).map(() => Math.random() * (this.isPlaying ? 80 : 10));
    }
    
    // Convert to smaller array for visualization
    const spectrum: number[] = [];
    const bucketSize = Math.floor(data.length / 20);
    
    for (let i = 0; i < 20; i++) {
      let sum = 0;
      for (let j = 0; j < bucketSize; j++) {
        sum += data[i * bucketSize + j];
      }
      spectrum.push(sum / bucketSize);
    }
    
    return spectrum;
  }

  getCurrentStation(): AIStation | null {
    return this.currentStation;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getVolume(): number {
    return this.volume;
  }

  getIsMuted(): boolean {
    return this.isMuted;
  }

  // Event system for radios to listen to changes
  addListener(callback: (data: any) => void) {
    this.listeners.push(callback);
  }

  removeListener(callback: (data: any) => void) {
    this.listeners = this.listeners.filter(l => l !== callback);
  }

  private notifyListeners(data: any) {
    this.listeners.forEach(callback => callback(data));
  }
}

// Singleton instance
export const aiAudioService = new AIAudioService();

// Hook for React components to use the audio service
export function useAIAudio() {
  return {
    playStation: (station: AIStation) => aiAudioService.playStation(station),
    stop: () => aiAudioService.stop(),
    pause: () => aiAudioService.pause(),
    resume: () => aiAudioService.resume(),
    setVolume: (volume: number) => aiAudioService.setVolume(volume),
    setMuted: (muted: boolean) => aiAudioService.setMuted(muted),
    getSpectrumData: () => aiAudioService.getSpectrumData(),
    getCurrentStation: () => aiAudioService.getCurrentStation(),
    getIsPlaying: () => aiAudioService.getIsPlaying(),
    getVolume: () => aiAudioService.getVolume(),
    getIsMuted: () => aiAudioService.getIsMuted(),
    addListener: (callback: (data: any) => void) => aiAudioService.addListener(callback),
    removeListener: (callback: (data: any) => void) => aiAudioService.removeListener(callback)
  };
}