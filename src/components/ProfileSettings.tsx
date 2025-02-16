
import { Camera, User } from "lucide-react";
import { useState } from "react";

interface Profile {
  name: string;
  about: string;
  avatar?: string;
}

export const ProfileSettings = () => {
  const [profile, setProfile] = useState<Profile>({
    name: "Your Name",
    about: "Hey there! I'm using Aditron",
  });

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-card/50 backdrop-blur-sm">
        <h2 className="font-semibold">Profile Settings</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt="Profile"
                className="w-24 h-24 rounded-full"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-12 h-12 text-primary" />
              </div>
            )}
            <button className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full hover:bg-primary-hover">
              <Camera className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Profile Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full p-2 rounded-md bg-secondary border focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">About</label>
            <textarea
              value={profile.about}
              onChange={(e) => setProfile({ ...profile, about: e.target.value })}
              className="w-full p-2 rounded-md bg-secondary border focus:ring-2 focus:ring-primary h-24 resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
