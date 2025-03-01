
import { useState, useEffect } from "react";
import { Message, RecentChat } from "@/types/chat";
import { ChatSidebar } from "./chat/ChatSidebar";
import { ChatHeader } from "./chat/ChatHeader";
import { MessageList } from "./chat/MessageList";
import { MessageInput } from "./chat/MessageInput";
import { CallPanel } from "./chat/CallPanel";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "./ui/use-toast";
import { Loader2, PlusCircle } from "lucide-react";
import { Button } from "./ui/button";
import "../styles/animations.css"; // Import animations

export const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [callData, setCallData] = useState<{ type: 'audio' | 'video', chat: RecentChat } | null>(null);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [newChatName, setNewChatName] = useState("");

  // Fetch messages for selected chat
  useEffect(() => {
    if (!selectedChat) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', selectedChat)
          .order('created_at', { ascending: true });

        if (error) {
          console.error("Error fetching messages:", error);
          toast({
            title: "Error fetching messages",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        // For demo purposes, simulate voice and image messages
        const currentUser = supabase.auth.getSession();
        const userId = (await currentUser).data.session?.user.id;
        
        const enhancedMessages = data.map((msg, index) => {
          // Every 5th message is a voice message for demo
          const isVoice = index % 7 === 0 && index > 0;
          // Every 8th message is an image for demo
          const isImage = index % 8 === 0 && index > 0;
          
          return {
            id: msg.id,
            content: msg.content,
            sent: msg.sender_id === userId,
            timestamp: new Date(msg.created_at),
            sender_id: msg.sender_id,
            chat_id: msg.chat_id,
            is_sticker: msg.is_sticker,
            sticker_url: msg.sticker_url,
            is_voice: isVoice,
            voice_url: isVoice ? 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' : undefined,
            is_image: isImage,
            image_url: isImage ? `https://picsum.photos/500/300?random=${index}` : undefined,
            reaction_type: Math.random() > 0.8 ? ["like", "love", "laugh"][Math.floor(Math.random() * 3)] as "like" | "love" | "laugh" : undefined,
            read: Math.random() > 0.3,
            delivery_status: Math.random() > 0.5 ? "read" : "delivered",
          };
        });

        setMessages(enhancedMessages);
      } catch (error) {
        console.error("Error in message fetching:", error);
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel('messages-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${selectedChat}`,
        },
        async (payload) => {
          try {
            const newMessage = payload.new as any;
            const currentUser = supabase.auth.getSession();
            const userId = (await currentUser).data.session?.user.id;

            setMessages(prev => [...prev, {
              id: newMessage.id,
              content: newMessage.content,
              sent: newMessage.sender_id === userId,
              timestamp: new Date(newMessage.created_at),
              sender_id: newMessage.sender_id,
              chat_id: newMessage.chat_id,
              is_sticker: newMessage.is_sticker,
              sticker_url: newMessage.sticker_url,
              read: false,
              delivery_status: "sent",
            }]);
          } catch (error) {
            console.error("Error handling new message:", error);
          }
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedChat]);

  // Fetch recent chats
  useEffect(() => {
    const fetchChats = async () => {
      try {
        // Use simple query to avoid recursion issues
        const { data: chats, error } = await supabase
          .from('chats')
          .select('id, name, is_group, created_at, updated_at, last_message_preview, last_message_at')
          .order('updated_at', { ascending: false });

        if (error) {
          console.error("Error fetching chats:", error);
          toast({
            title: "Error fetching chats",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        // Create formatted chats with additional mock data for UI
        const formattedChats: RecentChat[] = chats.map(chat => ({
          id: chat.id,
          name: chat.name || 'Chat',
          lastMessage: chat.last_message_preview || 'No messages yet',
          timestamp: new Date(chat.last_message_at || chat.updated_at),
          is_group: chat.is_group,
          hasStatus: Math.random() > 0.5, // Random for demo
          status: Math.random() > 0.7 ? "online" : Math.random() > 0.5 ? "away" : "offline",
          unreadCount: Math.random() > 0.7 ? Math.floor(Math.random() * 10) + 1 : 0, // Random for demo
          isTyping: Math.random() > 0.9, // Random for demo
          is_pinned: Math.random() > 0.8,
          is_muted: Math.random() > 0.8,
          avatar: Math.random() > 0.5 
            ? `https://avatars.githubusercontent.com/u/${Math.floor(Math.random() * 1000)}` 
            : undefined,
          color_theme: Math.random() > 0.7 ? ["#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4"][Math.floor(Math.random() * 4)] : undefined,
        }));

        setRecentChats(formattedChats);
        setIsLoading(false);
      } catch (error) {
        console.error("Error in chat fetching:", error);
        setIsLoading(false);
      }
    };

    fetchChats();

    // Subscribe to chat updates
    const channel = supabase
      .channel('chats-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chats',
        },
        () => {
          fetchChats();
        }
      )
      .subscribe((status) => {
        console.log("Chats subscription status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSendMessage = async (text: string) => {
    if (!selectedChat || !text.trim()) return;

    try {
      const currentUser = supabase.auth.getSession();
      const userId = (await currentUser).data.session?.user.id;

      if (!userId) {
        toast({
          title: "Authentication required",
          description: "You need to be logged in to send messages",
          variant: "destructive",
        });
        return;
      }

      const newMessage = {
        content: text,
        chat_id: selectedChat,
        sender_id: userId,
      };

      const { error } = await supabase
        .from('messages')
        .insert(newMessage);

      if (error) {
        console.error("Error sending message:", error);
        toast({
          title: "Error sending message",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error in message sending:", error);
    }
  };

  const startCall = (type: 'audio' | 'video') => {
    const chat = recentChats.find(chat => chat.id === selectedChat);
    if (chat) {
      setCallData({ type, chat });
      
      toast({
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} call initiated`,
        description: `Connecting to ${chat.name}...`,
      });
    }
  };

  const endCall = () => {
    setCallData(null);
    
    toast({
      title: "Call ended",
      description: "The call has been disconnected",
    });
  };

  const createNewChat = async () => {
    if (!newChatName.trim()) {
      toast({
        title: "Chat name required",
        description: "Please enter a name for the new chat",
        variant: "destructive",
      });
      return;
    }
    
    setIsCreatingChat(true);
    
    try {
      const currentUser = supabase.auth.getSession();
      const userId = (await currentUser).data.session?.user.id;
      
      if (!userId) {
        toast({
          title: "Authentication required",
          description: "You need to be logged in to create chats",
          variant: "destructive",
        });
        setIsCreatingChat(false);
        return;
      }
      
      const { data: newChat, error } = await supabase
        .from('chats')
        .insert({
          name: newChatName,
          created_by: userId,
          is_group: false,
        })
        .select('id')
        .single();
        
      if (error) {
        console.error("Error creating chat:", error);
        toast({
          title: "Error creating chat",
          description: error.message,
          variant: "destructive",
        });
        setIsCreatingChat(false);
        return;
      }
      
      toast({
        title: "Chat created",
        description: `Your chat "${newChatName}" has been created successfully!`,
      });
      
      setSelectedChat(newChat.id);
      setNewChatName("");
      setIsCreatingChat(false);
      
    } catch (error) {
      console.error("Error in chat creation:", error);
      setIsCreatingChat(false);
    }
  };

  const selectedChatDetails = recentChats.find(chat => chat.id === selectedChat);

  return (
    <div className="h-full flex bg-background rounded-xl overflow-hidden shadow-lg">
      <ChatSidebar
        recentChats={recentChats}
        selectedChat={selectedChat}
        onSelectChat={setSelectedChat}
        isLoading={isLoading}
        onCreateChat={() => setIsCreatingChat(true)}
      />
      
      {isCreatingChat && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-card p-6 rounded-xl shadow-lg max-w-md w-full animate-scale-in">
            <h2 className="text-2xl font-bold mb-4 gradient-text">Create New Chat</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="chatName" className="text-sm font-medium">Chat Name</label>
                <input
                  id="chatName"
                  type="text"
                  value={newChatName}
                  onChange={(e) => setNewChatName(e.target.value)}
                  placeholder="Enter a name for your chat"
                  className="w-full p-2 rounded-md border border-input bg-background"
                  autoFocus
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreatingChat(false);
                    setNewChatName("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={createNewChat}
                  disabled={isCreatingChat || !newChatName.trim()}
                  className="relative overflow-hidden"
                >
                  {isCreatingChat ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Chat
                    </>
                  )}
                  <span className="absolute inset-0 overflow-hidden rounded-md opacity-0 hover:opacity-20 transition-opacity">
                    <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white to-primary/0 animate-[shine_2s_ease-in-out_infinite]"></span>
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {selectedChat ? (
        <div className="flex-1 flex flex-col">
          <ChatHeader 
            selectedChat={selectedChatDetails} 
            onBackClick={() => setSelectedChat(null)}
          />
          
          {callData && (
            <CallPanel 
              contact={callData.chat} 
              callType={callData.type} 
              onEnd={endCall} 
            />
          )}
          
          <MessageList messages={messages} />
          <MessageInput 
            onSendMessage={handleSendMessage} 
            chatId={selectedChat}
            onStartCall={startCall}
          />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-secondary/20 via-background to-secondary/20 backdrop-blur-sm">
          <div className="text-center space-y-6 max-w-md p-8 glass-card rounded-xl shadow-lg animate-fade-up gradient-border">
            <div className="w-20 h-20 rounded-full bg-gradient-primary mx-auto flex items-center justify-center text-white">
              <svg className="w-10 h-10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold gradient-text animate-pulse-custom">Welcome to Aditron</h1>
            <p className="text-muted-foreground">Select a chat to start messaging or create a new conversation</p>
            <div className="pt-2 flex flex-col gap-4 items-center">
              <Button 
                className="px-6 py-2 bg-gradient-primary hover:opacity-90 transition-all shadow-lg"
                onClick={() => setIsCreatingChat(true)}
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Start New Chat
              </Button>
              
              <div className="w-32 h-1 bg-gradient-to-r from-background via-primary/20 to-background my-2"></div>
              
              <div className="text-sm text-muted-foreground">
                <p className="mb-1">Exciting features:</p>
                <ul className="space-y-1">
                  <li className="flex items-center gap-1">
                    <span className="w-1 h-1 bg-primary rounded-full"></span>
                    <span>Real-time messaging</span>
                  </li>
                  <li className="flex items-center gap-1">
                    <span className="w-1 h-1 bg-primary rounded-full"></span>
                    <span>Voice & video calls</span>
                  </li>
                  <li className="flex items-center gap-1">
                    <span className="w-1 h-1 bg-primary rounded-full"></span>
                    <span>Media sharing</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
