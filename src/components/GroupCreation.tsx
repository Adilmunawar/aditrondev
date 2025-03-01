
import { useState } from "react";
import { Users, Camera, Search, X, Check, Info, UserPlus } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "./ui/tooltip";
import { toast } from "./ui/use-toast";

interface Contact {
  id: number;
  name: string;
  avatar?: string;
  selected?: boolean;
  email?: string;
}

export const GroupCreation = () => {
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([
    { id: 1, name: "John Doe", avatar: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1", email: "john.doe@example.com" },
    { id: 2, name: "Jane Smith", avatar: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952", email: "jane.smith@example.com" },
    { id: 3, name: "Alice Johnson", avatar: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158", email: "alice.johnson@example.com" },
    { id: 4, name: "Robert Wilson", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e", email: "robert.wilson@example.com" },
    { id: 5, name: "Emily Davis", avatar: "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56", email: "emily.davis@example.com" },
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

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedContacts = contacts.filter(contact => contact.selected);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      toast({
        title: "Group name required",
        description: "Please enter a name for your group",
        variant: "destructive",
      });
      return;
    }

    if (selectedContacts.length < 2) {
      toast({
        title: "Not enough members",
        description: "Please select at least 2 contacts for your group",
        variant: "destructive",
      });
      return;
    }

    // Here you would normally save the group to your backend
    toast({
      title: "Group created!",
      description: `${groupName} has been created with ${selectedContacts.length} members.`,
      variant: "default",
    });

    // Reset form
    setGroupName("");
    setGroupDescription("");
    setPreviewUrl(null);
    setSelectedFile(null);
    setContacts(contacts.map(c => ({ ...c, selected: false })));
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-card/50 backdrop-blur-sm">
        <h2 className="font-semibold text-lg">Create Group</h2>
      </div>
      
      <ScrollArea className="flex-1 p-6">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Group Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Group Information</h3>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <div className="relative">
                <div className={`w-24 h-24 rounded-full ${previewUrl ? '' : 'bg-primary/10'} flex items-center justify-center overflow-hidden border-2 border-border`}>
                  {previewUrl ? (
                    <img 
                      src={previewUrl} 
                      alt="Group Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Users className="w-12 h-12 text-primary" />
                  )}
                </div>
                <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary-hover cursor-pointer">
                  <Camera className="w-4 h-4" />
                  <input 
                    id="avatar-upload" 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              
              <div className="flex-1 space-y-3 w-full sm:w-auto">
                <div>
                  <label htmlFor="group-name" className="block text-sm font-medium mb-1">
                    Group Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="group-name"
                    type="text"
                    placeholder="Enter group name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                  />
                </div>
                
                <div>
                  <label htmlFor="group-description" className="block text-sm font-medium mb-1">
                    Group Description
                  </label>
                  <Textarea
                    id="group-description"
                    placeholder="What's this group about?"
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Selected Contacts */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Group Members</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Info className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">You need at least 2 members to create a group</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            {selectedContacts.length > 0 ? (
              <div className="flex flex-wrap gap-2 p-3 bg-secondary/50 rounded-lg">
                {selectedContacts.map(contact => (
                  <Badge key={contact.id} variant="secondary" className="gap-1 py-1.5">
                    {contact.name}
                    <button onClick={() => toggleContact(contact.id)}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="text-center p-4 bg-secondary/30 rounded-lg">
                <p className="text-muted-foreground text-sm">No contacts selected yet</p>
              </div>
            )}
          </div>
          
          {/* Contact Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Add Contacts</h3>
              <Button variant="outline" size="sm" className="gap-1">
                <UserPlus className="w-4 h-4" />
                <span>New Contact</span>
              </Button>
            </div>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search contacts"
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
              {filteredContacts.length > 0 ? (
                filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => toggleContact(contact.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      contact.selected ? "bg-primary/10" : "hover:bg-secondary"
                    }`}
                  >
                    <div className="relative">
                      {contact.avatar ? (
                        <img
                          src={contact.avatar}
                          alt={contact.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <span className="font-medium">{contact.name}</span>
                      {contact.email && (
                        <p className="text-xs text-muted-foreground">{contact.email}</p>
                      )}
                    </div>
                    
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      contact.selected ? "bg-primary text-primary-foreground" : "border border-muted"
                    }`}>
                      {contact.selected && <Check className="w-4 h-4" />}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-4">
                  <p className="text-muted-foreground">No contacts found</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Create Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline">Cancel</Button>
            <Button 
              onClick={handleCreateGroup}
              disabled={!groupName.trim() || selectedContacts.length < 2}
            >
              Create Group
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
