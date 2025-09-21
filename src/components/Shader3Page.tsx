import { useState, useEffect } from "react";
import { ShaderCanvas } from "./ShaderCanvas";
// import { SingleShaderEmbedDisplay } from "./SingleShaderEmbedDisplay"; // TODO: Fix when working on Shader 3
import { BlurOverlay } from "./BlurOverlay";
import { motion } from "framer-motion";
import "../styles/blur-overlay.css";

export default function Shader3Page() {
  const [canvasSize, setCanvasSize] = useState(250);

  // Set dark mode
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  // Load shader preference from localStorage on initial load
  useEffect(() => {
    const handleResize = () => {
      // Calculate size to fit viewport with proper scaling
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Use same logic as original for single shader display
      const maxSize = Math.min(viewportWidth - 80, viewportHeight - 80);
      const size = Math.max(250, Math.min(maxSize, 500)); // Larger for single display
      
      setCanvasSize(size);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Shader Display */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative flex-shrink-0"
      >
        <ShaderCanvas
          size={canvasSize}
          shaderId={3}
        />
        
        {/* Centered Blur Overlay for Shader 3 */}
        <BlurOverlay canvasSize={canvasSize} />
      </motion.div>

    </div>
  );
}