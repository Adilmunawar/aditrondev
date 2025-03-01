
import { supabase } from "@/integrations/supabase/client";
import { Message, RecentChat, Sticker, StickerPack, MediaItem, CallHistory } from "@/types/chat";
import { v4 as uuidv4 } from "uuid";

// Fetch recent chats
export const fetchRecentChats = async (): Promise<RecentChat[]> => {
  try {
    const { data, error } = await supabase
      .from('chats')
      .select(`
        id,
        name,
        is_group,
        last_message_preview,
        last_message_at,
        chat_participants(profile_id)
      `)
      .order('last_message_at', { ascending: false });
    
    if (error) throw error;
    
    // Transform to RecentChat format
    const recentChats: RecentChat[] = data.map(chat => ({
      id: chat.id,
      name: chat.name,
      lastMessage: chat.last_message_preview || "No messages yet",
      timestamp: new Date(chat.last_message_at),
      unreadCount: Math.floor(Math.random() * 5), // Simulate unread count
      is_group: chat.is_group,
      hasStatus: !chat.is_group,
      status: Math.random() > 0.5 ? "online" : "offline",
      isTyping: false,
      color_theme: getRandomColor(),
      delivery_status: "delivered"
    }));
    
    return recentChats;
  } catch (error) {
    console.error('Error fetching recent chats:', error);
    return [];
  }
};

// Fetch messages for a chat
export const fetchMessages = async (chatId: string): Promise<Message[]> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    // Transform to Message format
    const messages: Message[] = data.map(msg => ({
      id: msg.id,
      content: msg.content,
      sent: true, // Assume all messages in DB are sent
      timestamp: new Date(msg.created_at),
      sender_id: msg.sender_id,
      chat_id: msg.chat_id,
      is_sticker: msg.is_sticker || false,
      sticker_url: msg.sticker_url,
      delivery_status: "read"
    }));
    
    return messages;
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

// Send a new message
export const sendMessage = async (
  chatId: string, 
  content: string, 
  senderId: string,
  options?: { 
    is_sticker?: boolean, 
    sticker_url?: string,
    is_voice?: boolean,
    voice_url?: string,
    is_image?: boolean,
    image_url?: string
  }
): Promise<Message | null> => {
  try {
    const newMessage = {
      id: uuidv4(),
      content,
      chat_id: chatId,
      sender_id: senderId,
      created_at: new Date().toISOString(),
      is_sticker: options?.is_sticker || false,
      sticker_url: options?.sticker_url || null,
      is_voice: options?.is_voice || false,
      voice_url: options?.voice_url || null,
      is_image: options?.is_image || false,
      image_url: options?.image_url || null
    };
    
    const { data, error } = await supabase
      .from('messages')
      .insert(newMessage)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      content: data.content,
      sent: true,
      timestamp: new Date(data.created_at),
      sender_id: data.sender_id,
      chat_id: data.chat_id,
      is_sticker: data.is_sticker || false,
      sticker_url: data.sticker_url,
      is_voice: data.is_voice || false,
      voice_url: data.voice_url,
      is_image: data.is_image || false,
      image_url: data.image_url,
      delivery_status: "sent"
    };
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
};

// Create a new chat
export const createChat = async (name: string, participants: string[], isGroup: boolean = false): Promise<RecentChat | null> => {
  try {
    // Create chat
    const { data: chatData, error: chatError } = await supabase
      .from('chats')
      .insert({ 
        name, 
        is_group: isGroup,
        created_at: new Date().toISOString(),
        last_message_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (chatError) throw chatError;
    
    // Add participants
    const participantRows = participants.map(participantId => ({
      chat_id: chatData.id,
      profile_id: participantId,
      joined_at: new Date().toISOString()
    }));
    
    const { error: participantsError } = await supabase
      .from('chat_participants')
      .insert(participantRows);
    
    if (participantsError) throw participantsError;
    
    return {
      id: chatData.id,
      name: chatData.name,
      lastMessage: "Chat created",
      timestamp: new Date(chatData.created_at),
      is_group: chatData.is_group,
      participants: participants,
      color_theme: getRandomColor(),
      delivery_status: "delivered"
    };
  } catch (error) {
    console.error('Error creating chat:', error);
    return null;
  }
};

// Fetch sticker packs
export const fetchStickerPacks = async (): Promise<StickerPack[]> => {
  // Simulating sticker packs since we don't have a backend API yet
  return [
    {
      id: "pack1",
      name: "Classic Emotions",
      author: "Lovable",
      cover_sticker_url: "https://source.unsplash.com/random/100x100?emoji",
      stickers: Array(8).fill(0).map((_, i) => ({
        id: `sticker${i+1}`,
        url: `https://source.unsplash.com/random/200x200?emoji=${i+1}`,
        pack_id: "pack1",
        emoji: ["😀", "😂", "😍", "😎", "🥳", "🤔", "😢", "🥰"][i]
      }))
    },
    {
      id: "pack2",
      name: "Animals",
      author: "Lovable",
      cover_sticker_url: "https://source.unsplash.com/random/100x100?animal",
      stickers: Array(8).fill(0).map((_, i) => ({
        id: `sticker${i+9}`,
        url: `https://source.unsplash.com/random/200x200?animal=${i+1}`,
        pack_id: "pack2",
        emoji: ["🐶", "🐱", "🐭", "🐰", "🦊", "🐻", "🐼", "🐨"][i]
      }))
    }
  ];
};

// Fetch media items for a chat
export const fetchMediaItems = async (chatId: string): Promise<MediaItem[]> => {
  try {
    // In a real implementation, we would fetch from the database
    // For now, let's return some dummy data
    return Array(12).fill(0).map((_, i) => ({
      id: `media${i+1}`,
      url: `https://source.unsplash.com/random/300x300?media=${i+1}`,
      type: i % 3 === 0 ? "video" : "image",
      name: `Media ${i+1}`,
      size: Math.floor(Math.random() * 1000000),
      thumbnail_url: `https://source.unsplash.com/random/100x100?media=${i+1}`,
      created_at: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
      message_id: `msg${i+1}`,
      chat_id: chatId
    }));
  } catch (error) {
    console.error('Error fetching media items:', error);
    return [];
  }
};

// Fetch call history
export const fetchCallHistory = async (): Promise<CallHistory[]> => {
  // Simulate call history
  return Array(5).fill(0).map((_, i) => ({
    id: `call${i+1}`,
    chat_id: `chat${i+1}`,
    caller_id: "user1",
    receiver_id: `user${i+2}`,
    call_type: i % 2 === 0 ? "audio" : "video",
    status: ["completed", "missed", "rejected"][Math.floor(Math.random() * 3)] as "completed" | "missed" | "rejected",
    start_time: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000),
    end_time: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000 + 300000),
    duration_seconds: Math.floor(Math.random() * 600)
  }));
};

// Helper function to get random color for chat avatars
function getRandomColor() {
  const colors = [
    "#f44336", "#e91e63", "#9c27b0", "#673ab7", 
    "#3f51b5", "#2196f3", "#03a9f4", "#00bcd4", 
    "#009688", "#4caf50", "#8bc34a", "#cddc39", 
    "#ffc107", "#ff9800", "#ff5722", "#795548"
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
