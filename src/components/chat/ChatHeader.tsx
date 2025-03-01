
import { useState } from "react";
import { Users, MoreVertical, Phone, Video, Search, ChevronLeft } from "lucide-react";
import { RecentChat } from "@/types/chat";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatHeaderProps {
  selectedChat: RecentChat | undefined;
  onBackClick?: () => void;
}

export const ChatHeader = ({ selectedChat, onBackClick }: ChatHeaderProps) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  if (!selectedChat) {
    return null;
  }

  return (
    <div className="p-3 border-b bg-card/50 backdrop-blur-sm flex items-center">
      <div className="flex items-center gap-3 flex-1">
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden rounded-full"
          onClick={onBackClick}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
      
        <div className={`relative ${selectedChat?.hasStatus ? 'status-ring' : ''}`}>
          {selectedChat?.avatar ? (
            <img
              src={selectedChat.avatar}
              alt={selectedChat.name}
              className="w-10 h-10 rounded-full relative z-10 object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center relative z-10">
              <Users className="w-5 h-5 text-primary" />
            </div>
          )}
          
          {/* Online status indicator */}
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-card rounded-full z-20" />
        </div>
        
        <div className="flex flex-col">
          <h2 className="font-semibold">{selectedChat.name}</h2>
          {selectedChat.isTyping ? (
            <span className="text-xs text-primary animate-pulse">Typing...</span>
          ) : (
            <span className="text-xs text-muted-foreground">Online</span>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        {isSearchOpen ? (
          <div className="flex items-center bg-secondary rounded-full overflow-hidden pr-1">
            <input 
              type="text" 
              placeholder="Search in conversation..."
              className="bg-transparent border-none focus:outline-none focus:ring-0 px-3 py-1 text-sm w-40"
              autoFocus
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full h-7 w-7" 
              onClick={() => setIsSearchOpen(false)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsSearchOpen(true)}>
              <Search className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Phone className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Video className="w-5 h-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Chat Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>View Profile</DropdownMenuItem>
                <DropdownMenuItem>Media, links, and docs</DropdownMenuItem>
                <DropdownMenuItem>Search in chat</DropdownMenuItem>
                <DropdownMenuItem>Mute notifications</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-500">Block</DropdownMenuItem>
                <DropdownMenuItem className="text-red-500">Delete chat</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
    </div>
  );
};
