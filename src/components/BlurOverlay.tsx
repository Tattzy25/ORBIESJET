interface BlurOverlayProps {
  canvasSize: number;
}

export const BlurOverlay = ({ canvasSize }: BlurOverlayProps) => {
  // Helper function to get blur overlay size class
  const getBlurOverlayClass = () => {
    if (canvasSize <= 180) return "blur-overlay blur-overlay--small";
    if (canvasSize <= 250) return "blur-overlay blur-overlay--medium";
    if (canvasSize <= 350) return "blur-overlay blur-overlay--large";
    if (canvasSize <= 450) return "blur-overlay blur-overlay--xlarge";
    return "blur-overlay blur-overlay--xxlarge";
  };

  return <div className={getBlurOverlayClass()} />;
};