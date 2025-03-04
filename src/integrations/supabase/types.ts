export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      call_history: {
        Row: {
          call_type: string
          caller_id: string | null
          chat_id: string | null
          created_at: string | null
          duration_seconds: number | null
          end_time: string | null
          id: string
          receiver_id: string | null
          start_time: string | null
          status: string
        }
        Insert: {
          call_type: string
          caller_id?: string | null
          chat_id?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          end_time?: string | null
          id?: string
          receiver_id?: string | null
          start_time?: string | null
          status: string
        }
        Update: {
          call_type?: string
          caller_id?: string | null
          chat_id?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          end_time?: string | null
          id?: string
          receiver_id?: string | null
          start_time?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_history_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_participants: {
        Row: {
          chat_id: string | null
          id: string
          joined_at: string | null
          profile_id: string | null
        }
        Insert: {
          chat_id?: string | null
          id?: string
          joined_at?: string | null
          profile_id?: string | null
        }
        Update: {
          chat_id?: string | null
          id?: string
          joined_at?: string | null
          profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_participants_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_participants_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chats: {
        Row: {
          created_at: string | null
          id: string
          is_group: boolean | null
          last_message_at: string | null
          last_message_preview: string | null
          name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_group?: boolean | null
          last_message_at?: string | null
          last_message_preview?: string | null
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_group?: boolean | null
          last_message_at?: string | null
          last_message_preview?: string | null
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          contact_id: string | null
          created_at: string | null
          id: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          contact_id?: string | null
          created_at?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          contact_id?: string | null
          created_at?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      media_items: {
        Row: {
          chat_id: string | null
          created_at: string | null
          id: string
          message_id: string | null
          name: string | null
          size: number | null
          thumbnail_url: string | null
          type: string
          url: string
        }
        Insert: {
          chat_id?: string | null
          created_at?: string | null
          id?: string
          message_id?: string | null
          name?: string | null
          size?: number | null
          thumbnail_url?: string | null
          type: string
          url: string
        }
        Update: {
          chat_id?: string | null
          created_at?: string | null
          id?: string
          message_id?: string | null
          name?: string | null
          size?: number | null
          thumbnail_url?: string | null
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_items_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_items_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          chat_id: string | null
          content: string | null
          created_at: string | null
          delivery_status: string | null
          id: string
          image_url: string | null
          is_image: boolean | null
          is_reaction: boolean | null
          is_sticker: boolean | null
          is_voice: boolean | null
          reaction_type: string | null
          read: boolean | null
          sender_id: string | null
          sticker_url: string | null
          updated_at: string | null
          voice_url: string | null
        }
        Insert: {
          chat_id?: string | null
          content?: string | null
          created_at?: string | null
          delivery_status?: string | null
          id?: string
          image_url?: string | null
          is_image?: boolean | null
          is_reaction?: boolean | null
          is_sticker?: boolean | null
          is_voice?: boolean | null
          reaction_type?: string | null
          read?: boolean | null
          sender_id?: string | null
          sticker_url?: string | null
          updated_at?: string | null
          voice_url?: string | null
        }
        Update: {
          chat_id?: string | null
          content?: string | null
          created_at?: string | null
          delivery_status?: string | null
          id?: string
          image_url?: string | null
          is_image?: boolean | null
          is_reaction?: boolean | null
          is_sticker?: boolean | null
          is_voice?: boolean | null
          reaction_type?: string | null
          read?: boolean | null
          sender_id?: string | null
          sticker_url?: string | null
          updated_at?: string | null
          voice_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      phone_verification: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          otp: string
          phone_number: string
          verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          otp: string
          phone_number: string
          verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          otp?: string
          phone_number?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          is_online: boolean | null
          last_seen: string | null
          onboarding_completed: boolean | null
          otp_secret: string | null
          otp_valid_until: string | null
          phone_number: string | null
          phone_verified: boolean | null
          profile_visibility: string | null
          status: string | null
          status_privacy: string | null
          updated_at: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          is_online?: boolean | null
          last_seen?: string | null
          onboarding_completed?: boolean | null
          otp_secret?: string | null
          otp_valid_until?: string | null
          phone_number?: string | null
          phone_verified?: boolean | null
          profile_visibility?: string | null
          status?: string | null
          status_privacy?: string | null
          updated_at?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          is_online?: boolean | null
          last_seen?: string | null
          onboarding_completed?: boolean | null
          otp_secret?: string | null
          otp_valid_until?: string | null
          phone_number?: string | null
          phone_verified?: boolean | null
          profile_visibility?: string | null
          status?: string | null
          status_privacy?: string | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      status_updates: {
        Row: {
          content: string
          created_at: string | null
          expires_at: string | null
          id: string
          profile_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          profile_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "status_updates_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sticker_packs: {
        Row: {
          author: string
          cover_sticker_url: string | null
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          author: string
          cover_sticker_url?: string | null
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          author?: string
          cover_sticker_url?: string | null
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      stickers: {
        Row: {
          created_at: string | null
          emoji: string | null
          id: string
          pack_id: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          emoji?: string | null
          id?: string
          pack_id?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          emoji?: string | null
          id?: string
          pack_id?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "stickers_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "sticker_packs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permissions: {
        Row: {
          contacts_permission: boolean | null
          created_at: string | null
          id: string
          location_permission: boolean | null
          profile_id: string | null
          storage_permission: boolean | null
          updated_at: string | null
        }
        Insert: {
          contacts_permission?: boolean | null
          created_at?: string | null
          id?: string
          location_permission?: boolean | null
          profile_id?: string | null
          storage_permission?: boolean | null
          updated_at?: string | null
        }
        Update: {
          contacts_permission?: boolean | null
          created_at?: string | null
          id?: string
          location_permission?: boolean | null
          profile_id?: string | null
          storage_permission?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_phone_verification_table: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      verify_otp: {
        Args: {
          phone_number_input: string
          otp_input: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
