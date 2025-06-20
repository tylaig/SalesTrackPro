import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function WebhookDocumentation() {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Payload copiado para a área de transferência",
    });
  };

  const payloadExamples = {
    sale_created: {
      event_type: "sale_created",
      sale_id: "sale_123456789",
      client: {
        name: "João Silva",
        email: "joao@empresa.com",
        phone: "(11) 99999-1111",
        company: "Tech Solutions"
      },
      product: "Software de Gestão",
      value: 25000.00,
      status: "pending",
      created_at: "2025-06-20T22:30:00Z",
      timestamp: "2025-06-20T22:30:00Z",
      notes: "Proposta enviada ao cliente"
    },
    sale_completed: {
      event_type: "sale_completed",
      sale_id: "sale_123456789",
      client: {
        name: "João Silva", 
        email: "joao@empresa.com",
        phone: "(11) 99999-1111",
        company: "Tech Solutions"
      },
      product: "Software de Gestão",
      value: 25000.00,
      status: "realized",
      completed_at: "2025-06-20T22:35:00Z",
      timestamp: "2025-06-20T22:35:00Z",
      notes: "Venda finalizada com sucesso"
    },
    client_created: {
      event_type: "client_created",
      client: {
        name: "Maria Santos",
        email: "maria@startup.com", 
        phone: "(11) 99999-2222",
        company: "StartupX"
      },
      created_at: "2025-06-20T22:30:00Z",
      timestamp: "2025-06-20T22:30:00Z",
      source: "website_form"
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5" />
            Documentação de Webhooks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Como usar os webhooks</h3>
            <p className="text-sm text-gray-600 mb-4">
              Configure os URLs dos webhooks no sistema para receber notificações automáticas 
              sobre eventos de pagamento. O sistema enviará requisições POST com os payloads abaixo.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Headers da Requisição</h4>
              <div className="bg-gray-50 p-3 rounded-lg font-mono text-sm">
                <div>Content-Type: application/json</div>
                <div>User-Agent: WebhookSystem/1.0</div>
                <div>X-Webhook-Signature: sha256=...</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Eventos Suportados</h4>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline">sale_created</Badge>
                <Badge variant="outline">sale_completed</Badge>
                <Badge variant="outline">sale_cancelled</Badge>
                <Badge variant="outline">client_created</Badge>
                <Badge variant="outline">client_updated</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {Object.entries(payloadExamples).map(([eventType, payload]) => (
        <Card key={eventType}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg capitalize">
                {eventType.replace('_', ' ')}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(JSON.stringify(payload, null, 2))}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{JSON.stringify(payload, null, 2)}</code>
            </pre>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle>Implementação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Exemplo de Endpoint (Node.js/Express)</h4>
              <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`app.post('/webhook/sales', (req, res) => {
  const payload = req.body;
  
  // Verificar assinatura (recomendado)
  const signature = req.headers['x-webhook-signature'];
  
  // Processar evento
  switch (payload.event_type) {
    case 'sale_created':
      console.log('Nova venda criada:', payload);
      // Registrar venda no sistema
      break;
    case 'sale_completed':
      console.log('Venda finalizada:', payload);
      // Atualizar status da venda
      break;
    case 'client_created':
      console.log('Novo cliente:', payload);
      // Adicionar cliente ao banco
      break;
  }
  
  // Responder com 200 para confirmar recebimento
  res.status(200).json({ received: true });
});`}</code>
              </pre>
            </div>

            <div>
              <h4 className="font-medium mb-2">Teste com cURL</h4>
              <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`curl -X POST https://seu-site.com/webhook/sales \\
  -H "Content-Type: application/json" \\
  -H "User-Agent: WebhookSystem/1.0" \\
  -d '${JSON.stringify(payloadExamples.sale_completed, null, 2)}'`}</code>
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}