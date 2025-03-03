
import { supabase } from "@/integrations/supabase/client";
import { CallHistory } from "@/types/chat";

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
