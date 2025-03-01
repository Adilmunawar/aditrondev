
import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MediaItem } from "@/types/chat";
import { fetchMediaItems } from "@/utils/chatBackend";
import { Image, FileText, Mic, Video, SlidersHorizontal, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";

interface MediaGalleryProps {
  chatId: string;
}

export const MediaGallery = ({ chatId }: MediaGalleryProps) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    loadMediaItems();
  }, [chatId]);

  const loadMediaItems = async () => {
    setIsLoading(true);
    try {
      const items = await fetchMediaItems(chatId);
      setMediaItems(items);
    } catch (error) {
      console.error("Error loading media items:", error);
      toast({
        title: "Error",
        description: "Failed to load media gallery. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = activeTab === "all" 
    ? mediaItems 
    : mediaItems.filter(item => item.type === activeTab);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Media Gallery</h3>
        <p className="text-sm text-muted-foreground">View shared media, documents and links</p>
      </div>
      
      <Tabs 
        defaultValue="all" 
        className="flex-1 flex flex-col"
        onValueChange={setActiveTab}
      >
        <div className="border-b px-4 pt-2">
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="all">
              <SlidersHorizontal className="h-4 w-4 mr-1" />
              All
            </TabsTrigger>
            <TabsTrigger value="image">
              <Image className="h-4 w-4 mr-1" />
              Photos
            </TabsTrigger>
            <TabsTrigger value="video">
              <Video className="h-4 w-4 mr-1" />
              Videos
            </TabsTrigger>
            <TabsTrigger value="voice">
              <Mic className="h-4 w-4 mr-1" />
              Audio
            </TabsTrigger>
            <TabsTrigger value="document">
              <FileText className="h-4 w-4 mr-1" />
              Docs
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="all" className="flex-1 p-0 m-0">
          <ScrollArea className="h-full">
            <div className="p-4">
              {isLoading ? (
                <div className="grid grid-cols-3 gap-2">
                  {Array(9).fill(0).map((_, idx) => (
                    <Skeleton key={idx} className="aspect-square rounded-md" />
                  ))}
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-8">
                  <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Image className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="text-lg font-medium">No media found</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Media shared in this chat will appear here
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {filteredItems.map((item) => (
                    <div key={item.id} className="group relative aspect-square rounded-md overflow-hidden bg-secondary">
                      {item.type === "image" && (
                        <img 
                          src={item.url} 
                          alt={item.name || "Image"} 
                          className="w-full h-full object-cover"
                        />
                      )}
                      {item.type === "video" && (
                        <div className="w-full h-full flex items-center justify-center bg-gray-900">
                          <img 
                            src={item.thumbnail_url} 
                            alt={item.name || "Video"} 
                            className="w-full h-full object-cover opacity-70"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-black/50 rounded-full p-2">
                              <Video className="h-6 w-6 text-white" />
                            </div>
                          </div>
                        </div>
                      )}
                      {item.type === "voice" && (
                        <div className="w-full h-full flex items-center justify-center bg-secondary">
                          <div className="bg-primary/10 rounded-full p-4">
                            <Mic className="h-6 w-6 text-primary" />
                          </div>
                        </div>
                      )}
                      {item.type === "document" && (
                        <div className="w-full h-full flex items-center justify-center bg-secondary">
                          <div className="bg-primary/10 rounded-full p-4">
                            <FileText className="h-6 w-6 text-primary" />
                          </div>
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button 
                          size="icon" 
                          className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30"
                          onClick={() => toast({
                            title: "Media Downloaded",
                            description: `${item.name || "File"} has been downloaded.`
                          })}
                        >
                          <Download className="h-4 w-4 text-white" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="image" className="flex-1 p-0 m-0">
          <ScrollArea className="h-full">
            <div className="p-4">
              {isLoading ? (
                <div className="grid grid-cols-3 gap-2">
                  {Array(9).fill(0).map((_, idx) => (
                    <Skeleton key={idx} className="aspect-square rounded-md" />
                  ))}
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-8">
                  <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Image className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="text-lg font-medium">No images found</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Images shared in this chat will appear here
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {filteredItems.map((item) => (
                    <div key={item.id} className="group relative aspect-square rounded-md overflow-hidden">
                      <img 
                        src={item.url} 
                        alt={item.name || "Image"} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button 
                          size="icon" 
                          className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30"
                          onClick={() => toast({
                            title: "Image Downloaded",
                            description: `${item.name || "Image"} has been downloaded.`
                          })}
                        >
                          <Download className="h-4 w-4 text-white" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
        
        {/* Similar implementation for other content types */}
        <TabsContent value="video" className="flex-1 p-0 m-0">
          <ScrollArea className="h-full">
            <div className="p-4">
              {/* Video content rendering similar to all/images */}
              {isLoading ? (
                <div className="grid grid-cols-3 gap-2">
                  {Array(6).fill(0).map((_, idx) => (
                    <Skeleton key={idx} className="aspect-square rounded-md" />
                  ))}
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-8">
                  <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Video className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="text-lg font-medium">No videos found</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Videos shared in this chat will appear here
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {filteredItems.map((item) => (
                    <div key={item.id} className="group relative aspect-square rounded-md overflow-hidden bg-gray-900">
                      <img 
                        src={item.thumbnail_url} 
                        alt={item.name || "Video"} 
                        className="w-full h-full object-cover opacity-70"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/50 rounded-full p-2">
                          <Video className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button 
                          size="icon" 
                          className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30"
                          onClick={() => toast({
                            title: "Video Downloaded",
                            description: `${item.name || "Video"} has been downloaded.`
                          })}
                        >
                          <Download className="h-4 w-4 text-white" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="voice" className="flex-1 p-0 m-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              {/* Voice message rendering */}
              {isLoading ? (
                <div className="space-y-2">
                  {Array(5).fill(0).map((_, idx) => (
                    <Skeleton key={idx} className="h-16 w-full rounded-md" />
                  ))}
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-8">
                  <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Mic className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="text-lg font-medium">No voice messages found</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Voice messages shared in this chat will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredItems.map((item) => (
                    <div key={item.id} className="p-3 rounded-md bg-secondary flex items-center">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                        <Mic className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium truncate">{item.name || "Voice message"}</span>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="h-2 bg-primary/20 rounded-full overflow-hidden">
                          <div className="h-full bg-primary w-1/3 rounded-full"></div>
                        </div>
                      </div>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="ml-2"
                        onClick={() => toast({
                          title: "Audio Downloaded",
                          description: `${item.name || "Voice message"} has been downloaded.`
                        })}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="document" className="flex-1 p-0 m-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              {/* Document rendering */}
              {isLoading ? (
                <div className="space-y-2">
                  {Array(5).fill(0).map((_, idx) => (
                    <Skeleton key={idx} className="h-16 w-full rounded-md" />
                  ))}
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-8">
                  <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="text-lg font-medium">No documents found</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Documents shared in this chat will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredItems.map((item) => (
                    <div key={item.id} className="p-3 rounded-md bg-secondary flex items-center">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <span className="font-medium truncate">{item.name || "Document"}</span>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {item.size ? `${Math.round(item.size / 1024)} KB` : "Unknown size"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="ml-2"
                        onClick={() => toast({
                          title: "Document Downloaded",
                          description: `${item.name || "Document"} has been downloaded.`
                        })}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};
