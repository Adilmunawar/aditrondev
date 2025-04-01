
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { AvatarUpload } from "./onboarding/AvatarUpload";
import { BasicInfoForm } from "./onboarding/BasicInfoForm";
import { checkUsernameAvailability } from "./onboarding/UsernameValidator";
import { useProfileData } from "./onboarding/useProfileData";
import { updateProfile } from "./onboarding/ProfileUpdater";

interface OnboardingProps {
  onComplete: () => void;
}

export const Onboarding = ({ onComplete }: OnboardingProps) => {
  const {
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
    usernameError,
    setUsernameError,
    initialDataLoaded,
    handleAvatarChange
  } = useProfileData();
  
  const [isLoading, setIsLoading] = useState(false);

  const handleUsernameChange = async (newUsername: string) => {
    setUsername(newUsername);
    
    // Only check availability if we have a non-empty username
    if (newUsername.trim() && userId) {
      const result = await checkUsernameAvailability(newUsername, userId, initialDataLoaded);
      setUsernameError(result.error);
    } else {
      setUsernameError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final validation before submitting
    if (!username.trim()) {
      setUsernameError("Username is required");
      return;
    }
    
    if (userId) {
      const result = await checkUsernameAvailability(username, userId, initialDataLoaded);
      if (!result.isValid) {
        // Error already set by checkUsernameAvailability
        return;
      }
    }
    
    if (!fullName.trim()) {
      toast({
        title: "Full name is required",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);

    try {
      if (!userId) throw new Error("No user found");

      const result = await updateProfile(userId, {
        username,
        fullName,
        bio,
        email,
        phoneNumber,
        gender,
        avatar
      });

      if (!result.success) throw new Error(result.error || "Unknown error occurred");

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
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-white">Set Up Your Profile</h1>
          <p className="text-gray-400">
            Let's personalize your experience
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {userId && (
            <AvatarUpload 
              userId={userId}
              initialAvatar={avatarPreview}
              onAvatarChange={handleAvatarChange}
            />
          )}

          <BasicInfoForm 
            username={username}
            setUsername={handleUsernameChange}
            fullName={fullName}
            setFullName={setFullName}
            email={email}
            setEmail={setEmail}
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            bio={bio}
            setBio={setBio}
            gender={gender}
            setGender={setGender}
            usernameError={usernameError}
          />

          <Button
            type="submit"
            disabled={isLoading || !!usernameError}
            className="w-full py-6 text-lg bg-blue-600 hover:bg-blue-700 text-white"
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
