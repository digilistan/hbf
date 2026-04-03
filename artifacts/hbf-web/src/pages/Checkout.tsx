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
import { ShoppingBag, MapPin, Phone, User, CheckCircle2, Mail, UserPlus, UploadCloud, CreditCard, Banknote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const guestCheckoutSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  customerPhone: z.string().min(10, "Valid phone number required"),
  customerEmail: z.string().email("Invalid email format"),
  customerAddress: z.string().min(10, "Full address required"),
  area: z.string().min(2, "Area is required"),
  notes: z.string().optional(),
});

const loggedInCheckoutSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  customerPhone: z.string().min(10, "Valid phone number required"),
  customerEmail: z.string().email("Invalid email font").optional().or(z.literal("")),
  customerAddress: z.string().min(10, "Full address required"),
  area: z.string().min(2, "Area is required"),
  notes: z.string().optional(),
});

type CheckoutForm = z.infer<typeof guestCheckoutSchema>;

export default function Checkout() {
  const { items, getTotal, clearCart } = useCartStore();
  const { setLatestOrder } = useOrderStore();
  const { customerUser, customerToken, setCustomerAuth } = useAuthStore();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<"Cash on Delivery" | "Manual Bank Transfer">("Cash on Delivery");
  const [transactionId, setTransactionId] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const isGuest = !customerUser;

  const { mutate: createOrder, isPending } = useCreateOrder({
    ...(customerToken ? { request: { headers: { Authorization: `Bearer ${customerToken}` } } } : {}),
    mutation: {
      onSuccess: (data) => {
        // Phase 2: If guestToken returned, log user in automatically
        const castedData = data as any;
        if (castedData.guestToken) {
          setCustomerAuth(castedData.guestToken, { 
            name: castedData.customerName, 
            email: castedData.customerEmail 
          });
        }
        
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
    resolver: zodResolver(isGuest ? guestCheckoutSchema : loggedInCheckoutSchema),
    defaultValues: {
      customerName: customerUser?.name || "",
      customerEmail: customerUser?.email || "",
    }
  });

  const onSubmit = async (data: CheckoutForm) => {
    if (items.length === 0) {
      toast({ title: "Cart empty", description: "Please add items to your cart first.", variant: "destructive" });
      return;
    }

    if (paymentMethod === "Manual Bank Transfer") {
      if (!transactionId || !screenshotFile) {
        toast({ title: "Payment Info Required", description: "Please provide both Transaction ID and a payment screenshot.", variant: "destructive" });
        return;
      }
    }

    let uploadedScreenshotUrl = "";

    if (paymentMethod === "Manual Bank Transfer" && screenshotFile) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", screenshotFile);
        
        const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api";
        const res = await fetch(`${baseUrl}/upload`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error("File upload failed");
        }

        const resData = await res.json();
        uploadedScreenshotUrl = resData.url;
      } catch (err) {
        setIsUploading(false);
        toast({ title: "Upload Failed", description: "Could not upload the payment screenshot. Ensure it's under 5MB and a valid image.", variant: "destructive" });
        return;
      }
      setIsUploading(false);
    }

    createOrder({
      data: {
        ...data,
        paymentMethod,
        ...(paymentMethod === "Manual Bank Transfer" ? {
          transactionId,
          paymentScreenshot: uploadedScreenshotUrl
        } : {}),
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
        <h1 className="text-4xl font-display font-black text-foreground mb-2">Checkout</h1>
        <p className="text-muted-foreground mb-8">Almost there! Fill in your delivery details below.</p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Form Section */}
          <div className="lg:col-span-7 space-y-6">

            {/* Guest account notice */}
            {isGuest && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-start gap-3">
                <UserPlus className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-blue-900 text-sm">Save your order history!</h3>
                  <p className="text-blue-700 text-xs mt-1">Providing your email and phone will automatically create a secure order history for you. Review your previous orders and track delivery status anytime.</p>
                </div>
              </div>
            )}

            <div className="bg-card rounded-3xl p-6 md:p-8 shadow-sm border">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 border-b pb-4">
                <MapPin className="text-primary w-6 h-6" /> Delivery Details
              </h2>

              <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Full Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                      <Input id="customerName" {...register("customerName")} className="pl-10 h-12 rounded-xl" placeholder="Your full name" />
                    </div>
                    {errors.customerName && <p className="text-red-500 text-xs">{errors.customerName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                      <Input id="customerPhone" {...register("customerPhone")} className="pl-10 h-12 rounded-xl" placeholder="03XXXXXXXXX" />
                    </div>
                    {errors.customerPhone && <p className="text-red-500 text-xs">{errors.customerPhone.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerEmail">
                    Email Address * <span className="text-muted-foreground text-xs">(For order tracking & history)</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="customerEmail"
                      type="email"
                      {...register("customerEmail")}
                      className="pl-10 h-12 rounded-xl"
                      placeholder={isGuest ? "your@email.com (for order tracking)" : "your@email.com"}
                      readOnly={!!customerUser}
                    />
                  </div>
                  {errors.customerEmail && <p className="text-red-500 text-xs">{errors.customerEmail.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerAddress">Complete Address *</Label>
                  <Textarea
                    id="customerAddress"
                    {...register("customerAddress")}
                    className="min-h-[90px] rounded-xl resize-none"
                    placeholder="House/Flat No, Street, Landmark..."
                  />
                  {errors.customerAddress && <p className="text-red-500 text-xs">{errors.customerAddress.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="area">Area / Society *</Label>
                    <Input id="area" {...register("area")} className="h-12 rounded-xl" placeholder="e.g. Saroba Garden" />
                    {errors.area && <p className="text-red-500 text-xs">{errors.area.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Order Notes (Optional)</Label>
                    <Input id="notes" {...register("notes")} className="h-12 rounded-xl" placeholder="Less spicy, extra ketchup..." />
                  </div>
                </div>
              </form>
            </div>

            <div className="bg-card rounded-3xl p-6 md:p-8 shadow-sm border mt-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 border-b pb-4">
                <CreditCard className="text-primary w-6 h-6" /> Payment Method
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                 <div 
                    onClick={() => setPaymentMethod("Cash on Delivery")}
                    className={`border-2 rounded-2xl p-4 cursor-pointer flex flex-col items-center gap-2 transition-all ${paymentMethod === "Cash on Delivery" ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}
                 >
                    <Banknote className="w-8 h-8" />
                    <span className="font-bold">Cash on Delivery</span>
                 </div>
                 <div 
                    onClick={() => setPaymentMethod("Manual Bank Transfer")}
                    className={`border-2 rounded-2xl p-4 cursor-pointer flex flex-col items-center gap-2 transition-all ${paymentMethod === "Manual Bank Transfer" ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}
                 >
                    <CreditCard className="w-8 h-8" />
                    <span className="font-bold">Bank Transfer</span>
                 </div>
              </div>

              {paymentMethod === "Cash on Delivery" ? (
                <div className="bg-[#f0f9ff] border border-[#bae6fd] rounded-2xl p-5 flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-blue-900">Cash on Delivery</h3>
                    <p className="text-blue-800/80 text-sm mt-1">Pay in cash when your order arrives. You'll be redirected to WhatsApp to confirm.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
                    <h3 className="font-bold text-orange-900 mb-2">Transfer Details</h3>
                    <p className="text-sm text-orange-800 mb-1"><strong>Bank:</strong> Meezan Bank Ltd</p>
                    <p className="text-sm text-orange-800 mb-1"><strong>Account Title:</strong> HBF Foods</p>
                    <p className="text-sm text-orange-800 font-mono tracking-wider bg-white px-2 py-1 rounded inline-block border border-orange-100 mt-1">0123 4567 8910 1112</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Transaction ID *</Label>
                      <Input 
                        value={transactionId} 
                        onChange={e => setTransactionId(e.target.value)} 
                        placeholder="e.g. 19283849102"
                        className="h-12 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                       <Label>Payment Screenshot *</Label>
                       <div className="relative">
                         <input 
                           type="file" 
                           accept="image/*" 
                           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                           onChange={e => setScreenshotFile(e.target.files?.[0] || null)}
                         />
                         <div className={`h-12 border-2 border-dashed rounded-xl flex items-center px-4 gap-2 text-sm ${screenshotFile ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground'}`}>
                           <UploadCloud className="w-4 h-4" />
                           <span className="truncate">{screenshotFile ? screenshotFile.name : "Select image file (Max 5MB)..."}</span>
                         </div>
                       </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-card rounded-3xl p-6 md:p-8 shadow-xl shadow-black/5 border sticky top-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 border-b pb-4">
                <ShoppingBag className="text-primary w-6 h-6" /> Order Summary
              </h2>

              <div className="space-y-3 mb-6 max-h-[38vh] overflow-y-auto pr-1">
                {items.map(item => (
                  <div key={item.itemId} className="flex justify-between items-start text-sm gap-2">
                    <div className="flex gap-2 flex-1 min-w-0">
                      <span className="font-bold text-primary shrink-0">{item.quantity}x</span>
                      <span className="font-medium truncate">{item.name}</span>
                    </div>
                    <span className="font-bold whitespace-nowrap shrink-0">Rs. {item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-3 mb-8">
                <div className="flex justify-between text-muted-foreground text-sm">
                  <span>Subtotal</span>
                  <span>Rs. {total}</span>
                </div>
                <div className="flex justify-between text-muted-foreground text-sm">
                  <span>Delivery Fee</span>
                  <span className="text-xs italic">Calculated later</span>
                </div>
                <div className="flex justify-between text-2xl font-display font-black pt-3 border-t">
                  <span>Total</span>
                  <span className="text-primary">Rs. {total}</span>
                </div>
              </div>

              <Button
                type="submit"
                form="checkout-form"
                disabled={isPending || isUploading}
                className="w-full h-14 text-lg rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 font-bold"
              >
                {isUploading ? "Uploading..." : isPending ? "Placing Order..." : "Place Order & WhatsApp"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
