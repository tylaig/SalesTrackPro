import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Download, Filter, TrendingUp, Users, DollarSign, BarChart3 } from "lucide-react";
import SalesTrendChart from "@/components/charts/SalesTrendChart";
import SalesDistributionChart from "@/components/charts/SalesDistributionChart";
import type { SaleWithClient } from "@shared/schema";

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

  const { data: sales = [], isLoading: salesLoading } = useQuery<SaleWithClient[]>({
    queryKey: ["/api/sales"],
    retry: false,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calculateConversionRate = () => {
    const totalSales = sales.length;
    const realizedSales = sales.filter(sale => sale.status === 'realized').length;
    return totalSales > 0 ? ((realizedSales / totalSales) * 100).toFixed(1) : '0';
  };

  const topPerformingProducts = () => {
    const productSales = sales.reduce((acc, sale) => {
      if (sale.status === 'realized') {
        acc[sale.product] = (acc[sale.product] || 0) + Number(sale.value);
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(productSales)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([product, value]) => ({ product, value }));
  };

  return (
    <div>
      {/* Header */}
      <header className="bg-surface shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Relatórios</h2>
            <p className="text-sm text-gray-600">Análises detalhadas de performance</p>
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
                  <SelectItem value="quarter">Este trimestre</SelectItem>
                  <SelectItem value="year">Este ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
            <Button className="bg-primary text-white hover:bg-blue-700">
              <Download className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* KPIs Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-sm border border-gray-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Taxa de Conversão</p>
                  <p className="text-2xl font-semibold text-gray-800">{calculateConversionRate()}%</p>
                  <p className="text-xs text-green-600 mt-1">+2.5% vs mês anterior</p>
                </div>
                <div className="p-3 rounded-lg bg-green-100">
                  <TrendingUp className="text-green-600 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-gray-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Ticket Médio</p>
                  <p className="text-2xl font-semibold text-gray-800">
                    {metrics?.totalSales ? formatCurrency(metrics.totalSales / Math.max(sales.filter(s => s.status === 'realized').length, 1)) : '-'}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">+8.2% vs mês anterior</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-100">
                  <DollarSign className="text-blue-600 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-gray-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Clientes Ativos</p>
                  <p className="text-2xl font-semibold text-gray-800">{(metrics as any)?.totalClients || 0}</p>
                  <p className="text-xs text-purple-600 mt-1">+12 novos este mês</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-100">
                  <Users className="text-purple-600 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-gray-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Performance</p>
                  <p className="text-2xl font-semibold text-gray-800">94%</p>
                  <p className="text-xs text-green-600 mt-1">Meta: 90%</p>
                </div>
                <div className="p-3 rounded-lg bg-green-100">
                  <BarChart3 className="text-green-600 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {chartLoading ? (
            <>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-pulse">
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-pulse">
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </>
          ) : chartData ? (
            <>
              <SalesTrendChart data={{
                monthly: (chartData as any)?.monthly || []
              }} />
              <SalesDistributionChart data={{
                distribution: (chartData as any)?.distribution || []
              }} />
            </>
          ) : (
            <div className="col-span-2 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">Não foi possível carregar os dados dos gráficos.</p>
            </div>
          )}
        </div>

        {/* Top Produtos e Análise Detalhada */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Produtos */}
          <Card className="shadow-sm border border-gray-100">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">
                Top 5 Produtos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformingProducts().map((item, index) => (
                  <div key={item.product} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-900">{item.product}</span>
                    </div>
                    <span className="font-semibold text-gray-800">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Análise por Status */}
          <Card className="shadow-sm border border-gray-100">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">
                Análise por Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-green-800">Vendas Realizadas</p>
                    <p className="text-sm text-green-600">
                      {sales.filter(s => s.status === 'realized').length} vendas
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-800">
                      {(metrics as any)?.totalSales ? formatCurrency((metrics as any).totalSales) : '-'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-blue-800">Vendas Recuperadas</p>
                    <p className="text-sm text-blue-600">
                      {sales.filter(s => s.status === 'recovered').length} vendas
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-blue-800">
                      {(metrics as any)?.recoveredSales ? formatCurrency((metrics as any).recoveredSales) : '-'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-red-800">Vendas Perdidas</p>
                    <p className="text-sm text-red-600">
                      {sales.filter(s => s.status === 'lost').length} vendas
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-800">
                      {(metrics as any)?.lostSales ? formatCurrency((metrics as any).lostSales) : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}