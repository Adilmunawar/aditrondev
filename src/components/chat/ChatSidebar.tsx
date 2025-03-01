import { useState, useEffect } from "react";
import { Search, Users, Plus, Filter, Circle, Loader2 } from "lucide-react";
import { RecentChat } from "@/types/chat";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatSidebarProps {
  recentChats: RecentChat[];
  selectedChat: string | null;
  onSelectChat: (chatId: string) => void;
  isLoading?: boolean;
}

export const ChatSidebar = ({ recentChats, selectedChat, onSelectChat, isLoading = false }: ChatSidebarProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredChats, setFilteredChats] = useState<RecentChat[]>(recentChats);

  useEffect(() => {
    if (searchTerm) {
      setFilteredChats(
        recentChats.filter((chat) =>
          chat.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredChats(recentChats);
    }
  }, [searchTerm, recentChats]);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const oneDay = 86400000; // milliseconds in a day
    
    if (diff < oneDay && now.getDate() === date.getDate()) {
      return new Intl.DateTimeFormat("default", {
        hour: "numeric",
        minute: "numeric",
      }).format(date);
    } else if (diff < oneDay * 7) {
      return new Intl.DateTimeFormat("default", {
        weekday: "short",
      }).format(date);
    } else {
      return new Intl.DateTimeFormat("default", {
        month: "short",
        day: "numeric",
      }).format(date);
    }
  };

  const getLastMessagePreview = (message: string) => {
    return message.length > 30 ? `${message.substring(0, 30)}...` : message;
  };

  return (
    <div className="w-80 border-r flex flex-col bg-card/70 backdrop-blur-sm">
      <div className="p-3 border-b bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold">Chats</h1>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Filter className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search conversations"
            className="w-full pl-10 p-2 rounded-full bg-secondary border-none focus:ring-2 focus:ring-primary text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs defaultValue="all" className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-3 p-2">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="flex-1 overflow-hidden m-0">
          <ScrollArea className="h-full">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-40 p-4">
                <Loader2 className="w-6 h-6 text-primary animate-spin mb-2" />
                <p className="text-sm text-muted-foreground">Loading conversations...</p>
              </div>
            ) : filteredChats.length > 0 ? (
              filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => onSelectChat(chat.id)}
                  className={`flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors cursor-pointer ${
                    selectedChat === chat.id ? "bg-secondary/50" : ""
                  }`}
                >
                  <div className="relative">
                    {chat.avatar ? (
                      <img
                        src={chat.avatar}
                        alt={chat.name}
                        className="w-12 h-12 rounded-full relative z-10 object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center relative z-10">
                        {chat.is_group ? (
                          <Users className="w-6 h-6 text-primary" />
                        ) : (
                          <Circle className="w-6 h-6 text-primary" />
                        )}
                      </div>
                    )}
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-card rounded-full z-20" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className={`font-medium truncate ${chat.unreadCount ? "font-semibold" : ""}`}>
                        {chat.name}
                      </h3>
                      <span className={`text-xs ${chat.unreadCount ? "text-primary font-medium" : "text-muted-foreground"}`}>
                        {formatTime(chat.timestamp)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p 
                        className={`text-sm truncate ${
                          chat.unreadCount ? "text-foreground font-medium" : "text-muted-foreground"
                        }`}
                      >
                        {chat.isTyping ? (
                          <span className="text-primary animate-pulse">Typing...</span>
                        ) : (
                          getLastMessagePreview(chat.lastMessage)
                        )}
                      </p>
                      {chat.unreadCount ? (
                        <span className="ml-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full min-w-5 text-center">
                          {chat.unreadCount}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <p className="text-muted-foreground mb-2">No conversations found</p>
                <Button size="sm" className="mt-2">
                  <Plus className="w-4 h-4 mr-2" />
                  Start New Chat
                </Button>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="unread" className="flex-1 overflow-hidden m-0">
          <ScrollArea className="h-full">
            {filteredChats.filter(chat => chat.unreadCount && chat.unreadCount > 0).length > 0 ? (
              filteredChats
                .filter(chat => chat.unreadCount && chat.unreadCount > 0)
                .map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => onSelectChat(chat.id)}
                    className={`flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors cursor-pointer ${
                      selectedChat === chat.id ? "bg-secondary/50" : ""
                    }`}
                  >
                    <div className="relative">
                      {chat.avatar ? (
                        <img
                          src={chat.avatar}
                          alt={chat.name}
                          className="w-12 h-12 rounded-full relative z-10 object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center relative z-10">
                          {chat.is_group ? (
                            <Users className="w-6 h-6 text-primary" />
                          ) : (
                            <Circle className="w-6 h-6 text-primary" />
                          )}
                        </div>
                      )}
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-card rounded-full z-20" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold truncate">
                          {chat.name}
                        </h3>
                        <span className="text-xs text-primary font-medium">
                          {formatTime(chat.timestamp)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm truncate text-foreground font-medium">
                          {chat.isTyping ? (
                            <span className="text-primary animate-pulse">Typing...</span>
                          ) : (
                            getLastMessagePreview(chat.lastMessage)
                          )}
                        </p>
                        {chat.unreadCount ? (
                          <span className="ml-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full min-w-5 text-center">
                            {chat.unreadCount}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <p className="text-muted-foreground">No unread messages</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="groups" className="flex-1 overflow-hidden m-0">
          <ScrollArea className="h-full">
            {filteredChats.filter(chat => chat.is_group).length > 0 ? (
              filteredChats
                .filter(chat => chat.is_group)
                .map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => onSelectChat(chat.id)}
                    className={`flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors cursor-pointer ${
                      selectedChat === chat.id ? "bg-secondary/50" : ""
                    }`}
                  >
                    <div className="relative">
                      {chat.avatar ? (
                        <img
                          src={chat.avatar}
                          alt={chat.name}
                          className="w-12 h-12 rounded-full relative z-10 object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center relative z-10">
                          <Users className="w-6 h-6 text-primary" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className={`font-medium truncate ${chat.unreadCount ? "font-semibold" : ""}`}>
                          {chat.name}
                        </h3>
                        <span className={`text-xs ${chat.unreadCount ? "text-primary font-medium" : "text-muted-foreground"}`}>
                          {formatTime(chat.timestamp)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p 
                          className={`text-sm truncate ${
                            chat.unreadCount ? "text-foreground font-medium" : "text-muted-foreground"
                          }`}
                        >
                          {chat.isTyping ? (
                            <span className="text-primary animate-pulse">Typing...</span>
                          ) : (
                            getLastMessagePreview(chat.lastMessage)
                          )}
                        </p>
                        {chat.unreadCount ? (
                          <span className="ml-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full min-w-5 text-center">
                            {chat.unreadCount}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <p className="text-muted-foreground mb-2">No group chats yet</p>
                <Button size="sm" className="mt-2">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Group
                </Button>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};
