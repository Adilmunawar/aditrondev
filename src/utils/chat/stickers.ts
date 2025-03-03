
import { supabase } from "@/integrations/supabase/client";
import { Sticker, StickerPack } from "@/types/chat";

// Fetch sticker packs
export const fetchStickerPacks = async (): Promise<StickerPack[]> => {
  try {
    // Query sticker packs from the database
    const { data: packData, error: packError } = await supabase
      .from('sticker_packs')
      .select('*');
    
    if (packError) throw packError;
    
    const stickerPacks: StickerPack[] = [];
    
    // For each pack, get its stickers
    for (const pack of packData) {
      const { data: stickerData, error: stickerError } = await supabase
        .from('stickers')
        .select('*')
        .eq('pack_id', pack.id);
        
      if (stickerError) throw stickerError;
      
      const stickers: Sticker[] = stickerData.map(sticker => ({
        id: sticker.id,
        url: sticker.url,
        pack_id: sticker.pack_id,
        emoji: sticker.emoji
      }));
      
      stickerPacks.push({
        id: pack.id,
        name: pack.name,
        author: pack.author,
        cover_sticker_url: pack.cover_sticker_url,
        stickers
      });
    }
    
    return stickerPacks;
  } catch (error) {
    console.error('Error fetching sticker packs:', error);
    
    // Fallback to sample data if there's an error
    return [
      {
        id: "pack1",
        name: "Classic Emotions",
        author: "Lovable",
        cover_sticker_url: "https://source.unsplash.com/random/100x100?emoji",
        stickers: Array(8).fill(0).map((_, i) => ({
          id: `sticker${i+1}`,
          url: `https://source.unsplash.com/random/200x200?emoji=${i+1}`,
          pack_id: "pack1",
          emoji: ["😀", "😂", "😍", "😎", "🥳", "🤔", "😢", "🥰"][i]
        }))
      },
      {
        id: "pack2",
        name: "Animals",
        author: "Lovable",
        cover_sticker_url: "https://source.unsplash.com/random/100x100?animal",
        stickers: Array(8).fill(0).map((_, i) => ({
          id: `sticker${i+9}`,
          url: `https://source.unsplash.com/random/200x200?animal=${i+1}`,
          pack_id: "pack2",
          emoji: ["🐶", "🐱", "🐭", "🐰", "🦊", "🐻", "🐼", "🐨"][i]
        }))
      }
    ];
  }
};
