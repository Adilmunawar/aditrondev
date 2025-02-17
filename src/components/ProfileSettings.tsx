
import { Camera, User, Save, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { toast } from "./ui/use-toast";
import { Button } from "./ui/button";

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
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
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
        setHasChanges(true);
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
    setHasChanges(true);
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Settings saved successfully",
      description: "Your profile settings have been updated",
    });
    setIsSaving(false);
    setHasChanges(false);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="p-4 border-b bg-card/50 backdrop-blur-sm flex justify-between items-center">
        <h2 className="font-semibold">Profile Settings</h2>
        <Button
          onClick={handleSaveSettings}
          disabled={!hasChanges || isSaving}
          className="gap-2"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-6 space-y-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className={`${profile.avatar ? 'status-ring' : ''}`}>
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover relative z-10"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center relative z-10">
                    <User className="w-16 h-16 text-primary" />
                  </div>
                )}
              </div>
              <button 
                className="absolute bottom-2 right-2 p-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors shadow-lg group-hover:scale-110 transform duration-200"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="w-5 h-5" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
            <div className="text-center">
              <h3 className="font-medium text-lg">{profile.name}</h3>
              <p className="text-sm text-muted-foreground">{profile.about}</p>
            </div>
          </div>

          {/* Profile Form */}
          <div className="space-y-4 bg-card rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2">Name</Label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => {
                    setProfile({ ...profile, name: e.target.value });
                    setHasChanges(true);
                  }}
                  className="w-full p-3 rounded-md bg-secondary border focus:ring-2 focus:ring-primary"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <Label className="text-sm font-medium mb-2">About</Label>
                <textarea
                  value={profile.about}
                  onChange={(e) => {
                    setProfile({ ...profile, about: e.target.value });
                    setHasChanges(true);
                  }}
                  className="w-full p-3 rounded-md bg-secondary border focus:ring-2 focus:ring-primary h-24 resize-none"
                  placeholder="Tell us about yourself"
                />
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="space-y-6 bg-card rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-4">Privacy Settings</h3>
            
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
                <div className="flex items-center space-x-2 p-2 hover:bg-secondary rounded-md transition-colors">
                  <RadioGroupItem value="everyone" id="status-everyone" />
                  <Label htmlFor="status-everyone">Everyone</Label>
                </div>
                <div className="flex items-center space-x-2 p-2 hover:bg-secondary rounded-md transition-colors">
                  <RadioGroupItem value="contacts" id="status-contacts" />
                  <Label htmlFor="status-contacts">Contacts Only</Label>
                </div>
                <div className="flex items-center space-x-2 p-2 hover:bg-secondary rounded-md transition-colors">
                  <RadioGroupItem value="nobody" id="status-nobody" />
                  <Label htmlFor="status-nobody">Nobody</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Profile Visibility */}
            <div className="space-y-3 pt-4 border-t">
              <Label className="text-sm font-medium">Profile Visibility</Label>
              <RadioGroup
                value={profile.profileVisibility}
                onValueChange={(value: "everyone" | "contacts" | "nobody") => 
                  handlePrivacyChange("profileVisibility", value)
                }
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2 p-2 hover:bg-secondary rounded-md transition-colors">
                  <RadioGroupItem value="everyone" id="profile-everyone" />
                  <Label htmlFor="profile-everyone">Everyone</Label>
                </div>
                <div className="flex items-center space-x-2 p-2 hover:bg-secondary rounded-md transition-colors">
                  <RadioGroupItem value="contacts" id="profile-contacts" />
                  <Label htmlFor="profile-contacts">Contacts Only</Label>
                </div>
                <div className="flex items-center space-x-2 p-2 hover:bg-secondary rounded-md transition-colors">
                  <RadioGroupItem value="nobody" id="profile-nobody" />
                  <Label htmlFor="profile-nobody">Nobody</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Online Status Toggle */}
            <div className="flex items-center justify-between pt-4 border-t">
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
                  setHasChanges(true);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
