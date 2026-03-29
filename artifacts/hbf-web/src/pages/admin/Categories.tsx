import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAdminGetCategories, useAdminCreateCategory, useAdminUpdateCategory, useAdminDeleteCategory } from "@workspace/api-client-react";
import type { CategoryRequest } from "@workspace/api-client-react";
import { useAuthStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { Trash2, Plus, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

type CategoryFormValues = { name: string; slug: string };

export default function AdminCategories() {
  const { adminToken } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editId, setEditId] = useState<string | null>(null);

  const reqOptions = { request: { headers: { Authorization: `Bearer ${adminToken}` } } };

  const { data: categories, isLoading } = useAdminGetCategories(reqOptions);

  const { mutate: createCat, isPending: creating } = useAdminCreateCategory({
    ...reqOptions,
    mutation: {
      onSuccess: () => {
        toast({ title: "Category added" });
        queryClient.invalidateQueries({ queryKey: [`/api/admin/categories`] });
        reset();
      }
    }
  });

  const { mutate: updateCat, isPending: updating } = useAdminUpdateCategory({
    ...reqOptions,
    mutation: {
      onSuccess: () => {
        toast({ title: "Category updated" });
        queryClient.invalidateQueries({ queryKey: [`/api/admin/categories`] });
        setEditId(null);
        editReset();
      }
    }
  });

  const { mutate: deleteCat } = useAdminDeleteCategory({
    ...reqOptions,
    mutation: {
      onSuccess: () => {
        toast({ title: "Category deleted" });
        queryClient.invalidateQueries({ queryKey: [`/api/admin/categories`] });
      }
    }
  });

  const { register, handleSubmit, reset } = useForm<CategoryFormValues>({ defaultValues: { name: "", slug: "" } });
  const { register: editRegister, handleSubmit: handleEditSubmit, reset: editReset } = useForm<CategoryFormValues>({ defaultValues: { name: "", slug: "" } });

  const onSubmit = (data: CategoryFormValues) => {
    const payload: CategoryRequest = {
      name: data.name,
      slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      isActive: true,
    };
    createCat({ data: payload });
  };

  const onEdit = (data: CategoryFormValues) => {
    if (!editId) return;
    const payload: CategoryRequest = {
      name: data.name,
      slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    };
    updateCat({ id: editId, data: payload });
  };

  const openEdit = (cat: { _id: string; name: string; slug: string }) => {
    setEditId(cat._id);
    editReset({ name: cat.name, slug: cat.slug });
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-black text-foreground">Categories</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-card p-6 rounded-2xl shadow-sm border sticky top-24">
            <h3 className="font-bold text-lg mb-4">Add New Category</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-sm font-bold mb-1 block">Name</label>
                <Input {...register("name", { required: true })} placeholder="e.g. Special Pizzas" className="rounded-lg" />
              </div>
              <div>
                <label className="text-sm font-bold mb-1 block">Slug (optional)</label>
                <Input {...register("slug")} placeholder="e.g. pizzas" className="rounded-lg" />
              </div>
              <Button type="submit" disabled={creating} className="w-full rounded-lg">
                <Plus className="w-4 h-4 mr-2" /> Add Category
              </Button>
            </form>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-card rounded-2xl shadow-sm border overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase font-bold text-xs">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Slug</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={3} className="p-8 text-center">Loading...</td></tr>
                ) : categories?.map((cat) => (
                  <tr key={cat._id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-6 py-4 font-bold">{cat.name}</td>
                    <td className="px-6 py-4 text-muted-foreground font-mono">{cat.slug}</td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <Button
                        variant="outline" size="icon" className="h-8 w-8 rounded-lg"
                        onClick={() => openEdit(cat)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive" size="icon" className="h-8 w-8 rounded-lg"
                        onClick={() => { if (confirm("Delete category?")) deleteCat({ id: cat._id }); }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={!!editId} onOpenChange={(open) => { if (!open) setEditId(null); }}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit(onEdit)} className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-bold mb-1 block">Name</label>
              <Input {...editRegister("name", { required: true })} className="rounded-lg" />
            </div>
            <div>
              <label className="text-sm font-bold mb-1 block">Slug</label>
              <Input {...editRegister("slug")} className="rounded-lg" />
            </div>
            <Button type="submit" disabled={updating} className="w-full rounded-xl h-11">Save Changes</Button>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
