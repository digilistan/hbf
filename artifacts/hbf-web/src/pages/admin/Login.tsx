import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAdminLogin } from "@workspace/api-client-react";
import { useAuthStore } from "@/store";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const { setAdminAuth } = useAuthStore();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { mutate: login, isPending } = useAdminLogin({
    mutation: {
      onSuccess: (data) => {
        setAdminAuth(data.token, { email: data.email, role: data.role });
        toast({ title: "Success", description: "Logged in to admin panel." });
        setLocation("/admin/orders");
      },
      onError: (err) => {
        toast({ title: "Login failed", description: err.response?.data?.error || "Invalid credentials", variant: "destructive" });
      }
    }
  });

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card p-8 rounded-3xl shadow-2xl border-t-[6px] border-primary">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary text-white flex items-center justify-center rounded-2xl mx-auto mb-4 font-display font-black text-3xl shadow-lg">
            H
          </div>
          <h1 className="text-3xl font-display font-black text-foreground">Admin Portal</h1>
          <p className="text-muted-foreground mt-2">Sign in to manage Haq Bahoo Foods</p>
        </div>

        <form onSubmit={handleSubmit((data) => login({ data }))} className="space-y-5">
          <div className="space-y-2">
            <Label>Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
              <Input type="email" {...register("email")} className="pl-10 h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background" />
            </div>
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label>Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
              <Input type="password" {...register("password")} className="pl-10 h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background" />
            </div>
            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
          </div>

          <Button type="submit" disabled={isPending} className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-lg shadow-lg font-bold mt-4">
            {isPending ? "Authenticating..." : "Login to Dashboard"}
          </Button>
        </form>
      </div>
    </div>
  );
}
