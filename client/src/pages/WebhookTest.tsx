import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Send, Copy, RefreshCw } from "lucide-react";

const sampleEvents = {
  PIX_GENERATED: {
    "event": "PIX_GENERATED",
    "sale_id": "8K421YV7",
    "payment_method": "PIX",
    "total_price": "R$ 152,44",
    "customer": {
      "name": "Luzenir Marques",
      "email": "luzenir@hotmail.com",
      "phone_number": "5544999849562"
    },
    "products": [
      {
        "name": "Aplicativo Máquina de 14 Pontos"
      }
    ],
    "utm": {
      "utm_campaign": "TESTE DE CRIATIVO - AD 56 — Cópia|120225526951540789",
      "utm_medium": "CJ 01 — Cópia — Cópia — Cópia 1|120225526952070789",
      "utm_content": "AD 56|120225526952100789"
    }
  },
  SALE_APPROVED: {
    "event": "SALE_APPROVED",
    "sale_id": "5NYB1P69",
    "payment_method": "CREDIT_CARD",
    "total_price": "R$ 97,90",
    "customer": {
      "name": "Osvaldo Dalfovo",
      "email": "osvaldo.dalfovo@hotmail.com",
      "phone_number": "5547984720087"
    },
    "products": [
      {
        "name": "Aplicativo Máquina de 14 Pontos"
      }
    ],
    "utm": {
      "utm_campaign": "TESTE DE CRIATIVO - AD 56 — Cópia|120225526951540789",
      "utm_medium": "CJ 01 — Cópia — Cópia — Cópia 1|120225526952070789",
      "utm_content": "AD 56|120225526952100789"
    }
  },
  ABANDONED_CART: [
    {
      "body": {
        "event": "ABANDONED_CART",
        "sale_id": null,
        "payment_method": null,
        "total_price": "R$ 47,00",
        "customer": {
          "name": "Denis Silva",
          "email": "soeds_@hotmail.com",
          "phone_number": "5511948333175"
        },
        "products": [
          {
            "name": "Aplicativo Máquina de 14 Pontos"
          }
        ],
        "utm": {
          "utm_campaign": "",
          "utm_medium": "",
          "utm_content": ""
        }
      }
    }
  ]
};

export default function WebhookTest() {
  const [selectedEvent, setSelectedEvent] = useState<keyof typeof sampleEvents>('PIX_GENERATED');
  const [payload, setPayload] = useState(JSON.stringify(sampleEvents.PIX_GENERATED, null, 2));
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const { toast } = useToast();

  const handleEventChange = (eventType: keyof typeof sampleEvents) => {
    setSelectedEvent(eventType);
    setPayload(JSON.stringify(sampleEvents[eventType], null, 2));
    setResponse(null);
  };

  const sendWebhook = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/webhook/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: payload,
      });

      const result = await response.json();
      setResponse({
        status: response.status,
        data: result,
      });

      if (response.ok) {
        toast({
          title: "Webhook enviado com sucesso",
          description: result.message,
        });
      } else {
        toast({
          title: "Erro no webhook",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao enviar webhook",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyPayload = () => {
    navigator.clipboard.writeText(payload);
    toast({
      title: "Copiado",
      description: "Payload copiado para a área de transferência",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Teste de Webhooks</h1>
        <p className="text-gray-600">Teste os diferentes tipos de eventos de webhook do sistema</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tipos de Evento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.keys(sampleEvents).map((eventType) => (
              <Button
                key={eventType}
                variant={selectedEvent === eventType ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => handleEventChange(eventType as keyof typeof sampleEvents)}
              >
                <Badge variant="secondary" className="mr-2">
                  {eventType}
                </Badge>
                {eventType === 'PIX_GENERATED' && 'PIX Gerado'}
                {eventType === 'SALE_APPROVED' && 'Venda Aprovada'}
                {eventType === 'ABANDONED_CART' && 'Carrinho Abandonado'}
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Payload JSON
              <Button variant="outline" size="sm" onClick={copyPayload}>
                <Copy className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
              placeholder="Edite o payload JSON aqui..."
            />
            <Button
              onClick={sendWebhook}
              disabled={isLoading}
              className="w-full mt-4"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {isLoading ? "Enviando..." : "Enviar Webhook"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {response && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Resposta do Servidor
              <Badge variant={response.status === 200 ? "default" : "destructive"}>
                {response.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(response.data, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Como Funciona o Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-green-600">1. PIX_GENERATED</h4>
            <p className="text-sm text-gray-600">
              Cria o cliente baseado no telefone e registra uma venda pendente. 
              Se o cliente já existir, apenas cria a venda pendente.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-blue-600">2. SALE_APPROVED</h4>
            <p className="text-sm text-gray-600">
              Verifica se o cliente tem carrinho abandonado ou PIX pendente. 
              Se sim, marca como "recuperada". Se não, marca como "realizada".
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-red-600">3. ABANDONED_CART</h4>
            <p className="text-sm text-gray-600">
              Registra uma venda perdida. Futuras vendas aprovadas deste telefone 
              serão marcadas como "recuperadas".
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}