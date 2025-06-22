import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertClientSchema, 
  insertSaleSchema, 
  insertSupportTicketSchema,
  insertUserSchema,
  insertClientEventSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes FIRST
  app.post('/api/login', async (req, res) => {
    try {
      console.log('Login attempt:', req.body);
      const { email, password } = req.body;
      
      if (!email || !password) {
        console.log('Missing email or password');
        return res.status(400).json({ message: 'Email e senha são obrigatórios' });
      }

      // Find user by email
      const user = await storage.getUserByEmail(email);
      console.log('User found:', user ? 'Yes' : 'No');
      
      if (!user) {
        console.log('User not found for email:', email);
        return res.status(401).json({ message: 'Email ou senha inválidos' });
      }

      // Check if user is active (note: using isActive not is_active)
      if (!user.isActive) {
        console.log('User is not active:', email);
        return res.status(401).json({ message: 'Usuário desativado' });
      }

      // For now, just check password directly (in production, use proper hashing)
      console.log('Password check:', user.password === password ? 'Match' : 'No match');
      if (user.password !== password) {
        return res.status(401).json({ message: 'Email ou senha inválidos' });
      }

      // Store user in session
      (req as any).session.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      };

      console.log('Login successful for:', email);
      res.json({ 
        success: true, 
        requirePasswordChange: user.requirePasswordChange,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  app.put('/api/change-password', async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const session = (req as any).session;
      
      if (!session.user) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }

      // Get user from database
      const user = await storage.getUserByEmail(session.user.email);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      // Verify current password
      if (user.password !== currentPassword) {
        return res.status(400).json({ message: 'Senha atual incorreta' });
      }

      // Update password
      await storage.updateUser(user.id, { 
        password: newPassword, 
        requirePasswordChange: false 
      });

      res.json({ success: true, message: 'Senha alterada com sucesso' });
    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  app.post('/api/logout', (req, res) => {
    (req as any).session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: 'Erro ao fazer logout' });
      }
      res.json({ success: true });
    });
  });

  app.get('/api/auth/user', (req, res) => {
    if ((req as any).session.user) {
      res.json((req as any).session.user);
    } else {
      res.status(401).json({ message: 'Não autenticado' });
    }
  });

  // Sales metrics and charts FIRST - before parameterized routes
  app.get("/api/sales/metrics", async (req, res) => {
    try {
      console.log("Fetching sales metrics from database...");
      const metrics = await storage.getSalesMetrics();
      console.log("Sales metrics fetched:", metrics);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching sales metrics:", error);
      res.status(500).json({ message: "Failed to fetch sales metrics", error: error.message });
    }
  });

  app.get("/api/sales/charts", async (req, res) => {
    try {
      console.log("Fetching sales charts from database...");
      const charts = await storage.getSalesChart();
      console.log("Sales charts fetched:", charts);
      res.json(charts);
    } catch (error) {
      console.error("Error fetching sales charts:", error);
      res.status(500).json({ message: "Failed to fetch chart data", error: error.message });
    }
  });

  // Sales routes
  app.get("/api/sales", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const sales = await storage.getSales(limit, offset);
      res.json(sales);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales list" });
    }
  });

  app.get("/api/sales/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const sale = await storage.getSale(id);
      if (!sale) {
        return res.status(404).json({ message: "Sale not found" });
      }
      res.json(sale);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sale by ID" });
    }
  });

  app.post("/api/sales", async (req, res) => {
    try {
      const validatedData = insertSaleSchema.parse(req.body);
      const sale = await storage.createSale(validatedData);
      res.status(201).json(sale);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create sale" });
    }
  });

  app.put("/api/sales/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertSaleSchema.partial().parse(req.body);
      const sale = await storage.updateSale(id, validatedData);
      if (!sale) {
        return res.status(404).json({ message: "Sale not found" });
      }
      res.json(sale);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update sale" });
    }
  });

  app.delete("/api/sales/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteSale(id);
      if (!deleted) {
        return res.status(404).json({ message: "Sale not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete sale" });
    }
  });



  // Clients routes
  app.get("/api/clients", async (req, res) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const client = await storage.getClient(id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.post("/api/clients", async (req, res) => {
    try {
      const validatedData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(validatedData);
      res.status(201).json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create client" });
    }
  });

  app.put("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertClientSchema.partial().parse(req.body);
      const client = await storage.updateClient(id, validatedData);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update client" });
    }
  });

  app.delete("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteClient(id);
      if (!deleted) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // Support tickets routes
  app.get("/api/support/tickets", async (req, res) => {
    try {
      const clientId = req.query.clientId ? parseInt(req.query.clientId as string) : undefined;
      const tickets = await storage.getSupportTickets(clientId);
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch support tickets" });
    }
  });

  app.get("/api/support/tickets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const ticket = await storage.getSupportTicket(id);
      if (!ticket) {
        return res.status(404).json({ message: "Support ticket not found" });
      }
      res.json(ticket);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch support ticket" });
    }
  });

  app.post("/api/support/tickets", async (req, res) => {
    try {
      const validatedData = insertSupportTicketSchema.parse(req.body);
      const ticket = await storage.createSupportTicket(validatedData);
      res.status(201).json(ticket);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create support ticket" });
    }
  });

  app.put("/api/support/tickets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertSupportTicketSchema.partial().parse(req.body);
      const ticket = await storage.updateSupportTicket(id, validatedData);
      if (!ticket) {
        return res.status(404).json({ message: "Support ticket not found" });
      }
      res.json(ticket);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update support ticket" });
    }
  });

  app.delete("/api/support/tickets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteSupportTicket(id);
      if (!deleted) {
        return res.status(404).json({ message: "Support ticket not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete support ticket" });
    }
  });

  // Super Admin routes
  // Users management
  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/users", async (req, res) => {
    try {
      const { tempPassword, ...userData } = req.body;
      const user = await storage.createUser({ ...userData, tempPassword });
      res.status(201).json({ 
        ...user, 
        tempPassword: tempPassword || "temp123"
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.put("/api/admin/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.updateUser(id, req.body);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.post("/api/admin/users/:id/reset-password", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await storage.resetUserPassword(id);
      res.json(result);
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });



  // Client events endpoint
  app.get("/api/clients/:id/events", async (req, res) => {
    try {
      const clientId = parseInt(req.params.id);
      const events = await storage.getClientEvents(clientId);
      res.json(events);
    } catch (error) {
      console.error("Error fetching client events:", error);
      res.status(500).json({ message: "Failed to fetch client events" });
    }
  });

  // Old webhook completely removed to avoid conflicts

  // WhatsApp chips management
  app.get("/api/admin/whatsapp-chips", async (req, res) => {
    try {
      const chips = await storage.getWhatsappChips();
      res.json(chips);
    } catch (error) {
      console.error("Error fetching whatsapp chips:", error);
      res.status(500).json({ message: "Failed to fetch whatsapp chips" });
    }
  });

  app.post("/api/admin/whatsapp-chips", async (req, res) => {
    try {
      const result = insertWhatsappChipSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid whatsapp chip data" });
      }

      const chip = await storage.createWhatsappChip(result.data);
      res.status(201).json(chip);
    } catch (error) {
      console.error("Error creating whatsapp chip:", error);
      res.status(500).json({ message: "Failed to create whatsapp chip" });
    }
  });

  app.patch("/api/admin/whatsapp-chips/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const chip = await storage.updateWhatsappChip(id, req.body);
      if (!chip) {
        return res.status(404).json({ message: "WhatsApp chip not found" });
      }
      res.json(chip);
    } catch (error) {
      console.error("Error updating whatsapp chip:", error);
      res.status(500).json({ message: "Failed to update whatsapp chip" });
    }
  });

  app.delete("/api/admin/whatsapp-chips/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteWhatsappChip(id);
      if (!success) {
        return res.status(404).json({ message: "WhatsApp chip not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting whatsapp chip:", error);
      res.status(500).json({ message: "Failed to delete whatsapp chip" });
    }
  });

  app.post("/api/admin/whatsapp-chips/:id/recover", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.recoverWhatsappChip(id);
      res.json({ success });
    } catch (error) {
      console.error("Error recovering whatsapp chip:", error);
      res.status(500).json({ message: "Failed to recover whatsapp chip" });
    }
  });

  // User plans management
  app.get("/api/admin/user-plans", async (req, res) => {
    try {
      const userPlans = await storage.getUserPlans();
      res.json(userPlans);
    } catch (error) {
      console.error("Error fetching user plans:", error);
      res.status(500).json({ message: "Failed to fetch user plans" });
    }
  });

  app.post("/api/admin/user-plans", async (req, res) => {
    try {
      const result = insertUserPlanSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid user plan data" });
      }

      const userPlan = await storage.assignPlanToUser(result.data);
      res.status(201).json(userPlan);
    } catch (error) {
      console.error("Error assigning plan to user:", error);
      res.status(500).json({ message: "Failed to assign plan to user" });
    }
  });

  // Middleware to protect admin routes
  const requireAdmin = (req: any, res: any, next: any) => {
    const session = req.session;
    if (!session.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    if (session.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin required.' });
    }
    
    next();
  };

  // Admin metrics
  app.get("/api/admin/metrics", requireAdmin, async (req, res) => {
    try {
      const metrics = await storage.getSuperAdminMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching admin metrics:", error);
      res.status(500).json({ message: "Failed to fetch admin metrics" });
    }
  });

  // Clear all data endpoint for Super Admin
  app.post("/api/admin/clear-data", requireAdmin, async (req, res) => {
    try {
      await storage.clearAllSales();
      await storage.clearAllClients();
      res.json({ 
        success: true, 
        message: "Todos os dados foram limpos com sucesso" 
      });
    } catch (error) {
      console.error("Error clearing data:", error);
      res.status(500).json({ message: "Failed to clear data" });
    }
  });

  // Clear only sales
  app.post("/api/admin/clear-sales", requireAdmin, async (req, res) => {
    try {
      await storage.clearAllSales();
      res.json({ 
        success: true, 
        message: "Todas as vendas foram removidas" 
      });
    } catch (error) {
      console.error("Error clearing sales:", error);
      res.status(500).json({ message: "Failed to clear sales" });
    }
  });

  // Clear only clients (and their sales due to FK constraints)
  app.post("/api/admin/clear-clients", requireAdmin, async (req, res) => {
    try {
      await storage.clearAllSales(); // Clear sales first due to FK
      await storage.clearAllClients();
      res.json({ 
        success: true, 
        message: "Todos os clientes e suas vendas foram removidos" 
      });
    } catch (error) {
      console.error("Error clearing clients:", error);
      res.status(500).json({ message: "Failed to clear clients" });
    }
  });

  // Super Admin Routes
  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/users", async (req, res) => {
    try {
      const { tempPassword, ...userData } = req.body;
      console.log('Creating user with data:', userData);
      console.log('Temporary password:', tempPassword);
      
      const user = await storage.createUser({ 
        ...userData, 
        password: tempPassword,
        requirePasswordChange: true 
      });
      
      res.json({ 
        ...user, 
        tempPassword // Return temp password for display
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.put("/api/admin/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const userData = req.body;
      const user = await storage.updateUser(userId, userData);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const success = await storage.deleteUser(userId);
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Plans management
  app.get("/api/admin/plans", async (req, res) => {
    try {
      const plans = await storage.getPlans();
      res.json(plans);
    } catch (error) {
      console.error("Error fetching plans:", error);
      res.status(500).json({ message: "Failed to fetch plans" });
    }
  });

  app.post("/api/admin/plans", async (req, res) => {
    try {
      const planData = req.body;
      const plan = await storage.createPlan(planData);
      res.json(plan);
    } catch (error) {
      console.error("Error creating plan:", error);
      res.status(500).json({ message: "Failed to create plan" });
    }
  });

  app.put("/api/admin/plans/:id", async (req, res) => {
    try {
      const planId = parseInt(req.params.id);
      const planData = req.body;
      const plan = await storage.updatePlan(planId, planData);
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }
      res.json(plan);
    } catch (error) {
      console.error("Error updating plan:", error);
      res.status(500).json({ message: "Failed to update plan" });
    }
  });

  app.delete("/api/admin/plans/:id", async (req, res) => {
    try {
      const planId = parseInt(req.params.id);
      const success = await storage.deletePlan(planId);
      if (!success) {
        return res.status(404).json({ message: "Plan not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting plan:", error);
      res.status(500).json({ message: "Failed to delete plan" });
    }
  });

  // Webhooks management
  app.get("/api/admin/webhooks", async (req, res) => {
    try {
      const webhooks = await storage.getWebhooks();
      res.json(webhooks);
    } catch (error) {
      console.error("Error fetching webhooks:", error);
      res.status(500).json({ message: "Failed to fetch webhooks" });
    }
  });

  app.post("/api/admin/webhooks", async (req, res) => {
    try {
      const webhookData = req.body;
      const webhook = await storage.createWebhook(webhookData);
      res.json(webhook);
    } catch (error) {
      console.error("Error creating webhook:", error);
      res.status(500).json({ message: "Failed to create webhook" });
    }
  });

  app.put("/api/admin/webhooks/:id", async (req, res) => {
    try {
      const webhookId = parseInt(req.params.id);
      const webhookData = req.body;
      const webhook = await storage.updateWebhook(webhookId, webhookData);
      if (!webhook) {
        return res.status(404).json({ message: "Webhook not found" });
      }
      res.json(webhook);
    } catch (error) {
      console.error("Error updating webhook:", error);
      res.status(500).json({ message: "Failed to update webhook" });
    }
  });

  app.delete("/api/admin/webhooks/:id", async (req, res) => {
    try {
      const webhookId = parseInt(req.params.id);
      const success = await storage.deleteWebhook(webhookId);
      if (!success) {
        return res.status(404).json({ message: "Webhook not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting webhook:", error);
      res.status(500).json({ message: "Failed to delete webhook" });
    }
  });

  app.post("/api/admin/webhooks/:id/trigger", async (req, res) => {
    try {
      const webhookId = parseInt(req.params.id);
      const { eventType, payload } = req.body;
      const success = await storage.triggerWebhook(webhookId, eventType, payload);
      if (!success) {
        return res.status(404).json({ message: "Webhook not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error triggering webhook:", error);
      res.status(500).json({ message: "Failed to trigger webhook" });
    }
  });

  // WhatsApp chips management
  app.get("/api/admin/whatsapp-chips", async (req, res) => {
    try {
      const chips = await storage.getWhatsappChips();
      res.json(chips);
    } catch (error) {
      console.error("Error fetching WhatsApp chips:", error);
      res.status(500).json({ message: "Failed to fetch WhatsApp chips" });
    }
  });

  app.post("/api/admin/whatsapp-chips", async (req, res) => {
    try {
      const chipData = req.body;
      const chip = await storage.createWhatsappChip(chipData);
      res.json(chip);
    } catch (error) {
      console.error("Error creating WhatsApp chip:", error);
      res.status(500).json({ message: "Failed to create WhatsApp chip" });
    }
  });

  app.put("/api/admin/whatsapp-chips/:id", async (req, res) => {
    try {
      const chipId = parseInt(req.params.id);
      const chipData = req.body;
      const chip = await storage.updateWhatsappChip(chipId, chipData);
      if (!chip) {
        return res.status(404).json({ message: "WhatsApp chip not found" });
      }
      res.json(chip);
    } catch (error) {
      console.error("Error updating WhatsApp chip:", error);
      res.status(500).json({ message: "Failed to update WhatsApp chip" });
    }
  });

  app.delete("/api/admin/whatsapp-chips/:id", async (req, res) => {
    try {
      const chipId = parseInt(req.params.id);
      const success = await storage.deleteWhatsappChip(chipId);
      if (!success) {
        return res.status(404).json({ message: "WhatsApp chip not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting WhatsApp chip:", error);
      res.status(500).json({ message: "Failed to delete WhatsApp chip" });
    }
  });

  app.post("/api/admin/whatsapp-chips/:id/recover", async (req, res) => {
    try {
      const chipId = parseInt(req.params.id);
      const success = await storage.recoverWhatsappChip(chipId);
      if (!success) {
        return res.status(404).json({ message: "WhatsApp chip not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error recovering WhatsApp chip:", error);
      res.status(500).json({ message: "Failed to recover WhatsApp chip" });
    }
  });

  // Admin metrics
  app.get("/api/admin/metrics", async (req, res) => {
    try {
      const metrics = await storage.getSuperAdminMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching admin metrics:", error);
      res.status(500).json({ message: "Failed to fetch admin metrics" });
    }
  });



  // Webhook endpoint for sales events
  app.post("/api/webhook/sales", async (req, res) => {
    try {
      console.log('Webhook received:', JSON.stringify(req.body, null, 2));
      
      let eventData = req.body;
      
      // Handle array format (like ABANDONED_CART)
      if (Array.isArray(eventData) && eventData.length > 0) {
        eventData = eventData[0].body || eventData[0];
        console.log('Extracted event data from array:', JSON.stringify(eventData, null, 2));
      }

      // Validate required fields
      if (!eventData || !eventData.event || !eventData.customer || !eventData.customer.phone_number) {
        console.error('Validation failed:', { eventData });
        return res.status(400).json({ 
          success: false, 
          message: 'Dados do webhook inválidos: evento, cliente ou telefone faltando' 
        });
      }

      const result = await storage.processWebhookEvent(eventData);
      
      if (result.success) {
        console.log(`Webhook processed successfully: ${result.message}`);
        res.status(200).json({ success: true, message: result.message });
      } else {
        console.log(`Webhook processing failed: ${result.message}`);
        res.status(400).json({ success: false, message: result.message });
      }
    } catch (error) {
      console.error('Error processing webhook:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to process webhook' 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
