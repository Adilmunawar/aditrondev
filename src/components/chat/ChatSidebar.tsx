
import { useState, useEffect } from "react";
import { RecentChat } from "@/types/chat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { 
  Search, X, PlusCircle, Settings, LogOut, Bell, Moon, Sun, 
  Check, Archive, Pin, MoreVertical, UserPlus, Users, MessageSquare,
  Phone, Video, User, Image, FileText, Filter
} from "lucide-react";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel 
} from "@/components/ui/dropdown-menu";
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "next-themes";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { fetchCallHistory } from "@/utils/chatBackend";

export interface ChatSidebarProps {
  recentChats: RecentChat[];
  selectedChat: string | null;
  onSelectChat: (chatId: string) => void;
  isLoading: boolean;
  onCreateChat: () => void;
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
  const [activeTab, setActiveTab] = useState("chats");
  const [callHistory, setCallHistory] = useState<any[]>([]);
  const [isCallHistoryLoading, setIsCallHistoryLoading] = useState(true);
  const { theme, setTheme } = useTheme();
  
  const filteredChats = recentChats.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    // Load call history when the calls tab is activated
    if (activeTab === "calls") {
      loadCallHistory();
    }
  }, [activeTab]);

  const loadCallHistory = async () => {
    setIsCallHistoryLoading(true);
    try {
      const history = await fetchCallHistory();
      setCallHistory(history);
    } catch (error) {
      console.error("Error loading call history:", error);
      toast({
        title: "Error",
        description: "Failed to load call history. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCallHistoryLoading(false);
    }
  };
  
  const getInitials = (name: string) => {
    return name.split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const renderCallHistory = () => {
    if (isCallHistoryLoading) {
      return Array(3).fill(0).map((_, idx) => (
        <div key={idx} className="flex items-center gap-3 px-3 py-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1 flex-1">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ));
    }
    
    if (callHistory.length === 0) {
      return (
        <div className="text-center py-8 px-4 text-muted-foreground">
          <Phone className="mx-auto h-12 w-12 mb-3 opacity-20" />
          <p>No call history</p>
        </div>
      );
    }
    
    return callHistory.map((call) => (
      <div key={call.id} className="flex items-center gap-3 px-3 py-2 hover:bg-secondary rounded-lg cursor-pointer">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary/10">
            {call.call_type === "audio" ? <Phone className="h-5 w-5 text-primary" /> : <Video className="h-5 w-5 text-primary" />}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <span className="font-medium truncate">
              {call.receiver_id === "user1" ? "Incoming call" : "Outgoing call"}
            </span>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatDate(call.start_time)}
            </span>
          </div>
          <div className="flex items-center text-sm">
            <span className={call.status === "missed" ? "text-red-500" : "text-muted-foreground"}>
              {call.status.charAt(0).toUpperCase() + call.status.slice(1)} • {call.duration_seconds ? `${Math.floor(call.duration_seconds / 60)}:${(call.duration_seconds % 60).toString().padStart(2, '0')}` : "00:00"}
            </span>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10">
          {call.call_type === "audio" ? <Phone className="h-4 w-4" /> : <Video className="h-4 w-4" />}
        </Button>
      </div>
    ));
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
            <h2 className="font-bold text-xl">Lovable Chat</h2>
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
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                    {theme === 'dark' ? (
                      <Sun className="mr-2 h-4 w-4" />
                    ) : (
                      <Moon className="mr-2 h-4 w-4" />
                    )}
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toast({ title: "Feature activated", description: "Notifications are now enabled" })}>
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toast({ title: "Settings", description: "Settings panel opened" })}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => toast({ title: "Archived Chats", description: "Archived chats opened" })}>
                    <Archive className="mr-2 h-4 w-4" />
                    Archived Chats
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toast({ title: "Starred Messages", description: "Starred messages opened" })}>
                    <Pin className="mr-2 h-4 w-4" />
                    Starred Messages
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
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
      
      <Tabs defaultValue="chats" className="flex-1 flex flex-col" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 px-2 pt-2">
          <TabsTrigger value="chats" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <MessageSquare className="h-4 w-4 mr-1" />
            Chats
          </TabsTrigger>
          <TabsTrigger value="calls" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Phone className="h-4 w-4 mr-1" />
            Calls
          </TabsTrigger>
          <TabsTrigger value="contacts" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <User className="h-4 w-4 mr-1" />
            Contacts
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="chats" className="flex-1 flex flex-col pt-2">
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
                          {formatDate(chat.timestamp)}
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
        </TabsContent>
        
        <TabsContent value="calls" className="flex-1 flex flex-col pt-2">
          <div className="p-2 border-b border-border flex gap-1">
            <Button 
              variant="default" 
              size="sm" 
              className="flex-1 h-8"
            >
              <Phone className="h-4 w-4 mr-1" />
              All
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 h-8"
            >
              <Video className="h-4 w-4 mr-1" />
              Video
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 h-8"
            >
              <Filter className="h-4 w-4 mr-1" />
              Missed
            </Button>
          </div>
          
          <ScrollArea className="flex-1">
            {renderCallHistory()}
          </ScrollArea>
          
          <Button
            onClick={() => toast({ title: "New Call", description: "Call feature activated" })}
            className="m-3 gap-2"
          >
            <Phone className="h-4 w-4" />
            New Call
          </Button>
        </TabsContent>
        
        <TabsContent value="contacts" className="flex-1 flex flex-col pt-2">
          <div className="p-2 border-b border-border">
            <Input
              placeholder="Search contacts..."
              className="h-9"
            />
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-2">
              <div className="py-2">
                <div className="text-xs font-medium text-muted-foreground pl-3 pb-1">A</div>
                <button className="w-full p-2 rounded-lg text-left flex items-center gap-3 hover:bg-secondary">
                  <Avatar>
                    <AvatarFallback className="bg-blue-500">AA</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Alice Adams</p>
                    <p className="text-xs text-muted-foreground">Online</p>
                  </div>
                </button>
                <button className="w-full p-2 rounded-lg text-left flex items-center gap-3 hover:bg-secondary">
                  <Avatar>
                    <AvatarFallback className="bg-green-500">AB</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Alex Brown</p>
                    <p className="text-xs text-muted-foreground">Last seen yesterday</p>
                  </div>
                </button>
              </div>
              
              <div className="py-2">
                <div className="text-xs font-medium text-muted-foreground pl-3 pb-1">B</div>
                <button className="w-full p-2 rounded-lg text-left flex items-center gap-3 hover:bg-secondary">
                  <Avatar>
                    <AvatarFallback className="bg-purple-500">BC</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Bob Carter</p>
                    <p className="text-xs text-muted-foreground">Last seen 2 days ago</p>
                  </div>
                </button>
              </div>
            </div>
          </ScrollArea>
          
          <Button
            onClick={() => toast({ title: "Add Contact", description: "Contact feature activated" })}
            className="m-3 gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Add Contact
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
};
