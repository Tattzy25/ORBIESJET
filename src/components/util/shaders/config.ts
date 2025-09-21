// Shader metadata and configuration
export interface ShaderConfig {
  id: number;
  name: string;
  color: string;
}

export const shaderConfigs: ShaderConfig[] = [
  {
    id: 1,
    name: "Blue Wave",
    color: "#6366f1" // Indigo color
  },
  {
    id: 2,
    name: "Ether",
    color: "#8b5cf6" // Purple color
  },
  {
    id: 3,
    name: "Shooting Stars",
    color: "#ec4899" // Pink color
  },
  {
    id: 4,
    name: "Wavy Lines",
    color: "#10b981" // Emerald color
  }
];