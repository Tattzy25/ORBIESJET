import { useState, useEffect } from "react";
import { ShaderCanvas } from "./ShaderCanvas";
import { BlueWaveRadio } from "../shaders/blue-wave/BlueWaveRadio";

export default function BlueWaveEmbedPage() {
  const [canvasSize, setCanvasSize] = useState(300);

  // Set transparent background for embedding
  useEffect(() => {
    // Remove any background colors for iframe embedding
    document.body.style.background = 'transparent';
    document.documentElement.style.background = 'transparent';
    
    // Add embed-specific styles
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
  }, []);

  // Responsive canvas sizing for embed
  useEffect(() => {
    const handleResize = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Make it responsive to iframe size
      const size = Math.min(viewportWidth - 40, viewportHeight - 40, 400);
      setCanvasSize(Math.max(200, size));
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="w-full h-screen flex items-center justify-center relative bg-transparent">
      {/* Blue Wave Shader for Embedding */}
      <div className="relative flex-shrink-0">
        <ShaderCanvas
          size={canvasSize}
          shaderId={1}
        />
        
        {/* Blue Wave Radio Player */}
        <BlueWaveRadio canvasSize={canvasSize} />
      </div>
    </div>
  );
}