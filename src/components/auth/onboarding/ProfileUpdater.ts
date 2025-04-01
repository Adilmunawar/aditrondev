
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export type ProfileData = {
  username: string;
  fullName: string;
  bio: string;
  email: string;
  phoneNumber: string;
  gender: "male" | "female" | "other" | "";
  avatar: File | null;
};

export const updateProfile = async (userId: string, profileData: ProfileData) => {
  const { username, fullName, bio, email, phoneNumber, gender, avatar } = profileData;
  
  try {
    let avatarUrl = null;
    if (avatar) {
      try {
        // Check if the avatars bucket exists
        const { error: bucketError } = await supabase.storage.getBucket('avatars');
        
        if (bucketError) {
          // Create bucket if it doesn't exist
          await supabase.storage.createBucket('avatars', {
            public: true
          });
        }
        
        // Upload avatar
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(`${userId}/${Date.now()}.png`, avatar);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("avatars")
          .getPublicUrl(uploadData.path);

        avatarUrl = publicUrl;
      } catch (error) {
        console.error("Error uploading avatar:", error);
        toast({
          title: "Avatar upload failed",
          description: "We couldn't upload your avatar, but will continue with profile setup.",
          variant: "destructive",
        });
      }
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        username,
        full_name: fullName,
        status: bio,
        avatar_url: avatarUrl || undefined,
        phone_number: phoneNumber || undefined,
        gender: gender || undefined,
        email: email || undefined,
        onboarding_completed: true,
      })
      .eq("id", userId);

    if (updateError) throw updateError;

    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
