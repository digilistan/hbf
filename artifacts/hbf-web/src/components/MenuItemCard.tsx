import { useCartStore } from "@/store";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, Flame, Star, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { MenuItem } from "@workspace/api-client-react";
import { useState } from "react";

export function MenuItemCard({ item }: { item: MenuItem }) {
  const addItem = useCartStore(s => s.addItem);
  const { toast } = useToast();
  const [imgError, setImgError] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);

  const handleAdd = () => {
    addItem({ ...item, itemId: item._id, quantity: 1 });
    toast({
      title: "Added to cart!",
      description: `${item.name} added to your order.`,
      duration: 2000,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-card rounded-2xl shadow-sm border border-border/50 hover:shadow-xl hover:border-primary/20 transition-all duration-300 flex flex-col h-full group overflow-hidden"
    >
      {/* Image Container */}
      <div className="relative h-44 bg-muted overflow-hidden shrink-0">
        {item.imageUrl && !imgError ? (
          <>
            {imgLoading && (
              <div className="absolute inset-0 skeleton animate-pulse bg-muted" />
            )}
            <img
              src={item.imageUrl}
              alt={item.name}
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                imgLoading ? "opacity-0" : "opacity-100"
              }`}
              onLoad={() => setImgLoading(false)}
              onError={() => {
                setImgError(true);
                setImgLoading(false);
              }}
              loading="lazy"
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
            <ShoppingBag className="w-12 h-12 text-primary/20" />
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1 z-10">
          {item.isBestSeller && (
            <span className="flex items-center gap-1 bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
              <Star className="w-3 h-3 fill-white" /> Best Seller
            </span>
          )}
          {item.isSpicy && (
            <span className="flex items-center gap-1 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
              <Flame className="w-3 h-3 fill-white" /> Spicy
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-bold text-base text-foreground leading-tight mb-1 group-hover:text-primary transition-colors">
          {item.name}
        </h3>
        {item.description && (
          <p className="text-muted-foreground text-xs line-clamp-2 flex-1 mb-4 leading-relaxed tracking-tight">
            {item.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Price</span>
            <span className="font-display font-black text-lg text-primary">Rs. {item.price}</span>
          </div>
          <Button
            onClick={handleAdd}
            size="sm"
            className="rounded-xl bg-primary text-white hover:bg-primary/90 transition-all group-hover:scale-105 shadow-md shadow-primary/20 h-9 px-4 font-bold"
          >
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
