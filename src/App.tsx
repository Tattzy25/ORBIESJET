import { useState, useEffect } from "react";
import { ShaderCanvas } from "./components/ShaderCanvas";
import { ShaderSelector } from "./components/ShaderSelector";
import { BlueWaveRadio } from "./shaders/blue-wave/BlueWaveRadio";
import { motion } from "framer-motion";

export default function App() {
  const [canvasSize, setCanvasSize] = useState(250);
  const [selectedShader, setSelectedShader] = useState(1); // Default to the first shader

  // Check if we're in embed mode with specific shader
  const urlParams = new URLSearchParams(window.location.search);
  const embedShader = urlParams.get('shader') || (window as any).EMBED_SHADER;
  const isEmbedMode = embedShader !== null;

  // Set dark mode
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  // Adjust canvas size based on window size for 2x2 grid
  useEffect(() => {
    const handleResize = () => {
      // Calculate size to fit 2x2 grid with spacing
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Account for padding and gaps (40px padding + 32px gap)
      const availableWidth = (viewportWidth - 80 - 32) / 2;
      const availableHeight = (viewportHeight - 80 - 32) / 2;
      
      // Use smaller dimension and cap at reasonable sizes
      const maxSize = Math.min(availableWidth, availableHeight);
      const size = Math.max(180, Math.min(maxSize, 300)); // Min 180px, max 300px
      
      setCanvasSize(size);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Handle shader selection
  const handleSelectShader = (id: number) => {
    setSelectedShader(id);
    // Store preference in localStorage for persistence across sessions
    localStorage.setItem("selectedShader", id.toString());
  };

  // Load shader preference from localStorage on initial load
  useEffect(() => {
    if (isEmbedMode && embedShader) {
      setSelectedShader(parseInt(embedShader, 10));
    } else {
      const savedShader = localStorage.getItem("selectedShader");
      if (savedShader) {
        setSelectedShader(parseInt(savedShader, 10));
      }
    }
  }, [isEmbedMode, embedShader]);

  // If in embed mode, show only the requested shader
  if (isEmbedMode && embedShader) {
    const shaderSize = Math.min(window.innerWidth - 40, window.innerHeight - 40, 400);
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
        <div className="relative">
          <ShaderCanvas
            size={shaderSize}
            shaderId={parseInt(embedShader, 10)}
          />
          <div 
            className="blur-overlay"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: `${shaderSize * 0.6}px`,
              height: `${shaderSize * 0.6}px`,
              borderRadius: '50%',
              backdropFilter: 'blur(12px)',
              background: 'rgba(255, 255, 255, 0.05)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              pointerEvents: 'none',
              transition: 'all 0.3s ease',
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Shader Selector - Now positioned fixed on the right */}
      <ShaderSelector
        selectedShader={selectedShader}
        onSelectShader={handleSelectShader}
      />

      {/* 2x2 Grid Layout for Shaders */}
      <div className="flex flex-col items-center justify-center gap-4 sm:gap-20 w-full max-w-4xl">
        {/* Top Row - 2 Shaders */}
        <div className="flex flex-row justify-center gap-4 sm:gap-8 w-full">
          {/* Blue Wave Shader */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative flex-shrink-0"
          >
            <ShaderCanvas
              size={canvasSize}
              shaderId={1}
            />
            
            {/* Blue Wave Radio Player */}
            <BlueWaveRadio canvasSize={canvasSize} />
          </motion.div>

          {/* Shader 2 */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative flex-shrink-0"
          >
            <ShaderCanvas
              size={canvasSize}
              shaderId={2}
            />
          </motion.div>
        </div>

        {/* Bottom Row - 2 Shaders */}
        <div className="flex flex-row justify-center gap-4 sm:gap-8 w-full">
          {/* Shader 3 */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative flex-shrink-0"
          >
            <ShaderCanvas
              size={canvasSize}
              shaderId={3}
            />
          </motion.div>

          {/* Shader 4 */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="relative flex-shrink-0"
          >
            <ShaderCanvas
              size={canvasSize}
              shaderId={4}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}