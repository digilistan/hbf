import { ReactNode, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuthStore } from "@/store";
import { LayoutDashboard, ShoppingCart, List, Coffee, Users, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminLayout({ children }: { children: ReactNode }) {
  const { adminToken, adminUser, logoutAdmin } = useAuthStore();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!adminToken) {
      setLocation("/admin/login");
    }
  }, [adminToken, setLocation]);

  if (!adminToken) return null;

  const navItems = [
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { href: "/admin/menu/categories", label: "Categories", icon: List },
    { href: "/admin/menu/items", label: "Menu Items", icon: Coffee },
    { href: "/admin/customers", label: "Customers", icon: Users },
  ];

  const lockedItems = [
    { label: "Analytics", icon: LayoutDashboard },
    { label: "Promo Codes", icon: LayoutDashboard }, // using LayoutDashboard as a generic generic icon placeholder for now
    { label: "Reviews", icon: LayoutDashboard },
  ];

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#1a1a1a] text-white flex flex-col shrink-0 md:sticky top-0 md:h-screen shadow-xl z-20">
        <div className="p-6 border-b border-white/10 flex items-center justify-between md:justify-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-display font-bold">H</div>
            <span className="font-display font-bold text-xl tracking-tight">HBF Admin</span>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.startsWith(item.href);
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                  isActive 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-accent" : ""}`} />
                {item.label}
              </Link>
            );
          })}
          
          <div className="pt-4 mt-4 border-t border-white/10">
            <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Coming Soon</p>
            {lockedItems.map((item, i) => (
              <div 
                key={i} 
                className="flex items-center justify-between px-4 py-3 rounded-xl font-medium text-gray-500 cursor-not-allowed opacity-60"
              >
                <div className="flex items-center gap-3">
                   <item.icon className="w-5 h-5" />
                   {item.label}
                </div>
                <div className="text-[10px] bg-white/10 px-2 py-0.5 rounded font-bold">PRO</div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-white/10">
          <div className="px-4 py-3 mb-2 rounded-xl bg-white/5 text-sm text-gray-300">
            Logged in as<br/>
            <strong className="text-white truncate block">{adminUser?.email}</strong>
          </div>
          <Button 
            onClick={() => { logoutAdmin(); setLocation("/admin/login"); }}
            variant="destructive" 
            className="w-full rounded-xl bg-red-600 hover:bg-red-700 justify-start"
          >
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
          <p className="text-center text-gray-700 text-[10px] mt-3">
            Powered by <a href="https://digilistan.com" target="_blank" rel="noopener noreferrer" className="text-primary/60 font-semibold hover:text-primary transition-colors">Digilistan</a>
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
