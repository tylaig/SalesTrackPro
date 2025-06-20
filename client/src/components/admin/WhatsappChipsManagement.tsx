import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Smartphone, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { WhatsappChip, Client } from "@shared/schema";

const chipFormSchema = z.object({
  chipId: z.string().min(1, "Chip ID is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  status: z.enum(["active", "inactive", "recovery"]),
  clientId: z.number().optional(),
});

type ChipFormData = z.infer<typeof chipFormSchema>;

export default function WhatsappChipsManagement() {
  const { toast } = useToast();
  const [editingChip, setEditingChip] = useState<WhatsappChip | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<ChipFormData>({
    resolver: zodResolver(chipFormSchema),
    defaultValues: {
      chipId: "",
      phoneNumber: "",
      status: "active",
      clientId: undefined,
    },
  });

  const { data: chips = [], isLoading } = useQuery({
    queryKey: ["/api/admin/whatsapp-chips"],
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["/api/clients"],
  });

  const createChipMutation = useMutation({
    mutationFn: async (data: ChipFormData) => {
      return apiRequest("POST", "/api/admin/whatsapp-chips", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/whatsapp-chips"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "WhatsApp chip created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create chip",
        variant: "destructive",
      });
    },
  });

  const updateChipMutation = useMutation({
    mutationFn: async (data: ChipFormData) => {
      return apiRequest("PUT", `/api/admin/whatsapp-chips/${editingChip?.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/whatsapp-chips"] });
      setIsDialogOpen(false);
      setEditingChip(null);
      form.reset();
      toast({
        title: "Success",
        description: "WhatsApp chip updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update chip",
        variant: "destructive",
      });
    },
  });

  const deleteChipMutation = useMutation({
    mutationFn: async (chipId: number) => {
      return apiRequest(`/api/admin/whatsapp-chips/${chipId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/whatsapp-chips"] });
      toast({
        title: "Success",
        description: "WhatsApp chip deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete chip",
        variant: "destructive",
      });
    },
  });

  const recoverChipMutation = useMutation({
    mutationFn: async (chipId: number) => {
      return apiRequest(`/api/admin/whatsapp-chips/${chipId}/recover`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/whatsapp-chips"] });
      toast({
        title: "Success",
        description: "WhatsApp chip recovery initiated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to recover chip",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: ChipFormData) => {
    if (editingChip) {
      updateChipMutation.mutate(data);
    } else {
      createChipMutation.mutate(data);
    }
  };

  const handleEdit = (chip: WhatsappChip) => {
    setEditingChip(chip);
    form.reset({
      chipId: chip.chipId,
      phoneNumber: chip.phoneNumber,
      status: chip.status as "active" | "inactive" | "recovery",
      clientId: chip.clientId || undefined,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (chipId: number) => {
    if (window.confirm("Are you sure you want to delete this WhatsApp chip?")) {
      deleteChipMutation.mutate(chipId);
    }
  };

  const handleRecover = (chipId: number) => {
    if (window.confirm("Are you sure you want to initiate recovery for this chip?")) {
      recoverChipMutation.mutate(chipId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "inactive": return "secondary";
      case "recovery": return "destructive";
      default: return "secondary";
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString();
  };

  if (isLoading) {
    return <div>Loading WhatsApp chips...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              WhatsApp Chips Management
            </CardTitle>
            <CardDescription>
              Manage WhatsApp chips and recovery operations
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingChip(null); form.reset(); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Chip
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingChip ? "Edit WhatsApp Chip" : "Add New WhatsApp Chip"}
                </DialogTitle>
                <DialogDescription>
                  {editingChip ? "Update chip information" : "Create a new WhatsApp chip"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="chipId">Chip ID</Label>
                  <Input
                    id="chipId"
                    {...form.register("chipId")}
                    placeholder="CHIP001"
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    {...form.register("phoneNumber")}
                    placeholder="+55 11 99999-9999"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select onValueChange={(value) => form.setValue("status", value as "active" | "inactive" | "recovery")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="recovery">Recovery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="clientId">Assigned Client (optional)</Label>
                  <Select onValueChange={(value) => form.setValue("clientId", value ? parseInt(value) : undefined)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No client</SelectItem>
                      {(clients as Client[]).map((client: Client) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={createChipMutation.isPending || updateChipMutation.isPending}
                  >
                    {editingChip ? "Update Chip" : "Create Chip"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Chip ID</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(chips as WhatsappChipWithClient[]).map((chip: WhatsappChipWithClient) => (
              <TableRow key={chip.id}>
                <TableCell className="font-medium">{chip.chipId}</TableCell>
                <TableCell>{chip.phoneNumber}</TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(chip.status)}>
                    {chip.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {chip.client?.name || "Unassigned"}
                </TableCell>
                <TableCell className="text-sm">
                  {formatDate(chip.lastActive)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {chip.status === "inactive" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRecover(chip.id)}
                        disabled={recoverChipMutation.isPending}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(chip)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(chip.id)}
                      disabled={deleteChipMutation.isPending}
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