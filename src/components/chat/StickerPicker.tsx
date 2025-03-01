
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { StickerPack } from "@/types/chat";
import { fetchStickerPacks } from "@/utils/chatBackend";
import { toast } from "@/components/ui/use-toast";
import { Clock, Download, Heart, Plus } from "lucide-react";

interface StickerPickerProps {
  onSelectSticker: (stickerUrl: string) => void;
  onClose: () => void;
}

export const StickerPicker = ({ onSelectSticker, onClose }: StickerPickerProps) => {
  const [stickerPacks, setStickerPacks] = useState<StickerPack[]>([]);
  const [recentStickers, setRecentStickers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStickerPacks();
    loadRecentStickers();
  }, []);

  const loadStickerPacks = async () => {
    setIsLoading(true);
    try {
      const packs = await fetchStickerPacks();
      setStickerPacks(packs);
    } catch (error) {
      console.error("Error loading sticker packs:", error);
      toast({
        title: "Error",
        description: "Failed to load stickers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecentStickers = () => {
    try {
      const saved = localStorage.getItem("recentStickers");
      if (saved) {
        setRecentStickers(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Error loading recent stickers:", error);
    }
  };

  const handleSelectSticker = (stickerUrl: string) => {
    // Add to recent stickers
    const updatedRecent = [stickerUrl, ...recentStickers.filter(url => url !== stickerUrl)].slice(0, 8);
    setRecentStickers(updatedRecent);
    
    try {
      localStorage.setItem("recentStickers", JSON.stringify(updatedRecent));
    } catch (error) {
      console.error("Error saving recent stickers:", error);
    }
    
    // Send the sticker
    onSelectSticker(stickerUrl);
    onClose();
  };

  return (
    <div className="w-[360px] h-[400px] bg-card rounded-lg border border-border shadow-lg overflow-hidden flex flex-col">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold">Stickers</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          ✕
        </Button>
      </div>
      
      <Tabs defaultValue="recent" className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-3 p-2">
          <TabsTrigger value="recent">
            <Clock className="h-4 w-4 mr-1" />
            Recent
          </TabsTrigger>
          {!isLoading && (
            <TabsTrigger value="favorite">
              <Heart className="h-4 w-4 mr-1" />
              Favorites
            </TabsTrigger>
          )}
          <TabsTrigger value="all">All Packs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recent" className="flex-1 p-0 m-0">
          {recentStickers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <Clock className="h-10 w-10 text-muted-foreground opacity-50 mb-2" />
              <p className="text-sm text-muted-foreground">No recent stickers</p>
              <p className="text-xs text-muted-foreground">Your recently used stickers will appear here</p>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="grid grid-cols-4 gap-2 p-4">
                {recentStickers.map((url, idx) => (
                  <button
                    key={idx}
                    className="p-2 hover:bg-secondary rounded-lg transition-colors"
                    onClick={() => handleSelectSticker(url)}
                  >
                    <img 
                      src={url}
                      alt="Sticker"
                      className="w-full aspect-square object-contain hover:scale-110 transition-transform"
                    />
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
        
        <TabsContent value="favorite" className="flex-1 p-0 m-0">
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <Heart className="h-10 w-10 text-muted-foreground opacity-50 mb-2" />
            <p className="text-sm text-muted-foreground">No favorite stickers yet</p>
            <p className="text-xs text-muted-foreground">Long press on any sticker to add it to favorites</p>
          </div>
        </TabsContent>
        
        <TabsContent value="all" className="flex-1 p-0 m-0">
          {isLoading ? (
            <div className="p-4">
              <Skeleton className="h-12 mb-4" />
              <div className="grid grid-cols-4 gap-2">
                {Array(8).fill(0).map((_, idx) => (
                  <Skeleton key={idx} className="aspect-square rounded-lg" />
                ))}
              </div>
              
              <Skeleton className="h-12 my-4" />
              <div className="grid grid-cols-4 gap-2">
                {Array(8).fill(0).map((_, idx) => (
                  <Skeleton key={idx} className="aspect-square rounded-lg" />
                ))}
              </div>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="p-4 space-y-6">
                {stickerPacks.map((pack) => (
                  <div key={pack.id}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{pack.name}</h4>
                      <p className="text-xs text-muted-foreground">by {pack.author}</p>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {pack.stickers.map((sticker) => (
                        <button
                          key={sticker.id}
                          className="p-2 hover:bg-secondary rounded-lg transition-colors"
                          onClick={() => handleSelectSticker(sticker.url)}
                        >
                          <img 
                            src={sticker.url}
                            alt={sticker.emoji || "Sticker"}
                            className="w-full aspect-square object-contain hover:scale-110 transition-transform"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                
                <button className="w-full py-3 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center gap-2 text-sm text-muted-foreground hover:bg-secondary transition-colors">
                  <Plus className="h-4 w-4" />
                  Get more stickers
                </button>
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
