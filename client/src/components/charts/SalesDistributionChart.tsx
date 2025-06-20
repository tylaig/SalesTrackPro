import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface SalesDistributionChartProps {
  data: {
    distribution: { status: string; count: number; value: number }[];
  };
}

export default function SalesDistributionChart({ data }: SalesDistributionChartProps) {
  const statusLabels: Record<string, string> = {
    realized: 'Realizadas',
    recovered: 'Recuperadas',
    lost: 'Perdidas'
  };

  const statusColors: Record<string, string> = {
    realized: 'hsl(120, 100%, 40%)',
    recovered: 'hsl(207, 90%, 54%)',
    lost: 'hsl(0, 84.2%, 60.2%)'
  };

  const chartData = {
    labels: data.distribution.map(item => statusLabels[item.status] || item.status),
    datasets: [
      {
        data: data.distribution.map(item => item.value),
        backgroundColor: data.distribution.map(item => statusColors[item.status] || '#6B7280'),
        borderWidth: 0,
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
  };

  return (
    <Card className="shadow-sm border border-gray-100">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-800">
            Distribuição de Vendas
          </CardTitle>
          <div className="flex items-center space-x-4 text-sm">
            {data.distribution.map((item) => (
              <div key={item.status} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: statusColors[item.status] }}
                />
                <span className="text-gray-600">
                  {statusLabels[item.status] || item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center">
          <Doughnut data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
