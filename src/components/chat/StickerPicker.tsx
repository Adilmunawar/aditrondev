
import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Smile, Search, StickyNote, Plus, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { fetchStickerPacks } from "@/utils/chat/stickers";
import { StickerPack, Sticker } from "@/types/chat";

interface StickerPickerProps {
  onSelectSticker: (sticker: Sticker) => void;
}

export const StickerPicker: React.FC<StickerPickerProps> = ({ onSelectSticker }) => {
  const [activeTab, setActiveTab] = useState("stickers");
  const [stickerPacks, setStickerPacks] = useState<StickerPack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    const loadStickerPacks = async () => {
      setIsLoading(true);
      try {
        const packs = await fetchStickerPacks();
        setStickerPacks(packs);
      } catch (error) {
        console.error("Error loading sticker packs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStickerPacks();
  }, []);

  const filteredStickers = stickerPacks.flatMap(pack => pack.stickers)
    .filter(sticker => sticker.emoji?.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleEmojiSelect = (emoji: any) => {
    console.log("Selected emoji:", emoji);
  };

  // Type-safe handler for tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const renderSticker = (sticker: Sticker) => (
    <Button
      key={sticker.id}
      variant="ghost"
      className="p-1.5 rounded-md hover:bg-secondary"
      onClick={() => onSelectSticker(sticker)}
    >
      <img src={sticker.url} alt={sticker.id} className="h-7 w-7" />
    </Button>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Input
            placeholder="Search stickers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9"
          />
          <Search className="absolute top-2.5 right-3 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <Tabs defaultValue="stickers" className="flex-1 flex flex-col" onValueChange={handleTabChange}>
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="stickers" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <StickyNote className="h-4 w-4 mr-1" />
            Stickers
          </TabsTrigger>
          <TabsTrigger value="emojis" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Smile className="h-4 w-4 mr-1" />
            Emojis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stickers" className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 p-2">
            {isLoading ? (
              <div className="grid grid-cols-5 gap-2">
                {Array(20).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-10 rounded-md" />
                ))}
              </div>
            ) : filteredStickers.length > 0 ? (
              <div className="grid grid-cols-5 gap-2">
                {filteredStickers.map(sticker => renderSticker(sticker))}
              </div>
            ) : (
              <div className="text-center py-8 px-4 text-muted-foreground">
                <StickyNote className="mx-auto h-12 w-12 mb-3 opacity-20" />
                <p>No stickers found</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="emojis" className="flex-1 flex flex-col">
          <ScrollArea className="flex-1">
            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full h-10 rounded-none">
                  {showEmojiPicker ? (
                    <>
                      <X className="mr-2 h-4 w-4" />
                      Close Emoji Picker
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Open Emoji Picker
                    </>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] sm:w-[350px] p-0" align="start">
                <Picker data={data} onEmojiSelect={handleEmojiSelect} />
              </PopoverContent>
            </Popover>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};
