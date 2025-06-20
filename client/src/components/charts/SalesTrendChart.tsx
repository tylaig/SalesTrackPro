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
  const chartData = {
    labels: data.monthly.map(item => item.month),
    datasets: [
      {
        label: 'Vendas Realizadas',
        data: data.monthly.map(item => item.realized),
        borderColor: 'hsl(120, 100%, 40%)',
        backgroundColor: 'hsla(120, 100%, 40%, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Vendas Recuperadas',
        data: data.monthly.map(item => item.recovered),
        borderColor: 'hsl(207, 90%, 54%)',
        backgroundColor: 'hsla(207, 90%, 54%, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Vendas Perdidas',
        data: data.monthly.map(item => item.lost),
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
            <Button variant="default" size="sm">Mensal</Button>
            <Button variant="ghost" size="sm">Semanal</Button>
            <Button variant="ghost" size="sm">Diário</Button>
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
