import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, MessageSquare, Clock, CheckCircle } from "lucide-react";
import SupportForm from "@/components/support-form";
import { type SupportTicket } from "@shared/schema";

export default function Support() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const { data: tickets = [], isLoading } = useQuery<SupportTicket[]>({
    queryKey: ["/api/support/tickets", statusFilter],
    queryFn: async () => {
      const url = (statusFilter && statusFilter !== "all") ? `/api/support/tickets?status=${statusFilter}` : "/api/support/tickets";
      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch tickets");
      return response.json();
    },
  });

  // Filter tickets based on search and priority
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = !priorityFilter || priorityFilter === "all" || ticket.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Aberto</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Em Andamento</Badge>;
      case 'closed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Fechado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Urgente</Badge>;
      case 'high':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Alta</Badge>;
      case 'medium':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Média</Badge>;
      case 'low':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Baixa</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <MessageSquare className="text-blue-600" size={16} />;
      case 'in_progress':
        return <Clock className="text-yellow-600" size={16} />;
      case 'closed':
        return <CheckCircle className="text-green-600" size={16} />;
      default:
        return <MessageSquare className="text-gray-600" size={16} />;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const truncateDescription = (description: string, maxLength = 100) => {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + "...";
  };

  const getTicketsByStatus = (status: string) => {
    return tickets.filter(ticket => ticket.status === status).length;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Central de Suporte</h2>
            <p className="text-sm text-gray-600">Gerencie suas solicitações de suporte</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">{getTicketsByStatus('open')} Abertos</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-600">{getTicketsByStatus('in_progress')} Em Andamento</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">{getTicketsByStatus('closed')} Fechados</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        <Tabs defaultValue="tickets" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="tickets">Meus Tickets</TabsTrigger>
            <TabsTrigger value="new">Novo Ticket</TabsTrigger>
          </TabsList>

          <TabsContent value="tickets" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <Input
                        placeholder="Buscar tickets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="open">Aberto</SelectItem>
                        <SelectItem value="in_progress">Em Andamento</SelectItem>
                        <SelectItem value="closed">Fechado</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Prioridade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tickets List */}
            <div className="space-y-4">
              {filteredTickets.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Nenhum ticket encontrado
                    </h3>
                    <p className="text-gray-500 mb-6">
                      {searchTerm || statusFilter || priorityFilter
                        ? "Tente ajustar os filtros para ver mais resultados."
                        : "Você ainda não tem tickets de suporte. Crie seu primeiro ticket para começar."}
                    </p>
                    <Button className="bg-primary hover:bg-blue-700">
                      <Plus size={16} className="mr-2" />
                      Criar Primeiro Ticket
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredTickets.map((ticket) => (
                  <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            {getStatusIcon(ticket.status)}
                            <h3 className="font-semibold text-gray-900">
                              {ticket.subject}
                            </h3>
                            <span className="text-sm text-gray-500">
                              #{ticket.id}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3">
                            {truncateDescription(ticket.description)}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Criado em {formatDate(ticket.createdAt)}</span>
                            <span>•</span>
                            <span>Atualizado em {formatDate(ticket.updatedAt)}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          {getPriorityBadge(ticket.priority)}
                          {getStatusBadge(ticket.status)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                            Ver Detalhes
                          </Button>
                          {ticket.status !== 'closed' && (
                            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-700">
                              Adicionar Comentário
                            </Button>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {ticket.status === 'closed' ? 'Resolvido' : 'Aguardando resposta'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="new">
            <div className="max-w-2xl">
              <SupportForm />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
