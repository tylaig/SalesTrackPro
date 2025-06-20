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
import PlansManagement from "@/components/admin/PlansManagement";
import WebhooksManagement from "@/components/admin/WebhooksManagement";
import WhatsappChipsManagement from "@/components/admin/WhatsappChipsManagement";
import AdminAnalytics from "@/components/admin/AdminAnalytics";

export default function SuperAdmin() {
  const [activeTab, setActiveTab] = useState("overview");

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
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
      <div className="p-6 min-h-[calc(100vh-120px)]">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Usuários</span>
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4" />
              <span>Planos</span>
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="flex items-center space-x-2">
              <Webhook className="h-4 w-4" />
              <span>Webhooks</span>
            </TabsTrigger>
            <TabsTrigger value="chips" className="flex items-center space-x-2">
              <Smartphone className="h-4 w-4" />
              <span>Chips WhatsApp</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 w-full">
            {/* KPIs Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
              <Card className="shadow-sm border border-gray-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total de Usuários</p>
                      <p className="text-2xl font-semibold text-gray-800">
                        {(metrics as any)?.totalUsers || 0}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">+5 novos esta semana</p>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-100">
                      <Users className="text-blue-600 h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border border-gray-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Planos Ativos</p>
                      <p className="text-2xl font-semibold text-gray-800">
                        {(metrics as any)?.totalPlans || 0}
                      </p>
                      <p className="text-xs text-green-600 mt-1">2 novos planos</p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-100">
                      <CreditCard className="text-green-600 h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border border-gray-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Chips Ativos</p>
                      <p className="text-2xl font-semibold text-gray-800">
                        {(metrics as any)?.activeChips || 0}/{(metrics as any)?.totalChips || 0}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        {(metrics as any)?.recoveryChips || 0} em recuperação
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-100">
                      <Smartphone className="text-green-600 h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border border-gray-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Revenue Total</p>
                      <p className="text-2xl font-semibold text-gray-800">
                        {formatCurrency((metrics as any)?.totalSalesValue || 0)}
                      </p>
                      <p className="text-xs text-purple-600 mt-1">
                        {formatCurrency((metrics as any)?.totalRecoveredValue || 0)} recuperado
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-purple-100">
                      <TrendingUp className="text-purple-600 h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Webhooks Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-sm border border-gray-100">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Webhook className="h-5 w-5 text-purple-600" />
                    <span>Status dos Webhooks</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium text-green-800">Webhooks Ativos</p>
                        <p className="text-sm text-green-600">
                          {(metrics as any)?.totalWebhooks || 0} configurados
                        </p>
                      </div>
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    </div>

                    <div className="space-y-2">
                      <p className="font-medium text-gray-700">Eventos Suportados:</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          Aguardando Pagamento
                        </span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          Pagamento Aprovado
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border border-gray-100">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    <span>Atividade Recente</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-3">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600">Novo usuário registrado</span>
                      <span className="text-xs text-gray-400 ml-auto">2h atrás</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-600">Webhook disparado</span>
                      <span className="text-xs text-gray-400 ml-auto">4h atrás</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-gray-600">Chip em recuperação</span>
                      <span className="text-xs text-gray-400 ml-auto">6h atrás</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                      <span className="text-gray-600">Novo plano criado</span>
                      <span className="text-xs text-gray-400 ml-auto">1d atrás</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="w-full">
            <UsersManagement />
          </TabsContent>

          <TabsContent value="plans" className="w-full">
            <PlansManagement />
          </TabsContent>

          <TabsContent value="webhooks" className="w-full">
            <WebhooksManagement />
          </TabsContent>

          <TabsContent value="chips" className="w-full">
            <WhatsappChipsManagement />
          </TabsContent>

          <TabsContent value="analytics" className="w-full">
            <AdminAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}