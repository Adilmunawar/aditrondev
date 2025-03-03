
import { supabase } from "@/integrations/supabase/client";
import { RecentChat } from "@/types/chat";
import { getRandomColor } from "./helpers";

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
