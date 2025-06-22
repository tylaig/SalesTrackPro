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
  Activity,
  Trash2,
  AlertTriangle
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="webhook">Webhook Test</TabsTrigger>
            <TabsTrigger value="data">Limpar Dados</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <UsersManagement />
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            <SuperAdminDashboard />
          </TabsContent>

          <TabsContent value="webhook">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Webhook className="h-5 w-5" />
                  Teste de Webhook
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Interface para testar webhooks do sistema de vendas
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      className="gap-2"
                      onClick={() => window.open("/webhook-test", "_blank")}
                    >
                      <Webhook className="h-4 w-4" />
                      Abrir Página de Teste
                    </Button>
                    <Button 
                      variant="outline"
                      className="gap-2"
                      onClick={() => window.location.href = "/webhook-test"}
                    >
                      <Webhook className="h-4 w-4" />
                      Ir para Teste de Webhook
                    </Button>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Eventos Suportados:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• PIX_GENERATED - Gera venda pendente</li>
                      <li>• SALE_APPROVED - Confirma venda como realizada</li>
                      <li>• ABANDONED_CART - Registra carrinho abandonado</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Limpar Vendas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-600">
                    <Trash2 className="h-5 w-5" />
                    Limpar Apenas Vendas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <h3 className="font-semibold text-orange-800 mb-2">⚠️ ATENÇÃO</h3>
                      <p className="text-orange-700 text-sm">
                        Esta ação irá remover TODAS as vendas do sistema. 
                        Os clientes serão mantidos.
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700">
                        Digite "CONFIRMAR" para limpar vendas:
                      </label>
                      <Input
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="CONFIRMAR"
                        className="max-w-xs"
                      />
                    </div>

                    <Button
                      onClick={handleClearSales}
                      disabled={confirmText !== "CONFIRMAR" || clearDataMutation.isPending}
                      variant="destructive"
                      className="gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      {clearDataMutation.isPending ? "Limpando..." : "Limpar Vendas"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Limpar Clientes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <Trash2 className="h-5 w-5" />
                    Limpar Apenas Clientes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h3 className="font-semibold text-red-800 mb-2">⚠️ ATENÇÃO</h3>
                      <p className="text-red-700 text-sm">
                        Esta ação irá remover TODOS os clientes E suas vendas do sistema.
                        Esta operação é IRREVERSÍVEL.
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700">
                        Digite "CONFIRMAR" para limpar clientes:
                      </label>
                      <Input
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="CONFIRMAR"
                        className="max-w-xs"
                      />
                    </div>

                    <Button
                      onClick={handleClearClients}
                      disabled={confirmText !== "CONFIRMAR" || clearDataMutation.isPending}
                      variant="destructive"
                      className="gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      {clearDataMutation.isPending ? "Limpando..." : "Limpar Clientes"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Limpar Tudo */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    Zona Perigosa - Limpar TODOS os Dados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h3 className="font-semibold text-red-800 mb-2">⚠️ ATENÇÃO MÁXIMA</h3>
                      <p className="text-red-700 text-sm">
                        Esta ação irá remover TODOS os clientes E TODAS as vendas do sistema. 
                        Esta operação é IRREVERSÍVEL e não pode ser desfeita.
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700">
                        Digite "CONFIRMAR" para limpar tudo:
                      </label>
                      <Input
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="CONFIRMAR"
                        className="max-w-xs"
                      />
                    </div>

                    <Button
                      onClick={handleClearAll}
                      disabled={confirmText !== "CONFIRMAR" || clearDataMutation.isPending}
                      variant="destructive"
                      className="gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      {clearDataMutation.isPending ? "Limpando..." : "Limpar TODOS os Dados"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}