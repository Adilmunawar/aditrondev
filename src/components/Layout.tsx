
import { MessageCircle, Users, Settings, Menu } from "lucide-react";
import { useState } from "react";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-20' : 'w-0'} bg-white border-r transition-all duration-300 flex flex-col items-center py-6 gap-8`}>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6 text-gray-600" />
        </button>
        <nav className="flex flex-col gap-6">
          <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <MessageCircle className="w-6 h-6 text-primary" />
          </button>
          <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <Users className="w-6 h-6 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <Settings className="w-6 h-6 text-gray-600" />
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
