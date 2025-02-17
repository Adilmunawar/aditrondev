
import { User } from "lucide-react";

interface Contact {
  id: number;
  name: string;
  status: string;
  avatar?: string;
  hasStatus?: boolean;
  isOnline?: boolean;
}

export const ContactList = () => {
  // Mock data with richer details
  const contacts: Contact[] = [
    { 
      id: 1, 
      name: "John Doe", 
      status: "At the gym 💪", 
      avatar: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1",
      hasStatus: true,
      isOnline: true
    },
    { 
      id: 2, 
      name: "Jane Smith", 
      status: "Working from home today 🏠", 
      avatar: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952",
      hasStatus: true,
      isOnline: true
    },
    { 
      id: 3, 
      name: "Alice Johnson", 
      status: "On vacation ✈️", 
      avatar: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
      hasStatus: true,
      isOnline: false
    },
    { 
      id: 4, 
      name: "Robert Wilson", 
      status: "In a meeting 📊", 
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
      isOnline: true
    }
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-card/50 backdrop-blur-sm">
        <h2 className="font-semibold">Contacts</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {contacts.map((contact) => (
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
              {contact.isOnline && (
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full z-20" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">{contact.name}</h3>
                {contact.hasStatus && (
                  <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                    Updated
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {contact.status}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
