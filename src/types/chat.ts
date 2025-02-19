
export interface Message {
  id: string;
  content: string;
  sent: boolean;
  timestamp: Date;
  sender_id: string;
  chat_id: string;
  is_sticker?: boolean;
  sticker_url?: string;
}

export interface RecentChat {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount?: number;
  avatar?: string;
  hasStatus?: boolean;
  is_group?: boolean;
}

