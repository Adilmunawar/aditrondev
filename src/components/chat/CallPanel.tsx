
import { useState, useEffect } from 'react';
import { Phone, Video, Mic, MicOff, VideoOff, X } from 'lucide-react';
import { Button } from '../ui/button';
import { RecentChat } from '@/types/chat';
import { toast } from '../ui/use-toast';

interface CallPanelProps {
  contact: RecentChat;
  callType: 'audio' | 'video';
  onEnd: () => void;
}

export const CallPanel = ({ contact, callType, onEnd }: CallPanelProps) => {
  const [callDuration, setCallDuration] = useState(0);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [connecting, setConnecting] = useState(true);

  useEffect(() => {
    // Simulate call connection
    const connectionTimer = setTimeout(() => {
      setConnecting(false);
      toast({
        title: "Call connected",
        description: `You are now connected with ${contact.name}`,
      });
    }, 2000);

    // Set up call duration timer
    let durationTimer: NodeJS.Timeout;
    if (!connecting) {
      durationTimer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      clearTimeout(connectionTimer);
      if (durationTimer) clearInterval(durationTimer);
    };
  }, [connecting, contact.name]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleMic = () => {
    setIsMicMuted(!isMicMuted);
    toast({
      title: isMicMuted ? "Microphone enabled" : "Microphone muted",
      duration: 2000,
    });
  };

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    toast({
      title: isVideoOff ? "Camera enabled" : "Camera disabled",
      duration: 2000,
    });
  };

  return (
    <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center z-20 animate-fade-in p-4">
      <div className="bg-card p-5 rounded-xl shadow-lg flex flex-col items-center gap-4 max-w-md w-full animate-slide-up">
        {/* Call status indicator */}
        <div className="text-sm font-medium text-muted-foreground">
          {connecting ? (
            <span className="text-primary animate-pulse">Connecting...</span>
          ) : (
            <span>{formatDuration(callDuration)}</span>
          )}
        </div>
        
        {/* Contact info */}
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-2 relative">
          {contact.avatar ? (
            <img 
              src={contact.avatar} 
              alt={contact.name} 
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <>
              {callType === 'audio' ? (
                <Phone className="w-10 h-10 text-primary animate-pulse" />
              ) : (
                <Video className="w-10 h-10 text-primary animate-pulse" />
              )}
            </>
          )}
          
          {connecting && (
            <div className="absolute inset-0 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
          )}
        </div>
        
        <h2 className="text-xl font-bold">{contact.name}</h2>
        <p className="text-muted-foreground">
          {callType === 'audio' ? 'Audio call' : 'Video call'}
          {connecting ? ' - Connecting...' : ' in progress'}
        </p>
        
        {/* Call video placeholder (only for video calls) */}
        {callType === 'video' && !isVideoOff && !connecting && (
          <div className="relative w-full h-48 bg-black/90 rounded-lg mb-2 overflow-hidden flex items-center justify-center">
            {/* Simulated remote video */}
            <div className="absolute inset-0 w-full h-full flex items-center justify-center">
              <p className="text-white/50 text-sm">Remote video feed</p>
            </div>
            
            {/* Simulated local video thumbnail */}
            <div className="absolute bottom-2 right-2 w-24 h-24 bg-gray-800 rounded-md border border-white/20">
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-white/50 text-xs">Your camera</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Call controls */}
        <div className="flex gap-4 mt-4">
          <Button 
            variant={isMicMuted ? "secondary" : "outline"} 
            size="lg" 
            className="rounded-full w-12 h-12 flex items-center justify-center"
            onClick={toggleMic}
          >
            {isMicMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </Button>
          
          {callType === 'video' && (
            <Button 
              variant={isVideoOff ? "secondary" : "outline"} 
              size="lg" 
              className="rounded-full w-12 h-12 flex items-center justify-center"
              onClick={toggleVideo}
            >
              {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
            </Button>
          )}
          
          <Button 
            variant="destructive" 
            size="lg" 
            className="rounded-full w-12 h-12 flex items-center justify-center"
            onClick={onEnd}
          >
            <Phone className="w-6 h-6 rotate-135" />
          </Button>
          
          <Button 
            variant="outline" 
            size="lg" 
            className="rounded-full w-12 h-12 flex items-center justify-center"
            onClick={onEnd}
          >
            <X className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};
