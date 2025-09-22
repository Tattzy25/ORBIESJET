export const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60000);
  const seconds = Math.floor((time % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const calculateProgressPercentage = (currentTime: number, duration: number): number => {
  return duration > 0 ? (currentTime / duration) * 100 : 0;
};

export const calculateSeekPosition = (
  clickX: number, 
  containerWidth: number, 
  duration: number
): number => {
  const percentage = clickX / containerWidth;
  return percentage * duration;
};

export const generateSoundCloudEmbedUrl = (playlistId: string): string => {
  return `https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/${playlistId}&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&visual=false`;
};

export const createSoundCloudIframe = (playlistId: string = '1964027796'): HTMLIFrameElement => {
  const iframe = document.createElement('iframe');
  iframe.width = '0';
  iframe.height = '0';
  iframe.style.display = 'none';
  iframe.src = generateSoundCloudEmbedUrl(playlistId);
  iframe.allow = 'autoplay';
  return iframe;
};

export const loadSoundCloudScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://w.soundcloud.com/player/api.js';
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
};