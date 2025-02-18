
import { useState } from "react";
import { Send, Paperclip, Smile } from "lucide-react";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
}

export const MessageInput = ({ onSendMessage }: MessageInputProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    onSendMessage(newMessage);
    setNewMessage("");
  };

  const addEmoji = (emoji: any) => {
    setNewMessage(prev => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-card/50 backdrop-blur-sm border-t">
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="p-2 hover:bg-secondary rounded-full transition-all duration-300 transform hover:scale-110"
        >
          <Paperclip className="w-5 h-5 text-muted-foreground" />
        </button>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-secondary p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
        />
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 hover:bg-secondary rounded-full transition-all duration-300 transform hover:scale-110"
          >
            <Smile className="w-5 h-5 text-muted-foreground" />
          </button>
          {showEmojiPicker && (
            <div className="absolute bottom-full right-0 mb-2">
              <Picker data={data} onEmojiSelect={addEmoji} />
            </div>
          )}
        </div>
        <button
          type="submit"
          className="p-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-full transition-all duration-300 transform hover:scale-110"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
};
