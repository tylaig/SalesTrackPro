import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Users, 
  CreditCard, 
  Webhook, 
  Smartphone,
  TrendingUp,
  Settings,
  Database,
  BarChart3,
  Activity
} from "lucide-react";
import UsersManagement from "@/components/admin/UsersManagement";
import SuperAdminDashboard from "@/components/admin/SuperAdminDashboard";

export default function SuperAdmin() {
  const [activeTab, setActiveTab] = useState("users");

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/admin/metrics"],
    retry: false,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="super-admin-layout w-full min-h-screen bg-gray-50">
      {/* Header */}
      <header className="w-full bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="text-red-600 h-8 w-8" />
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">Super Admin</h2>
              <p className="text-sm text-gray-600">Painel de administração avançado</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
              Administrador
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="super-admin-content w-full p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <UsersManagement />
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            <SuperAdminDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}