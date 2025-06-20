import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Edit, Download, Filter } from "lucide-react";
import type { SaleWithClient } from "@shared/schema";

interface SalesTableProps {
  sales: SaleWithClient[];
}

export default function SalesTable({ sales }: SalesTableProps) {
  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Number(value));
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      realized: "default",
      recovered: "secondary", 
      lost: "destructive"
    };

    const labels: Record<string, string> = {
      realized: "Realizada",
      recovered: "Recuperada",
      lost: "Perdida"
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="shadow-sm border border-gray-100 mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Vendas Recentes</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="text-gray-500 h-4 w-4" />
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="realized">Realizadas</SelectItem>
                  <SelectItem value="recovered">Recuperadas</SelectItem>
                  <SelectItem value="lost">Perdidas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="bg-primary text-white hover:bg-blue-700">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="px-6 py-3">Cliente</TableHead>
                <TableHead className="px-6 py-3">Produto</TableHead>
                <TableHead className="px-6 py-3">Valor</TableHead>
                <TableHead className="px-6 py-3">Status</TableHead>
                <TableHead className="px-6 py-3">Data</TableHead>
                <TableHead className="px-6 py-3">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => (
                <TableRow key={sale.id} className="hover:bg-gray-50">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {getInitials(sale.client.name)}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {sale.client.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {sale.client.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-gray-900">
                    {sale.product}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm font-semibold text-gray-900">
                    {formatCurrency(sale.value)}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    {getStatusBadge(sale.status)}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(sale.date)}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {sales.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            Nenhuma venda encontrada
          </div>
        )}
      </CardContent>
    </Card>
  );
}
