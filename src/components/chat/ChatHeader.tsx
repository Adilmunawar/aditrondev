
import { useState } from "react";
import { Users, MoreVertical, Phone, Video, Search, ChevronLeft, Shield, Bell, BellOff, UserPlus, Settings } from "lucide-react";
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
import { toast } from "../ui/use-toast";

interface ChatHeaderProps {
  selectedChat: RecentChat | undefined;
  onBackClick?: () => void;
}

export const ChatHeader = ({ selectedChat, onBackClick }: ChatHeaderProps) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callActive, setCallActive] = useState<'none' | 'audio' | 'video'>('none');

  if (!selectedChat) {
    return null;
  }

  const handleCallStart = (type: 'audio' | 'video') => {
    setCallActive(type);
    toast({
      title: `${type === 'audio' ? 'Audio' : 'Video'} call started`,
      description: `Call with ${selectedChat.name} is active`,
      duration: 3000,
    });
  };

  const handleCallEnd = () => {
    setCallActive('none');
    toast({
      title: "Call ended",
      description: `Call with ${selectedChat.name} has ended`,
      duration: 3000,
    });
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast({
      title: isMuted ? "Notifications unmuted" : "Notifications muted",
      description: `Notifications for ${selectedChat.name} are now ${isMuted ? "enabled" : "disabled"}`,
      duration: 3000,
    });
  };

  return (
    <div className="p-3 border-b bg-card/70 backdrop-blur-sm flex items-center sticky top-0 z-10">
      <div className="flex items-center gap-3 flex-1">
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden rounded-full hover:bg-secondary/80 transition-all duration-200"
          onClick={onBackClick}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
      
        <div className={`relative ${selectedChat?.hasStatus ? 'status-ring' : ''}`}>
          {selectedChat?.avatar ? (
            <img
              src={selectedChat.avatar}
              alt={selectedChat.name}
              className="w-10 h-10 rounded-full relative z-10 object-cover border-2 border-background shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center relative z-10 border-2 border-background shadow-sm">
              <Users className="w-5 h-5 text-primary" />
            </div>
          )}
          
          {/* Online status indicator with pulse animation */}
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-card rounded-full z-20">
            <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></span>
          </div>
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
      
      {callActive !== 'none' && (
        <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-20 animate-fade-in">
          <div className="bg-card p-5 rounded-xl shadow-lg flex flex-col items-center gap-4 max-w-md w-full animate-slide-up">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              {callActive === 'audio' ? (
                <Phone className="w-10 h-10 text-primary animate-pulse" />
              ) : (
                <Video className="w-10 h-10 text-primary animate-pulse" />
              )}
            </div>
            <h2 className="text-xl font-bold">{selectedChat.name}</h2>
            <p className="text-muted-foreground">{callActive === 'audio' ? 'Audio' : 'Video'} call in progress</p>
            <div className="flex gap-4 mt-4">
              <Button 
                variant="destructive" 
                size="lg" 
                className="rounded-full w-12 h-12 flex items-center justify-center"
                onClick={handleCallEnd}
              >
                <Phone className="w-6 h-6 rotate-135" />
              </Button>
              {callActive === 'video' && (
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="rounded-full w-12 h-12 flex items-center justify-center"
                >
                  <Video className="w-6 h-6" />
                </Button>
              )}
              <Button 
                variant={isMuted ? "default" : "outline"} 
                size="lg" 
                className="rounded-full w-12 h-12 flex items-center justify-center"
                onClick={toggleMute}
              >
                {isMuted ? <BellOff className="w-6 h-6" /> : <Bell className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex items-center gap-1">
        {isSearchOpen ? (
          <div className="flex items-center bg-secondary rounded-full overflow-hidden pr-1 animate-slide-left">
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
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full hover:bg-secondary/80 transition-all duration-200"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full hover:bg-secondary/80 transition-all duration-200"
              onClick={() => handleCallStart('audio')}
            >
              <Phone className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full hover:bg-secondary/80 transition-all duration-200"
              onClick={() => handleCallStart('video')}
            >
              <Video className="w-5 h-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary/80 transition-all duration-200">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Chat Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add to group
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem>Media, links, and docs</DropdownMenuItem>
                <DropdownMenuItem>Search in chat</DropdownMenuItem>
                <DropdownMenuItem onClick={toggleMute}>
                  {isMuted ? <Bell className="mr-2 h-4 w-4" /> : <BellOff className="mr-2 h-4 w-4" />}
                  {isMuted ? "Unmute notifications" : "Mute notifications"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <Shield className="mr-2 h-4 w-4" />
                  Block
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Delete chat</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
    </div>
  );
};
