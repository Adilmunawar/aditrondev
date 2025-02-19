
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Contact2, FolderOpen, MapPin, Loader2 } from "lucide-react";

interface PermissionsRequestProps {
  onComplete: () => void;
}

export const PermissionsRequest = ({ onComplete }: PermissionsRequestProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [permissions, setPermissions] = useState({
    contacts: false,
    storage: false,
    location: false,
  });

  const requestPermission = async (type: 'contacts' | 'storage' | 'location') => {
    try {
      let granted = false;

      switch (type) {
        case 'contacts':
          if ('contacts' in navigator) {
            // @ts-ignore - Contacts API is not fully typed
            const result = await navigator.contacts.select(['name', 'tel']);
            granted = result.length > 0;
          }
          break;
        case 'storage':
          const storageResult = await navigator.storage.persist();
          granted = storageResult;
          break;
        case 'location':
          const locationResult = await navigator.permissions.query({ name: 'geolocation' });
          granted = locationResult.state === 'granted';
          break;
      }

      if (granted) {
        setPermissions(prev => ({ ...prev, [type]: true }));
        
        const user = (await supabase.auth.getSession()).data.session?.user;
        if (!user) throw new Error("No user found");

        await supabase
          .from('user_permissions')
          .update({ [`${type}_permission`]: true })
          .eq('profile_id', user.id);

        toast({
          title: "Permission granted",
          description: `${type.charAt(0).toUpperCase() + type.slice(1)} access enabled`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Permission error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const completeSetup = async () => {
    setIsLoading(true);
    try {
      onComplete();
    } catch (error: any) {
      toast({
        title: "Error",
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
          <h1 className="text-4xl font-bold tracking-tight">Almost Done!</h1>
          <p className="text-muted-foreground">
            Grant permissions to unlock all features
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => requestPermission('contacts')}
            disabled={permissions.contacts}
            className="w-full py-6 text-lg justify-start space-x-4"
            variant={permissions.contacts ? "secondary" : "default"}
          >
            <Contact2 className="w-6 h-6" />
            <div className="flex-1 text-left">
              <div className="font-semibold">Contacts</div>
              <div className="text-sm text-muted-foreground">
                Find friends using Aditron
              </div>
            </div>
          </Button>

          <Button
            onClick={() => requestPermission('storage')}
            disabled={permissions.storage}
            className="w-full py-6 text-lg justify-start space-x-4"
            variant={permissions.storage ? "secondary" : "default"}
          >
            <FolderOpen className="w-6 h-6" />
            <div className="flex-1 text-left">
              <div className="font-semibold">Storage</div>
              <div className="text-sm text-muted-foreground">
                Share photos and files
              </div>
            </div>
          </Button>

          <Button
            onClick={() => requestPermission('location')}
            disabled={permissions.location}
            className="w-full py-6 text-lg justify-start space-x-4"
            variant={permissions.location ? "secondary" : "default"}
          >
            <MapPin className="w-6 h-6" />
            <div className="flex-1 text-left">
              <div className="font-semibold">Location</div>
              <div className="text-sm text-muted-foreground">
                Share location with friends
              </div>
            </div>
          </Button>
        </div>

        <Button
          onClick={completeSetup}
          disabled={isLoading}
          className="w-full py-6 text-lg"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Get Started"
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          You can change these permissions later in settings
        </p>
      </div>
    </div>
  );
};
