
import { useState, useEffect } from "react";
import { Message, RecentChat } from "@/types/chat";
import { ChatSidebar } from "./chat/ChatSidebar";
import { ChatHeader } from "./chat/ChatHeader";
import { MessageList } from "./chat/MessageList";
import { MessageInput } from "./chat/MessageInput";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "./ui/use-toast";

export const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch messages for selected chat
  useEffect(() => {
    if (!selectedChat) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', selectedChat)
        .order('created_at', { ascending: true });

      if (error) {
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
      })));
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${selectedChat}`,
        },
        async (payload) => {
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
          }]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedChat]);

  // Fetch recent chats
  useEffect(() => {
    const fetchChats = async () => {
      const { data: chats, error } = await supabase
        .from('chats')
        .select(`
          *,
          chat_participants(profile_id),
          messages(
            content,
            created_at,
            sender_id
          )
        `)
        .order('updated_at', { ascending: false });

      if (error) {
        toast({
          title: "Error fetching chats",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      const formattedChats: RecentChat[] = chats.map(chat => ({
        id: chat.id,
        name: chat.name || 'Chat',
        lastMessage: chat.messages?.[0]?.content || '',
        timestamp: new Date(chat.messages?.[0]?.created_at || chat.updated_at),
        is_group: chat.is_group,
      }));

      setRecentChats(formattedChats);
      setIsLoading(false);
    };

    fetchChats();

    // Subscribe to chat updates
    const channel = supabase
      .channel('chats')
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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSendMessage = async (text: string) => {
    if (!selectedChat || !text.trim()) return;

    const currentUser = supabase.auth.getSession();
    const userId = (await currentUser).data.session?.user.id;

    const newMessage = {
      content: text,
      chat_id: selectedChat,
      sender_id: userId,
    };

    const { error } = await supabase
      .from('messages')
      .insert(newMessage);

    if (error) {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const selectedChatDetails = recentChats.find(chat => chat.id === selectedChat);

  return (
    <div className="h-full flex bg-background rounded-xl overflow-hidden shadow-lg">
      <ChatSidebar
        recentChats={recentChats}
        selectedChat={selectedChat}
        onSelectChat={setSelectedChat}
      />
      {selectedChat ? (
        <div className="flex-1 flex flex-col">
          <ChatHeader selectedChat={selectedChatDetails} />
          <MessageList messages={messages} />
          <MessageInput onSendMessage={handleSendMessage} />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-secondary/50">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-primary">Welcome to Aditron</h1>
            <p className="text-muted-foreground">Select a chat to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
};
