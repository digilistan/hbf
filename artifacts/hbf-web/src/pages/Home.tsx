import { PublicLayout } from "@/components/layout/PublicLayout";
import { useGetMenu } from "@workspace/api-client-react";
import { useCartStore } from "@/store";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, Flame, Star, ShoppingBag, ArrowRight, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { MenuItem } from "@workspace/api-client-react";
import { useState } from "react";

function MenuItemCard({ item }: { item: MenuItem }) {
  const addItem = useCartStore(s => s.addItem);
  const { toast } = useToast();
  const [imgError, setImgError] = useState(false);

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
      {/* Image */}
      <div className="relative h-44 bg-gradient-to-br from-primary/10 to-accent/10 overflow-hidden shrink-0">
        {item.imageUrl && !imgError ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-primary/30" />
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          {item.isBestSeller && (
            <span className="flex items-center gap-1 bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
              <Star className="w-3 h-3 fill-white" /> Best Seller
            </span>
          )}
          {item.isSpicy && (
            <span className="flex items-center gap-1 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
              <Flame className="w-3 h-3 fill-white" /> Spicy
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-bold text-base text-foreground leading-tight mb-1">{item.name}</h3>
        {item.description && (
          <p className="text-muted-foreground text-xs line-clamp-2 flex-1 mb-3">{item.description}</p>
        )}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
          <span className="font-display font-black text-lg text-primary">Rs. {item.price}</span>
          <Button
            onClick={handleAdd}
            size="sm"
            className="rounded-full bg-primary text-white hover:bg-primary/90 transition-all group-hover:scale-105 shadow-sm shadow-primary/20 h-8 px-3"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const { data: menuData, isLoading } = useGetMenu();

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
            alt="Delicious food"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 hero-gradient"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block py-1.5 px-5 rounded-full bg-accent/20 text-accent font-bold tracking-widest text-sm uppercase mb-6 border border-accent/30 backdrop-blur-sm">
              Lahore's Favorite Fast Food
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white font-display leading-[1.05] mb-6 drop-shadow-2xl">
              CRAVING<br />
              <span className="text-primary [-webkit-text-stroke:2px_white] drop-shadow-md">DELICIOUS?</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 font-medium mb-10 max-w-2xl mx-auto">
              Burgers • Pizzas • Wings • BBQ
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-14 px-10 rounded-full text-lg font-bold bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/30 w-full sm:w-auto" asChild>
                <a href="#menu">Order Online <ArrowRight className="ml-2 w-5 h-5" /></a>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 rounded-full text-lg font-bold bg-white/10 text-white border-white/20 hover:bg-white hover:text-black backdrop-blur-md w-full sm:w-auto" asChild>
                <a href="tel:03159408619"><Phone className="mr-2 w-5 h-5" /> Call 0315-9408619</a>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Decorative Wave */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-10">
          <svg className="relative block w-full h-[50px] md:h-[80px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,123.6,190.7,109.11,234.9,98.34,278.4,76.5,321.39,56.44Z" className="fill-background"></path>
          </svg>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl border bg-card overflow-hidden animate-pulse">
                  <div className="h-44 bg-muted" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-full" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                    <div className="h-8 bg-muted rounded w-full mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : menuData ? (
            <>
              {/* Sticky Category Navigation */}
              <div className="flex overflow-x-auto pb-3 mb-12 gap-2 sticky top-[72px] sm:top-[88px] z-30 bg-background/95 backdrop-blur pt-4 border-b border-border/50 -mx-4 px-4">
                {menuData.categories.map((cat) => (
                  <a
                    key={cat._id}
                    href={`#cat-${cat.slug}`}
                    className="whitespace-nowrap px-5 py-2.5 rounded-full bg-secondary/60 text-secondary-foreground text-sm font-bold hover:bg-primary hover:text-white transition-all duration-200 border border-border/50 shrink-0"
                  >
                    {cat.name}
                  </a>
                ))}
              </div>

              {/* Best Sellers Strip */}
              {menuData.bestSellers.length > 0 && (
                <div className="mb-20">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                      <Star className="w-6 h-6 text-accent fill-accent" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-display font-black text-foreground">Best Sellers</h2>
                      <p className="text-muted-foreground text-sm">Our most loved items</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {menuData.bestSellers.map(item => (
                      <MenuItemCard key={item._id} item={item} />
                    ))}
                  </div>
                </div>
              )}

              {/* Category Sections */}
              <div className="space-y-20">
                {menuData.categories.map((category) => (
                  <div key={category._id} id={`cat-${category.slug}`} className="scroll-mt-36">
                    <div className="flex items-end justify-between mb-8 pb-4 border-b-2 border-primary/10">
                      <h2 className="text-3xl font-display font-black text-foreground">{category.name}</h2>
                      <span className="text-muted-foreground text-sm font-medium">{category.items.length} items</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {category.items.map(item => (
                        <MenuItemCard key={item._id} item={item} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-24 text-muted-foreground">
              <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg">Failed to load menu. Please try again.</p>
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
