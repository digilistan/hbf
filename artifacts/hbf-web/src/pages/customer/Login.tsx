import { PublicLayout } from "@/components/layout/PublicLayout";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCustomerLogin } from "@workspace/api-client-react";
import { useAuthStore } from "@/store";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function CustomerLogin() {
  const { setCustomerAuth } = useAuthStore();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { mutate, isPending } = useCustomerLogin({
    mutation: {
      onSuccess: (data) => {
        setCustomerAuth(data.token, { email: data.email, name: data.name });
        toast({ title: "Welcome back!" });
        setLocation("/");
      },
      onError: (err) => {
        const errData = err.data as { error?: string } | null;
        toast({ title: "Error", description: errData?.error ?? "Login failed", variant: "destructive" });
      }
    }
  });

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  return (
    <PublicLayout>
      <div className="max-w-md mx-auto mt-16 p-8 bg-card rounded-3xl shadow-xl border">
        <h1 className="text-3xl font-display font-black text-center mb-2">Welcome Back</h1>
        <p className="text-center text-muted-foreground mb-8">Login to track your orders</p>

        <form onSubmit={handleSubmit((data) => mutate({ data }))} className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" {...register("email")} className="h-12 rounded-xl" />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input type="password" {...register("password")} className="h-12 rounded-xl" />
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
          </div>
          <Button type="submit" disabled={isPending} className="w-full h-12 rounded-xl bg-primary text-lg mt-4">
            {isPending ? "Logging in..." : "Login"}
          </Button>
        </form>
        
        <p className="text-center mt-6 text-muted-foreground">
          Don't have an account? <Link href="/account/signup" className="text-primary font-bold hover:underline">Sign up</Link>
        </p>
      </div>
    </PublicLayout>
  );
}
