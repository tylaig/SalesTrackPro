import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Headset, Send } from "lucide-react";
import { insertSupportTicketSchema, type InsertSupportTicket } from "@shared/schema";

export default function SupportForm() {
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    priority: "medium" as const,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createTicketMutation = useMutation({
    mutationFn: async (data: InsertSupportTicket) => {
      const response = await apiRequest("POST", "/api/support/tickets", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Sua solicitação de suporte foi enviada com sucesso.",
      });
      
      // Reset form
      setFormData({
        subject: "",
        description: "",
        priority: "medium",
      });
      
      // Invalidate tickets query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/support/tickets"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao enviar solicitação de suporte.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = insertSupportTicketSchema.parse(formData);
      createTicketMutation.mutate(validatedData);
    } catch (error) {
      toast({
        title: "Erro de validação",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'low': return 'Baixa';
      case 'medium': return 'Média';
      case 'high': return 'Alta';
      case 'urgent': return 'Urgente';
      default: return priority;
    }
  };

  return (
    <Card className="bg-white shadow-sm border border-gray-100">
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-semibold text-gray-800">
          <Headset className="text-primary mr-3" size={20} />
          Nova Solicitação de Suporte
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="subject" className="text-sm font-medium text-gray-700">
              Assunto
            </Label>
            <Input
              id="subject"
              type="text"
              value={formData.subject}
              onChange={(e) => handleInputChange("subject", e.target.value)}
              placeholder="Descreva o problema brevemente"
              className="mt-2"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="priority" className="text-sm font-medium text-gray-700">
              Prioridade
            </Label>
            <Select 
              value={formData.priority} 
              onValueChange={(value) => handleInputChange("priority", value)}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Descrição
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Descreva o problema detalhadamente..."
              rows={4}
              className="mt-2"
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-blue-700 transition-colors font-medium"
            disabled={createTicketMutation.isPending}
          >
            <Send size={16} className="mr-2" />
            {createTicketMutation.isPending ? "Enviando..." : "Enviar Solicitação"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
