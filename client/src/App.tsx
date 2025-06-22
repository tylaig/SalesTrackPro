import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/Dashboard";
import Sales from "@/pages/Sales";
import Clients from "@/pages/Clients";
import Support from "@/pages/Support";
import Reports from "@/pages/Reports";
import SuperAdmin from "@/pages/SuperAdmin";
import WebhookTest from "@/pages/WebhookTest";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";
import Sidebar from "@/components/navigation/Sidebar";

function Router({ isAuthenticated, onLogout, onLogin }: { isAuthenticated: boolean; onLogout: () => void; onLogin: (success: boolean) => void }) {
  if (!isAuthenticated) {
    return <Login onLogin={onLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar onLogout={onLogout} />
      <main className="flex-1 w-full min-h-screen">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/sales" component={Sales} />
          <Route path="/clients" component={Clients} />
          <Route path="/reports" component={Reports} />
          <Route path="/super-admin" component={SuperAdmin} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  const handleLogin = (success: boolean) => {
    if (success) {
      setIsAuthenticated(true);
      localStorage.setItem('isLoggedIn', 'true');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isLoggedIn');
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router isAuthenticated={isAuthenticated} onLogout={handleLogout} onLogin={handleLogin} />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
