
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/auth";

export const useProfileData = () => {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Load initial user data if available
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        setEmail(session.user.email || "");
        
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("username, full_name, status, avatar_url, phone_number, gender, email")
            .eq("id", session.user.id)
            .single();
            
          if (error) {
            console.error("Error fetching profile:", error);
          } else if (data) {
            setUsername(data.username || "");
            setFullName(data.full_name || "");
            setBio(data.status || "");
            setPhoneNumber(data.phone_number || "");
            setEmail(data.email || session.user.email || "");
            if (data.gender) {
              setGender(data.gender as "male" | "female" | "other");
            }
            if (data.avatar_url) {
              setAvatarPreview(data.avatar_url);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
      setInitialDataLoaded(true);
    };

    fetchUserData();
  }, []);

  const handleAvatarChange = (file: File | null, preview: string | null) => {
    setAvatar(file);
    setAvatarPreview(preview);
  };

  return {
    userId,
    username,
    setUsername,
    fullName,
    setFullName,
    bio,
    setBio,
    email,
    setEmail,
    phoneNumber,
    setPhoneNumber,
    gender,
    setGender,
    avatar,
    setAvatar,
    avatarPreview,
    setAvatarPreview,
    usernameError,
    setUsernameError,
    initialDataLoaded,
    handleAvatarChange
  };
};
