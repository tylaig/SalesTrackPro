import { 
  users, clients, sales, supportTickets,
  type User, type InsertUser,
  type Client, type InsertClient,
  type Sale, type InsertSale, type SaleWithClient,
  type SupportTicket, type InsertSupportTicket, type SupportTicketWithUser
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
  getSupportTickets(userId?: number): Promise<SupportTicketWithUser[]>;
  getSupportTicket(id: number): Promise<SupportTicketWithUser | undefined>;
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  updateSupportTicket(id: number, ticket: Partial<InsertSupportTicket>): Promise<SupportTicket | undefined>;
  deleteSupportTicket(id: number): Promise<boolean>;
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
    return result.rowCount > 0;
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
    return result.rowCount > 0;
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
        monthly[monthIndex][row.status as keyof typeof monthly[0]] = Number(row.value);
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
  async getSupportTickets(userId?: number): Promise<SupportTicketWithUser[]> {
    const query = db
      .select()
      .from(supportTickets)
      .innerJoin(users, eq(supportTickets.userId, users.id))
      .orderBy(desc(supportTickets.createdAt));

    const result = userId 
      ? await query.where(eq(supportTickets.userId, userId))
      : await query;

    return result.map(row => ({
      ...row.support_tickets,
      user: row.users
    }));
  }

  async getSupportTicket(id: number): Promise<SupportTicketWithUser | undefined> {
    const result = await db
      .select()
      .from(supportTickets)
      .innerJoin(users, eq(supportTickets.userId, users.id))
      .where(eq(supportTickets.id, id));

    if (result.length === 0) return undefined;

    const row = result[0];
    return {
      ...row.support_tickets,
      user: row.users
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
    return result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();
