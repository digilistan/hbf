import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAdminGetItems, useAdminCreateItem, useAdminUpdateItem, useAdminDeleteItem, useAdminGetCategories, getAdminGetItemsQueryKey } from "@workspace/api-client-react";
import type { MenuItemRequest, MenuItem } from "@workspace/api-client-react";
import { useAuthStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm, Controller } from "react-hook-form";
import { Trash2, Plus, Flame, Star, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

type ItemFormValues = {
  name: string;
  category: string;
  price: number;
  description: string;
  imageUrl: string;
  isSpicy: boolean;
  isBestSeller: boolean;
};


const defaultValues: ItemFormValues = {
  name: "", category: "", price: 0, description: "", imageUrl: "", isSpicy: false, isBestSeller: false,
};

const toPayload = (data: ItemFormValues): MenuItemRequest => ({
  name: data.name,
  category: data.category,
  price: Number(data.price),
  description: data.description || undefined,
  imageUrl: data.imageUrl || undefined,
  isBestSeller: data.isBestSeller,
  isSpicy: data.isSpicy,
  isActive: true,
});

export default function AdminItems() {
  const { adminToken } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);

  const reqOptions = { request: { headers: { Authorization: `Bearer ${adminToken}` } } };

  const { data: items, isLoading } = useAdminGetItems(reqOptions);
  const { data: categories } = useAdminGetCategories(reqOptions);

  const addForm = useForm<ItemFormValues>({ defaultValues });
  const editForm = useForm<ItemFormValues>({ defaultValues });

  const { mutate: createItem, isPending: creating } = useAdminCreateItem({
    ...reqOptions,
    mutation: {
      onSuccess: () => {
        toast({ title: "Item added" });
        queryClient.invalidateQueries({ queryKey: getAdminGetItemsQueryKey() });
        setAddOpen(false);
        addForm.reset(defaultValues);
      }
    }
  });

  const { mutate: updateItem, isPending: updating } = useAdminUpdateItem({
    ...reqOptions,
    mutation: {
      onSuccess: () => {
        toast({ title: "Item updated" });
        queryClient.invalidateQueries({ queryKey: getAdminGetItemsQueryKey() });
        setEditItem(null);
      }
    }
  });

  const { mutate: deleteItem } = useAdminDeleteItem({
    ...reqOptions,
    mutation: {
      onSuccess: () => {
        toast({ title: "Item deleted" });
        queryClient.invalidateQueries({ queryKey: getAdminGetItemsQueryKey() });
      }
    }
  });

  const openEdit = (item: MenuItem) => {
    setEditItem(item);
    editForm.reset({
      name: item.name,
      category: item.category,
      price: item.price,
      description: item.description ?? "",
      imageUrl: item.imageUrl ?? "",
      isSpicy: item.isSpicy,
      isBestSeller: item.isBestSeller,
    });
  };

  const CategorySelect = ({ form }: { form: ReturnType<typeof useForm<ItemFormValues>> }) => (
    <Controller
      name="category"
      control={form.control}
      rules={{ required: true }}
      render={({ field }) => (
        <Select onValueChange={field.onChange} value={field.value}>
          <SelectTrigger className="rounded-lg"><SelectValue placeholder="Select category..." /></SelectTrigger>
          <SelectContent>
            {categories?.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      )}
    />
  );

  return (
    <AdminLayout>
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-display font-black text-foreground">Menu Items</h1>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl shadow-lg"><Plus className="w-4 h-4 mr-2" /> Add Item</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg rounded-2xl">
            <DialogHeader><DialogTitle>Add Menu Item</DialogTitle></DialogHeader>
            <form onSubmit={addForm.handleSubmit(v => createItem({ data: toPayload(v) }))} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-sm font-bold mb-1 block">Name</label>
                  <Input {...addForm.register("name", { required: true })} className="rounded-lg" />
                </div>
                <div>
                  <label className="text-sm font-bold mb-1 block">Category</label>
                  <CategorySelect form={addForm} />
                </div>
                <div>
                  <label className="text-sm font-bold mb-1 block">Price (Rs.)</label>
                  <Input type="number" {...addForm.register("price", { required: true, valueAsNumber: true })} className="rounded-lg" />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-bold mb-1 block">Description</label>
                  <Textarea {...addForm.register("description")} className="rounded-lg resize-none" />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-bold mb-1 block">Image URL (optional)</label>
                  <Input {...addForm.register("imageUrl")} className="rounded-lg" placeholder="https://images.unsplash.com/..." />
                </div>
              </div>
              <div className="flex gap-6 py-2">
                <label className="flex items-center gap-2 font-bold text-sm cursor-pointer">
                  <Controller name="isSpicy" control={addForm.control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />
                  🌶️ Spicy
                </label>
                <label className="flex items-center gap-2 font-bold text-sm cursor-pointer">
                  <Controller name="isBestSeller" control={addForm.control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />
                  ⭐ Best Seller
                </label>
              </div>
              <Button type="submit" disabled={creating} className="w-full rounded-xl h-12 text-lg">Save Item</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground uppercase font-bold text-xs">
            <tr>
              <th className="px-4 py-4 w-14"></th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Tags</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="p-8 text-center">Loading...</td></tr>
            ) : items?.map((item) => (
              <tr key={item._id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-xs">No img</div>
                  )}
                </td>
                <td className="px-6 py-4 font-bold">{item.name}</td>
                <td className="px-6 py-4 text-muted-foreground">{item.categoryName || "Unknown"}</td>
                <td className="px-6 py-4 font-bold text-primary">Rs. {item.price}</td>
                <td className="px-6 py-4">
                  <span className="flex gap-2">
                    {item.isBestSeller && <Star className="w-4 h-4 text-accent fill-accent" />}
                    {item.isSpicy && <Flame className="w-4 h-4 text-red-500 fill-red-500" />}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="flex justify-end gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={() => openEdit(item)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="destructive" size="icon" className="h-8 w-8 rounded-lg"
                      onClick={() => { if (confirm("Delete this item?")) deleteItem({ id: item._id }); }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!editItem} onOpenChange={(open) => { if (!open) setEditItem(null); }}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader><DialogTitle>Edit Menu Item</DialogTitle></DialogHeader>
          <form onSubmit={editForm.handleSubmit(v => { if (editItem) updateItem({ id: editItem._id, data: toPayload(v) }); })} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-bold mb-1 block">Name</label>
                <Input {...editForm.register("name", { required: true })} className="rounded-lg" />
              </div>
              <div>
                <label className="text-sm font-bold mb-1 block">Category</label>
                <CategorySelect form={editForm} />
              </div>
              <div>
                <label className="text-sm font-bold mb-1 block">Price (Rs.)</label>
                <Input type="number" {...editForm.register("price", { required: true, valueAsNumber: true })} className="rounded-lg" />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-bold mb-1 block">Description</label>
                <Textarea {...editForm.register("description")} className="rounded-lg resize-none" />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-bold mb-1 block">Image URL (optional)</label>
                <Input {...editForm.register("imageUrl")} className="rounded-lg" placeholder="https://images.unsplash.com/..." />
              </div>
            </div>
            <div className="flex gap-6 py-2">
              <label className="flex items-center gap-2 font-bold text-sm cursor-pointer">
                <Controller name="isSpicy" control={editForm.control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />
                🌶️ Spicy
              </label>
              <label className="flex items-center gap-2 font-bold text-sm cursor-pointer">
                <Controller name="isBestSeller" control={editForm.control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />
                ⭐ Best Seller
              </label>
            </div>
            <Button type="submit" disabled={updating} className="w-full rounded-xl h-12 text-lg">Save Changes</Button>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
