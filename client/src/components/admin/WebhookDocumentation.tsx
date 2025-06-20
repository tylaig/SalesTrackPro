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
      payment_id: "pay_123456789",
      user_id: "user_987654321",
      amount: 99.90,
      currency: "BRL",
      method: "credit_card",
      timestamp: "2025-06-20T22:30:00Z",
      metadata: {
        plan_id: "plan_basic",
        billing_cycle: "monthly"
      }
    },
    payment_approved: {
      event_type: "payment_approved",
      payment_id: "pay_123456789",
      user_id: "user_987654321",
      amount: 99.90,
      currency: "BRL",
      method: "credit_card",
      transaction_id: "txn_abc123def456",
      approved_at: "2025-06-20T22:35:00Z",
      timestamp: "2025-06-20T22:35:00Z",
      metadata: {
        plan_id: "plan_basic",
        billing_cycle: "monthly"
      }
    },
    payment_failed: {
      event_type: "payment_failed",
      payment_id: "pay_123456789",
      user_id: "user_987654321",
      amount: 99.90,
      currency: "BRL",
      method: "credit_card",
      error_code: "insufficient_funds",
      error_message: "Saldo insuficiente",
      failed_at: "2025-06-20T22:30:30Z",
      timestamp: "2025-06-20T22:30:30Z",
      metadata: {
        plan_id: "plan_basic",
        billing_cycle: "monthly"
      }
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
                <Badge variant="outline">payment_pending</Badge>
                <Badge variant="outline">payment_approved</Badge>
                <Badge variant="outline">payment_failed</Badge>
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
                <code>{`app.post('/webhook/payment', (req, res) => {
  const payload = req.body;
  
  // Verificar assinatura (recomendado)
  const signature = req.headers['x-webhook-signature'];
  
  // Processar evento
  switch (payload.event_type) {
    case 'payment_pending':
      console.log('Pagamento pendente:', payload);
      break;
    case 'payment_approved':
      console.log('Pagamento aprovado:', payload);
      // Ativar plano do usuário
      break;
    case 'payment_failed':
      console.log('Pagamento falhou:', payload);
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
                <code>{`curl -X POST https://seu-site.com/webhook/payment \\
  -H "Content-Type: application/json" \\
  -H "User-Agent: WebhookSystem/1.0" \\
  -d '${JSON.stringify(payloadExamples.payment_approved, null, 2)}'`}</code>
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}