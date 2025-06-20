import { useQuery } from "@tanstack/react-query";
import { Calendar, Bell } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import KPICards from "@/components/kpi-cards";
import ChartsSection from "@/components/charts-section";
import SalesTable from "@/components/sales-table";
import SupportForm from "@/components/support-form";
import TicketsList from "@/components/tickets-list";
import { useState } from "react";
import { type SaleWithClient } from "@shared/schema";

export default function Dashboard() {
  const [salesStatusFilter, setSalesStatusFilter] = useState("");

  // Fetch sales metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/sales/metrics"],
  });

  // Fetch chart data
  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ["/api/sales/charts"],
  });

  // Fetch sales data
  const { data: sales = [], isLoading: salesLoading } = useQuery<SaleWithClient[]>({
    queryKey: ["/api/sales", salesStatusFilter],
    queryFn: async () => {
      const url = (salesStatusFilter && salesStatusFilter !== "all") ? `/api/sales?status=${salesStatusFilter}` : "/api/sales";
      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch sales");
      return response.json();
    },
  });

  const currentDate = new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date());

  if (metricsLoading || chartLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse p-6">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Dashboard de Vendas</h2>
            <p className="text-sm text-gray-600">Atualizado em: {currentDate}</p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Date Filter */}
            <div className="flex items-center space-x-2">
              <Calendar className="text-gray-500" size={16} />
              <Select defaultValue="30days">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Últimos 7 dias</SelectItem>
                  <SelectItem value="30days">Últimos 30 dias</SelectItem>
                  <SelectItem value="thismonth">Este mês</SelectItem>
                  <SelectItem value="lastmonth">Mês anterior</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Notifications */}
            <Button variant="ghost" className="relative">
              <Bell size={20} />
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
        {metrics && <KPICards metrics={metrics} />}

        {/* Charts Section */}
        {chartData && <ChartsSection chartData={chartData} />}

        {/* Recent Sales Table */}
        <SalesTable 
          sales={sales} 
          onStatusFilter={setSalesStatusFilter}
        />

        {/* Support Tickets Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SupportForm />
          <TicketsList />
        </div>
      </div>
    </div>
  );
}
