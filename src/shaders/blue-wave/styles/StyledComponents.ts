import styled from 'styled-components';

export const BlueWaveRadioWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  pointer-events: auto;

  .bw-radio {
    width: 280px;
    height: 320px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-direction: column;
    padding: 30px 0;
    box-sizing: border-box;
  }

  .bw-radio-cube {
    position: absolute;
    width: 280px;
    height: 280px;
    border-radius: 35px;
    top: 20px;
    left: 0;
  }

  .bw-radio-cube--glowing {
    z-index: 1;
    background-color: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }

  .bw-track-info {
    z-index: 3;
    text-align: center;
    color: white;
    text-shadow: 0 0 10px rgba(26, 251, 240, 0.5);
    margin-top: 20px;
    margin-bottom: 15px;
    width: 240px;
    min-height: 45px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
    padding: 0 10px;
  }

  .bw-track-info h3 {
    margin: 0;
    font-size: 16px;
    font-weight: bold;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    line-height: 1.3;
  }

  .bw-track-info p {
    margin: 5px 0 0 0;
    font-size: 13px;
    opacity: 0.8;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  .bw-audio-indicator {
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    width: 220px;
    margin: 10px 0;
    background: rgba(0, 0, 0, 0.4);
    border-radius: 12px;
    padding: 8px;
    backdrop-filter: blur(15px);
    border: 1px solid rgba(26, 251, 240, 0.2);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }

  .bw-visualizer {
    z-index: 3;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    height: 60px;
    width: 220px;
    margin: 10px 0;
    background: rgba(0, 0, 0, 0.4);
    border-radius: 12px;
    padding: 8px;
    backdrop-filter: blur(15px);
    border: 1px solid rgba(26, 251, 240, 0.2);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    gap: 3px;
  }

  .bw-visualizer-bar {
    flex: 1;
    background: linear-gradient(to top, #1afbf0, #da00ff);
    border-radius: 2px;
    min-height: 4px;
    transition: height 0.1s ease, opacity 0.1s ease;
    max-width: 8px;
  }

  .bw-playing-dots {
    display: flex;
    gap: 4px;
    align-items: center;
  }

  .bw-playing-dots span {
    width: 4px;
    height: 20px;
    background: linear-gradient(to top, #1afbf0, #da00ff);
    border-radius: 2px;
    animation: bw-bounce 1.4s ease-in-out infinite both;
  }

  .bw-playing-dots span:nth-child(1) { animation-delay: -0.32s; }
  .bw-playing-dots span:nth-child(2) { animation-delay: -0.16s; }
  .bw-playing-dots span:nth-child(3) { animation-delay: 0s; }

  @keyframes bw-bounce {
    0%, 80%, 100% { 
      transform: scaleY(0.3);
      opacity: 0.6;
    }
    40% { 
      transform: scaleY(1);
      opacity: 1;
    }
  }

  .bw-paused-icon {
    color: rgba(26, 251, 240, 0.6);
    font-size: 18px;
  }

  .bw-progress-section {
    z-index: 3;
    width: 100%;
    padding: 0 15px;
    margin-top: 12px;
  }

  .bw-time-display {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 6px;
  }

  .bw-progress-bar {
    width: 100%;
    height: 6px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
    cursor: pointer;
    position: relative;
  }

  .bw-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #1afbf0, #da00ff);
    border-radius: 3px;
    transition: width 0.1s ease;
  }

  .bw-controls {
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 25px;
    margin-top: 20px;
    width: 100%;
    padding: 0 15px;
  }

  .bw-control-btn {
    background: linear-gradient(145deg, rgba(26, 251, 240, 0.2), rgba(218, 0, 255, 0.2));
    border: 2px solid transparent;
    background-clip: padding-box;
    border-radius: 50%;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    color: white;
    flex-shrink: 0;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    font-size: 18px;
  }

  .bw-control-btn:hover {
    transform: scale(1.1) translateY(-2px);
    box-shadow: 0 8px 25px rgba(26, 251, 240, 0.4);
    border: 2px solid rgba(26, 251, 240, 0.6);
  }

  .bw-play-btn {
    width: 60px;
    height: 60px;
    background: linear-gradient(145deg, #1afbf0, #da00ff);
    border: none;
    box-shadow: 0 6px 20px rgba(26, 251, 240, 0.5);
  }

  .bw-play-btn:hover {
    background: linear-gradient(145deg, #da00ff, #1afbf0);
    transform: scale(1.15) translateY(-3px);
    box-shadow: 0 10px 30px rgba(26, 251, 240, 0.6);
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .bw-radio {
      width: 180px;
      height: 200px;
      padding: 15px 0;
    }
    
    .bw-radio-cube {
      width: 180px;
      height: 180px;
      border-radius: 20px;
    }
    
    .bw-control-btn {
      width: 32px;
      height: 32px;
      font-size: 12px;
    }
    
    .bw-play-btn {
      width: 40px;
      height: 40px;
    }
    
    .bw-controls {
      gap: 12px;
      padding: 0 8px;
    }
    
    .bw-audio-indicator {
      width: 140px;
      height: 25px;
    }

    .bw-visualizer {
      width: 140px;
      height: 35px;
      gap: 2px;
    }

    .bw-visualizer-bar {
      max-width: 6px;
    }
    
    .bw-track-info {
      width: 160px;
      min-height: 30px;
      margin-top: 12px;
      margin-bottom: 8px;
    }
    
    .bw-track-info h3 {
      font-size: 11px;
    }
    
    .bw-track-info p {
      font-size: 9px;
    }
    
    .bw-progress-section {
      padding: 0 8px;
      margin-top: 6px;
    }
    
    .bw-time-display {
      font-size: 8px;
    }
    
    .bw-progress-bar {
      height: 3px;
    }
  }

  @media (max-width: 480px) {
    .bw-radio {
      width: 160px;
      height: 180px;
      padding: 12px 0;
    }
    
    .bw-radio-cube {
      width: 160px;
      height: 160px;
      border-radius: 18px;
    }
    
    .bw-control-btn {
      width: 28px;
      height: 28px;
      font-size: 10px;
    }
    
    .bw-play-btn {
      width: 36px;
      height: 36px;
    }
    
    .bw-audio-indicator {
      width: 120px;
      height: 20px;
    }

    .bw-visualizer {
      width: 120px;
      height: 30px;
      gap: 1px;
    }

    .bw-visualizer-bar {
      max-width: 4px;
    }
    
    .bw-playing-dots span {
      width: 3px;
      height: 12px;
    }
    
    .bw-track-info {
      width: 140px;
      min-height: 25px;
      margin-top: 10px;
      margin-bottom: 6px;
    }
    
    .bw-track-info h3 {
      font-size: 10px;
    }
    
    .bw-track-info p {
      font-size: 8px;
    }
    
    .bw-controls {
      gap: 10px;
      margin-top: 8px;
    }
    
    .bw-progress-section {
      padding: 0 6px;
      margin-top: 4px;
    }
    
    .bw-time-display {
      font-size: 7px;
    }
    
    .bw-progress-bar {
      height: 2px;
    }
  }
`;