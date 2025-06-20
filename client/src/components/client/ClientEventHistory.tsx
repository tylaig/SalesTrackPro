import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CreditCard, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";

interface ClientEvent {
  id: number;
  eventType: string;
  transactionId: string;
  product: string;
  value: number;
  paymentMethod: string;
  metadata?: any;
  createdAt: string;
}

interface ClientEventHistoryProps {
  clientId: number;
}

export default function ClientEventHistory({ clientId }: ClientEventHistoryProps) {
  const { data: events = [], isLoading } = useQuery<ClientEvent[]>({
    queryKey: [`/api/clients/${clientId}/events`],
  });

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'payment_pending':
        return <Calendar className="w-4 h-4 text-yellow-600" />;
      case 'payment_completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'payment_failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'recovery_purchase':
        return <RefreshCw className="w-4 h-4 text-blue-600" />;
      default:
        return <CreditCard className="w-4 h-4 text-gray-600" />;
    }
  };

  const getEventTitle = (eventType: string) => {
    switch (eventType) {
      case 'payment_pending':
        return 'Pagamento Pendente';
      case 'payment_completed':
        return 'Pagamento Realizado';
      case 'payment_failed':
        return 'Pagamento Falhado';
      case 'recovery_purchase':
        return 'Compra de Recuperação';
      default:
        return eventType;
    }
  };

  const getEventBadge = (eventType: string) => {
    switch (eventType) {
      case 'payment_pending':
        return <Badge variant="outline" className="text-yellow-700 border-yellow-300">Pendente</Badge>;
      case 'payment_completed':
        return <Badge variant="outline" className="text-green-700 border-green-300">Realizado</Badge>;
      case 'payment_failed':
        return <Badge variant="outline" className="text-red-700 border-red-300">Falhado</Badge>;
      case 'recovery_purchase':
        return <Badge variant="outline" className="text-blue-700 border-blue-300">Recuperação</Badge>;
      default:
        return <Badge variant="outline">{eventType}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Eventos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Histórico de Eventos ({events.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Nenhum evento registrado para este cliente</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getEventIcon(event.eventType)}
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {getEventTitle(event.eventType)}
                      </h4>
                      <p className="text-sm text-gray-600">{event.product}</p>
                    </div>
                  </div>
                  {getEventBadge(event.eventType)}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Valor:</span>
                    <div className="text-gray-900">{formatCurrency(event.value)}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Método:</span>
                    <div className="text-gray-900 capitalize">{event.paymentMethod}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Transaction ID:</span>
                    <div className="text-gray-900 font-mono text-xs">{event.transactionId}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Data:</span>
                    <div className="text-gray-900">{formatDate(event.createdAt)}</div>
                  </div>
                </div>

                {event.metadata && Object.keys(event.metadata).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <span className="font-medium text-gray-700 text-sm">Metadados:</span>
                    <div className="mt-1 text-xs text-gray-600">
                      {Object.entries(event.metadata).map(([key, value]) => (
                        <div key={key} className="flex gap-2">
                          <span className="font-medium">{key}:</span>
                          <span>{JSON.stringify(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}