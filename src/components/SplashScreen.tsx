
import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";

export const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
      setTimeout(onComplete, 500); // Wait for exit animation
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 bg-[#000000] flex flex-col items-center justify-center transition-opacity duration-500 ${
        isAnimating ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="flex flex-col items-center gap-6 animate-fade-up">
        {/* Logo Container */}
        <div className="w-24 h-24 rounded-2xl bg-[#1EAEDB] flex items-center justify-center shadow-lg shadow-[#1EAEDB]/20">
          <MessageCircle className="w-14 h-14 text-white animate-pulse" />
        </div>
        
        {/* App Name with Futuristic Style */}
        <h1 
          className="text-6xl font-bold text-[#1EAEDB]"
          style={{
            textShadow: '0 0 20px rgba(30, 174, 219, 0.5)',
            fontFamily: 'Inter, sans-serif',
            letterSpacing: '0.1em',
            background: 'linear-gradient(to right, #1EAEDB, #33C3F0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Aditron
        </h1>
      </div>

      {/* Developer Credit */}
      <div className="fixed bottom-8 text-center">
        <p 
          className="text-[#1EAEDB] text-sm font-light tracking-wider"
          style={{
            textShadow: '0 0 10px rgba(30, 174, 219, 0.3)',
          }}
        >
          Proudly Developed by Adil Munawar
        </p>
      </div>
    </div>
  );
};
