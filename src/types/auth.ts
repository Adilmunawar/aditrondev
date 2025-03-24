
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
  onboarding_completed?: boolean;
  phone_number?: string | null;
  phone_verified?: boolean;
  otp_secret?: string;
  otp_valid_until?: string;
  gender?: 'male' | 'female' | 'other' | null;
  email?: string | null;
}
