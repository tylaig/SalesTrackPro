import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Filter, Mail, Phone, Building, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { Client } from "@shared/schema";
import ClientEventHistory from "@/components/client/ClientEventHistory";

export default function Clients() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: clients = [], isLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
    retry: false,
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Filter clients based on search
  const filteredClients = clients.filter((client: Client) => {
    return (
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const ClientEventHistory = ({ clientId }: { clientId: number }) => {
    const { data: events = [], isLoading: eventsLoading } = useQuery({
      queryKey: [`/api/clients/${clientId}/events`],
    });

    if (eventsLoading) return <div>Carregando eventos...</div>;

    return (
      <div className="space-y-3">
        {events.length === 0 ? (
          <p className="text-gray-500">Nenhum evento encontrado</p>
        ) : (
          events.map((event: any) => (
            <div key={event.id} className="border rounded p-3">
              <div className="flex justify-between items-start">
                <div>
                  <Badge variant={
                    event.eventType === 'payment_completed' ? 'default' :
                    event.eventType === 'payment_failed' ? 'destructive' :
                    'secondary'
                  }>
                    {event.eventType}
                  </Badge>
                  <p className="text-sm mt-1">{event.product}</p>
                  <p className="text-xs text-gray-500">R$ {event.value}</p>
                </div>
                <span className="text-xs text-gray-400">
                  {formatDate(event.createdAt)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <header className="bg-surface shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Clientes</h2>
            <p className="text-sm text-gray-600">Clientes criados via Webhook</p>
          </div>

        </div>
      </header>

      {/* Content */}
      <div className="p-6">
        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nome, email, empresa..."
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
        </div>

        {/* Clients Table */}
        <Card className="shadow-sm border border-gray-100">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">
              Lista de Clientes ({clients.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-pulse">Carregando clientes...</div>
              </div>
            ) : clients.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Nenhum cliente encontrado
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="px-6 py-3">Cliente</TableHead>
                      <TableHead className="px-6 py-3">Contato</TableHead>
                      <TableHead className="px-6 py-3">Empresa</TableHead>
                      <TableHead className="px-6 py-3">Data de Cadastro</TableHead>
                      <TableHead className="px-6 py-3">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.map((client) => (
                      <TableRow key={client.id} className="hover:bg-gray-50">
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {getInitials(client.name)}
                              </span>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {client.name}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="h-4 w-4 mr-1" />
                              {client.email}
                            </div>
                            {client.phone && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Phone className="h-4 w-4 mr-1" />
                                {client.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          {client.company ? (
                            <div className="flex items-center text-sm text-gray-600">
                              <Building className="h-4 w-4 mr-1" />
                              {client.company}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(client.createdAt)}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <History className="w-4 h-4 mr-2" />
                                  Histórico
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>
                                    Histórico de Eventos - {client.name}
                                  </DialogTitle>
                                </DialogHeader>
                                <ClientEventHistory clientId={client.id} />
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
