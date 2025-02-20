
import { MessageCircle, Users, Settings, Menu, Sun, Moon, Users2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Chat } from "./Chat";
import { ContactList } from "./ContactList";
import { ProfileSettings } from "./ProfileSettings";
import { GroupCreation } from "./GroupCreation";

type Panel = "chat" | "contacts" | "settings" | "group";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [activePanel, setActivePanel] = useState<Panel>("chat");

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

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-br from-background to-secondary/30">
      {/* Sidebar */}
      <div 
        className={`${
          isSidebarOpen ? 'w-20' : 'w-0'
        } bg-card/80 backdrop-blur-sm border-r border-border/50 transition-all duration-300 flex flex-col items-center py-6 gap-8`}
      >
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-secondary rounded-lg transition-colors duration-200 hover:scale-110 transform"
        >
          <Menu className="w-6 h-6 text-foreground" />
        </button>
        <nav className="flex flex-col gap-6">
          <button 
            onClick={() => setActivePanel("chat")}
            className={`p-2 hover:bg-secondary rounded-lg transition-all duration-200 hover:scale-110 transform ${
              activePanel === "chat" ? "bg-primary/10 text-primary" : ""
            }`}
          >
            <MessageCircle className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setActivePanel("contacts")}
            className={`p-2 hover:bg-secondary rounded-lg transition-all duration-200 hover:scale-110 transform ${
              activePanel === "contacts" ? "bg-primary/10 text-primary" : ""
            }`}
          >
            <Users className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setActivePanel("group")}
            className={`p-2 hover:bg-secondary rounded-lg transition-all duration-200 hover:scale-110 transform ${
              activePanel === "group" ? "bg-primary/10 text-primary" : ""
            }`}
          >
            <Users2 className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setActivePanel("settings")}
            className={`p-2 hover:bg-secondary rounded-lg transition-all duration-200 hover:scale-110 transform ${
              activePanel === "settings" ? "bg-primary/10 text-primary" : ""
            }`}
          >
            <Settings className="w-6 h-6" />
          </button>
          <button 
            onClick={toggleTheme}
            className="p-2 hover:bg-secondary rounded-lg transition-all duration-200 hover:scale-110 transform mt-auto"
          >
            {isDark ? (
              <Sun className="w-6 h-6 text-yellow-500" />
            ) : (
              <Moon className="w-6 h-6 text-blue-500" />
            )}
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 bg-background/50 backdrop-blur-sm overflow-hidden rounded-l-xl transition-all duration-300">
        {renderPanel()}
      </main>
    </div>
  );
};
