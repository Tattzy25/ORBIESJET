import React from "react";
import { ShaderCanvas } from "./ShaderCanvas";

interface ShaderWithBlurProps {
  size: number;
  shaderId: number;
  className?: string;
}

export const ShaderWithBlur: React.FC<ShaderWithBlurProps> = ({
  size,
  shaderId,
  className = ""
}) => {
  // Calculate blur overlay size class based on canvas size
  const getBlurOverlayClass = () => {
    if (size <= 180) return "blur-overlay blur-overlay--small";
    if (size <= 250) return "blur-overlay blur-overlay--medium";
    return "blur-overlay blur-overlay--large";
  };

  return (
    <div className={`relative ${className}`}>
      <ShaderCanvas
        size={size}
        shaderId={shaderId}
      />

      {/* Integrated Blur Overlay */}
      <div className={getBlurOverlayClass()} />
    </div>
  );
};