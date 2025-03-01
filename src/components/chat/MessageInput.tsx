
import { useState, useEffect, useRef } from "react";
import { Send, Paperclip, Smile, Mic, Camera, X, Video, Phone } from "lucide-react";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "../ui/button";
import { toast } from "../ui/use-toast";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  chatId?: string | null;
  onStartCall?: (type: 'audio' | 'video') => void;
}

export const MessageInput = ({ onSendMessage, chatId, onStartCall }: MessageInputProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showExtras, setShowExtras] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Focus input on component mount
  useEffect(() => {
    inputRef.current?.focus();
  }, [chatId]);

  // Handle click outside emoji picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle recording time updates
  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        setRecordingTime(0);
      }
    }

    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [isRecording]);

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    onSendMessage(newMessage);
    setNewMessage("");
    setIsTyping(false);
    
    // Clear any existing typing status
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const addEmoji = (emoji: any) => {
    setNewMessage(prev => prev + emoji.native);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);
    
    // Handle typing indicator
    if (value && !isTyping && chatId) {
      setIsTyping(true);
      // Broadcast typing status
      supabase.channel('typing')
        .send({
          type: 'broadcast',
          event: 'typing',
          payload: { chatId, isTyping: true }
        })
        .then(() => console.log("Typing status sent"))
        .catch(error => console.error("Error sending typing status:", error));
    }
    
    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to clear typing status
    typingTimeoutRef.current = setTimeout(() => {
      if (chatId) {
        setIsTyping(false);
        // Broadcast stopped typing
        supabase.channel('typing')
          .send({
            type: 'broadcast',
            event: 'typing',
            payload: { chatId, isTyping: false }
          })
          .then(() => console.log("Stopped typing status sent"))
          .catch(error => console.error("Error sending stopped typing status:", error));
      }
    }, 2000);
  };

  const startRecording = () => {
    // Check if browser supports audio recording
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast({
        title: "Recording not supported",
        description: "Your browser doesn't support audio recording",
        variant: "destructive"
      });
      return;
    }

    setIsRecording(true);
    toast({
      title: "Recording started",
      description: "Recording your voice message...",
    });

    // In a real app, you would start actual recording here
    // navigator.mediaDevices.getUserMedia({ audio: true })
    //   .then(stream => {
    //     const mediaRecorder = new MediaRecorder(stream);
    //     mediaRecorder.start();
    //   })
  };

  const stopRecording = () => {
    setIsRecording(false);
    
    // Simulating send recorded message
    if (recordingTime > 1) {
      toast({
        title: "Voice message sent",
        description: `Voice message (${formatRecordingTime(recordingTime)}) sent successfully`,
      });
      
      // In a real app, you would stop recording and process the audio here
      onSendMessage(`[Voice message - ${formatRecordingTime(recordingTime)}]`);
    } else {
      toast({
        title: "Recording discarded",
        description: "Recording was too short",
      });
    }
  };

  const handleStartCall = (type: 'audio' | 'video') => {
    if (onStartCall) {
      onStartCall(type);
      setShowExtras(false);
    }
  };

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="p-3 bg-card/70 backdrop-blur-sm border-t">
      {isRecording ? (
        <div className="flex items-center gap-3 p-2 px-4 bg-red-50 dark:bg-red-900/20 rounded-full animate-pulse">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium flex-1">{formatRecordingTime(recordingTime)}</span>
          <Button 
            variant="ghost" 
            size="sm"
            className="ml-auto rounded-full hover:bg-red-100 dark:hover:bg-red-900/40"
            onClick={stopRecording}
          >
            Send
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="rounded-full hover:bg-red-100 dark:hover:bg-red-900/40"
            onClick={() => setIsRecording(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-secondary transition-all duration-300 hover:scale-110"
                onClick={() => setShowExtras(!showExtras)}
              >
                <Paperclip className="w-5 h-5 text-muted-foreground" />
              </Button>
              
              {showExtras && (
                <div className="absolute bottom-full left-0 mb-2 bg-card rounded-xl p-2 shadow-lg border border-border animate-fade-up">
                  <div className="grid grid-cols-2 gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="flex flex-col items-center justify-center p-2 h-auto rounded-lg gap-1"
                      onClick={() => handleStartCall('audio')}
                    >
                      <Phone className="w-5 h-5 text-primary" />
                      <span className="text-xs">Call</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="flex flex-col items-center justify-center p-2 h-auto rounded-lg gap-1"
                      onClick={() => handleStartCall('video')}
                    >
                      <Video className="w-5 h-5 text-primary" />
                      <span className="text-xs">Video</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="flex flex-col items-center justify-center p-2 h-auto rounded-lg gap-1"
                      onClick={() => {
                        toast({
                          title: "Feature coming soon",
                          description: "Image upload will be available soon",
                        });
                        setShowExtras(false);
                      }}
                    >
                      <Camera className="w-5 h-5 text-primary" />
                      <span className="text-xs">Image</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="flex flex-col items-center justify-center p-2 h-auto rounded-lg gap-1"
                      onClick={() => {
                        setShowExtras(false);
                        startRecording();
                      }}
                    >
                      <Mic className="w-5 h-5 text-primary" />
                      <span className="text-xs">Audio</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={handleInputChange}
                placeholder="Type a message..."
                className="w-full bg-secondary p-3 pl-4 pr-10 rounded-full focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
              </Button>
            </div>
            
            {newMessage.trim() ? (
              <Button
                type="submit"
                size="icon"
                className="bg-primary hover:bg-primary-hover text-primary-foreground rounded-full transition-all duration-300 hover:scale-110 shadow-md"
              >
                <Send className="w-5 h-5" />
              </Button>
            ) : (
              <Button
                type="button"
                size="icon"
                className="bg-primary hover:bg-primary-hover text-primary-foreground rounded-full transition-all duration-300 hover:scale-110 shadow-md"
                onClick={startRecording}
              >
                <Mic className="w-5 h-5" />
              </Button>
            )}
          </div>
          
          {showEmojiPicker && (
            <div className="absolute bottom-full right-0 mb-2 z-50" ref={emojiPickerRef}>
              <div className="shadow-xl rounded-lg border border-border overflow-hidden">
                <Picker data={data} onEmojiSelect={addEmoji} theme="light" />
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
};
