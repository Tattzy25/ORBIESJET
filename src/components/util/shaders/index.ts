// Modular shader system - clean imports and exports
import { blueWaveShader } from './blueWave';
import { etherShader } from './ether';
import { shootingStarsShader } from './shootingStars';
import { wavyLinesShader } from './wavyLines';
import { vertexShader } from './vertex';
import { shaderConfigs, type ShaderConfig } from './config';

// Export individual shaders for direct use
export { 
  blueWaveShader,
  etherShader, 
  shootingStarsShader,
  wavyLinesShader,
  vertexShader
};

// Export configuration
export { shaderConfigs, type ShaderConfig };

// Combined shader interface for backward compatibility
export interface Shader extends ShaderConfig {
  fragmentShader: string;
}

// Combined shaders array for backward compatibility
export const shaders: Shader[] = [
  {
    ...shaderConfigs[0],
    fragmentShader: blueWaveShader
  },
  {
    ...shaderConfigs[1], 
    fragmentShader: etherShader
  },
  {
    ...shaderConfigs[2],
    fragmentShader: shootingStarsShader
  },
  {
    ...shaderConfigs[3],
    fragmentShader: wavyLinesShader
  }
];