
import { Message } from "@/types/chat";
import { useEffect, useRef, useState } from "react";
import { CheckCheck, Clock, Download, Heart, Image, MessageSquare, Mic, Play, Smile, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MessageListProps {
  messages: Message[];
}

export const MessageList = ({ messages }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [imagesLoaded, setImagesLoaded] = useState<{[key: string]: boolean}>({});
  const [showReactions, setShowReactions] = useState<{[key: string]: boolean}>({});
  const [activeAudio, setActiveAudio] = useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Group messages by date for better organization
  const groupedMessages = messages.reduce<{ date: string; messages: Message[] }[]>((acc, message) => {
    const messageDate = new Date(message.timestamp).toLocaleDateString();
    const existingGroup = acc.find(group => group.date === messageDate);
    
    if (existingGroup) {
      existingGroup.messages.push(message);
    } else {
      acc.push({ date: messageDate, messages: [message] });
    }
    
    return acc;
  }, []);

  const formatMessageTime = (date: Date) => {
    return new Intl.DateTimeFormat('default', {
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  const handleImageLoad = (messageId: string) => {
    setImagesLoaded(prev => ({
      ...prev,
      [messageId]: true
    }));
  };

  const toggleReactions = (messageId: string) => {
    setShowReactions(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  const playVoiceMessage = (messageId: string, audioUrl: string) => {
    if (activeAudio === messageId) {
      // Stop playing
      setActiveAudio(null);
      const audioElement = document.getElementById(`audio-${messageId}`) as HTMLAudioElement;
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
    } else {
      // Stop any currently playing audio
      if (activeAudio) {
        const currentAudio = document.getElementById(`audio-${activeAudio}`) as HTMLAudioElement;
        if (currentAudio) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
        }
      }
      
      // Start playing the new audio
      setActiveAudio(messageId);
      const audioElement = document.getElementById(`audio-${messageId}`) as HTMLAudioElement;
      if (audioElement) {
        audioElement.play();
        audioElement.onended = () => setActiveAudio(null);
      }
    }
  };

  const isMessageToday = (date: string) => {
    const today = new Date().toLocaleDateString();
    return date === today;
  };

  const isMessageYesterday = (date: string) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date === yesterday.toLocaleDateString();
  };

  const getFormattedDate = (date: string) => {
    if (isMessageToday(date)) {
      return 'Today';
    } else if (isMessageYesterday(date)) {
      return 'Yesterday';
    } else {
      return new Date(date).toLocaleDateString(undefined, { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getDeliveryStatusIcon = (message: Message) => {
    if (!message.sent) return null;
    
    if (message.read) {
      return <CheckCheck className="w-3 h-3 text-blue-500" />;
    } else if (message.delivery_status === "delivered") {
      return <CheckCheck className="w-3 h-3 text-muted-foreground" />;
    } else {
      return <Clock className="w-3 h-3 text-muted-foreground" />;
    }
  };

  return (
    <div 
      className="flex-1 overflow-y-auto p-4 space-y-6"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle' font-family='Arial' font-size='20' fill='%23E2E8F0' opacity='0.07'%3E💬 💭 ✨%3C/text%3E%3C/svg%3E")`,
        backgroundColor: 'var(--secondary)',
        backgroundBlendMode: 'overlay'
      }}
    >
      {groupedMessages.map((group, groupIndex) => (
        <div key={group.date} className="space-y-4">
          <div className="flex justify-center">
            <span className="px-3 py-1 text-xs bg-secondary/80 backdrop-blur-sm rounded-full text-muted-foreground shadow-sm">
              {getFormattedDate(group.date)}
            </span>
          </div>
          
          {group.messages.map((message, messageIndex) => {
            const prevMessage = messageIndex > 0 ? group.messages[messageIndex - 1] : null;
            const isSequence = prevMessage && prevMessage.sender_id === message.sender_id;
            
            const nextMessage = messageIndex < group.messages.length - 1 ? group.messages[messageIndex + 1] : null;
            const isNextFromSameSender = nextMessage && nextMessage.sender_id === message.sender_id;
            
            let borderRadiusClass = "";
            if (message.sent) {
              borderRadiusClass = isSequence 
                ? (isNextFromSameSender ? "rounded-tr-none rounded-br-none" : "rounded-tr-none") 
                : (isNextFromSameSender ? "rounded-br-none" : "");
            } else {
              borderRadiusClass = isSequence 
                ? (isNextFromSameSender ? "rounded-tl-none rounded-bl-none" : "rounded-tl-none") 
                : (isNextFromSameSender ? "rounded-bl-none" : "");
            }
            
            const messageTimestamp = new Date(message.timestamp);
            const animationDelay = `${(messageIndex * 100) + (groupIndex * 200)}ms`;
            
            return (
              <div
                key={message.id}
                className={`flex ${message.sent ? 'justify-end' : 'justify-start'} ${
                  isSequence ? 'mt-1' : 'mt-4'
                } group`}
              >
                <div
                  className={`message-bubble max-w-[80%] p-3 rounded-2xl ${
                    message.sent
                      ? 'bg-primary text-primary-foreground ml-auto'
                      : 'bg-secondary text-secondary-foreground'
                  } ${borderRadiusClass} shadow-lg hover:scale-[1.01] transition-all duration-200 animate-fade-up relative`}
                  style={{ 
                    animationDelay,
                    animationDuration: '300ms'
                  }}
                  onDoubleClick={() => toggleReactions(message.id)}
                >
                  {showReactions[message.id] && (
                    <div className="absolute -top-10 left-0 right-0 flex justify-center gap-1 p-1 bg-card/90 backdrop-blur-sm rounded-full shadow-lg animate-fade-down">
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-primary/20">
                        <ThumbsUp className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-primary/20">
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-primary/20">
                        <Smile className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  {message.is_sticker ? (
                    <div className="flex flex-col items-center">
                      <div className="relative group">
                        <img 
                          src={message.sticker_url} 
                          alt="Sticker" 
                          className={`max-w-[150px] max-h-[150px] object-contain rounded-lg hover:scale-110 transition-transform duration-200 ${
                            !imagesLoaded[message.id] ? 'opacity-0' : 'opacity-100'
                          }`}
                          loading="lazy"
                          onLoad={() => handleImageLoad(message.id)}
                        />
                        {!imagesLoaded[message.id] && (
                          <div className="absolute inset-0 flex items-center justify-center bg-secondary/50 rounded-lg">
                            <Image className="w-6 h-6 text-muted-foreground animate-pulse" />
                          </div>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute top-1 right-1 h-6 w-6 rounded-full bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => window.open(message.sticker_url, '_blank')}
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                      <span className="text-xs opacity-70 mt-1 self-end flex items-center gap-1">
                        {formatMessageTime(messageTimestamp)}
                        {getDeliveryStatusIcon(message)}
                      </span>
                    </div>
                  ) : message.is_voice ? (
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 relative min-w-[120px]">
                        <audio id={`audio-${message.id}`} src={message.voice_url} className="hidden" />
                        <Button 
                          variant="secondary" 
                          size="icon" 
                          className={`h-8 w-8 rounded-full ${activeAudio === message.id ? 'bg-primary/20' : ''}`}
                          onClick={() => playVoiceMessage(message.id, message.voice_url!)}
                        >
                          {activeAudio === message.id ? (
                            <span className="relative flex h-4 w-4">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-4 w-4 bg-primary"></span>
                            </span>
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                        <div className="h-2 bg-secondary-foreground/20 rounded-full flex-1">
                          <div className={`h-full bg-primary rounded-full ${activeAudio === message.id ? 'animate-[grow_8s_linear_forwards]' : ''}`} style={{ width: activeAudio === message.id ? '100%' : '0%' }}></div>
                        </div>
                        <span className="text-xs opacity-70">0:08</span>
                      </div>
                      <div className="flex items-center justify-end gap-1 mt-2">
                        <span className="text-xs opacity-70">
                          {formatMessageTime(messageTimestamp)}
                        </span>
                        {getDeliveryStatusIcon(message)}
                      </div>
                    </div>
                  ) : message.is_image ? (
                    <div className="flex flex-col">
                      <div className="relative group rounded-lg overflow-hidden">
                        <img 
                          src={message.image_url} 
                          alt="Image" 
                          className={`max-w-full object-cover rounded-lg hover:scale-105 transition-transform duration-300 ${
                            !imagesLoaded[message.id] ? 'opacity-0' : 'opacity-100'
                          }`}
                          loading="lazy"
                          onLoad={() => handleImageLoad(message.id)}
                        />
                        {!imagesLoaded[message.id] && (
                          <div className="absolute inset-0 flex items-center justify-center bg-secondary/50 rounded-lg">
                            <Image className="w-6 h-6 text-muted-foreground animate-pulse" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-full bg-background/60 hover:bg-background/80"
                            onClick={() => window.open(message.image_url, '_blank')}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-xs opacity-70">
                          {formatMessageTime(messageTimestamp)}
                        </span>
                        {getDeliveryStatusIcon(message)}
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <p className="break-words">{message.content}</p>
                      {message.reaction_type && (
                        <div className="absolute -bottom-3 right-0 bg-card rounded-full p-1 shadow-lg">
                          {message.reaction_type === "like" && <ThumbsUp className="w-3 h-3 text-blue-500" />}
                          {message.reaction_type === "love" && <Heart className="w-3 h-3 text-red-500" />}
                          {message.reaction_type === "laugh" && <Smile className="w-3 h-3 text-yellow-500" />}
                        </div>
                      )}
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-xs opacity-70">
                          {formatMessageTime(messageTimestamp)}
                        </span>
                        {getDeliveryStatusIcon(message)}
                      </div>
                    </div>
                  )}
                </div>
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity mx-1 my-auto rounded-full"
                        onClick={() => toggleReactions(message.id)}
                      >
                        <Smile className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>React to message</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            );
          })}
        </div>
      ))}
      {messages.length === 0 && (
        <div className="h-full flex flex-col items-center justify-center text-center p-4 opacity-60">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <MessageSquare className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-medium mb-2">No messages yet</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Start the conversation by sending a message, sticker, or media file.
          </p>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};
