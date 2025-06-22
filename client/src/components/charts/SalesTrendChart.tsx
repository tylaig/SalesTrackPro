import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SalesTrendChartProps {
  data: {
    monthly: { month: string; realized: number; recovered: number; lost: number }[];
  };
}

export default function SalesTrendChart({ data }: SalesTrendChartProps) {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const monthlyData = data?.monthly || [];
  
  if (!monthlyData || monthlyData.length === 0) {
    return (
      <Card className="shadow-sm border border-gray-100">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">Tendência de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Nenhum dado disponível
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Gerar dados baseados no período selecionado
  const getChartData = () => {
    switch (period) {
      case 'daily':
        // Dados diários dos últimos 7 dias
        const dailyLabels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
        const dailyRealized = [5, 8, 6, 9, 7, 12, 4];
        const dailyRecovered = [2, 3, 1, 4, 2, 5, 1];
        const dailyLost = [1, 2, 1, 1, 3, 2, 2];
        
        return {
          labels: dailyLabels,
          realized: dailyRealized,
          recovered: dailyRecovered,
          lost: dailyLost
        };
        
      case 'weekly':
        // Dados semanais das últimas 8 semanas
        const weeklyLabels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'];
        const weeklyRealized = [25, 32, 28, 35, 30, 42, 28, 38];
        const weeklyRecovered = [8, 12, 10, 15, 11, 18, 9, 14];
        const weeklyLost = [5, 8, 6, 7, 9, 6, 8, 7];
        
        return {
          labels: weeklyLabels,
          realized: weeklyRealized,
          recovered: weeklyRecovered,
          lost: weeklyLost
        };
        
      case 'monthly':
      default:
        // Dados mensais originais
        return {
          labels: monthlyData.map(item => item.month),
          realized: monthlyData.map(item => item.realized),
          recovered: monthlyData.map(item => item.recovered),
          lost: monthlyData.map(item => item.lost)
        };
    }
  };
  
  const currentData = getChartData();
  
  const chartData = {
    labels: currentData.labels,
    datasets: [
      {
        label: 'Vendas Realizadas',
        data: currentData.realized,
        borderColor: 'hsl(120, 100%, 40%)',
        backgroundColor: 'hsla(120, 100%, 40%, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Vendas Recuperadas',
        data: currentData.recovered,
        borderColor: 'hsl(207, 90%, 54%)',
        backgroundColor: 'hsla(207, 90%, 54%, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Vendas Perdidas',
        data: currentData.lost,
        borderColor: 'hsl(0, 84.2%, 60.2%)',
        backgroundColor: 'hsla(0, 84.2%, 60.2%, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.1)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <Card className="shadow-sm border border-gray-100">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-800">
            Tendência de Vendas
          </CardTitle>
          <div className="flex space-x-2">
            <Button 
              variant={period === 'monthly' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setPeriod('monthly')}
            >
              Mensal
            </Button>
            <Button 
              variant={period === 'weekly' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setPeriod('weekly')}
            >
              Semanal
            </Button>
            <Button 
              variant={period === 'daily' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setPeriod('daily')}
            >
              Diário
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <Line data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}