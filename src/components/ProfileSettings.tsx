
import { Camera, User } from "lucide-react";
import { useState, useRef } from "react";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { toast } from "./ui/use-toast";

interface Profile {
  name: string;
  about: string;
  avatar?: string;
  statusPrivacy: "everyone" | "contacts" | "nobody";
  profileVisibility: "everyone" | "contacts" | "nobody";
  onlineStatus: boolean;
}

export const ProfileSettings = () => {
  const [profile, setProfile] = useState<Profile>({
    name: "Your Name",
    about: "Hey there! I'm using Aditron",
    statusPrivacy: "everyone",
    profileVisibility: "everyone",
    onlineStatus: true,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 5MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile((prev) => ({
          ...prev,
          avatar: reader.result as string,
        }));
        toast({
          title: "Profile picture updated",
          description: "Your profile picture has been updated successfully",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePrivacyChange = (
    setting: "statusPrivacy" | "profileVisibility",
    value: "everyone" | "contacts" | "nobody"
  ) => {
    setProfile((prev) => ({
      ...prev,
      [setting]: value,
    }));
    toast({
      title: "Privacy settings updated",
      description: `Your ${setting === "statusPrivacy" ? "status" : "profile"} privacy settings have been updated`,
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-card/50 backdrop-blur-sm">
        <h2 className="font-semibold">Profile Settings</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-12 h-12 text-primary" />
              </div>
            )}
            <button 
              className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>
        </div>

        {/* Profile Form */}
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2">Name</Label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full p-2 rounded-md bg-secondary border focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <Label className="text-sm font-medium mb-2">About</Label>
            <textarea
              value={profile.about}
              onChange={(e) => setProfile({ ...profile, about: e.target.value })}
              className="w-full p-2 rounded-md bg-secondary border focus:ring-2 focus:ring-primary h-24 resize-none"
            />
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="space-y-6">
          <h3 className="font-semibold text-lg">Privacy Settings</h3>
          
          {/* Status Privacy */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Status Privacy</Label>
            <RadioGroup
              value={profile.statusPrivacy}
              onValueChange={(value: "everyone" | "contacts" | "nobody") => 
                handlePrivacyChange("statusPrivacy", value)
              }
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="everyone" id="status-everyone" />
                <Label htmlFor="status-everyone">Everyone</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="contacts" id="status-contacts" />
                <Label htmlFor="status-contacts">Contacts Only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="nobody" id="status-nobody" />
                <Label htmlFor="status-nobody">Nobody</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Profile Visibility */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Profile Visibility</Label>
            <RadioGroup
              value={profile.profileVisibility}
              onValueChange={(value: "everyone" | "contacts" | "nobody") => 
                handlePrivacyChange("profileVisibility", value)
              }
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="everyone" id="profile-everyone" />
                <Label htmlFor="profile-everyone">Everyone</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="contacts" id="profile-contacts" />
                <Label htmlFor="profile-contacts">Contacts Only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="nobody" id="profile-nobody" />
                <Label htmlFor="profile-nobody">Nobody</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Online Status Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Online Status</Label>
              <p className="text-sm text-muted-foreground">
                Show when you're active
              </p>
            </div>
            <Switch
              checked={profile.onlineStatus}
              onCheckedChange={(checked) => {
                setProfile((prev) => ({ ...prev, onlineStatus: checked }));
                toast({
                  title: "Online status updated",
                  description: `Your online status is now ${checked ? "visible" : "hidden"}`,
                });
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
