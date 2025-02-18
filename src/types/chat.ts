
export interface Message {
  id: number;
  text: string;
  sent: boolean;
  timestamp: Date;
}

export interface RecentChat {
  id: number;
  name: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount?: number;
  avatar?: string;
  hasStatus?: boolean;
}
