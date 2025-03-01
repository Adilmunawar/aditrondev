
import { useState } from "react";
import { User, Search, Plus, UserPlus, MoreVertical, Phone, Video } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface Contact {
  id: number;
  name: string;
  status: string;
  avatar?: string;
  hasStatus?: boolean;
  isOnline?: boolean;
  lastSeen?: Date;
  email?: string;
  phone?: string;
}

export const ContactList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([
    { 
      id: 1, 
      name: "John Doe", 
      status: "At the gym 💪", 
      avatar: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1",
      hasStatus: true,
      isOnline: true,
      lastSeen: new Date(),
      email: "john.doe@example.com",
      phone: "+1 234 567 8901"
    },
    { 
      id: 2, 
      name: "Jane Smith", 
      status: "Working from home today 🏠", 
      avatar: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952",
      hasStatus: true,
      isOnline: true,
      lastSeen: new Date(),
      email: "jane.smith@example.com",
      phone: "+1 234 567 8902"
    },
    { 
      id: 3, 
      name: "Alice Johnson", 
      status: "On vacation ✈️", 
      avatar: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
      hasStatus: true,
      isOnline: false,
      lastSeen: new Date(Date.now() - 3600000), // 1 hour ago
      email: "alice.johnson@example.com",
      phone: "+1 234 567 8903"
    },
    { 
      id: 4, 
      name: "Robert Wilson", 
      status: "In a meeting 📊", 
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
      isOnline: true,
      lastSeen: new Date(),
      email: "robert.wilson@example.com",
      phone: "+1 234 567 8904"
    },
    { 
      id: 5, 
      name: "Emily Davis", 
      status: "Just finished a great book 📚", 
      avatar: "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56",
      isOnline: false,
      lastSeen: new Date(Date.now() - 86400000), // 1 day ago
      email: "emily.davis@example.com",
      phone: "+1 234 567 8905"
    }
  ]);

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    if (days === 1) return "Yesterday";
    
    return `${days}d ago`;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-card/50 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">Contacts</h2>
          <Button size="sm" variant="outline" className="gap-1">
            <UserPlus className="w-4 h-4" />
            <span>Add Contact</span>
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Search contacts"
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs defaultValue="all" className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-3 px-4 py-2">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="online">Online</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="flex-1 p-0 m-0">
          <ScrollArea className="h-full">
            {filteredContacts.length > 0 ? (
              filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center gap-3 p-4 hover:bg-secondary transition-colors cursor-pointer"
                >
                  <div className={`relative ${contact.hasStatus ? 'status-ring' : ''}`}>
                    {contact.avatar ? (
                      <img
                        src={contact.avatar}
                        alt={contact.name}
                        className="w-12 h-12 rounded-full relative z-10 object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center relative z-10">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                    )}
                    {contact.isOnline ? (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full z-20" />
                    ) : (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-gray-300 border-2 border-white dark:border-gray-800 rounded-full z-20" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{contact.name}</h3>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                          <Video className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                              <MoreVertical className="w-4 h-4 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Contact Options</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                            <DropdownMenuItem>Send Message</DropdownMenuItem>
                            <DropdownMenuItem>Share Contact</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-500">Remove Contact</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-500">Block Contact</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    
                    <div className="flex flex-col mt-1">
                      <p className="text-sm text-muted-foreground">
                        {contact.status}
                      </p>
                      <div className="flex items-center mt-1">
                        {contact.isOnline ? (
                          <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-200">
                            Online
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Last seen {formatLastSeen(contact.lastSeen!)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <p className="text-muted-foreground mb-2">No contacts found</p>
                <Button size="sm" className="mt-2">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Contact
                </Button>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="online" className="flex-1 p-0 m-0">
          <ScrollArea className="h-full">
            {filteredContacts.filter(c => c.isOnline).length > 0 ? (
              filteredContacts
                .filter(c => c.isOnline)
                .map((contact) => (
                  // Online contacts - same structure as above
                  <div
                    key={contact.id}
                    className="flex items-center gap-3 p-4 hover:bg-secondary transition-colors cursor-pointer"
                  >
                    {/* Same content as above for online contacts */}
                    <div className={`relative ${contact.hasStatus ? 'status-ring' : ''}`}>
                      {contact.avatar ? (
                        <img
                          src={contact.avatar}
                          alt={contact.name}
                          className="w-12 h-12 rounded-full relative z-10 object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center relative z-10">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                      )}
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full z-20" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{contact.name}</h3>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <Video className="w-4 h-4 text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <MoreVertical className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex flex-col mt-1">
                        <p className="text-sm text-muted-foreground">
                          {contact.status}
                        </p>
                        <div className="flex items-center mt-1">
                          <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-200">
                            Online
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <p className="text-muted-foreground">No contacts online</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="recent" className="flex-1 p-0 m-0">
          <ScrollArea className="h-full">
            {filteredContacts
              .sort((a, b) => (b.lastSeen?.getTime() || 0) - (a.lastSeen?.getTime() || 0))
              .slice(0, 5)
              .map((contact) => (
                // Recent contacts - same structure as above
                <div
                  key={contact.id}
                  className="flex items-center gap-3 p-4 hover:bg-secondary transition-colors cursor-pointer"
                >
                  {/* Same content as above for recent contacts */}
                  <div className={`relative ${contact.hasStatus ? 'status-ring' : ''}`}>
                    {contact.avatar ? (
                      <img
                        src={contact.avatar}
                        alt={contact.name}
                        className="w-12 h-12 rounded-full relative z-10 object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center relative z-10">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                    )}
                    {contact.isOnline ? (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full z-20" />
                    ) : (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-gray-300 border-2 border-white dark:border-gray-800 rounded-full z-20" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{contact.name}</h3>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                          <Video className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                          <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex flex-col mt-1">
                      <p className="text-sm text-muted-foreground">
                        {contact.status}
                      </p>
                      <div className="flex items-center mt-1">
                        {contact.isOnline ? (
                          <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-200">
                            Online
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Last seen {formatLastSeen(contact.lastSeen!)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};
