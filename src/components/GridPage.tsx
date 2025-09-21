import { useState, useEffect } from "react";
import { ShaderCanvas } from "./ShaderCanvas";
import { ShaderSelector } from "./ShaderSelector";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import "../styles/blur-overlay.css";

export default function GridPage() {
  const [canvasSize, setCanvasSize] = useState(250);
  const [selectedShader, setSelectedShader] = useState(1); // Default to the first shader

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
    const savedShader = localStorage.getItem("selectedShader");
    if (savedShader) {
      setSelectedShader(parseInt(savedShader, 10));
    }
  }, []);

  // Helper function to get blur overlay size class
  const getBlurOverlayClass = () => {
    if (canvasSize <= 180) return "blur-overlay blur-overlay--small";
    if (canvasSize <= 250) return "blur-overlay blur-overlay--medium";
    return "blur-overlay blur-overlay--large";
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Shader Selector - Now positioned fixed on the right */}
      <ShaderSelector
        selectedShader={selectedShader}
        onSelectShader={handleSelectShader}
      />

      {/* 2x2 Grid Layout for Shaders */}
      <div className="flex flex-col items-center justify-center gap-4 sm:gap-8 w-full max-w-4xl">
        {/* Top Row - 2 Shaders */}
        <div className="flex flex-row justify-center gap-4 sm:gap-8 w-full">
          {/* Blue Wave Shader */}
          <Link to="/BW-Radio-Widget">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
            >
              <ShaderCanvas
                size={canvasSize}
                shaderId={1}
              />
              
              {/* Centered Blur Overlay for Blue Wave */}
              <div className={getBlurOverlayClass()} />
            </motion.div>
          </Link>

          {/* Shader 2 */}
          <Link to="/shader2">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
            >
              <ShaderCanvas
                size={canvasSize}
                shaderId={2}
              />
              
              {/* Centered Blur Overlay for Shader 2 */}
              <div className={getBlurOverlayClass()} />
            </motion.div>
          </Link>
        </div>

        {/* Bottom Row - 2 Shaders */}
        <div className="flex flex-row justify-center gap-4 sm:gap-8 w-full">
          {/* Shader 3 */}
          <Link to="/shader3">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
            >
              <ShaderCanvas
                size={canvasSize}
                shaderId={3}
              />
              
              {/* Centered Blur Overlay for Shader 3 */}
              <div className={getBlurOverlayClass()} />
            </motion.div>
          </Link>

          {/* Shader 4 */}
          <Link to="/shader4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="relative flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
            >
              <ShaderCanvas
                size={canvasSize}
                shaderId={4}
              />
              
              {/* Centered Blur Overlay for Shader 4 */}
              <div className={getBlurOverlayClass()} />
            </motion.div>
          </Link>
        </div>
      </div>
    </div>
  );
}