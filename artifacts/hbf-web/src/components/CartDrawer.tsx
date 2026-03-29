import { useCartStore } from "@/store";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { Link, useLocation } from "wouter";

export function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, getTotal } = useCartStore();
  const [, setLocation] = useLocation();

  const handleCheckout = () => {
    setIsOpen(false);
    setLocation("/checkout");
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0 border-l-0 shadow-2xl">
        <SheetHeader className="p-6 border-b bg-muted/30">
          <SheetTitle className="flex items-center gap-2 text-2xl font-display">
            <ShoppingBag className="w-6 h-6 text-primary" />
            Your Order
            <span className="ml-auto bg-primary text-primary-foreground text-xs px-2.5 py-1 rounded-full">
              {items.reduce((acc, i) => acc + i.quantity, 0)} items
            </span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-muted-foreground">
              <ShoppingBag className="w-16 h-16 opacity-20" />
              <p className="text-lg">Your cart is empty.</p>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Browse Menu
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.itemId} className="flex gap-4 p-4 rounded-2xl border bg-card shadow-sm group">
                  <div className="flex-1 space-y-1">
                    <h4 className="font-bold text-foreground leading-tight">{item.name}</h4>
                    <p className="text-primary font-semibold">Rs. {item.price}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button 
                      onClick={() => removeItem(item.itemId)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-3 bg-muted rounded-full p-1 border">
                      <button 
                        onClick={() => updateQuantity(item.itemId, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center bg-background rounded-full shadow-sm hover:text-primary transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-4 text-center font-bold text-sm">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center bg-background rounded-full shadow-sm hover:text-primary transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t bg-background space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-muted-foreground text-sm">
                <span>Subtotal</span>
                <span>Rs. {getTotal()}</span>
              </div>
              <div className="flex justify-between text-muted-foreground text-sm">
                <span>Delivery</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="flex justify-between font-display text-2xl font-bold pt-2 border-t">
                <span>Total</span>
                <span className="text-primary">Rs. {getTotal()}</span>
              </div>
            </div>
            
            <Button 
              className="w-full h-14 text-lg rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 group"
              onClick={handleCheckout}
            >
              Checkout Now
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
