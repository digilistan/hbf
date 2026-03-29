import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Home from "@/pages/Home";
import Checkout from "@/pages/Checkout";
import OrderSuccess from "@/pages/OrderSuccess";
import CustomerLogin from "@/pages/customer/Login";
import CustomerSignup from "@/pages/customer/Signup";
import MyOrders from "@/pages/customer/MyOrders";
import AdminLogin from "@/pages/admin/Login";
import AdminOrders from "@/pages/admin/Orders";
import AdminOrderDetail from "@/pages/admin/OrderDetail";
import AdminCategories from "@/pages/admin/Categories";
import AdminItems from "@/pages/admin/Items";
import AdminCustomers from "@/pages/admin/Customers";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      {/* Public / Customer Routes */}
      <Route path="/" component={Home} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/order/:id" component={OrderSuccess} />
      <Route path="/account/login" component={CustomerLogin} />
      <Route path="/account/signup" component={CustomerSignup} />
      <Route path="/account/orders" component={MyOrders} />
      
      {/* Admin Routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminOrders} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/admin/orders/:id" component={AdminOrderDetail} />
      <Route path="/admin/menu/categories" component={AdminCategories} />
      <Route path="/admin/menu/items" component={AdminItems} />
      <Route path="/admin/customers" component={AdminCustomers} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
