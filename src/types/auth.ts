
export interface AuthState {
  isLoading: boolean;
  session: any;
  user: any;
}

export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  status: string | null;
  status_privacy: 'everyone' | 'contacts' | 'nobody';
  profile_visibility: 'everyone' | 'contacts' | 'nobody';
  is_online: boolean;
  last_seen: string;
  otp_secret?: string;
}
