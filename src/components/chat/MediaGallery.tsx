
import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, X, Download, Share2, Trash2 } from "lucide-react";
import { fetchMediaItems } from "@/utils/chat/media";
import { MediaItem } from "@/types/chat";

interface MediaGalleryProps {
  chatId: string;
  onClose: () => void;
}

export const MediaGallery = ({ chatId, onClose }: MediaGalleryProps) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [activeTab, setActiveTab] = useState<"images" | "videos" | "files">("images");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMediaItems = async () => {
      setIsLoading(true);
      try {
        const items = await fetchMediaItems(chatId);
        setMediaItems(items);
      } catch (error) {
        console.error("Error loading media items:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMediaItems();
  }, [chatId]);

  const filteredMedia = mediaItems.filter(item => {
    if (activeTab === "images") return item.type === "image";
    if (activeTab === "videos") return item.type === "video";
    if (activeTab === "files") return item.type === "document" || item.type === "voice";
    return false;
  });

  // Type-safe handler for tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value as "images" | "videos" | "files");
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold">Media Gallery</h2>
        <Button variant="ghost" size="icon">
          <X className="h-5 w-5" onClick={onClose} />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="images" className="border-b border-border" onValueChange={handleTabChange}>
        <TabsList className="px-6">
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <TabsContent value="images" className="h-full">
          <ScrollArea className="h-full">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 p-3">
              {isLoading ? (
                Array(12).fill(null).map((_, i) => (
                  <div key={i} className="aspect-square rounded-md bg-secondary animate-pulse" />
                ))
              ) : filteredMedia.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">No images found</div>
              ) : (
                filteredMedia.map(item => (
                  <div key={item.id} className="aspect-square rounded-md overflow-hidden relative">
                    <img src={item.url} alt={item.name || "Media"} className="object-cover w-full h-full" />
                    <div className="absolute top-0 left-0 w-full h-full hover:bg-background/40 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="videos" className="h-full">
          <ScrollArea className="h-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 p-3">
              {isLoading ? (
                Array(6).fill(null).map((_, i) => (
                  <div key={i} className="aspect-video rounded-md bg-secondary animate-pulse" />
                ))
              ) : filteredMedia.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">No videos found</div>
              ) : (
                filteredMedia.map(item => (
                  <div key={item.id} className="aspect-video rounded-md overflow-hidden relative">
                    <video src={item.url} controls className="object-cover w-full h-full" />
                    <div className="absolute top-0 left-0 w-full h-full hover:bg-background/40 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="files" className="h-full">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-3">
              {isLoading ? (
                Array(4).fill(null).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 py-2 animate-pulse">
                    <div className="h-10 w-10 rounded-md bg-secondary" />
                    <div className="flex-1 space-y-1">
                      <div className="h-4 w-3/4 bg-secondary rounded-md" />
                      <div className="h-3 w-1/2 bg-secondary rounded-md" />
                    </div>
                  </div>
                ))
              ) : filteredMedia.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">No files found</div>
              ) : (
                filteredMedia.map(item => (
                  <div key={item.id} className="flex items-center space-x-4 py-2 rounded-md hover:bg-secondary">
                    <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                      {item.type === "image" && <img src={item.thumbnail_url || item.url} alt={item.name || "File"} className="max-h-full max-w-full object-cover" />}
                      {item.type === "video" && <video src={item.url} className="max-h-full max-w-full object-cover" />}
                      {item.type === "voice" && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M3 9v6h4l5 5V4L7 9H3zM17 10l.94 2.06.82 2.41.88 2.53.94 2.06M12 12l.94 2.06.82 2.41.88 2.53.94 2.06"/></svg>}
                      {item.type === "document" && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium truncate">{item.name || "Untitled File"}</p>
                      <p className="text-sm text-muted-foreground">{item.size ? `${(item.size / 1024).toFixed(2)} KB` : "Unknown Size"}</p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </div>
    </div>
  );
};
