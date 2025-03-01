
import { useState, useEffect } from "react";
import { Message, RecentChat } from "@/types/chat";
import { ChatSidebar } from "./chat/ChatSidebar";
import { ChatHeader } from "./chat/ChatHeader";
import { MessageList } from "./chat/MessageList";
import { MessageInput } from "./chat/MessageInput";
import { CallPanel } from "./chat/CallPanel";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "./ui/use-toast";
import "../styles/animations.css"; // Import animations

export const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [callData, setCallData] = useState<{ type: 'audio' | 'video', chat: RecentChat } | null>(null);

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

        const currentUser = supabase.auth.getSession();
        const userId = (await currentUser).data.session?.user.id;

        setMessages(data.map(msg => ({
          id: msg.id,
          content: msg.content,
          sent: msg.sender_id === userId,
          timestamp: new Date(msg.created_at),
          sender_id: msg.sender_id,
          chat_id: msg.chat_id,
          is_sticker: msg.is_sticker,
          sticker_url: msg.sticker_url,
          read: Math.random() > 0.3, // Simulated read status for demo
        })));
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

  // Fetch recent chats with mock data (to avoid recursion issues)
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
          unreadCount: Math.random() > 0.7 ? Math.floor(Math.random() * 10) + 1 : 0, // Random for demo
          isTyping: Math.random() > 0.9, // Random for demo
          avatar: Math.random() > 0.5 
            ? `https://avatars.githubusercontent.com/u/${Math.floor(Math.random() * 1000)}` 
            : undefined,
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
    }
  };

  const endCall = () => {
    setCallData(null);
  };

  const selectedChatDetails = recentChats.find(chat => chat.id === selectedChat);

  return (
    <div className="h-full flex bg-background rounded-xl overflow-hidden shadow-lg">
      <ChatSidebar
        recentChats={recentChats}
        selectedChat={selectedChat}
        onSelectChat={setSelectedChat}
        isLoading={isLoading}
      />
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
        <div className="flex-1 flex items-center justify-center bg-secondary/30 backdrop-blur-sm">
          <div className="text-center space-y-6 max-w-md p-8 bg-card/90 rounded-xl shadow-lg animate-fade-up">
            <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
              <svg className="w-8 h-8 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-primary">Welcome to Aditron</h1>
            <p className="text-muted-foreground">Select a chat to start messaging or start a new conversation</p>
            <div className="pt-2">
              <button 
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                onClick={() => toast({
                  title: "Feature coming soon",
                  description: "Creating new conversations will be available in the next update",
                })}
              >
                Start New Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
