import { PublicLayout } from "@/components/layout/PublicLayout";
import { useOrderStore } from "@/store";
import type { OrderItem } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle, MessageCircle, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function OrderSuccess() {
  const { latestOrder } = useOrderStore();
  const [, setLocation] = useLocation();
  const [countdown, setCountdown] = useState(5);

  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "923159408619";

  useEffect(() => {
    if (!latestOrder) {
      setLocation("/");
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          redirectToWhatsApp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [latestOrder, setLocation]);

  const generateWhatsAppMessage = () => {
    if (!latestOrder) return "";
    
    let msg = `*NEW ORDER: #${latestOrder._id.slice(-6)}*\n\n`;
    msg += `*Customer:* ${latestOrder.customerName}\n`;
    msg += `*Phone:* ${latestOrder.customerPhone}\n`;
    msg += `*Address:* ${latestOrder.customerAddress}, ${latestOrder.area}\n`;
    if (latestOrder.notes) msg += `*Notes:* ${latestOrder.notes}\n`;
    
    msg += `\n*Order Items:*\n`;
    latestOrder.items.forEach((item: OrderItem) => {
      msg += `- ${item.quantity}x ${item.name} (Rs. ${item.price})\n`;
    });
    
    msg += `\n*TOTAL: Rs. ${latestOrder.total}*`;
    return encodeURIComponent(msg);
  };

  const redirectToWhatsApp = () => {
    window.location.href = `https://wa.me/${whatsappNumber}?text=${generateWhatsAppMessage()}`;
  };

  if (!latestOrder) return null;

  return (
    <PublicLayout>
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-lg w-full bg-card rounded-3xl p-8 shadow-2xl border text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
          
          <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
          <h1 className="text-4xl font-display font-black mb-2 text-foreground">Order Received!</h1>
          <p className="text-xl text-muted-foreground mb-6">Order #{latestOrder._id.slice(-6)}</p>
          
          <div className="bg-muted/50 rounded-2xl p-6 mb-8 text-left border">
            <h3 className="font-bold text-lg mb-4 border-b pb-2">Summary</h3>
            <div className="space-y-2 mb-4 max-h-40 overflow-y-auto pr-2">
              {latestOrder.items.map((item: OrderItem, i: number) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.name}</span>
                  <span className="font-medium">Rs. {item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2 text-primary">
              <span>Total</span>
              <span>Rs. {latestOrder.total}</span>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-muted-foreground">
              Redirecting to WhatsApp to confirm your order in <strong className="text-foreground">{countdown}s</strong>...
            </p>
            
            <Button 
              onClick={redirectToWhatsApp}
              className="w-full h-14 text-lg rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold shadow-lg shadow-green-500/25"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Send Order via WhatsApp Now
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setLocation("/")}
              className="w-full h-12 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
            </Button>
          </div>
        </motion.div>
      </div>
    </PublicLayout>
  );
}
