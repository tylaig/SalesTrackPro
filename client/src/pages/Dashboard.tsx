import { useQuery } from "@tanstack/react-query";
import { Calendar, Bell } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import KPICards from "@/components/dashboard/KPICards";
import SalesTrendChart from "@/components/charts/SalesTrendChart";
import SalesDistributionChart from "@/components/charts/SalesDistributionChart";
import SalesTable from "@/components/dashboard/SalesTable";

import type { SaleWithClient } from "@shared/schema";

export default function Dashboard() {
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/sales/metrics"],
    retry: false,
  });

  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ["/api/sales/charts"],
    retry: false,
  });

  const { data: sales = [], isLoading: salesLoading } = useQuery<SaleWithClient[]>({
    queryKey: ["/api/sales"],
    retry: false,
  });

  const formatDate = () => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date());
  };

  return (
    <div>
      {/* Header */}
      <header className="bg-surface shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Dashboard de Vendas</h2>
            <p className="text-sm text-gray-600">Atualizado em: {formatDate()}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="text-gray-500 h-4 w-4" />
              <Select>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Últimos 30 dias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="this_month">Este mês</SelectItem>
                  <SelectItem value="last_month">Mês anterior</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </Button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="p-6">
        {/* KPI Cards */}
        {metricsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-pulse">
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : metrics && (metrics.totalSales > 0 || metrics.totalClients > 0) ? (
          <KPICards metrics={{
            totalSales: metrics.totalSales || 0,
            recoveredSales: metrics.recoveredSales || 0,
            lostSales: metrics.lostSales || 0,
            totalClients: metrics.totalClients || 0,
            salesGrowth: 12.3,
            recoveryGrowth: 8.7,
            lossGrowth: -4.2,
            clientGrowth: 15.6
          }} />
        ) : (
          <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-blue-800 font-medium mb-2">Dashboard Vazio</h3>
            <p className="text-blue-700">
              Nenhuma venda foi registrada ainda. Quando houver dados de vendas e clientes, 
              as métricas aparecerão aqui automaticamente.
            </p>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {chartLoading ? (
            <>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-pulse">
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-pulse">
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </>
          ) : chartData && chartData.distribution && chartData.distribution.length > 0 ? (
            <>
              <SalesTrendChart data={chartData} />
              <SalesDistributionChart data={chartData} />
            </>
          ) : (
            <div className="col-span-2 p-6 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Gráficos não disponíveis</h3>
                <p className="text-gray-500">
                  Os gráficos aparecerão quando houver dados de vendas suficientes.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Recent Sales Table */}
        {salesLoading ? (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-pulse mb-8">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        ) : sales && sales.length > 0 ? (
          <SalesTable sales={sales} />
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma venda registrada</h3>
              <p className="text-gray-500">
                Quando houver vendas registradas no sistema, elas aparecerão aqui.
              </p>
            </div>
          </div>
        )}


      </div>
    </div>
  );
}
