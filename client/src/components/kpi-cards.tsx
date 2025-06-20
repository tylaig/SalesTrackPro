import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Undo2, XCircle, Users, TrendingUp, TrendingDown } from "lucide-react";

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
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const cards = [
    {
      title: "Vendas Realizadas",
      value: formatCurrency(metrics.totalSales),
      growth: metrics.salesGrowth,
      icon: CheckCircle,
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Vendas Recuperadas", 
      value: formatCurrency(metrics.recoveredSales),
      growth: metrics.recoveryGrowth,
      icon: Undo2,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Vendas Perdidas",
      value: formatCurrency(metrics.lostSales),
      growth: metrics.lossGrowth,
      icon: XCircle,
      bgColor: "bg-red-100", 
      iconColor: "text-red-600",
    },
    {
      title: "Total de Clientes",
      value: metrics.totalClients.toString(),
      growth: metrics.clientGrowth,
      icon: Users,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const isPositive = card.growth >= 0;
        const TrendIcon = isPositive ? TrendingUp : TrendingDown;
        const trendColor = isPositive ? "text-green-600" : "text-red-600";
        
        return (
          <Card key={index} className="bg-white shadow-sm border border-gray-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                  <p className="text-2xl font-semibold text-gray-800">{card.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendIcon className={`${trendColor} text-xs mr-1`} size={12} />
                    <span className={`${trendColor} text-xs font-medium`}>
                      {formatPercent(card.growth)}
                    </span>
                    <span className="text-gray-500 text-xs ml-1">vs mês anterior</span>
                  </div>
                </div>
                <div className={`${card.bgColor} p-3 rounded-lg`}>
                  <Icon className={card.iconColor} size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
