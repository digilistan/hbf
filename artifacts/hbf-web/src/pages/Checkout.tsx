import { PublicLayout } from "@/components/layout/PublicLayout";
import { useCartStore, useOrderStore, useAuthStore } from "@/store";
import { useCreateOrder } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ShoppingBag, MapPin, Phone, User, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  customerPhone: z.string().min(10, "Valid phone number required"),
  customerEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  customerAddress: z.string().min(10, "Full address required"),
  area: z.string().min(2, "Area is required"),
  notes: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const { items, getTotal, clearCart } = useCartStore();
  const { setLatestOrder } = useOrderStore();
  const { customerUser } = useAuthStore();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { mutate: createOrder, isPending } = useCreateOrder({
    mutation: {
      onSuccess: (data) => {
        setLatestOrder(data);
        clearCart();
        setLocation(`/order/${data._id}`);
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to place order. Please try again.", variant: "destructive" });
      }
    }
  });

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: customerUser?.name || "",
      customerEmail: customerUser?.email || "",
    }
  });

  const onSubmit = (data: CheckoutForm) => {
    if (items.length === 0) {
      toast({ title: "Cart empty", description: "Please add items to your cart first.", variant: "destructive" });
      return;
    }
    
    createOrder({
      data: {
        ...data,
        items: items.map(i => ({ itemId: i.itemId, name: i.name, price: i.price, quantity: i.quantity })),
      }
    });
  };

  if (items.length === 0) {
    return (
      <PublicLayout>
        <div className="max-w-md mx-auto mt-20 p-8 text-center bg-card rounded-2xl shadow-xl border">
          <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground opacity-30 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <Button onClick={() => setLocation("/")} className="rounded-full w-full h-12">Browse Menu</Button>
        </div>
      </PublicLayout>
    );
  }

  const total = getTotal();

  return (
    <PublicLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-display font-black text-foreground mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Form Section */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-card rounded-3xl p-6 md:p-8 shadow-sm border">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 border-b pb-4">
                <MapPin className="text-primary w-6 h-6" /> Delivery Details
              </h2>
              
              <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Full Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                      <Input id="customerName" {...register("customerName")} className="pl-10 h-12 rounded-xl" placeholder="John Doe" />
                    </div>
                    {errors.customerName && <p className="text-red-500 text-sm">{errors.customerName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                      <Input id="customerPhone" {...register("customerPhone")} className="pl-10 h-12 rounded-xl" placeholder="03XXXXXXXXX" />
                    </div>
                    {errors.customerPhone && <p className="text-red-500 text-sm">{errors.customerPhone.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerAddress">Complete Address *</Label>
                  <Textarea id="customerAddress" {...register("customerAddress")} className="min-h-[100px] rounded-xl resize-none" placeholder="House/Flat No, Street, Landmark" />
                  {errors.customerAddress && <p className="text-red-500 text-sm">{errors.customerAddress.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="area">Area / Society *</Label>
                    <Input id="area" {...register("area")} className="h-12 rounded-xl" placeholder="e.g. Saroba Garden" />
                    {errors.area && <p className="text-red-500 text-sm">{errors.area.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerEmail">Email (Optional)</Label>
                    <Input id="customerEmail" type="email" {...register("customerEmail")} className="h-12 rounded-xl" placeholder="your@email.com" />
                    {errors.customerEmail && <p className="text-red-500 text-sm">{errors.customerEmail.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Order Notes (Optional)</Label>
                  <Input id="notes" {...register("notes")} className="h-12 rounded-xl" placeholder="Less spicy, extra ketchup, etc." />
                </div>
              </form>
            </div>
            
            <div className="bg-[#f0f9ff] border border-[#bae6fd] rounded-3xl p-6 flex items-start gap-4">
              <CheckCircle2 className="w-8 h-8 text-blue-500 shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg text-blue-900">Cash on Delivery Only</h3>
                <p className="text-blue-800/80">You will pay in cash when your order is delivered to your doorstep. After placing the order, you will be redirected to WhatsApp to confirm with our staff.</p>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-5">
            <div className="bg-card rounded-3xl p-6 md:p-8 shadow-xl shadow-black/5 border sticky top-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 border-b pb-4">
                <ShoppingBag className="text-primary w-6 h-6" /> Order Summary
              </h2>
              
              <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
                {items.map(item => (
                  <div key={item.itemId} className="flex justify-between items-start text-sm">
                    <div className="flex gap-2">
                      <span className="font-bold text-primary">{item.quantity}x</span>
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <span className="font-bold whitespace-nowrap">Rs. {item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4 space-y-3 mb-8">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>Rs. {total}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery Fee</span>
                  <span>Calculated later</span>
                </div>
                <div className="flex justify-between text-2xl font-display font-black pt-4 border-t">
                  <span>Total</span>
                  <span className="text-primary">Rs. {total}</span>
                </div>
              </div>
              
              <Button 
                type="submit" 
                form="checkout-form" 
                disabled={isPending}
                className="w-full h-14 text-lg rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 font-bold"
              >
                {isPending ? "Placing Order..." : "Place Order & WhatsApp"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
