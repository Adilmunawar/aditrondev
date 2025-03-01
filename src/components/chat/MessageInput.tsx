
import { useState, useEffect, useRef } from "react";
import { Send, Paperclip, Smile, Mic, Camera, X } from "lucide-react";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "../ui/button";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  chatId?: string | null;
}

export const MessageInput = ({ onSendMessage, chatId }: MessageInputProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on component mount
  useEffect(() => {
    inputRef.current?.focus();
  }, [chatId]);

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
        });
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
          });
      }
    }, 2000);
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
        <div className="flex items-center gap-3 p-2 bg-red-50 dark:bg-red-900/20 rounded-full">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm">Recording audio...</span>
          <Button 
            variant="ghost" 
            size="icon"
            className="ml-auto rounded-full"
            onClick={() => setIsRecording(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-secondary transition-all duration-300 hover:scale-110"
              >
                <Paperclip className="w-5 h-5 text-muted-foreground" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-secondary transition-all duration-300 hover:scale-110"
              >
                <Camera className="w-5 h-5 text-muted-foreground" />
              </Button>
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
                className="bg-primary hover:bg-primary-hover text-primary-foreground rounded-full transition-all duration-300 hover:scale-110"
              >
                <Send className="w-5 h-5" />
              </Button>
            ) : (
              <Button
                type="button"
                size="icon"
                className="bg-primary hover:bg-primary-hover text-primary-foreground rounded-full transition-all duration-300 hover:scale-110"
                onClick={() => setIsRecording(true)}
              >
                <Mic className="w-5 h-5" />
              </Button>
            )}
          </div>
          
          {showEmojiPicker && (
            <div className="absolute bottom-full right-0 mb-2 z-50">
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
