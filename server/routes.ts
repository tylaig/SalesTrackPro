import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertClientSchema, 
  insertSaleSchema, 
  insertSupportTicketSchema,
  insertUserSchema,
  insertPlanSchema,
  insertWebhookSchema,
  insertWhatsappChipSchema,
  insertUserPlanSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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
      res.status(500).json({ message: "Failed to fetch sales data" });
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

  // Sales metrics and charts
  app.get("/api/sales/metrics", async (req, res) => {
    try {
      const metrics = {
        totalSales: 70900,
        recoveredSales: 28500,
        lostSales: 19800,
        totalClients: 5
      };
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching sales metrics:", error);
      res.status(500).json({ message: "Failed to fetch sales metrics" });
    }
  });

  app.get("/api/sales/charts", async (req, res) => {
    try {
      const charts = {
        monthly: [
          { month: 'Jan', realized: 1, recovered: 0, lost: 0 },
          { month: 'Feb', realized: 1, recovered: 1, lost: 0 },
          { month: 'Mar', realized: 1, recovered: 0, lost: 1 },
          { month: 'Apr', realized: 1, recovered: 1, lost: 0 },
          { month: 'May', realized: 1, recovered: 0, lost: 1 },
          { month: 'Jun', realized: 1, recovered: 0, lost: 0 }
        ],
        distribution: [
          { status: 'realized', count: 6, value: 70900 },
          { status: 'recovered', count: 2, value: 28500 },
          { status: 'lost', count: 2, value: 19800 }
        ]
      };
      res.json(charts);
    } catch (error) {
      console.error("Error fetching sales charts:", error);
      res.status(500).json({ message: "Failed to fetch chart data" });
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
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid user data" });
      }

      const user = await storage.createUser(result.data);
      res.status(201).json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.patch("/api/admin/users/:id", async (req, res) => {
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

  app.delete("/api/admin/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteUser(id);
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
      const result = insertPlanSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid plan data" });
      }

      const plan = await storage.createPlan(result.data);
      res.status(201).json(plan);
    } catch (error) {
      console.error("Error creating plan:", error);
      res.status(500).json({ message: "Failed to create plan" });
    }
  });

  app.patch("/api/admin/plans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const plan = await storage.updatePlan(id, req.body);
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
      const id = parseInt(req.params.id);
      const success = await storage.deletePlan(id);
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
      const result = insertWebhookSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid webhook data" });
      }

      const webhook = await storage.createWebhook(result.data);
      res.status(201).json(webhook);
    } catch (error) {
      console.error("Error creating webhook:", error);
      res.status(500).json({ message: "Failed to create webhook" });
    }
  });

  app.patch("/api/admin/webhooks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const webhook = await storage.updateWebhook(id, req.body);
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
      const id = parseInt(req.params.id);
      const success = await storage.deleteWebhook(id);
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
      const id = parseInt(req.params.id);
      const { eventType, payload } = req.body;
      const success = await storage.triggerWebhook(id, eventType, payload);
      res.json({ success });
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
      const userData = req.body;
      const user = await storage.createUser(userData);
      res.json(user);
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

  app.delete("/api/admin/users/:id", async (req, res) => {
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

  const httpServer = createServer(app);
  return httpServer;
}
