import { 
  users, clients, sales, supportTickets, plans, webhooks, whatsappChips, userPlans, webhookEvents,
  type User, type InsertUser,
  type Client, type InsertClient,
  type Sale, type InsertSale, type SaleWithClient,
  type SupportTicket, type InsertSupportTicket, type SupportTicketWithClient,
  type Plan, type InsertPlan,
  type Webhook, type InsertWebhook, type WebhookWithEvents,
  type WhatsappChip, type InsertWhatsappChip, type WhatsappChipWithClient,
  type UserPlan, type InsertUserPlan, type UserPlanWithDetails,
  type WebhookEvent, type InsertWebhookEvent
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, count, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Clients
  getClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;

  // Sales
  getSales(limit?: number, offset?: number): Promise<SaleWithClient[]>;
  getSale(id: number): Promise<SaleWithClient | undefined>;
  createSale(sale: InsertSale): Promise<Sale>;
  updateSale(id: number, sale: Partial<InsertSale>): Promise<Sale | undefined>;
  deleteSale(id: number): Promise<boolean>;
  getSalesMetrics(): Promise<{
    totalSales: number;
    recoveredSales: number;
    lostSales: number;
    totalClients: number;
  }>;
  getSalesChart(): Promise<{
    monthly: { month: string; realized: number; recovered: number; lost: number }[];
    distribution: { status: string; count: number; value: number }[];
  }>;

  // Support Tickets
  getSupportTickets(clientId?: number): Promise<SupportTicketWithClient[]>;
  getSupportTicket(id: number): Promise<SupportTicketWithClient | undefined>;
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  updateSupportTicket(id: number, ticket: Partial<InsertSupportTicket>): Promise<SupportTicket | undefined>;
  deleteSupportTicket(id: number): Promise<boolean>;

  // Super Admin - Plans
  getPlans(): Promise<Plan[]>;
  getPlan(id: number): Promise<Plan | undefined>;
  createPlan(plan: InsertPlan): Promise<Plan>;
  updatePlan(id: number, plan: Partial<InsertPlan>): Promise<Plan | undefined>;
  deletePlan(id: number): Promise<boolean>;

  // Super Admin - Webhooks
  getWebhooks(): Promise<Webhook[]>;
  getWebhook(id: number): Promise<Webhook | undefined>;
  createWebhook(webhook: InsertWebhook): Promise<Webhook>;
  updateWebhook(id: number, webhook: Partial<InsertWebhook>): Promise<Webhook | undefined>;
  deleteWebhook(id: number): Promise<boolean>;
  triggerWebhook(id: number, eventType: string, payload: any): Promise<boolean>;

  // Super Admin - WhatsApp Chips
  getWhatsappChips(): Promise<WhatsappChipWithClient[]>;
  getWhatsappChip(id: number): Promise<WhatsappChipWithClient | undefined>;
  createWhatsappChip(chip: InsertWhatsappChip): Promise<WhatsappChip>;
  updateWhatsappChip(id: number, chip: Partial<InsertWhatsappChip>): Promise<WhatsappChip | undefined>;
  deleteWhatsappChip(id: number): Promise<boolean>;
  recoverWhatsappChip(id: number): Promise<boolean>;

  // Super Admin - User Plans
  getUserPlans(): Promise<UserPlanWithDetails[]>;
  getUserPlan(userId: number): Promise<UserPlanWithDetails | undefined>;
  assignPlanToUser(userPlan: InsertUserPlan): Promise<UserPlan>;
  removePlanFromUser(userId: number): Promise<boolean>;

  // Super Admin - Webhook Events
  getWebhookEvents(webhookId?: number): Promise<WebhookEvent[]>;
  createWebhookEvent(event: InsertWebhookEvent): Promise<WebhookEvent>;

  // Super Admin - Users Management
  getAllUsers(): Promise<User[]>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;

  // Super Admin - Analytics
  getSuperAdminMetrics(): Promise<{
    totalUsers: number;
    totalPlans: number;
    totalWebhooks: number;
    totalChips: number;
    activeChips: number;
    recoveryChips: number;
    totalSalesValue: number;
    totalRecoveredValue: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Clients
  async getClients(): Promise<Client[]> {
    return await db.select().from(clients).orderBy(desc(clients.createdAt));
  }

  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client || undefined;
  }

  async createClient(client: InsertClient): Promise<Client> {
    const [newClient] = await db
      .insert(clients)
      .values(client)
      .returning();
    return newClient;
  }

  async updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined> {
    const [updatedClient] = await db
      .update(clients)
      .set(client)
      .where(eq(clients.id, id))
      .returning();
    return updatedClient || undefined;
  }

  async deleteClient(id: number): Promise<boolean> {
    const result = await db.delete(clients).where(eq(clients.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Sales
  async getSales(limit = 50, offset = 0): Promise<SaleWithClient[]> {
    const result = await db
      .select()
      .from(sales)
      .innerJoin(clients, eq(sales.clientId, clients.id))
      .orderBy(desc(sales.date))
      .limit(limit)
      .offset(offset);

    return result.map(row => ({
      ...row.sales,
      client: row.clients
    }));
  }

  async getSale(id: number): Promise<SaleWithClient | undefined> {
    const result = await db
      .select()
      .from(sales)
      .innerJoin(clients, eq(sales.clientId, clients.id))
      .where(eq(sales.id, id));

    if (result.length === 0) return undefined;

    const row = result[0];
    return {
      ...row.sales,
      client: row.clients
    };
  }

  async createSale(sale: InsertSale): Promise<Sale> {
    const [newSale] = await db
      .insert(sales)
      .values(sale)
      .returning();
    return newSale;
  }

  async updateSale(id: number, sale: Partial<InsertSale>): Promise<Sale | undefined> {
    const [updatedSale] = await db
      .update(sales)
      .set(sale)
      .where(eq(sales.id, id))
      .returning();
    return updatedSale || undefined;
  }

  async deleteSale(id: number): Promise<boolean> {
    const result = await db.delete(sales).where(eq(sales.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getSalesMetrics(): Promise<{
    totalSales: number;
    recoveredSales: number;
    lostSales: number;
    totalClients: number;
  }> {
    const [totalSalesResult] = await db
      .select({ value: sql<number>`sum(${sales.value})` })
      .from(sales)
      .where(eq(sales.status, 'realized'));

    const [recoveredSalesResult] = await db
      .select({ value: sql<number>`sum(${sales.value})` })
      .from(sales)
      .where(eq(sales.status, 'recovered'));

    const [lostSalesResult] = await db
      .select({ value: sql<number>`sum(${sales.value})` })
      .from(sales)
      .where(eq(sales.status, 'lost'));

    const [totalClientsResult] = await db
      .select({ count: count() })
      .from(clients);

    return {
      totalSales: Number(totalSalesResult?.value || 0),
      recoveredSales: Number(recoveredSalesResult?.value || 0),
      lostSales: Number(lostSalesResult?.value || 0),
      totalClients: totalClientsResult?.count || 0,
    };
  }

  async getSalesChart(): Promise<{
    monthly: { month: string; realized: number; recovered: number; lost: number }[];
    distribution: { status: string; count: number; value: number }[];
  }> {
    // Monthly data for the last 12 months
    const monthlyData = await db
      .select({
        month: sql<string>`to_char(${sales.date}, 'Mon')`,
        status: sales.status,
        value: sql<number>`sum(${sales.value})`
      })
      .from(sales)
      .where(gte(sales.date, sql`NOW() - INTERVAL '12 months'`))
      .groupBy(sql`date_trunc('month', ${sales.date})`, sales.status)
      .orderBy(sql`date_trunc('month', ${sales.date})`);

    // Distribution data
    const distributionData = await db
      .select({
        status: sales.status,
        count: count(),
        value: sql<number>`sum(${sales.value})`
      })
      .from(sales)
      .groupBy(sales.status);

    // Process monthly data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthly = months.map(month => ({
      month,
      realized: 0,
      recovered: 0,
      lost: 0
    }));

    monthlyData.forEach(row => {
      const monthIndex = months.findIndex(m => m === row.month);
      if (monthIndex !== -1) {
        const status = row.status as 'realized' | 'recovered' | 'lost';
        if (status in monthly[monthIndex]) {
          monthly[monthIndex][status] = Number(row.value);
        }
      }
    });

    const distribution = distributionData.map(row => ({
      status: row.status,
      count: row.count,
      value: Number(row.value)
    }));

    return { monthly, distribution };
  }

  // Support Tickets
  async getSupportTickets(clientId?: number): Promise<SupportTicketWithClient[]> {
    const query = db
      .select()
      .from(supportTickets)
      .innerJoin(clients, eq(supportTickets.clientId, clients.id))
      .orderBy(desc(supportTickets.createdAt));

    const result = clientId 
      ? await query.where(eq(supportTickets.clientId, clientId))
      : await query;

    return result.map(row => ({
      ...row.support_tickets,
      client: row.clients
    }));
  }

  async getSupportTicket(id: number): Promise<SupportTicketWithClient | undefined> {
    const result = await db
      .select()
      .from(supportTickets)
      .innerJoin(clients, eq(supportTickets.clientId, clients.id))
      .where(eq(supportTickets.id, id));

    if (result.length === 0) return undefined;

    const row = result[0];
    return {
      ...row.support_tickets,
      client: row.clients
    };
  }

  async createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket> {
    const [newTicket] = await db
      .insert(supportTickets)
      .values(ticket)
      .returning();
    return newTicket;
  }

  async updateSupportTicket(id: number, ticket: Partial<InsertSupportTicket>): Promise<SupportTicket | undefined> {
    const [updatedTicket] = await db
      .update(supportTickets)
      .set({ ...ticket, updatedAt: new Date() })
      .where(eq(supportTickets.id, id))
      .returning();
    return updatedTicket || undefined;
  }

  async deleteSupportTicket(id: number): Promise<boolean> {
    const result = await db.delete(supportTickets).where(eq(supportTickets.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Super Admin - Plans
  async getPlans(): Promise<Plan[]> {
    return await db.select().from(plans).orderBy(desc(plans.createdAt));
  }

  async getPlan(id: number): Promise<Plan | undefined> {
    const [plan] = await db.select().from(plans).where(eq(plans.id, id));
    return plan;
  }

  async createPlan(plan: InsertPlan): Promise<Plan> {
    const [newPlan] = await db.insert(plans).values(plan).returning();
    return newPlan;
  }

  async updatePlan(id: number, plan: Partial<InsertPlan>): Promise<Plan | undefined> {
    try {
      const [updatedPlan] = await db
        .update(plans)
        .set({ ...plan, updatedAt: new Date() })
        .where(eq(plans.id, id))
        .returning();
      return updatedPlan;
    } catch (error) {
      console.error("Error updating plan:", error);
      return undefined;
    }
  }

  async deletePlan(id: number): Promise<boolean> {
    try {
      await db.delete(plans).where(eq(plans.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting plan:", error);
      return false;
    }
  }

  // Super Admin - Webhooks
  async getWebhooks(): Promise<WebhookWithEvents[]> {
    const webhooksData = await db.select().from(webhooks).orderBy(desc(webhooks.createdAt));
    const webhooksWithEvents = await Promise.all(
      webhooksData.map(async (webhook) => {
        const events = await db.select().from(webhookEvents).where(eq(webhookEvents.webhookId, webhook.id));
        return { ...webhook, events };
      })
    );
    return webhooksWithEvents;
  }

  async getWebhook(id: number): Promise<Webhook | undefined> {
    const [webhook] = await db.select().from(webhooks).where(eq(webhooks.id, id));
    return webhook;
  }

  async createWebhook(webhook: InsertWebhook): Promise<Webhook> {
    const [newWebhook] = await db.insert(webhooks).values(webhook).returning();
    return newWebhook;
  }

  async updateWebhook(id: number, webhook: Partial<InsertWebhook>): Promise<Webhook | undefined> {
    try {
      const [updatedWebhook] = await db
        .update(webhooks)
        .set({ ...webhook, updatedAt: new Date() })
        .where(eq(webhooks.id, id))
        .returning();
      return updatedWebhook;
    } catch (error) {
      console.error("Error updating webhook:", error);
      return undefined;
    }
  }

  async deleteWebhook(id: number): Promise<boolean> {
    try {
      await db.delete(webhooks).where(eq(webhooks.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting webhook:", error);
      return false;
    }
  }

  async triggerWebhook(id: number, eventType: string, payload: any): Promise<boolean> {
    try {
      const webhook = await this.getWebhook(id);
      if (!webhook || !webhook.isActive) return false;

      const events = JSON.parse(webhook.events);
      if (!events.includes(eventType)) return false;

      await this.createWebhookEvent({
        webhookId: id,
        eventType,
        payload: JSON.stringify(payload),
        status: "pending",
        attempts: 0,
      });

      await db.update(webhooks)
        .set({ lastTriggered: new Date() })
        .where(eq(webhooks.id, id));

      return true;
    } catch (error) {
      console.error("Error triggering webhook:", error);
      return false;
    }
  }

  // Super Admin - WhatsApp Chips
  async getWhatsappChips(): Promise<WhatsappChipWithClient[]> {
    return await db
      .select({
        id: whatsappChips.id,
        chipId: whatsappChips.chipId,
        phoneNumber: whatsappChips.phoneNumber,
        status: whatsappChips.status,
        clientId: whatsappChips.clientId,
        lastActive: whatsappChips.lastActive,
        recoveryDate: whatsappChips.recoveryDate,
        createdAt: whatsappChips.createdAt,
        updatedAt: whatsappChips.updatedAt,
        client: clients,
      })
      .from(whatsappChips)
      .leftJoin(clients, eq(whatsappChips.clientId, clients.id))
      .orderBy(desc(whatsappChips.createdAt));
  }

  async getWhatsappChip(id: number): Promise<WhatsappChipWithClient | undefined> {
    const [chip] = await db
      .select({
        id: whatsappChips.id,
        chipId: whatsappChips.chipId,
        phoneNumber: whatsappChips.phoneNumber,
        status: whatsappChips.status,
        clientId: whatsappChips.clientId,
        lastActive: whatsappChips.lastActive,
        recoveryDate: whatsappChips.recoveryDate,
        createdAt: whatsappChips.createdAt,
        updatedAt: whatsappChips.updatedAt,
        client: clients,
      })
      .from(whatsappChips)
      .leftJoin(clients, eq(whatsappChips.clientId, clients.id))
      .where(eq(whatsappChips.id, id));
    return chip;
  }

  async createWhatsappChip(chip: InsertWhatsappChip): Promise<WhatsappChip> {
    const [newChip] = await db.insert(whatsappChips).values(chip).returning();
    return newChip;
  }

  async updateWhatsappChip(id: number, chip: Partial<InsertWhatsappChip>): Promise<WhatsappChip | undefined> {
    try {
      const [updatedChip] = await db
        .update(whatsappChips)
        .set({ ...chip, updatedAt: new Date() })
        .where(eq(whatsappChips.id, id))
        .returning();
      return updatedChip;
    } catch (error) {
      console.error("Error updating whatsapp chip:", error);
      return undefined;
    }
  }

  async deleteWhatsappChip(id: number): Promise<boolean> {
    try {
      await db.delete(whatsappChips).where(eq(whatsappChips.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting whatsapp chip:", error);
      return false;
    }
  }

  async recoverWhatsappChip(id: number): Promise<boolean> {
    try {
      await db
        .update(whatsappChips)
        .set({ 
          status: "recovery", 
          recoveryDate: new Date(),
          updatedAt: new Date()
        })
        .where(eq(whatsappChips.id, id));
      return true;
    } catch (error) {
      console.error("Error recovering whatsapp chip:", error);
      return false;
    }
  }

  // Super Admin - User Plans
  async getUserPlans(): Promise<UserPlanWithDetails[]> {
    return await db
      .select({
        id: userPlans.id,
        userId: userPlans.userId,
        planId: userPlans.planId,
        isActive: userPlans.isActive,
        startDate: userPlans.startDate,
        endDate: userPlans.endDate,
        createdAt: userPlans.createdAt,
        user: users,
        plan: plans,
      })
      .from(userPlans)
      .innerJoin(users, eq(userPlans.userId, users.id))
      .innerJoin(plans, eq(userPlans.planId, plans.id))
      .orderBy(desc(userPlans.createdAt));
  }

  async getUserPlan(userId: number): Promise<UserPlanWithDetails | undefined> {
    const [userPlan] = await db
      .select({
        id: userPlans.id,
        userId: userPlans.userId,
        planId: userPlans.planId,
        isActive: userPlans.isActive,
        startDate: userPlans.startDate,
        endDate: userPlans.endDate,
        createdAt: userPlans.createdAt,
        user: users,
        plan: plans,
      })
      .from(userPlans)
      .innerJoin(users, eq(userPlans.userId, users.id))
      .innerJoin(plans, eq(userPlans.planId, plans.id))
      .where(and(eq(userPlans.userId, userId), eq(userPlans.isActive, true)));
    return userPlan;
  }

  async assignPlanToUser(userPlan: InsertUserPlan): Promise<UserPlan> {
    await db
      .update(userPlans)
      .set({ isActive: false })
      .where(and(eq(userPlans.userId, userPlan.userId!), eq(userPlans.isActive, true)));

    const [newUserPlan] = await db.insert(userPlans).values(userPlan).returning();
    return newUserPlan;
  }

  async removePlanFromUser(userId: number): Promise<boolean> {
    try {
      await db
        .update(userPlans)
        .set({ isActive: false })
        .where(and(eq(userPlans.userId, userId), eq(userPlans.isActive, true)));
      return true;
    } catch (error) {
      console.error("Error removing plan from user:", error);
      return false;
    }
  }

  // Super Admin - Webhook Events
  async getWebhookEvents(webhookId?: number): Promise<WebhookEvent[]> {
    const query = db.select().from(webhookEvents);
    if (webhookId) {
      return await query.where(eq(webhookEvents.webhookId, webhookId)).orderBy(desc(webhookEvents.createdAt));
    }
    return await query.orderBy(desc(webhookEvents.createdAt));
  }

  async createWebhookEvent(event: InsertWebhookEvent): Promise<WebhookEvent> {
    const [newEvent] = await db.insert(webhookEvents).values(event).returning();
    return newEvent;
  }

  // Super Admin - Users Management
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.id));
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    try {
      const [updatedUser] = await db
        .update(users)
        .set(user)
        .where(eq(users.id, id))
        .returning();
      return updatedUser;
    } catch (error) {
      console.error("Error updating user:", error);
      return undefined;
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      await db.delete(users).where(eq(users.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  }

  // Super Admin - Analytics
  async getSuperAdminMetrics(): Promise<{
    totalUsers: number;
    totalPlans: number;
    totalWebhooks: number;
    totalChips: number;
    activeChips: number;
    recoveryChips: number;
    totalSalesValue: number;
    totalRecoveredValue: number;
  }> {
    const [usersCount] = await db.select({ count: count() }).from(users);
    const [plansCount] = await db.select({ count: count() }).from(plans);
    const [webhooksCount] = await db.select({ count: count() }).from(webhooks);
    const [chipsCount] = await db.select({ count: count() }).from(whatsappChips);
    
    const [activeChipsCount] = await db
      .select({ count: count() })
      .from(whatsappChips)
      .where(eq(whatsappChips.status, "active"));
    
    const [recoveryChipsCount] = await db
      .select({ count: count() })
      .from(whatsappChips)
      .where(eq(whatsappChips.status, "recovery"));

    const [totalSales] = await db
      .select({ total: sql<number>`sum(${sales.value})` })
      .from(sales)
      .where(eq(sales.status, "realized"));

    const [recoveredSales] = await db
      .select({ total: sql<number>`sum(${sales.value})` })
      .from(sales)
      .where(eq(sales.status, "recovered"));

    return {
      totalUsers: usersCount.count,
      totalPlans: plansCount.count,
      totalWebhooks: webhooksCount.count,
      totalChips: chipsCount.count,
      activeChips: activeChipsCount.count,
      recoveryChips: recoveryChipsCount.count,
      totalSalesValue: Number(totalSales.total) || 0,
      totalRecoveredValue: Number(recoveredSales.total) || 0,
    };
  }
}

export const storage = new DatabaseStorage();
