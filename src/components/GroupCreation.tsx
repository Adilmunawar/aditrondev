
import { Users, Camera, Search } from "lucide-react";
import { useState } from "react";

interface Contact {
  id: number;
  name: string;
  avatar?: string;
  selected?: boolean;
}

export const GroupCreation = () => {
  const [groupName, setGroupName] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([
    { id: 1, name: "John Doe" },
    { id: 2, name: "Jane Smith" },
    { id: 3, name: "Alice Johnson" },
  ]);

  const toggleContact = (id: number) => {
    setContacts(
      contacts.map((contact) =>
        contact.id === id
          ? { ...contact, selected: !contact.selected }
          : contact
      )
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-card/50 backdrop-blur-sm">
        <h2 className="font-semibold">Create Group</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Group Info */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-12 h-12 text-primary" />
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full hover:bg-primary-hover">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <input
            type="text"
            placeholder="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full p-2 rounded-md bg-secondary border focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Contact Selection */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search contacts"
              className="w-full pl-10 p-2 rounded-md bg-secondary border focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-2">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => toggleContact(contact.id)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  contact.selected ? "bg-primary/10" : "hover:bg-secondary"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <span className="font-medium">{contact.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
