import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAdminGetItems, useAdminCreateItem, useAdminDeleteItem, useAdminGetCategories } from "@workspace/api-client-react";
import { useAuthStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm, Controller } from "react-hook-form";
import { Trash2, Plus, Flame, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export default function AdminItems() {
  const { adminToken } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const reqOptions = { request: { headers: { Authorization: `Bearer ${adminToken}` } } };

  const { data: items, isLoading } = useAdminGetItems(reqOptions);
  const { data: categories } = useAdminGetCategories(reqOptions);

  const { mutate: createItem, isPending } = useAdminCreateItem({
    ...reqOptions,
    mutation: {
      onSuccess: () => {
        toast({ title: "Item added" });
        queryClient.invalidateQueries({ queryKey: [`/api/admin/items`] });
        setOpen(false);
        reset();
      }
    }
  });

  const { mutate: deleteItem } = useAdminDeleteItem({
    ...reqOptions,
    mutation: {
      onSuccess: () => {
        toast({ title: "Item deleted" });
        queryClient.invalidateQueries({ queryKey: [`/api/admin/items`] });
      }
    }
  });

  const { register, handleSubmit, control, reset } = useForm({
    defaultValues: { name: "", category: "", price: 0, description: "", isSpicy: false, isBestSeller: false }
  });

  const onSubmit = (data: any) => {
    createItem({ data: { ...data, price: Number(data.price), isActive: true } });
  };

  return (
    <AdminLayout>
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-display font-black text-foreground">Menu Items</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl shadow-lg"><Plus className="w-4 h-4 mr-2" /> Add Item</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg rounded-2xl">
            <DialogHeader>
              <DialogTitle>Add Menu Item</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-sm font-bold mb-1 block">Name</label>
                  <Input {...register("name", { required: true })} className="rounded-lg" />
                </div>
                <div>
                  <label className="text-sm font-bold mb-1 block">Category</label>
                  <Controller
                    name="category"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="rounded-lg"><SelectValue placeholder="Select..." /></SelectTrigger>
                        <SelectContent>
                          {categories?.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div>
                  <label className="text-sm font-bold mb-1 block">Price (Rs.)</label>
                  <Input type="number" {...register("price", { required: true })} className="rounded-lg" />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-bold mb-1 block">Description</label>
                  <Textarea {...register("description")} className="rounded-lg resize-none" />
                </div>
              </div>
              <div className="flex gap-6 py-2">
                <label className="flex items-center gap-2 font-bold text-sm cursor-pointer">
                  <Controller name="isSpicy" control={control} render={({field}) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />
                  🌶️ Spicy
                </label>
                <label className="flex items-center gap-2 font-bold text-sm cursor-pointer">
                  <Controller name="isBestSeller" control={control} render={({field}) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />
                  ⭐ Best Seller
                </label>
              </div>
              <Button type="submit" disabled={isPending} className="w-full rounded-xl h-12 text-lg">Save Item</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground uppercase font-bold text-xs">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Tags</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="p-8 text-center">Loading...</td></tr>
            ) : items?.map((item) => (
              <tr key={item._id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-6 py-4 font-bold">{item.name}</td>
                <td className="px-6 py-4 text-muted-foreground">{item.categoryName || 'Unknown'}</td>
                <td className="px-6 py-4 font-bold text-primary">Rs. {item.price}</td>
                <td className="px-6 py-4 flex gap-2">
                  {item.isBestSeller && <Star className="w-4 h-4 text-accent fill-accent" />}
                  {item.isSpicy && <Flame className="w-4 h-4 text-red-500 fill-red-500" />}
                </td>
                <td className="px-6 py-4 text-right">
                  <Button 
                    variant="destructive" size="icon" className="h-8 w-8 rounded-lg"
                    onClick={() => { if(confirm("Delete item?")) deleteItem({ id: item._id }) }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
