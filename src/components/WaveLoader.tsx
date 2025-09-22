import React from 'react';
import styled from 'styled-components';

interface WaveLoaderProps {
  isPlaying?: boolean;
}

const WaveLoader: React.FC<WaveLoaderProps> = ({ isPlaying = true }) => {
  return (
    <StyledWrapper isPlaying={isPlaying}>
      <ul className="wave-menu">
        <li />
        <li />
        <li />
        <li />
        <li />
        <li />
        <li />
        <li />
        <li />
        <li />
      </ul>
    </StyledWrapper>
  );
};

interface StyledWrapperProps {
  isPlaying: boolean;
}

const StyledWrapper = styled.div<StyledWrapperProps>`
  /* Container styling to match radio player design */
  z-index: 3;
  display: flex;
  align-items: center;
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

  .wave-menu {
    border: none;
    border-radius: 50px;
    width: 200px;
    height: 45px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0;
    margin: 0;
    cursor: pointer;
    transition: ease 0.2s;
    position: relative;
    background: transparent;
  }

  .wave-menu li {
    list-style: none;
    height: 30px;
    width: 4px;
    border-radius: 10px;
    background: linear-gradient(to top, #1afbf0, #da00ff);
    margin: 0 6px;
    padding: 0;
    animation-name: ${props => props.isPlaying ? 'wave1' : 'none'};
    animation-duration: 0.3s;
    animation-iteration-count: infinite;
    animation-direction: alternate;
    transition: ease 0.2s;
    opacity: ${props => props.isPlaying ? 1 : 0.3};
  }

  .wave-menu:hover > li {
    background: linear-gradient(to top, #ffffff, #ffffff);
    opacity: 1;
  }

  .wave-menu:hover {
    background: rgba(26, 251, 240, 0.1);
  }

  .wave-menu li:nth-child(2) {
    animation-name: ${props => props.isPlaying ? 'wave2' : 'none'};
    animation-delay: 0.2s;
  }

  .wave-menu li:nth-child(3) {
    animation-name: ${props => props.isPlaying ? 'wave3' : 'none'};
    animation-delay: 0.23s;
    animation-duration: 0.4s;
  }

  .wave-menu li:nth-child(4) {
    animation-name: ${props => props.isPlaying ? 'wave4' : 'none'};
    animation-delay: 0.1s;
    animation-duration: 0.3s;
  }

  .wave-menu li:nth-child(5) {
    animation-delay: 0.5s;
  }

  .wave-menu li:nth-child(6) {
    animation-name: ${props => props.isPlaying ? 'wave2' : 'none'};
    animation-duration: 0.5s;
  }

  .wave-menu li:nth-child(8) {
    animation-name: ${props => props.isPlaying ? 'wave4' : 'none'};
    animation-delay: 0.4s;
    animation-duration: 0.25s;
  }

  .wave-menu li:nth-child(9) {
    animation-name: ${props => props.isPlaying ? 'wave3' : 'none'};
    animation-delay: 0.15s;
  }

  @keyframes wave1 {
    from {
      transform: scaleY(1);
    }

    to {
      transform: scaleY(0.5);
    }
  }

  @keyframes wave2 {
    from {
      transform: scaleY(0.3);
    }

    to {
      transform: scaleY(0.6);
    }
  }

  @keyframes wave3 {
    from {
      transform: scaleY(0.6);
    }

    to {
      transform: scaleY(0.8);
    }
  }

  @keyframes wave4 {
    from {
      transform: scaleY(0.2);
    }

    to {
      transform: scaleY(0.5);
    }
  }
`;

export default WaveLoader;