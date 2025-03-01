
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
    
    // Transform to Message format with proper type handling
    const messages: Message[] = data.map(msg => ({
      id: msg.id,
      content: msg.content,
      sent: true, // Assume all messages in DB are sent
      timestamp: new Date(msg.created_at),
      sender_id: msg.sender_id,
      chat_id: msg.chat_id,
      is_sticker: msg.is_sticker || false,
      sticker_url: msg.sticker_url,
      is_voice: msg.is_voice || false,
      voice_url: msg.voice_url || undefined,
      is_image: msg.is_image || false,
      image_url: msg.image_url || undefined,
      is_reaction: msg.is_reaction || false,
      reaction_type: msg.reaction_type as "like" | "love" | "laugh" | "wow" | "sad" | "angry" | undefined,
      read: msg.read || false,
      delivery_status: (msg.delivery_status as "sent" | "delivered" | "read") || "sent"
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
      image_url: options?.image_url || null,
      delivery_status: "sent"
    };
    
    const { data, error } = await supabase
      .from('messages')
      .insert(newMessage)
      .select()
      .single();
    
    if (error) throw error;
    
    // Type guard to make sure delivery_status is one of the allowed values
    const deliveryStatus: "sent" | "delivered" | "read" = 
      ["sent", "delivered", "read"].includes(data.delivery_status) 
        ? (data.delivery_status as "sent" | "delivered" | "read") 
        : "sent";
    
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
      delivery_status: deliveryStatus
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
  try {
    // Query sticker packs from the database
    const { data: packData, error: packError } = await supabase
      .from('sticker_packs')
      .select('*');
    
    if (packError) throw packError;
    
    const stickerPacks: StickerPack[] = [];
    
    // For each pack, get its stickers
    for (const pack of packData) {
      const { data: stickerData, error: stickerError } = await supabase
        .from('stickers')
        .select('*')
        .eq('pack_id', pack.id);
        
      if (stickerError) throw stickerError;
      
      const stickers: Sticker[] = stickerData.map(sticker => ({
        id: sticker.id,
        url: sticker.url,
        pack_id: sticker.pack_id,
        emoji: sticker.emoji
      }));
      
      stickerPacks.push({
        id: pack.id,
        name: pack.name,
        author: pack.author,
        cover_sticker_url: pack.cover_sticker_url,
        stickers
      });
    }
    
    return stickerPacks;
  } catch (error) {
    console.error('Error fetching sticker packs:', error);
    
    // Fallback to sample data if there's an error
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
  }
};

// Fetch media items for a chat
export const fetchMediaItems = async (chatId: string): Promise<MediaItem[]> => {
  try {
    const { data, error } = await supabase
      .from('media_items')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      url: item.url,
      type: item.type as "image" | "video" | "voice" | "document",
      name: item.name,
      size: item.size,
      thumbnail_url: item.thumbnail_url,
      created_at: new Date(item.created_at),
      message_id: item.message_id,
      chat_id: item.chat_id
    }));
  } catch (error) {
    console.error('Error fetching media items:', error);
    
    // Return some dummy data for now
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
  }
};

// Fetch call history
export const fetchCallHistory = async (): Promise<CallHistory[]> => {
  try {
    const { data, error } = await supabase
      .from('call_history')
      .select('*')
      .order('start_time', { ascending: false });
      
    if (error) throw error;
    
    return data.map(call => ({
      id: call.id,
      chat_id: call.chat_id,
      caller_id: call.caller_id,
      receiver_id: call.receiver_id,
      call_type: call.call_type as "audio" | "video",
      status: call.status as "completed" | "missed" | "rejected",
      start_time: new Date(call.start_time),
      end_time: call.end_time ? new Date(call.end_time) : undefined,
      duration_seconds: call.duration_seconds
    }));
  } catch (error) {
    console.error('Error fetching call history:', error);
    
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
  }
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
