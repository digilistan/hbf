import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAdminGetOrders, OrderStatus } from "@workspace/api-client-react";
import { useAuthStore } from "@/store";
import { useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const statusColors: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-800",
  IN_KITCHEN: "bg-amber-100 text-amber-800",
  OUT_FOR_DELIVERY: "bg-purple-100 text-purple-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default function AdminOrders() {
  const { adminToken } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");

  const { data: orders, isLoading } = useAdminGetOrders(
    statusFilter === "ALL" ? undefined : { status: statusFilter as OrderStatus },
    { request: { headers: { Authorization: `Bearer ${adminToken}` } } }
  );

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-foreground">Orders Management</h1>
          <p className="text-muted-foreground">View and update customer orders.</p>
        </div>
      </div>

      <Tabs defaultValue="ALL" onValueChange={(v) => setStatusFilter(v as OrderStatus | "ALL")} className="mb-6">
        <TabsList className="bg-white border shadow-sm p-1 rounded-xl w-full flex overflow-x-auto hide-scrollbar">
          <TabsTrigger value="ALL" className="rounded-lg flex-1">All</TabsTrigger>
          <TabsTrigger value="NEW" className="rounded-lg flex-1">New</TabsTrigger>
          <TabsTrigger value="IN_KITCHEN" className="rounded-lg flex-1">In Kitchen</TabsTrigger>
          <TabsTrigger value="OUT_FOR_DELIVERY" className="rounded-lg flex-1">Delivery</TabsTrigger>
          <TabsTrigger value="COMPLETED" className="rounded-lg flex-1">Completed</TabsTrigger>
          <TabsTrigger value="CANCELLED" className="rounded-lg flex-1">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="bg-card rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase font-bold text-xs">
              <tr>
                <th className="px-6 py-4">Order ID / Date</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="p-8 text-center">Loading...</td></tr>
              ) : orders?.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No orders found.</td></tr>
              ) : (
                orders?.map((order) => (
                  <tr key={order._id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-foreground">#{order._id.slice(-6).toUpperCase()}</div>
                      <div className="text-xs text-muted-foreground">{format(new Date(order.createdAt), "MMM dd, hh:mm a")}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold">{order.customerName}</div>
                      <div className="text-xs text-muted-foreground">{order.customerPhone}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-primary">Rs. {order.total}</td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className={`${statusColors[order.status]} hover:opacity-80`}>
                        {order.status.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="outline" size="sm" asChild className="rounded-lg">
                        <Link href={`/admin/orders/${order._id}`}>View Details</Link>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
