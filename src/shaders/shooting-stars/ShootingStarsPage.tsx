import { useEffect } from "react";
import { ShaderCanvas } from "../../components/ShaderCanvas";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function ShootingStarsPage() {
  // Set dark mode
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
      {/* Back button */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 z-10 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
      >
        <ArrowLeft size={20} />
        <span className="text-sm">Back to Grid</span>
      </Link>

      {/* Fullscreen Shader */}
      <div className="w-full h-full flex items-center justify-center">
        <ShaderCanvas
          size={Math.min(window.innerWidth - 40, window.innerHeight - 40, 800)}
          shaderId={3}
        />
      </div>

      {/* Shader name overlay */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white/60 text-sm">
        Shooting Stars
      </div>
    </div>
  );
}