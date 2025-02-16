
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
      className={`fixed inset-0 bg-background flex items-center justify-center transition-opacity duration-500 ${
        isAnimating ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="flex flex-col items-center gap-4 animate-fade-up">
        <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center">
          <MessageCircle className="w-12 h-12 text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-bold text-foreground">Aditron</h1>
      </div>
    </div>
  );
};
