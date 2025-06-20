import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, CreditCard, Globe, Smartphone, TrendingUp, DollarSign } from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function AdminAnalytics() {
  const { data: metrics = {}, isLoading } = useQuery({
    queryKey: ["/api/admin/metrics"],
  });

  if (isLoading) {
    return <div>Loading analytics...</div>;
  }

  const kpiCards = [
    {
      title: "Total Users",
      value: metrics.totalUsers || 0,
      icon: Users,
      description: "Active platform users",
      change: "+12%",
    },
    {
      title: "Active Plans",
      value: metrics.totalPlans || 0,
      icon: CreditCard,
      description: "Available subscription plans",
      change: "+3%",
    },
    {
      title: "Webhooks",
      value: metrics.totalWebhooks || 0,
      icon: Globe,
      description: "Configured webhook endpoints",
      change: "+5%",
    },
    {
      title: "WhatsApp Chips",
      value: metrics.totalChips || 0,
      icon: Smartphone,
      description: "Total WhatsApp chips",
      change: "+8%",
    },
    {
      title: "Active Chips",
      value: metrics.activeChips || 0,
      icon: TrendingUp,
      description: "Currently active chips",
      change: "+15%",
    },
    {
      title: "Total Sales Value",
      value: `$${(metrics.totalSalesValue || 0).toLocaleString()}`,
      icon: DollarSign,
      description: "Total platform sales",
      change: "+23%",
    },
  ];

  const chipStatusData = [
    { name: "Active", value: metrics.activeChips || 0, color: COLORS[0] },
    { name: "Recovery", value: metrics.recoveryChips || 0, color: COLORS[1] },
    { name: "Inactive", value: (metrics.totalChips || 0) - (metrics.activeChips || 0) - (metrics.recoveryChips || 0), color: COLORS[2] },
  ];

  const salesData = [
    { month: "Jan", sales: 45000, recovery: 12000 },
    { month: "Feb", sales: 52000, recovery: 15000 },
    { month: "Mar", sales: 48000, recovery: 18000 },
    { month: "Apr", sales: 61000, recovery: 22000 },
    { month: "May", sales: 55000, recovery: 20000 },
    { month: "Jun", sales: 67000, recovery: 25000 },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpiCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Badge variant="secondary" className="text-xs">
                  {card.change}
                </Badge>
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales and Recovery Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Sales & Recovery</CardTitle>
            <CardDescription>Monthly sales and recovery performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#8884d8" name="Sales" />
                <Bar dataKey="recovery" fill="#82ca9d" name="Recovery" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chip Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>WhatsApp Chips Status</CardTitle>
            <CardDescription>Distribution of chip statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chipStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chipStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Overall platform performance indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">User Engagement</span>
              <Badge variant="default">High</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">System Uptime</span>
              <Badge variant="default">99.9%</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Recovery Rate</span>
              <Badge variant="default">
                {metrics.totalSalesValue > 0 
                  ? Math.round((metrics.totalRecoveredValue / metrics.totalSalesValue) * 100) 
                  : 0}%
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Active Webhooks</span>
              <Badge variant="secondary">{metrics.totalWebhooks || 0}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform activities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm">
              <div className="flex justify-between items-center py-2 border-b">
                <span>New user registration</span>
                <span className="text-muted-foreground">2 min ago</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span>Webhook triggered</span>
                <span className="text-muted-foreground">5 min ago</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span>Chip recovery completed</span>
                <span className="text-muted-foreground">12 min ago</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span>Plan updated</span>
                <span className="text-muted-foreground">1 hour ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}