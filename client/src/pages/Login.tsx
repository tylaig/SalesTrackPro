import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, LogIn, Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import ChangePasswordDialog from "@/components/auth/ChangePasswordDialog";

const loginSchema = z.object({
  email: z.string().email("Email válido é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
});

type LoginData = z.infer<typeof loginSchema>;

interface LoginProps {
  onLogin: (success: boolean, userData?: any) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const { toast } = useToast();

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLogin = async (data: LoginData) => {
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {

        if (result.requirePasswordChange) {
          setShowPasswordChange(true);
        } else {
          toast({
            title: "Login realizado com sucesso!",
            description: "Bem-vindo ao Dashboard de Vendas",
          });
          onLogin(true, result.user);
        }
      } else {
        toast({
          title: "Erro no login",
          description: result.message || "Credenciais inválidas",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao realizar login. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <TrendingUp className="text-primary h-12 w-12" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Vendas</h1>
          <p className="text-gray-600 mt-2">Faça login para acessar sua conta</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Entrar</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Digite seu email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Digite sua senha"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-blue-700"
                  disabled={isLoading}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </Form>


          </CardContent>
        </Card>

        <ChangePasswordDialog 
          open={showPasswordChange}
          isFirstLogin={true}
          onSuccess={() => {
            setShowPasswordChange(false);
            toast({
              title: "Login realizado com sucesso!",
              description: "Bem-vindo ao Dashboard de Vendas",
            });
            onLogin(true, { id: 1, email: form.getValues().email, name: "User", role: "user" });
          }}
        />
      </div>
    </div>
  );
}