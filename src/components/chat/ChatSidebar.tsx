
import { useState } from "react";
import { RecentChat } from "@/types/chat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { 
  Search, X, PlusCircle, Settings, LogOut, Bell, Moon, Sun, 
  Check, Archive, Pin, MoreVertical, UserPlus, Users, MessageSquare 
} from "lucide-react";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "next-themes";

export interface ChatSidebarProps {
  recentChats: RecentChat[];
  selectedChat: string | null;
  onSelectChat: (chatId: string) => void;
  isLoading: boolean;
  onCreateChat: () => void; // Add this prop to the interface
}

export const ChatSidebar = ({ 
  recentChats, 
  selectedChat, 
  onSelectChat, 
  isLoading,
  onCreateChat 
}: ChatSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const { theme, setTheme } = useTheme();
  
  const filteredChats = recentChats.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const getInitials = (name: string) => {
    return name.split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="w-80 border-r border-border flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between">
        {showSearch ? (
          <div className="flex items-center w-full gap-2">
            <Input
              autoFocus
              placeholder="Search chats..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="h-9"
            />
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => {
                setSearchQuery("");
                setShowSearch(false);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <h2 className="font-bold text-xl">Chats</h2>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowSearch(true)}
              >
                <Search className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onCreateChat}
              >
                <PlusCircle className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                    {theme === 'dark' ? (
                      <Sun className="mr-2 h-4 w-4" />
                    ) : (
                      <Moon className="mr-2 h-4 w-4" />
                    )}
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        )}
      </div>
      
      <div className="p-2 border-b border-border flex gap-1">
        <Button 
          variant={!searchQuery ? "default" : "outline"} 
          size="sm" 
          className="flex-1 h-8"
          onClick={() => setSearchQuery("")}
        >
          <MessageSquare className="h-4 w-4 mr-1" />
          All
        </Button>
        <Button 
          variant={searchQuery === "group" ? "default" : "outline"} 
          size="sm" 
          className="flex-1 h-8"
          onClick={() => setSearchQuery("group")}
        >
          <Users className="h-4 w-4 mr-1" />
          Groups
        </Button>
        <Button 
          variant={searchQuery === "unread" ? "default" : "outline"} 
          size="sm" 
          className="flex-1 h-8"
          onClick={() => setSearchQuery("unread")}
        >
          <UserPlus className="h-4 w-4 mr-1" />
          Unread
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {Array(5).fill(0).map((_, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="text-center py-8 px-4 text-muted-foreground">
            <MessageSquare className="mx-auto h-12 w-12 mb-3 opacity-20" />
            <p>No chats found</p>
            <Button
              variant="link"
              onClick={onCreateChat}
              className="mt-2"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create new chat
            </Button>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredChats.map(chat => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`w-full p-2 rounded-lg text-left flex items-center gap-3 transition-all ${
                  selectedChat === chat.id
                    ? 'bg-primary/10 hover:bg-primary/15'
                    : 'hover:bg-secondary'
                }`}
              >
                <div className="relative">
                  {chat.avatar ? (
                    <Avatar>
                      <AvatarImage src={chat.avatar} alt={chat.name} />
                      <AvatarFallback>{getInitials(chat.name)}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <Avatar>
                      <AvatarFallback 
                        style={{ 
                          backgroundColor: chat.color_theme || undefined 
                        }}
                      >
                        {getInitials(chat.name)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  {chat.hasStatus && chat.status === 'online' && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <span className="font-medium truncate">{chat.name}</span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm truncate">
                    <span className={`truncate ${chat.unreadCount ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                      {chat.isTyping ? (
                        <em className="text-primary">typing...</em>
                      ) : (
                        chat.lastMessage
                      )}
                    </span>
                    
                    <div className="flex items-center space-x-1 ml-1 shrink-0">
                      {chat.is_pinned && <Pin className="h-3 w-3 text-muted-foreground" />}
                      {chat.is_muted && <Bell className="h-3 w-3 text-muted-foreground" />}
                      {chat.unreadCount ? (
                        <span className="h-5 min-w-5 px-1 flex items-center justify-center rounded-full bg-primary text-white text-xs">
                          {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                        </span>
                      ) : chat.delivery_status === 'read' ? (
                        <Check className="h-4 w-4 text-primary" />
                      ) : null}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
      
      <Button
        onClick={onCreateChat}
        className="m-3 gap-2"
      >
        <PlusCircle className="h-4 w-4" />
        New Chat
      </Button>
    </div>
  );
};
