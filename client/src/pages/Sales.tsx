import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Eye, Edit, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { SaleWithClient } from "@shared/schema";

export default function Sales() {
  const { data: sales = [], isLoading } = useQuery<SaleWithClient[]>({
    queryKey: ["/api/sales"],
    retry: false,
  });

  return (
    <div>
      {/* Header */}
      <header className="bg-surface shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Vendas</h2>
            <p className="text-sm text-gray-600">Gerencie todas as suas vendas</p>
          </div>
          <Button className="bg-primary text-white hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Nova Venda
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="p-6">
        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por cliente, produto..."
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="realized">Realizadas</SelectItem>
                <SelectItem value="recovered">Recuperadas</SelectItem>
                <SelectItem value="lost">Perdidas</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">Esta semana</SelectItem>
                <SelectItem value="month">Este mês</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
          </div>
        </div>

        {/* Sales Table */}
        {isLoading ? (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-pulse">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        ) : (
          <SalesTable sales={sales} />
        )}
      </div>
    </div>
  );
}
