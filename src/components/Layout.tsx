
import { MessageCircle, Users, Settings, Menu, Sun, Moon, Users2, BellRing, PanelLeft, Palette, Search, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { Chat } from "./Chat";
import { ContactList } from "./ContactList";
import { ProfileSettings } from "./ProfileSettings";
import { GroupCreation } from "./GroupCreation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "./ui/use-toast";

type Panel = "chat" | "contacts" | "settings" | "group";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [activePanel, setActivePanel] = useState<Panel>("chat");
  const [notificationCount, setNotificationCount] = useState(3);

  useEffect(() => {
    const isDarkMode = localStorage.getItem("theme") === "dark" ||
      (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDark(isDarkMode);
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
    document.documentElement.classList.toggle("dark", newTheme);
    
    toast({
      title: `${newTheme ? 'Dark' : 'Light'} mode activated`,
      description: `The application theme has been changed to ${newTheme ? 'dark' : 'light'} mode.`,
    });
  };

  const renderPanel = () => {
    switch (activePanel) {
      case "contacts":
        return <ContactList />;
      case "settings":
        return <ProfileSettings />;
      case "group":
        return <GroupCreation />;
      default:
        return <Chat />;
    }
  };

  const clearNotifications = () => {
    setNotificationCount(0);
    toast({
      title: "Notifications cleared",
      description: "All notifications have been marked as read.",
    });
  };

  const createNewChat = () => {
    toast({
      title: "Create new chat",
      description: "This feature is coming soon!",
    });
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-br from-background via-secondary/5 to-background">
      {/* Sidebar */}
      <div 
        className={`${
          isSidebarOpen ? 'w-20' : 'w-0'
        } glass-card border-r border-border/50 transition-all duration-300 flex flex-col items-center py-6 gap-8 z-10`}
      >
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-secondary rounded-lg transition-colors duration-200 hover:scale-110 transform"
          >
            <Menu className="w-6 h-6 text-foreground" />
          </button>
          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold">
            A
          </div>
        </div>
        
        <nav className="flex flex-col gap-6">
          <Tabs defaultValue="main" orientation="vertical" className="w-full">
            <TabsList className="flex flex-col gap-4 bg-transparent">
              <TabsTrigger 
                value="main" 
                onClick={() => setActivePanel("chat")}
                className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 transform data-[state=active]:bg-primary/10 data-[state=active]:text-primary`}
              >
                <MessageCircle className="w-6 h-6" />
              </TabsTrigger>
              
              <TabsTrigger 
                value="contacts" 
                onClick={() => setActivePanel("contacts")}
                className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 transform data-[state=active]:bg-primary/10 data-[state=active]:text-primary`}
              >
                <Users className="w-6 h-6" />
              </TabsTrigger>
              
              <TabsTrigger 
                value="groups" 
                onClick={() => setActivePanel("group")}
                className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 transform data-[state=active]:bg-primary/10 data-[state=active]:text-primary`}
              >
                <Users2 className="w-6 h-6" />
              </TabsTrigger>
              
              <TabsTrigger 
                value="settings" 
                onClick={() => setActivePanel("settings")}
                className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 transform data-[state=active]:bg-primary/10 data-[state=active]:text-primary`}
              >
                <Settings className="w-6 h-6" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex flex-col gap-4 mt-auto">
            <button 
              onClick={clearNotifications}
              className="p-2 hover:bg-secondary rounded-lg transition-all duration-200 hover:scale-110 transform relative"
            >
              <BellRing className="w-6 h-6" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse-custom">
                  {notificationCount}
                </span>
              )}
            </button>
            
            <button 
              onClick={toggleTheme}
              className="p-2 hover:bg-secondary rounded-lg transition-all duration-200 hover:scale-110 transform"
            >
              {isDark ? (
                <Sun className="w-6 h-6 text-yellow-500" />
              ) : (
                <Moon className="w-6 h-6 text-blue-500" />
              )}
            </button>
            
            <button 
              className="p-2 hover:bg-secondary rounded-lg transition-all duration-200 hover:scale-110 transform"
              onClick={() => {
                toast({
                  title: "Theme customization",
                  description: "Coming soon! Personalize your chat experience.",
                });
              }}
            >
              <Palette className="w-6 h-6 text-purple-500" />
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 bg-background/50 backdrop-blur-sm overflow-hidden rounded-l-xl transition-all duration-300 relative">
        <div className="absolute top-4 right-4 z-10 flex gap-2 glass-card p-2 rounded-lg">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-lg"
            onClick={() => {
              toast({
                title: "Global search",
                description: "Search functionality coming soon!",
              });
            }}
          >
            <Search className="w-4 h-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-lg"
            onClick={createNewChat}
          >
            <Plus className="w-4 h-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-lg lg:hidden"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <PanelLeft className="w-4 h-4" />
          </Button>
        </div>
        
        {renderPanel()}
      </main>
    </div>
  );
};
