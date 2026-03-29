import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingBag, User, Phone, MapPin, Menu, X, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useCartStore, useAuthStore } from "@/store";
import { CartDrawer } from "@/components/CartDrawer";
import { WhatsAppChat } from "@/components/WhatsAppChat";
import { Button } from "@/components/ui/button";

export function PublicLayout({ children }: { children: ReactNode }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const itemsCount = useCartStore((s) => s.items.reduce((acc, i) => acc + i.quantity, 0));
  const setIsOpen = useCartStore((s) => s.setIsOpen);
  const { customerUser, logoutCustomer } = useAuthStore();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Utility Bar */}
      <div className="bg-foreground text-muted h-10 flex items-center justify-between px-4 sm:px-8 text-xs sm:text-sm font-medium">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-primary" /> Ferozepur Road, Lahore</span>
          <span className="hidden sm:flex items-center gap-1"><Phone className="w-3 h-3 text-primary" /> 0315-9408619</span>
        </div>
        <div className="flex items-center gap-4">
          {customerUser ? (
            <div className="flex items-center gap-4">
              <Link href="/account/orders" className="hover:text-white transition-colors">My Orders</Link>
              <button onClick={logoutCustomer} className="hover:text-white transition-colors flex items-center gap-1">
                <LogOut className="w-3 h-3" /> Logout
              </button>
            </div>
          ) : (
            <>
              <Link href="/account/login" className="hover:text-white transition-colors">Login</Link>
              <Link href="/account/signup" className="text-primary font-bold hover:text-primary/80 transition-colors">Sign Up</Link>
            </>
          )}
        </div>
      </div>

      {/* Main Navbar */}
      <header className={`sticky top-0 z-40 w-full transition-all duration-300 ${isScrolled ? "bg-white/95 backdrop-blur-md shadow-md py-3" : "bg-white py-5"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="HBF Logo" className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl shadow-md group-hover:scale-105 transition-transform" />
            <div className="flex flex-col">
              <span className="font-display font-black text-2xl sm:text-3xl text-foreground leading-none tracking-tight">HBF</span>
              <span className="text-[10px] sm:text-xs font-bold text-primary tracking-widest uppercase">Haq Bahoo Foods</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8 font-bold text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors text-foreground">Menu</Link>
            <a href="#about" className="hover:text-primary transition-colors">About Us</a>
            <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <Button variant="outline" className="hidden sm:flex rounded-full border-primary/20 text-primary hover:bg-primary/5 font-bold" asChild>
              <a href="tel:03159408619"><Phone className="w-4 h-4 mr-2" /> Call Now</a>
            </Button>
            
            <button 
              onClick={() => setIsOpen(true)}
              className="relative p-2.5 sm:p-3 rounded-full bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-all duration-300 hover:scale-105"
            >
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
              {itemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-in zoom-in">
                  {itemsCount}
                </span>
              )}
            </button>

            <button className="md:hidden p-2 text-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-t shadow-xl py-4 px-4 flex flex-col gap-4 animate-in slide-in-from-top-4">
            <Link href="/" className="font-bold text-lg p-2 hover:bg-muted rounded-lg" onClick={() => setMobileMenuOpen(false)}>Menu</Link>
            {customerUser ? (
              <Link href="/account/orders" className="font-bold text-lg p-2 hover:bg-muted rounded-lg" onClick={() => setMobileMenuOpen(false)}>My Orders</Link>
            ) : (
              <Link href="/account/login" className="font-bold text-lg p-2 hover:bg-muted rounded-lg" onClick={() => setMobileMenuOpen(false)}>Login / Sign Up</Link>
            )}
            <a href="tel:03159408619" className="font-bold text-lg p-2 bg-primary/10 text-primary rounded-lg flex items-center gap-2">
              <Phone className="w-5 h-5" /> 0315-9408619
            </a>
          </div>
        )}
      </header>

      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer id="contact" className="bg-[#1a1a1a] text-white pt-16 pb-8 border-t-[6px] border-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="HBF Logo" className="w-12 h-12 rounded-xl" />
              <span className="font-display font-black text-3xl">HBF</span>
            </div>
            <p className="text-gray-400 font-medium">Serving the most delicious and fresh fast food in Lahore.</p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-display font-bold text-accent">Contact Us</h3>
            <div className="space-y-2 text-gray-300">
              <p className="flex items-start gap-2"><MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" /> 17 km Ferozepur/Lahore–Kasur Road, near Pak Arab Society, opposite Awan Market, Saroba Garden Housing Society, Lahore</p>
              <p className="flex items-center gap-2"><Phone className="w-5 h-5 text-primary" /> 0315-9408619</p>
              <p className="flex items-center gap-2"><Phone className="w-5 h-5 text-primary" /> 0333-9408619</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-display font-bold text-accent">Quick Links</h3>
            <div className="flex flex-col gap-2">
              <Link href="/" className="text-gray-300 hover:text-white transition-colors">Full Menu</Link>
              <Link href="/account/login" className="text-gray-300 hover:text-white transition-colors">Customer Login</Link>
              <Link href="/admin/login" className="text-gray-300 hover:text-white transition-colors">Staff Portal</Link>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
          <p className="text-gray-500">&copy; {new Date().getFullYear()} Haq Bahoo Foods (HBF). All rights reserved.</p>
          <a
            href="https://digilistan.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-400 transition-colors text-xs font-medium tracking-wide"
          >
            Powered by <span className="text-primary font-bold">Digilistan</span>
          </a>
        </div>
      </footer>

      <CartDrawer />
      <WhatsAppChat />
    </div>
  );
}
