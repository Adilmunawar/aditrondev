
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Camera, Loader2 } from "lucide-react";

interface OnboardingProps {
  onComplete: () => void;
}

export const Onboarding = ({ onComplete }: OnboardingProps) => {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  // Load initial user data if available
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("username, full_name, status, avatar_url")
          .eq("id", session.user.id)
          .single();
        
        if (profile && !error) {
          setUsername(profile.username || "");
          setFullName(profile.full_name || "");
          setBio(profile.status || "");
          if (profile.avatar_url) {
            setAvatarPreview(profile.avatar_url);
          }
        }
      }
      setInitialDataLoaded(true);
    };

    fetchUserData();
  }, []);

  const checkUsernameAvailability = async (usernameToCheck: string) => {
    if (!initialDataLoaded) return;
    
    if (!usernameToCheck.trim()) {
      setUsernameError("Username is required");
      return false;
    }
    
    // Get current user to exempt them from username check (for update case)
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return false;
    
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username")
      .eq("username", usernameToCheck)
      .neq("id", session.user.id) // Don't count current user's username as a duplicate
      .maybeSingle();
    
    if (data) {
      setUsernameError("This username is already taken");
      return false;
    } else {
      setUsernameError(null);
      return true;
    }
  };

  const handleUsernameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
    
    // Only check availability if we have a non-empty username
    if (newUsername.trim()) {
      await checkUsernameAvailability(newUsername);
    } else {
      setUsernameError(null);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 5MB",
          variant: "destructive",
        });
        return;
      }
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final validation before submitting
    if (!username.trim()) {
      setUsernameError("Username is required");
      return;
    }
    
    if (!await checkUsernameAvailability(username)) {
      // Error already set by checkUsernameAvailability
      return;
    }
    
    setIsLoading(true);

    try {
      const user = (await supabase.auth.getSession()).data.session?.user;
      if (!user) throw new Error("No user found");

      let avatarUrl = null;
      if (avatar) {
        // Create the avatars bucket if it doesn't exist
        try {
          const { error: bucketError } = await supabase.storage.getBucket('avatars');
          if (bucketError) {
            // Bucket might not exist, try to create it
            await supabase.storage.createBucket('avatars', {
              public: true
            });
          }
        } catch (error) {
          console.error("Error checking/creating bucket:", error);
        }

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(`${user.id}/${Date.now()}.png`, avatar);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("avatars")
          .getPublicUrl(uploadData.path);

        avatarUrl = publicUrl;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          username,
          full_name: fullName,
          status: bio,
          avatar_url: avatarUrl || undefined,
          onboarding_completed: true,
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      toast({
        title: "Profile updated",
        description: "Your profile has been set up successfully",
      });
      onComplete();
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Set Up Your Profile</h1>
          <p className="text-muted-foreground">
            Let's personalize your experience
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative group">
              <div className={`w-32 h-32 rounded-full overflow-hidden ${!avatarPreview ? 'bg-secondary' : ''}`}>
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Camera className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full cursor-pointer shadow-lg transform transition-transform group-hover:scale-110"
              >
                <Camera className="w-4 h-4" />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Input
                placeholder="Username"
                value={username}
                onChange={handleUsernameChange}
                className={`py-6 text-lg ${usernameError ? 'border-red-500' : ''}`}
                required
              />
              {usernameError && (
                <p className="text-sm text-red-500 mt-1">{usernameError}</p>
              )}
            </div>
            <div>
              <Input
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="py-6 text-lg"
                required
              />
            </div>
            <div>
              <Textarea
                placeholder="Bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="min-h-[100px] text-lg"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !!usernameError}
            className="w-full py-6 text-lg"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Complete Setup"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};
