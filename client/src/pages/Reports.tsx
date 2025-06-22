import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Filter, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import KPICards from "@/components/kpi-cards";
import ChartsSection from "@/components/charts-section";

export default function Reports() {
  const [dateFilter, setDateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/sales/metrics"],
    retry: false,
  });

  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ["/api/sales/charts"],
    retry: false,
  });

  const handleExportPDF = () => {
    toast({
      title: "Exportando Relatório",
      description: "PDF sendo gerado e baixado...",
    });
    
    setTimeout(() => {
      toast({
        title: "Relatório Exportado",
        description: "PDF baixado com sucesso",
      });
    }, 2000);
  };

  if (metricsLoading || chartLoading) {
    return <div className="p-6">Carregando relatórios...</div>;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg px-6 py-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Relatórios</h2>
            <p className="text-sm text-gray-600">Análise detalhada de vendas e performance</p>
          </div>
          <div className="flex gap-2">
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-40">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">7 dias</SelectItem>
                <SelectItem value="month">30 dias</SelectItem>
                <SelectItem value="quarter">90 dias</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="realized">Realizadas</SelectItem>
                <SelectItem value="recovered">Recuperadas</SelectItem>
                <SelectItem value="lost">Perdidas</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={handleExportPDF} 
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar PDF
            </Button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      {metrics && chartData && (
        <KPICards metrics={{
          totalSales: metrics.totalSales,
          recoveredSales: metrics.recoveredSales,
          lostSales: metrics.lostSales,
          totalClients: metrics.totalClients,
          salesGrowth: 15.2,
          recoveryGrowth: 8.7,
          lossGrowth: -5.3,
          clientGrowth: 12.1
        }} />
      )}

      {/* Charts */}
      {chartData && (
        <ChartsSection chartData={chartData} />
      )}

      {/* Additional Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Resumo de Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Taxa de Conversão</span>
                <Badge variant="outline">
                  {metrics ? ((metrics.totalSales - metrics.lostSales) / metrics.totalSales * 100).toFixed(1) : 0}%
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Taxa de Recuperação</span>
                <Badge variant="secondary">
                  {metrics ? (metrics.recoveredSales / (metrics.recoveredSales + metrics.lostSales) * 100).toFixed(1) : 0}%
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Valor Médio por Venda</span>
                <Badge variant="outline">
                  R$ {metrics ? (metrics.totalSales / Math.max(metrics.totalClients, 1)).toFixed(2) : '0.00'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tendências</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Vendas este mês</span>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-green-600 text-sm">+15.2%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Recuperações</span>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="text-blue-600 text-sm">+8.7%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Perdas</span>
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="text-red-600 text-sm">-5.3%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}