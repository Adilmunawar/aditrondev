
export interface Message {
  id: string;
  content: string;
  sent: boolean;
  timestamp: Date;
  sender_id: string;
  chat_id: string;
  is_sticker?: boolean;
  sticker_url?: string;
  is_voice?: boolean;
  voice_url?: string;
  is_image?: boolean;
  image_url?: string;
  is_reaction?: boolean;
  reaction_type?: "like" | "love" | "laugh" | "wow" | "sad" | "angry";
  read?: boolean;
  delivery_status?: "sent" | "delivered" | "read";
}

export interface RecentChat {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount?: number;
  avatar?: string;
  hasStatus?: boolean;
  status?: "online" | "offline" | "away" | "busy";
  is_group?: boolean;
  participants?: string[];
  isTyping?: boolean;
  is_pinned?: boolean;
  is_archived?: boolean;
  is_muted?: boolean;
  color_theme?: string;
  delivery_status?: "sent" | "delivered" | "read";
}

export interface ChatSettings {
  theme: string;
  wallpaper?: string;
  notifications: boolean;
  sound: boolean;
  read_receipts: boolean;
  typing_indicators: boolean;
  media_auto_download: boolean;
  language: string;
}

export interface UserStatus {
  status_type: "online" | "offline" | "away" | "busy";
  last_seen?: Date;
  custom_status?: string;
}
