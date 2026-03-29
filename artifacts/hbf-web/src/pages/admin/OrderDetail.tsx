import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAdminGetOrder, useAdminUpdateOrderStatus, OrderStatus } from "@workspace/api-client-react";
import { useAuthStore } from "@/store";
import { useParams, Link } from "wouter";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, User, MapPin, Phone, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const statusColors: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-800",
  IN_KITCHEN: "bg-amber-100 text-amber-800",
  OUT_FOR_DELIVERY: "bg-purple-100 text-purple-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default function AdminOrderDetail() {
  const { id } = useParams();
  const { adminToken } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useAdminGetOrder(id!, {
    request: { headers: { Authorization: `Bearer ${adminToken}` } },
    query: { enabled: !!id }
  });

  const { mutate: updateStatus, isPending } = useAdminUpdateOrderStatus({
    request: { headers: { Authorization: `Bearer ${adminToken}` } },
    mutation: {
      onSuccess: () => {
        toast({ title: "Status updated successfully" });
        queryClient.invalidateQueries({ queryKey: [`/api/admin/orders/${id}`] });
        queryClient.invalidateQueries({ queryKey: [`/api/admin/orders`] });
      },
      onError: () => toast({ title: "Failed to update status", variant: "destructive" })
    }
  });

  if (isLoading || !order) return <AdminLayout><div className="p-8">Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4 -ml-4 text-muted-foreground hover:text-foreground">
          <Link href="/admin/orders"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders</Link>
        </Button>
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-black text-foreground">Order #{order._id.slice(-6).toUpperCase()}</h1>
            <p className="text-muted-foreground">{format(new Date(order.createdAt), "MMMM dd, yyyy - hh:mm a")}</p>
          </div>
          <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border">
            <span className="text-sm font-bold text-muted-foreground ml-2">Status:</span>
            <Select 
              disabled={isPending} 
              defaultValue={order.status} 
              onValueChange={(val) => updateStatus({ id: order._id, data: { status: val as OrderStatus } })}
            >
              <SelectTrigger className="w-[180px] font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NEW">New</SelectItem>
                <SelectItem value="IN_KITCHEN">In Kitchen</SelectItem>
                <SelectItem value="OUT_FOR_DELIVERY">Out for Delivery</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-card rounded-2xl shadow-sm border p-6">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-lg transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="bg-muted px-3 py-1 rounded-md font-bold text-primary">{item.quantity}x</span>
                    <span className="font-semibold text-lg">{item.name}</span>
                  </div>
                  <span className="font-bold">Rs. {item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t flex justify-end">
              <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>Rs. {order.total}</span></div>
                <div className="flex justify-between text-2xl font-black text-primary pt-2 border-t"><span>Total</span><span>Rs. {order.total}</span></div>
              </div>
            </div>
          </div>
          
          {order.notes && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-amber-900">
              <h3 className="font-bold mb-2 flex items-center gap-2"><MessageCircle className="w-5 h-5"/> Customer Notes</h3>
              <p>{order.notes}</p>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="bg-card rounded-2xl shadow-sm border p-6">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">Customer Details</h2>
            <div className="space-y-4">
              <div className="flex gap-3 text-muted-foreground">
                <User className="w-5 h-5 shrink-0" />
                <div>
                  <div className="font-bold text-foreground">{order.customerName}</div>
                  {order.customerEmail && <div className="text-sm">{order.customerEmail}</div>}
                </div>
              </div>
              <div className="flex gap-3 text-muted-foreground">
                <Phone className="w-5 h-5 shrink-0" />
                <div className="font-bold text-foreground">{order.customerPhone}</div>
              </div>
              <div className="flex gap-3 text-muted-foreground">
                <MapPin className="w-5 h-5 shrink-0" />
                <div>
                  <div className="font-bold text-foreground">{order.area}</div>
                  <div className="text-sm">{order.customerAddress}</div>
                </div>
              </div>
            </div>
            
            <Button className="w-full mt-6 rounded-xl" variant="outline" asChild>
              <a href={`tel:${order.customerPhone}`}><Phone className="w-4 h-4 mr-2" /> Call Customer</a>
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
