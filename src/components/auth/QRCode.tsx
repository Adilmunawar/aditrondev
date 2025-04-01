
import { useEffect, useRef } from 'react';

interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

export default function QRCode({ value, size = 200, className = '' }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const drawQRCode = async () => {
      if (!canvasRef.current) return;
      
      try {
        // Dynamically import QRCode.js to avoid SSR issues
        const QRCodeLib = await import('qrcode');
        const canvas = canvasRef.current;
        
        // Clear previous QR code
        const context = canvas.getContext('2d');
        if (context) {
          context.clearRect(0, 0, canvas.width, canvas.height);
        }
        
        // Generate new QR code with blue color for better visibility on dark background
        QRCodeLib.toCanvas(canvas, value, {
          width: size,
          margin: 1,
          color: {
            dark: '#3b82f6', // Blue color for QR code
            light: '#000000'  // Black background
          }
        });
      } catch (error) {
        console.error('Failed to generate QR code:', error);
      }
    };
    
    drawQRCode();
  }, [value, size]);
  
  return (
    <canvas 
      ref={canvasRef} 
      width={size} 
      height={size} 
      className={`rounded-md ${className}`}
    />
  );
}
