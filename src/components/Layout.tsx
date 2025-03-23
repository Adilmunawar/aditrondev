
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { Chat } from "@/components/Chat";
import { ContactList } from "@/components/ContactList";
import { ProfileSettings } from "@/components/ProfileSettings";
import { GroupCreation } from "@/components/GroupCreation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

type Panel = "chat" | "contacts" | "profile" | "group";

interface LayoutProps {
  children?: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const [activePanel, setActivePanel] = useState<Panel>("chat");
  const [userAuthenticated, setUserAuthenticated] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserAuthenticated(!!session);
    };

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        setUserAuthenticated(true);
      } else if (event === 'SIGNED_OUT') {
        setUserAuthenticated(false);
        navigate('/auth');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const renderPanel = () => {
    switch (activePanel) {
      case "chat":
        return <Chat />;
      case "contacts":
        return <ContactList />;
      case "profile":
        return <ProfileSettings />;
      case "group":
        return <GroupCreation />;
      default:
        return <Chat />;
    }
  };

  if (!userAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background to-secondary/30 p-6">
        <div className="text-center space-y-6 max-w-md">
          <h1 className="text-4xl font-bold">Welcome to Aditron</h1>
          <p className="text-lg text-muted-foreground">Please sign in to access the chat application.</p>
          <div className="flex flex-col space-y-3">
            <Button asChild className="flex items-center gap-2">
              <Link to="/auth">
                Sign In / Create Account
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden bg-background">
      <div className="container mx-auto px-4 py-6 h-screen flex flex-col">
        <header className="flex justify-between items-center mb-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Aditron</h1>
          </div>
          <nav className="flex-1 flex justify-center">
            <div className="flex space-x-2">
              <Button 
                variant={activePanel === "chat" ? "default" : "ghost"} 
                onClick={() => setActivePanel("chat")}
              >
                Chat
              </Button>
              <Button
                variant={activePanel === "contacts" ? "default" : "ghost"}
                onClick={() => setActivePanel("contacts")}
              >
                Contacts
              </Button>
              <Button
                variant={activePanel === "group" ? "default" : "ghost"}
                onClick={() => setActivePanel("group")}
              >
                Create Group
              </Button>
              <Button
                variant={activePanel === "profile" ? "default" : "ghost"}
                onClick={() => setActivePanel("profile")}
              >
                Profile
              </Button>
            </div>
          </nav>
          <div className="flex-1 flex justify-end">
            <Button variant="outline" size="icon" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-hidden">
          {children || renderPanel()}
        </main>
      </div>
    </div>
  );
}
