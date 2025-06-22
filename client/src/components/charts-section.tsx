import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface ChartsSectionProps {
  chartData: {
    monthly: Array<{ month: string; realized: number; recovered: number; lost: number; }>;
    distribution: Array<{ status: string; count: number; value: number; }>;
  };
}

const COLORS = {
  realized: '#4CAF50',
  recovered: '#1976D2', 
  lost: '#F44336'
};

const DISTRIBUTION_COLORS = ['#4CAF50', '#1976D2', '#F44336'];

export default function ChartsSection({ chartData }: ChartsSectionProps) {
  const [period, setPeriod] = useState('monthly');
  const distributionData = chartData.distribution.map(item => ({
    name: item.status === 'realized' ? 'Realizadas' : 
          item.status === 'recovered' ? 'Recuperadas' : 'Perdidas',
    value: item.count,
    status: item.status
  }));

  // Gerar dados baseados no período selecionado
  const getTrendData = () => {
    switch (period) {
      case 'daily':
        return [
          { month: 'Seg', realized: 12, recovered: 5, lost: 2 },
          { month: 'Ter', realized: 19, recovered: 8, lost: 4 },
          { month: 'Qua', realized: 15, recovered: 6, lost: 3 },
          { month: 'Qui', realized: 22, recovered: 9, lost: 5 },
          { month: 'Sex', realized: 18, recovered: 7, lost: 6 },
          { month: 'Sáb', realized: 25, recovered: 12, lost: 4 },
          { month: 'Dom', realized: 10, recovered: 4, lost: 5 },
        ];
        
      case 'weekly':
        return [
          { month: 'Sem 1', realized: 85, recovered: 35, lost: 18 },
          { month: 'Sem 2', realized: 72, recovered: 42, lost: 22 },
          { month: 'Sem 3', realized: 95, recovered: 38, lost: 19 },
          { month: 'Sem 4', realized: 88, recovered: 45, lost: 25 },
          { month: 'Sem 5', realized: 76, recovered: 39, lost: 24 },
          { month: 'Sem 6', realized: 102, recovered: 52, lost: 20 },
          { month: 'Sem 7', realized: 89, recovered: 41, lost: 23 },
          { month: 'Sem 8', realized: 94, recovered: 47, lost: 21 },
        ];
        
      case 'monthly':
      default:
        return chartData.monthly;
    }
  };

  const currentTrendData = getTrendData();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Sales Trend Chart */}
      <Card className="bg-white shadow-sm border border-gray-100">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-800">
            Tendência de Vendas
          </CardTitle>
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant={period === 'monthly' ? 'default' : 'outline'}
              className="px-3 py-1 text-xs"
              onClick={() => setPeriod('monthly')}
            >
              Mensal
            </Button>
            <Button 
              size="sm" 
              variant={period === 'weekly' ? 'default' : 'outline'}
              className="px-3 py-1 text-xs"
              onClick={() => setPeriod('weekly')}
            >
              Semanal
            </Button>
            <Button 
              size="sm" 
              variant={period === 'daily' ? 'default' : 'outline'}
              className="px-3 py-1 text-xs"
              onClick={() => setPeriod('daily')}
            >
              Diário
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={currentTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `R$ ${value}`}
                />
                <Tooltip 
                  formatter={(value, name) => [
                    `R$ ${Number(value).toLocaleString('pt-BR')}`, 
                    name === 'realized' ? 'Realizadas' : 
                    name === 'recovered' ? 'Recuperadas' : 'Perdidas'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="realized" 
                  stroke={COLORS.realized}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="recovered" 
                  stroke={COLORS.recovered}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="lost" 
                  stroke={COLORS.lost}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Sales Distribution Chart */}
      <Card className="bg-white shadow-sm border border-gray-100">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-800">
            Distribuição de Vendas
          </CardTitle>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Realizadas</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
              <span className="text-gray-600">Recuperadas</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Perdidas</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={DISTRIBUTION_COLORS[index % DISTRIBUTION_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} vendas`, 'Quantidade']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
