import { useState } from "react";
import { Switch, Route } from "wouter";
import { Menu, X } from "lucide-react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/Dashboard";
import Sales from "@/pages/Sales";
import Clients from "@/pages/Clients";
import Reports from "@/pages/Reports";
import SuperAdmin from "@/pages/SuperAdmin";
import WebhookTest from "@/pages/WebhookTest";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";
import Sidebar from "@/components/navigation/Sidebar";
import { useAuth } from "@/hooks/useAuth";



function AppWithAuth() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, isAdmin, user, login, logout } = useAuth();

  const handleLogin = (success: boolean, userData?: any) => {
    if (success && userData) {
      login(userData);
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-background relative">
      <button
        className="fixed top-4 left-4 z-50 bg-white shadow-lg border border-gray-300 rounded-md p-2 hover:bg-gray-50"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      <Sidebar onLogout={logout} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />
      <main className={`flex-1 min-h-screen transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/sales" component={Sales} />
          <Route path="/clients" component={Clients} />
          <Route path="/reports" component={Reports} />
          {isAdmin && <Route path="/super-admin" component={SuperAdmin} />}
          {isAdmin && <Route path="/webhook-test" component={WebhookTest} />}
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppWithAuth />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
