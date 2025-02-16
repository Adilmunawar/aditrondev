
import { MessageCircle, Users, Settings, Menu, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check if user has a theme preference
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

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-20' : 'w-0'} bg-card border-r transition-all duration-300 flex flex-col items-center py-6 gap-8`}>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6 text-foreground" />
        </button>
        <nav className="flex flex-col gap-6">
          <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <MessageCircle className="w-6 h-6 text-primary" />
          </button>
          <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <Users className="w-6 h-6 text-foreground" />
          </button>
          <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <Settings className="w-6 h-6 text-foreground" />
          </button>
          <button 
            onClick={toggleTheme}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            {isDark ? (
              <Sun className="w-6 h-6 text-foreground" />
            ) : (
              <Moon className="w-6 h-6 text-foreground" />
            )}
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 bg-background overflow-hidden">
        {children}
      </main>
    </div>
  );
};
