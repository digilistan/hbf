import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAdminGetCustomers, getAdminGetCustomersQueryKey } from "@workspace/api-client-react";
import { useAuthStore } from "@/store";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserPlus, KeyRound, Mail, User, Calendar } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminCustomers() {
  const { adminToken } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: customers, isLoading } = useAdminGetCustomers({
    request: { headers: { Authorization: `Bearer ${adminToken}` } }
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [resetModalCustomer, setResetModalCustomer] = useState<{ id: string, name: string } | null>(null);

  const [addForm, setAddForm] = useState({ name: "", email: "", password: "" });
  const [resetPassword, setResetPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api";
      const res = await fetch(`${baseUrl}/admin/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify(addForm),
      });
      if (!res.ok) throw new Error(await res.text());
      toast({ title: "Customer Added!" });
      setIsAddModalOpen(false);
      setAddForm({ name: "", email: "", password: "" });
      queryClient.invalidateQueries({ queryKey: getAdminGetCustomersQueryKey() });
    } catch {
      toast({ title: "Failed to add customer", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalCustomer) return;
    setIsSubmitting(true);
    try {
       const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api";
       const res = await fetch(`${baseUrl}/admin/customers/${resetModalCustomer.id}/password`, {
         method: "PATCH",
         headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
         body: JSON.stringify({ password: resetPassword }),
       });
       if (!res.ok) throw new Error(await res.text());
       toast({ title: "Password Reset Successfully!" });
       setResetModalCustomer(null);
       setResetPassword("");
    } catch {
       toast({ title: "Failed to reset password", variant: "destructive" });
    } finally {
       setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-black text-foreground">Customers</h1>
          <p className="text-muted-foreground">Manage accounts and reset passwords.</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="rounded-xl shadow-lg gap-2">
           <UserPlus className="w-4 h-4" /> Add Customer
        </Button>
      </div>

      {isLoading ? (
         <div className="p-8 text-center text-muted-foreground">Loading...</div>
      ) : customers?.length === 0 ? (
         <div className="p-8 text-center bg-card rounded-2xl border text-muted-foreground">No customers found.</div>
      ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customers?.map((c) => (
               <div key={c._id} className="bg-card border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="font-display font-bold text-lg leading-tight truncate mr-2">
                        {c.name || "N/A"}
                      </div>
                      <div className="bg-primary/10 text-primary font-bold px-2 py-1 rounded-md text-xs whitespace-nowrap">
                        {c.orderCount} Orders
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-muted-foreground mb-6">
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="w-4 h-4 shrink-0" />
                        <span className="truncate">{c.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 shrink-0" />
                        <span>Joined: {format(new Date(c.createdAt), "MMM dd, yyyy")}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <Button 
                      variant="outline" 
                      className="w-full rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                      onClick={() => setResetModalCustomer({ id: c._id, name: c.name || c.email })}
                    >
                      <KeyRound className="w-4 h-4 mr-2" /> Reset Password
                    </Button>
                  </div>
               </div>
            ))}
         </div>
      )}

      {/* Add Customer Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Add Customer</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input required value={addForm.name} onChange={e => setAddForm({...addForm, name: e.target.value})} placeholder="Full Name" className="rounded-xl h-12"/>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input required type="email" value={addForm.email} onChange={e => setAddForm({...addForm, email: e.target.value})} placeholder="you@example.com" className="rounded-xl h-12"/>
            </div>
            <div className="space-y-2">
              <Label>Initial Password</Label>
              <Input required type="password" value={addForm.password} onChange={e => setAddForm({...addForm, password: e.target.value})} placeholder="********" className="rounded-xl h-12"/>
            </div>
            <Button disabled={isSubmitting} type="submit" className="w-full h-12 rounded-xl mt-4 text-lg">
              {isSubmitting ? "Adding..." : "Add Customer"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Modal */}
      <Dialog open={!!resetModalCustomer} onOpenChange={(open) => !open && setResetModalCustomer(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Force Reset Password</DialogTitle>
          </DialogHeader>
          <div className="text-muted-foreground text-sm mb-4">
            Resetting password for: <strong className="text-foreground">{resetModalCustomer?.name}</strong>
          </div>
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input required type="password" value={resetPassword} onChange={e => setResetPassword(e.target.value)} placeholder="Minimum 6 characters" className="rounded-xl h-12"/>
            </div>
            <Button disabled={isSubmitting} type="submit" className="w-full h-12 rounded-xl bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 text-white font-bold mt-4 text-lg">
              {isSubmitting ? "Resetting..." : "Confirm Force Reset"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

    </AdminLayout>
  );
}
