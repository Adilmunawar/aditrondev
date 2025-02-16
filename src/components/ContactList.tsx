
import { User } from "lucide-react";

interface Contact {
  id: number;
  name: string;
  status: string;
  avatar?: string;
}

export const ContactList = () => {
  // Mock data - would be replaced with real data in a full implementation
  const contacts: Contact[] = [
    { id: 1, name: "John Doe", status: "Online" },
    { id: 2, name: "Jane Smith", status: "Last seen 2h ago" },
    { id: 3, name: "Alice Johnson", status: "Offline" },
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
            {contact.avatar ? (
              <img
                src={contact.avatar}
                alt={contact.name}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
            )}
            <div>
              <h3 className="font-medium">{contact.name}</h3>
              <p className="text-sm text-muted-foreground">{contact.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
