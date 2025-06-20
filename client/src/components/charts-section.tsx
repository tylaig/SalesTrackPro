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
  const distributionData = chartData.distribution.map(item => ({
    name: item.status === 'realized' ? 'Realizadas' : 
          item.status === 'recovered' ? 'Recuperadas' : 'Perdidas',
    value: item.count,
    status: item.status
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Sales Trend Chart */}
      <Card className="bg-white shadow-sm border border-gray-100">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-800">
            Tendência de Vendas
          </CardTitle>
          <div className="flex space-x-2">
            <Button size="sm" className="px-3 py-1 text-xs">Mensal</Button>
            <Button size="sm" variant="outline" className="px-3 py-1 text-xs">Semanal</Button>
            <Button size="sm" variant="outline" className="px-3 py-1 text-xs">Diário</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.monthly}>
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
