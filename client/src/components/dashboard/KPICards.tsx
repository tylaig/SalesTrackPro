import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, RotateCcw, XCircle, Users } from "lucide-react";

interface KPICardsProps {
  metrics: {
    totalSales: number;
    recoveredSales: number;
    lostSales: number;
    totalClients: number;
    salesGrowth: number;
    recoveryGrowth: number;
    lossGrowth: number;
    clientGrowth: number;
  };
}

export default function KPICards({ metrics }: KPICardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercent = (value: number) => {
    if (value === 0) {
      return 'Sem dados históricos';
    }
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const cards = [
    {
      title: "Vendas Realizadas",
      value: formatCurrency(metrics.totalSales),
      growth: formatPercent(metrics.salesGrowth),
      growthText: "vs mês anterior",
      icon: CheckCircle,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      growthColor: metrics.salesGrowth >= 0 ? "text-green-600" : "text-red-600"
    },
    {
      title: "Vendas Recuperadas",
      value: formatCurrency(metrics.recoveredSales),
      growth: formatPercent(metrics.recoveryGrowth),
      growthText: "vs mês anterior",
      icon: RotateCcw,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      growthColor: metrics.recoveryGrowth >= 0 ? "text-green-600" : "text-red-600"
    },
    {
      title: "Vendas Perdidas",
      value: formatCurrency(metrics.lostSales),
      growth: formatPercent(metrics.lossGrowth),
      growthText: "vs mês anterior",
      icon: XCircle,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      growthColor: metrics.lossGrowth <= 0 ? "text-green-600" : "text-red-600"
    },
    {
      title: "Total de Clientes",
      value: metrics.totalClients.toString(),
      growth: formatPercent(metrics.clientGrowth),
      growthText: "novos clientes",
      icon: Users,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      growthColor: metrics.clientGrowth >= 0 ? "text-green-600" : "text-red-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <Card key={index} className="shadow-sm border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                <p className="text-2xl font-semibold text-gray-800">{card.value}</p>
                <div className="flex items-center mt-2">
                  <span className={`text-xs font-medium ${card.growthColor}`}>
                    {card.growth}
                  </span>
                  <span className="text-gray-500 text-xs ml-1">{card.growthText}</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${card.iconBg}`}>
                <card.icon className={`${card.iconColor} text-xl h-6 w-6`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}