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
import { Plus, Edit, Trash2, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { User } from "@shared/schema";

const userFormSchema = z.object({
  email: z.string().email("Email válido é obrigatório"),
  name: z.string().min(1, "Nome é obrigatório"),
  role: z.string().min(1, "Função é obrigatória"),
  isActive: z.boolean().default(true),
});

type UserFormData = z.infer<typeof userFormSchema>;

export default function UsersManagement() {
  const { toast } = useToast();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [createdUserPassword, setCreatedUserPassword] = useState("");

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: "",
      name: "",
      role: "user",
      isActive: true,
    },
  });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      // Generate temporary password
      const tempPassword = Math.random().toString(36).slice(-12);
      const userData = { ...data, tempPassword, requirePasswordChange: true };
      
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        throw new Error("Falha ao criar usuário");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsDialogOpen(false);
      form.reset();
      
      // Show password dialog
      setCreatedUserPassword(data.tempPassword);
      setShowPasswordDialog(true);
      
      toast({
        title: "Usuário criado",
        description: "Usuário criado com sucesso. Senha temporária gerada.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao criar usuário",
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      return apiRequest("PUT", `/api/admin/users/${editingUser?.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsDialogOpen(false);
      setEditingUser(null);
      form.reset();
      toast({
        title: "Success",
        description: "User updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest("DELETE", `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: UserFormData) => {
    if (editingUser) {
      updateUserMutation.mutate(data);
    } else {
      createUserMutation.mutate(data);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.reset({
      email: user.email || "",
      name: user.name || "",
      role: user.role || "user",
      isActive: user.isActive ?? true,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (userId: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      deleteUserMutation.mutate(userId);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
  };

  if (isLoading) {
    return <div>Loading users...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gerenciar Usuários
              </CardTitle>
              <CardDescription>Criar, editar e gerenciar contas de usuário</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingUser(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Usuário
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingUser ? "Editar Usuário" : "Adicionar Novo Usuário"}</DialogTitle>
                  <DialogDescription>
                    {editingUser ? "Atualizar informações do usuário" : "Criar uma nova conta de usuário"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register("email")}
                      placeholder="Digite o email"
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      {...form.register("name")}
                      placeholder="Digite o nome completo"
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Função</Label>
                    <select 
                      id="role"
                      {...form.register("role")}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="user">Usuário</option>
                      <option value="admin">Administrador</option>
                    </select>
                    {form.formState.errors.role && (
                      <p className="text-sm text-red-600">{form.formState.errors.role.message}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      {...form.register("isActive")}
                      className="rounded"
                    />
                    <Label htmlFor="isActive">Usuário Ativo</Label>
                  </div>
                  {!editingUser && (
                    <div className="p-3 bg-blue-50 rounded-md">
                      <p className="text-sm text-blue-700">
                        Uma senha temporária será gerada automaticamente e o usuário será obrigado a alterá-la no primeiro login.
                      </p>
                    </div>
                  )}
                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={createUserMutation.isPending || updateUserMutation.isPending}
                    >
                      {editingUser ? "Atualizar Usuário" : "Criar Usuário"}
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
                <TableHead>ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(users as User[]).map((user: User) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email || "Sem email"}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? 'default' : 'destructive'}>
                      {user.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
                        disabled={deleteUserMutation.isPending}
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

      {/* Password Display Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Senha Temporária Gerada</DialogTitle>
            <DialogDescription>
              Esta é a senha temporária para o usuário. Ele precisará alterá-la no primeiro login.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="password" className="sr-only">
                Senha
              </Label>
              <Input
                id="password"
                value={createdUserPassword}
                readOnly
                className="font-mono"
              />
            </div>
            <Button 
              type="button" 
              size="sm" 
              className="px-3"
              onClick={() => {
                navigator.clipboard.writeText(createdUserPassword);
                toast({
                  title: "Copiado!",
                  description: "Senha copiada para a área de transferência",
                });
              }}
            >
              <span className="sr-only">Copiar</span>
              📋
            </Button>
          </div>
          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowPasswordDialog(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}