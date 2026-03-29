import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAdminGetCategories, useAdminCreateCategory, useAdminDeleteCategory } from "@workspace/api-client-react";
import { useAuthStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminCategories() {
  const { adminToken } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const { mutate: deleteCat } = useAdminDeleteCategory({
    ...reqOptions,
    mutation: {
      onSuccess: () => {
        toast({ title: "Category deleted" });
        queryClient.invalidateQueries({ queryKey: [`/api/admin/categories`] });
      }
    }
  });

  const { register, handleSubmit, reset, watch } = useForm({ defaultValues: { name: "", slug: "" } });

  const onSubmit = (data: any) => {
    if(!data.slug) data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    createCat({ data: { ...data, isActive: true } });
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
                    <td className="px-6 py-4 text-right">
                      <Button 
                        variant="destructive" size="icon" className="h-8 w-8 rounded-lg"
                        onClick={() => { if(confirm("Delete category?")) deleteCat({ id: cat._id }) }}
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
    </AdminLayout>
  );
}
