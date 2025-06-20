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
    payment_pending: {
      event_type: "payment_pending",
      transaction_id: "pix_123456789",
      client: {
        name: "João Silva",
        email: "joao@empresa.com",
        phone: "11999991111",
        company: "Tech Solutions"
      },
      product: "Software de Gestão",
      value: 25.00,
      payment_method: "pix",
      created_at: "2025-06-20T22:30:00Z",
      timestamp: "2025-06-20T22:30:00Z",
      expires_at: "2025-06-22T22:30:00Z"
    },
    payment_completed: {
      event_type: "payment_completed",
      transaction_id: "pix_123456789",
      client: {
        name: "João Silva", 
        email: "joao@empresa.com",
        phone: "11999991111",
        company: "Tech Solutions"
      },
      product: "Software de Gestão",
      value: 25.00,
      payment_method: "pix",
      completed_at: "2025-06-20T23:00:00Z",
      timestamp: "2025-06-20T23:00:00Z"
    },
    payment_failed: {
      event_type: "payment_failed",
      transaction_id: "pix_123456789",
      client: {
        name: "João Silva",
        email: "joao@empresa.com",
        phone: "11999991111",
        company: "Tech Solutions"
      },
      product: "Software de Gestão",
      value: 25.00,
      payment_method: "pix",
      failed_at: "2025-06-22T22:30:00Z",
      timestamp: "2025-06-22T22:30:00Z",
      reason: "expired"
    },
    recovery_purchase: {
      event_type: "recovery_purchase",
      transaction_id: "card_987654321",
      client: {
        name: "João Silva",
        email: "joao@empresa.com",
        phone: "11999991111",
        company: "Tech Solutions"
      },
      product: "Software de Gestão Premium",
      value: 50.00,
      payment_method: "credit_card",
      completed_at: "2025-06-25T10:15:00Z",
      timestamp: "2025-06-25T10:15:00Z",
      original_transaction: "pix_123456789"
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
              Sistema receptor de webhooks para processar vendas automaticamente. 
              Identifica clientes pelo telefone e gerencia status: realizadas, perdidas e recuperadas.
              Após 48h sem pagamento, marca como perdida. Se mesmo telefone comprar depois, marca como recuperada.
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
                <Badge variant="outline">payment_pending</Badge>
                <Badge variant="outline">payment_completed</Badge>
                <Badge variant="outline">payment_failed</Badge>
                <Badge variant="outline">recovery_purchase</Badge>
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
              <h4 className="font-medium mb-2">Lógica de Processamento</h4>
              <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`// payment_pending: Cria venda com status "pending"
// payment_completed: Atualiza para "realized" 
// payment_failed: Marca como "lost" após 48h
// recovery_purchase: Cliente com telefone existente
//   que tinha venda perdida volta a comprar = "recovered"

// Endpoint: POST /api/webhook/sales
// Identificação: client.phone (único)
// Auto-criação de clientes se não existirem
// Auto-atualização de status baseado no telefone`}</code>
              </pre>
            </div>

            <div>
              <h4 className="font-medium mb-2">Teste com cURL</h4>
              <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`curl -X POST http://localhost:5000/api/webhook/sales \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(payloadExamples.payment_completed, null, 2)}'`}</code>
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}