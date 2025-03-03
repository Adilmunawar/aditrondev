
import { supabase } from "@/integrations/supabase/client";
import { MediaItem } from "@/types/chat";

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
