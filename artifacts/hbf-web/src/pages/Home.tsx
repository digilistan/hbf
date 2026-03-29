import { PublicLayout } from "@/components/layout/PublicLayout";
import { useGetMenu } from "@workspace/api-client-react";
import { useCartStore } from "@/store";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, Flame, Star, ShoppingBag, ArrowRight, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { MenuItem } from "@workspace/api-client-react";

function MenuItemCard({ item }: { item: MenuItem }) {
  const addItem = useCartStore(s => s.addItem);
  const { toast } = useToast();

  const handleAdd = () => {
    addItem({ ...item, itemId: item._id, quantity: 1 });
    toast({
      title: "Added to cart",
      description: `${item.name} added to your order.`,
      duration: 2000,
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-card rounded-2xl p-5 shadow-sm border border-border/50 hover:shadow-xl hover:border-primary/20 transition-all duration-300 flex flex-col h-full group"
    >
      <div className="flex-1">
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="font-bold text-lg text-foreground leading-tight">{item.name}</h3>
          <div className="flex gap-1 shrink-0">
            {item.isBestSeller && <span title="Best Seller"><Star className="w-5 h-5 text-accent fill-accent" /></span>}
            {item.isSpicy && <span title="Spicy"><Flame className="w-5 h-5 text-red-500 fill-red-500" /></span>}
          </div>
        </div>
        {item.description && (
          <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{item.description}</p>
        )}
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
        <span className="font-display font-bold text-xl text-primary">Rs. {item.price}</span>
        <Button 
          onClick={handleAdd}
          size="sm" 
          className="rounded-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors group-hover:scale-105"
        >
          <Plus className="w-4 h-4 mr-1" /> Add
        </Button>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const { data: menuData, isLoading } = useGetMenu();

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
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
            <span className="inline-block py-1.5 px-4 rounded-full bg-accent/20 text-accent font-bold tracking-widest text-sm uppercase mb-6 border border-accent/20 backdrop-blur-sm">
              Lahore's Favorite Fast Food
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white font-display leading-[1.1] mb-6 drop-shadow-2xl">
              CRAVING <br/><span className="text-primary [-webkit-text-stroke:2px_white] drop-shadow-md">DELICIOUS?</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 font-medium mb-10 max-w-2xl mx-auto">
              Burgers • Pizzas • Wings • BBQ
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-14 px-8 rounded-full text-lg font-bold bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/30 w-full sm:w-auto" asChild>
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
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : menuData ? (
            <>
              {/* Category Tabs */}
              <div className="flex overflow-x-auto pb-4 mb-12 hide-scrollbar gap-2 sticky top-[72px] sm:top-[88px] z-30 bg-background/95 backdrop-blur pt-4">
                {menuData.categories.map((cat) => (
                  <a 
                    key={cat._id}
                    href={`#cat-${cat.slug}`}
                    className="whitespace-nowrap px-6 py-3 rounded-full bg-secondary/50 text-secondary-foreground font-bold hover:bg-primary hover:text-white transition-colors border border-border/50"
                  >
                    {cat.name}
                  </a>
                ))}
              </div>

              {/* Best Sellers Strip */}
              {menuData.bestSellers.length > 0 && (
                <div className="mb-16">
                  <div className="flex items-center gap-3 mb-8">
                    <Star className="w-8 h-8 text-accent fill-accent" />
                    <h2 className="text-3xl font-display font-black text-foreground">Best Sellers</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {menuData.bestSellers.map(item => (
                      <MenuItemCard key={item._id} item={item} />
                    ))}
                  </div>
                </div>
              )}

              {/* Categories */}
              <div className="space-y-16">
                {menuData.categories.map((category) => (
                  <div key={category._id} id={`cat-${category.slug}`} className="scroll-mt-32">
                    <h2 className="text-3xl font-display font-black text-foreground mb-8 border-b-2 border-primary/10 pb-4">
                      {category.name}
                    </h2>
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
            <div className="text-center text-muted-foreground">Failed to load menu.</div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
