import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Globe, Play } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Webhook } from "@shared/schema";

const webhookFormSchema = z.object({
  name: z.string().min(1, "Webhook name is required"),
  url: z.string().url("Invalid URL"),
  events: z.string().min(1, "Please select an event"),
  secret: z.string().optional(),
  isActive: z.boolean().default(true),
});

const AVAILABLE_EVENTS = [
  { id: "payment_pending", label: "Pagamento Pendente" },
  { id: "payment_completed", label: "Pagamento Realizado" },
  { id: "payment_failed", label: "Pagamento Expirado/Falhado" },
  { id: "recovery_purchase", label: "Compra de Recuperação" },
];

type WebhookFormData = z.infer<typeof webhookFormSchema>;

export default function WebhooksManagement() {
  const { toast } = useToast();
  const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<WebhookFormData>({
    resolver: zodResolver(webhookFormSchema),
    defaultValues: {
      name: "",
      url: "",
      events: "",
      secret: "",
      isActive: true,
    },
  });

  const { data: webhooks = [], isLoading } = useQuery({
    queryKey: ["/api/admin/webhooks"],
  });

  const createWebhookMutation = useMutation({
    mutationFn: async (data: WebhookFormData) => {
      const webhookData = {
        ...data,
        events: JSON.stringify([data.events]),
      };
      return apiRequest("POST", "/api/admin/webhooks", webhookData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/webhooks"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Webhook created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create webhook",
        variant: "destructive",
      });
    },
  });

  const updateWebhookMutation = useMutation({
    mutationFn: async (data: WebhookFormData) => {
      const webhookData = {
        ...data,
        events: JSON.stringify([data.events]),
      };
      return apiRequest("PUT", `/api/admin/webhooks/${editingWebhook?.id}`, webhookData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/webhooks"] });
      setIsDialogOpen(false);
      setEditingWebhook(null);
      form.reset();
      toast({
        title: "Success",
        description: "Webhook updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update webhook",
        variant: "destructive",
      });
    },
  });

  const deleteWebhookMutation = useMutation({
    mutationFn: async (webhookId: number) => {
      return apiRequest(`/api/admin/webhooks/${webhookId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/webhooks"] });
      toast({
        title: "Success",
        description: "Webhook deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete webhook",
        variant: "destructive",
      });
    },
  });

  const triggerWebhookMutation = useMutation({
    mutationFn: async (webhookId: number) => {
      const triggerData = {
        eventType: "test",
        payload: { message: "Test webhook trigger", timestamp: new Date().toISOString() },
      };
      return apiRequest("POST", `/api/admin/webhooks/${webhookId}/trigger`, triggerData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Webhook triggered successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to trigger webhook",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: WebhookFormData) => {
    if (editingWebhook) {
      updateWebhookMutation.mutate(data);
    } else {
      createWebhookMutation.mutate(data);
    }
  };

  const handleEdit = (webhook: Webhook) => {
    setEditingWebhook(webhook);
    let eventValue = "";
    try {
      const events = JSON.parse(webhook.events || "[]");
      eventValue = Array.isArray(events) && events.length > 0 ? events[0] : "";
    } catch (error) {
      eventValue = "";
    }
    
    form.reset({
      name: webhook.name,
      url: webhook.url,
      events: eventValue,
      secret: webhook.secret || "",
      isActive: webhook.isActive || false,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (webhookId: number) => {
    if (window.confirm("Are you sure you want to delete this webhook?")) {
      deleteWebhookMutation.mutate(webhookId);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Never";
    return new Date(date).toLocaleString();
  };

  if (isLoading) {
    return <div>Loading webhooks...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Webhooks Management
            </CardTitle>
            <CardDescription>
              Manage payment webhooks and event notifications
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingWebhook(null); form.reset(); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Webhook
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingWebhook ? "Edit Webhook" : "Add New Webhook"}
                </DialogTitle>
                <DialogDescription>
                  {editingWebhook ? "Update webhook configuration" : "Create a new webhook endpoint"}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="name">Webhook Name</Label>
                  <Input
                    id="name"
                    {...form.register("name")}
                    placeholder="Payment Webhook"
                  />
                </div>
                <div>
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    {...form.register("url")}
                    placeholder="https://example.com/webhook"
                  />
                </div>
                <FormField
                  control={form.control}
                  name="events"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Evento</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um evento" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {AVAILABLE_EVENTS.map((event) => (
                            <SelectItem key={event.id} value={event.id}>
                              {event.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div>
                  <Label htmlFor="secret">Secret Key (optional)</Label>
                  <Input
                    id="secret"
                    {...form.register("secret")}
                    placeholder="webhook_secret_key"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    {...form.register("isActive")}
                  />
                  <Label htmlFor="isActive">Active Webhook</Label>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={createWebhookMutation.isPending || updateWebhookMutation.isPending}
                  >
                    {editingWebhook ? "Update Webhook" : "Create Webhook"}
                  </Button>
                </DialogFooter>
              </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Events</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Triggered</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(webhooks as Webhook[]).map((webhook: Webhook) => (
              <TableRow key={webhook.id}>
                <TableCell className="font-medium">{webhook.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                  {webhook.url}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {(() => {
                      let events: string[] = [];
                      try {
                        if (Array.isArray(webhook.events)) {
                          events = webhook.events.map(e => typeof e === 'string' ? e : e.eventType || '').filter(Boolean);
                        } else if (typeof webhook.events === 'string' && webhook.events.trim()) {
                          events = JSON.parse(webhook.events);
                        }
                      } catch (error) {
                        events = [];
                      }
                      
                      return events.length > 0 ? events.map((event: string, index: number) => {
                        const eventInfo = AVAILABLE_EVENTS.find(e => e.id === event);
                        return (
                          <Badge key={index} variant="outline" className="text-xs">
                            {eventInfo?.label || event}
                          </Badge>
                        );
                      }) : (
                        <span className="text-xs text-gray-400">Nenhum evento</span>
                      );
                    })()}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={webhook.isActive ? "default" : "secondary"}>
                    {webhook.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">
                  {formatDate(webhook.lastTriggered)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => triggerWebhookMutation.mutate(webhook.id)}
                      disabled={triggerWebhookMutation.isPending}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(webhook)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(webhook.id)}
                      disabled={deleteWebhookMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}