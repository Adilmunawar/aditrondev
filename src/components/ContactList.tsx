import { useState, useMemo } from "react";
import {
  User,
  Search,
  Plus,
  UserPlus,
  MoreVertical,
  Phone,
  Video,
} from "lucide-react";
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

// Types
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

interface ContactItemProps {
  contact: Contact;
}

// Reusable Contact Item Component
const ContactItem = ({ contact }: ContactItemProps) => {
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
    <div
      className="flex items-center gap-3 p-4 hover:bg-secondary transition-colors cursor-pointer"
      key={contact.id}
    >
      <div className={`relative ${contact.hasStatus ? "status-ring" : ""}`}>
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
        <div
          className={`absolute bottom-0 right-0 w-3.5 h-3.5 ${
            contact.isOnline ? "bg-green-500" : "bg-gray-300"
          } border-2 border-white dark:border-gray-800 rounded-full z-20`}
        />
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                >
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
                <DropdownMenuItem className="text-red-500">
                  Remove Contact
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-500">
                  Block Contact
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex flex-col mt-1">
          <p className="text-sm text-muted-foreground">{contact.status}</p>
          <div className="flex items-center mt-1">
            {contact.isOnline ? (
              <Badge
                variant="outline"
                className="text-xs bg-green-500/10 text-green-600 border-green-200"
              >
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
  );
};

// Main Contact List Component
export const ContactList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [contacts] = useState<Contact[]>([
    {
      id: 1,
      name: "John Doe",
      status: "At the gym 💪",
      avatar: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1",
      hasStatus: true,
      isOnline: true,
      lastSeen: new Date(),
      email: "john.doe@example.com",
      phone: "+1 234 567 8901",
    },
    // ... other contacts
  ]);

  // Memoized Filtered Contacts
  const filteredContacts = useMemo(
    () =>
      contacts.filter((contact) =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [contacts, searchTerm]
  );

  const onlineContacts = useMemo(
    () => filteredContacts.filter((contact) => contact.isOnline),
    [filteredContacts]
  );

  const recentContacts = useMemo(
    () =>
      [...filteredContacts]
        .sort((a, b) => (b.lastSeen?.getTime() || 0) - (a.lastSeen?.getTime() || 0))
        .slice(0, 5),
    [filteredContacts]
  );

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
            {filteredContacts.map((contact) => (
              <ContactItem contact={contact} key={contact.id} />
            ))}
          </ScrollArea>
        </TabsContent>
        <TabsContent value="online" className="flex-1 p-0 m-0">
          <ScrollArea className="h-full">
            {onlineContacts.map((contact) => (
              <ContactItem contact={contact} key={contact.id} />
            ))}
          </ScrollArea>
        </TabsContent>
        <TabsContent value="recent" className="flex-1 p-0 m-0">
          <ScrollArea className="h-full">
            {recentContacts.map((contact) => (
              <ContactItem contact={contact} key={contact.id} />
            ))}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};
