
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/types/chat";
import { v4 as uuidv4 } from "uuid";

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
