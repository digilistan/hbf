import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAdminGetCustomers } from "@workspace/api-client-react";
import { useAuthStore } from "@/store";
import { format } from "date-fns";

export default function AdminCustomers() {
  const { adminToken } = useAuthStore();
  const { data: customers, isLoading } = useAdminGetCustomers({
    request: { headers: { Authorization: `Bearer ${adminToken}` } }
  });

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-black text-foreground">Customers</h1>
        <p className="text-muted-foreground">View registered customers and their order counts.</p>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground uppercase font-bold text-xs">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4 text-center">Orders Count</th>
              <th className="px-6 py-4">Joined Date</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={4} className="p-8 text-center">Loading...</td></tr>
            ) : customers?.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No customers found.</td></tr>
            ) : (
              customers?.map((customer) => (
                <tr key={customer._id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-6 py-4 font-bold">{customer.name || 'N/A'}</td>
                  <td className="px-6 py-4 text-muted-foreground">{customer.email}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-primary/10 text-primary font-bold px-3 py-1 rounded-full">{customer.orderCount}</span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {format(new Date(customer.createdAt), "MMM dd, yyyy")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
