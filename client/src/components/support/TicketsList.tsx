import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import type { SupportTicketWithClient } from "@shared/schema";

export default function TicketsList() {
  const { data: tickets = [], isLoading } = useQuery<SupportTicketWithClient[]>({
    queryKey: ["/api/support/tickets"],
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      low: "outline",
      medium: "secondary",
      high: "destructive",
      urgent: "destructive"
    };

    const labels: Record<string, string> = {
      low: "Baixa",
      medium: "Média", 
      high: "Alta",
      urgent: "Urgente"
    };

    return (
      <Badge variant={variants[priority] || "default"}>
        {labels[priority] || priority}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      open: "secondary",
      in_progress: "default",
      closed: "outline"
    };

    const labels: Record<string, string> = {
      open: "Aberto",
      in_progress: "Em Andamento",
      closed: "Fechado"
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card className="shadow-sm border border-gray-100">
        <CardContent className="p-6">
          <div className="text-center">Carregando tickets...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border border-gray-100">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-800">
            Meus Tickets
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Select>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="open">Aberto</SelectItem>
                <SelectItem value="in_progress">Em Andamento</SelectItem>
                <SelectItem value="closed">Fechado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {tickets.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Nenhum ticket encontrado
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">
                      {ticket.subject}
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {ticket.description}
                    </p>
                  </div>
                  {getPriorityBadge(ticket.priority)}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Ticket #{ticket.id}</span>
                    <span>{formatDate(ticket.createdAt)}</span>
                    {getStatusBadge(ticket.status)}
                  </div>
                  <Button variant="link" className="text-primary hover:text-blue-700 p-0">
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
