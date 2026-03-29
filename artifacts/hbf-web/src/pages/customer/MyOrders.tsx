import { PublicLayout } from "@/components/layout/PublicLayout";
import { useGetMyOrders } from "@workspace/api-client-react";
import { useAuthStore } from "@/store";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

const statusColors: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-800 border-blue-200",
  IN_KITCHEN: "bg-amber-100 text-amber-800 border-amber-200",
  OUT_FOR_DELIVERY: "bg-purple-100 text-purple-800 border-purple-200",
  COMPLETED: "bg-green-100 text-green-800 border-green-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
};

export default function MyOrders() {
  const { customerToken } = useAuthStore();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!customerToken) setLocation("/account/login");
  }, [customerToken, setLocation]);

  const { data: orders, isLoading } = useGetMyOrders({
    request: { headers: { Authorization: `Bearer ${customerToken}` } }
  });

  if (!customerToken) return null;

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-display font-black mb-8 border-b pb-4">My Orders</h1>
        
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading orders...</div>
        ) : !orders || orders.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-2xl border border-dashed">
            <p className="text-lg text-muted-foreground mb-4">You haven't placed any orders yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-card border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b pb-4">
                  <div>
                    <h3 className="font-bold text-lg">Order #{order._id.slice(-6).toUpperCase()}</h3>
                    <p className="text-sm text-muted-foreground">{format(new Date(order.createdAt), "MMM dd, yyyy - h:mm a")}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className={`${statusColors[order.status]} text-sm px-3 py-1 font-bold`}>
                      {order.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.name}</span>
                      <span className="text-muted-foreground">Rs. {item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t flex justify-between items-center font-bold text-lg">
                  <span>Total Amount</span>
                  <span className="text-primary">Rs. {order.total}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
