import { PublicLayout } from "@/components/layout/PublicLayout";
import { useGetMenu } from "@workspace/api-client-react";
import { useCartStore } from "@/store";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, Star, ShoppingBag, ArrowRight, Phone } from "lucide-react";
import { MenuItemCard } from "@/components/MenuItemCard";

export default function Home() {
  const { data: menuData, isLoading } = useGetMenu();

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
            alt="Delicious fast food variety at Haq Bahoo Foods (HBF) Lahore"
            className="w-full h-full object-cover scale-105 blur-[2px] opacity-90 transition-transform duration-[10s]"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-black/60 shadow-inner"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-center mb-6">
              <span className="inline-flex items-center gap-2 py-1.5 px-5 rounded-full bg-primary/20 text-primary font-black tracking-widest text-xs uppercase border border-primary/30 backdrop-blur-md shadow-lg shadow-primary/10">
                <Star className="w-4 h-4 fill-primary" /> Premium Taste • Fresh Ingredients
              </span>
            </div>
            
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white font-display leading-[0.95] mb-6 drop-shadow-2xl flex flex-col items-center">
              <span>UNFORGETTABLE</span>
              <span className="text-primary italic [-webkit-text-stroke:2px_white] drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">FLAVORS</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-200 font-medium mb-12 max-w-2xl mx-auto drop-shadow shadow-black/40">
              The ultimate spot for 
              <span className="text-white font-bold ml-1.5 border-b-2 border-primary pb-0.5">Burgers, Pizzas & BBQ</span> 
              since 2012.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <Button size="lg" className="h-16 px-12 rounded-2xl text-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/40 w-full sm:w-auto hover:scale-105 transition-transform" asChild>
                <a href="#menu">View Full Menu <ArrowRight className="ml-2 w-6 h-6" /></a>
              </Button>
              <Button size="lg" variant="outline" className="h-16 px-10 rounded-2xl text-xl font-bold bg-white/5 text-white border-white/20 hover:bg-white hover:text-black backdrop-blur-md w-full sm:w-auto transition-all" asChild>
                <a href="tel:03159408619"><Phone className="mr-2 w-5 h-5" /> Order via Call</a>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Decorative Wave Decoration */}
        <div className="absolute bottom-[-1px] left-0 right-0 w-full overflow-hidden leading-none z-10">
          <svg className="relative block w-full h-[60px] md:h-[100px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
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
                {menuData?.categories?.map((cat) => (
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
                    {menuData?.bestSellers?.map(item => (
                      <MenuItemCard key={item._id} item={item} />
                    ))}
                  </div>
                </div>
              )}

              {/* Category Sections */}
              <div className="space-y-20">
                {menuData?.categories?.map((category) => (
                  <div key={category._id} id={`cat-${category.slug}`} className="scroll-mt-36">
                    <div className="flex items-end justify-between mb-8 pb-4 border-b-2 border-primary/10">
                      <h2 className="text-3xl font-display font-black text-foreground">{category.name}</h2>
                      <span className="text-muted-foreground text-sm font-medium">{category?.items?.length || 0} items</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {category?.items?.map(item => (
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
