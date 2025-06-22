import { 
  users, clients, sales, supportTickets, clientEvents,
  type User, type InsertUser,
  type Client, type InsertClient,
  type Sale, type InsertSale, type SaleWithClient,
  type SupportTicket, type InsertSupportTicket, type SupportTicketWithClient,
  type ClientEvent, type InsertClientEvent, type ClientWithEvents
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, count, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser & { tempPassword?: string }): Promise<User>;

  // Clients
  getClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  getClientByPhone(phone: string): Promise<Client | undefined>;
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



  // Client Events
  getClientEvents(clientId?: number): Promise<ClientEvent[]>;
  createClientEvent(event: InsertClientEvent): Promise<ClientEvent>;
  getClientWithEvents(clientId: number): Promise<ClientWithEvents | undefined>;

  // Super Admin - Users Management
  getAllUsers(): Promise<User[]>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;

  // Super Admin - Users Management
  getAllUsers(): Promise<User[]>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  resetUserPassword(id: number): Promise<{ tempPassword: string }>;
  
  // Super Admin - Analytics
  getSuperAdminMetrics(): Promise<{
    totalUsers: number;
    totalSalesValue: number;
    totalRecoveredValue: number;
    totalClients: number;
  }>;

  // Webhook Processing
  processWebhookEvent(eventData: any): Promise<{ success: boolean; message: string; }>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser & { tempPassword?: string }): Promise<User> {
    const password = insertUser.tempPassword || "temp123";
    const userData = {
      ...insertUser,
      password,
      requirePasswordChange: true,
    };
    delete userData.tempPassword;
    
    const [user] = await db
      .insert(users)
      .values(userData)
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

  async getClientByPhone(phone: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.phone, phone));
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
    try {
      // Get all sales data
      const allSales = await db.select().from(sales);
      const allClients = await db.select().from(clients);

      // Calculate totals by status
      const totalSalesValue = allSales.reduce((sum, sale) => sum + Number(sale.value), 0);
      const recoveredSalesValue = allSales
        .filter(sale => sale.status === 'recovered')
        .reduce((sum, sale) => sum + Number(sale.value), 0);
      const lostSalesValue = allSales
        .filter(sale => sale.status === 'lost')
        .reduce((sum, sale) => sum + Number(sale.value), 0);

      return {
        totalSales: totalSalesValue,
        recoveredSales: recoveredSalesValue,
        lostSales: lostSalesValue,
        totalClients: allClients.length,
      };
    } catch (error) {
      console.error('Error fetching sales metrics:', error);
      throw error;
    }
  }

  async getSalesChart(): Promise<{
    monthly: { month: string; realized: number; recovered: number; lost: number }[];
    distribution: { status: string; count: number; value: number }[];
  }> {
    try {
      // Get all sales data
      const allSales = await db.select().from(sales);
      
      // Calculate distribution by status
      const statusCounts = allSales.reduce((acc, sale) => {
        const status = sale.status;
        if (!acc[status]) {
          acc[status] = { count: 0, value: 0 };
        }
        acc[status].count++;
        acc[status].value += Number(sale.value);
        return acc;
      }, {} as Record<string, { count: number; value: number }>);

      const distribution = Object.entries(statusCounts).map(([status, data]) => ({
        status,
        count: data.count,
        value: data.value
      }));

      // Create monthly data based on status counts
      const realizedCount = statusCounts.realized?.count || 0;
      const recoveredCount = statusCounts.recovered?.count || 0;
      const lostCount = statusCounts.lost?.count || 0;

      const monthly = [
        { month: 'Jan', realized: Math.floor(realizedCount / 6), recovered: 0, lost: 0 },
        { month: 'Feb', realized: Math.floor(realizedCount / 6), recovered: Math.floor(recoveredCount / 2), lost: 0 },
        { month: 'Mar', realized: Math.floor(realizedCount / 6), recovered: 0, lost: Math.floor(lostCount / 2) },
        { month: 'Apr', realized: Math.floor(realizedCount / 6), recovered: Math.floor(recoveredCount / 2), lost: 0 },
        { month: 'May', realized: Math.floor(realizedCount / 6), recovered: 0, lost: Math.floor(lostCount / 2) },
        { month: 'Jun', realized: Math.floor(realizedCount / 6), recovered: 0, lost: 0 }
      ];

      return { monthly, distribution };
    } catch (error) {
      console.error('Error fetching sales chart data:', error);
      throw error;
    }
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





  // Super Admin - Users Management
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.id));
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    try {
      const updateData = { ...user, updatedAt: new Date() };
      const [updatedUser] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, id))
        .returning();
      return updatedUser;
    } catch (error) {
      console.error("Error updating user:", error);
      return undefined;
    }
  }

  async resetUserPassword(id: number): Promise<{ tempPassword: string }> {
    const tempPassword = Math.random().toString(36).slice(-12);
    await db
      .update(users)
      .set({ 
        password: tempPassword,
        requirePasswordChange: true,
        updatedAt: new Date()
      })
      .where(eq(users.id, id));
    
    return { tempPassword };
  }

  // Super Admin - Analytics
  async getSuperAdminMetrics(): Promise<{
    totalUsers: number;
    totalSalesValue: number;
    totalRecoveredValue: number;
    totalClients: number;
  }> {
    const [usersCount] = await db.select({ count: count() }).from(users);
    const [clientsCount] = await db.select({ count: count() }).from(clients);

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
      totalSalesValue: Number(totalSales.total) || 0,
      totalRecoveredValue: Number(recoveredSales.total) || 0,
      totalClients: clientsCount.count,
    };
  }

  // Client Events
  async getClientEvents(clientId?: number): Promise<ClientEvent[]> {
    const query = db.select().from(clientEvents);
    if (clientId) {
      return await query.where(eq(clientEvents.clientId, clientId)).orderBy(desc(clientEvents.createdAt));
    }
    return await query.orderBy(desc(clientEvents.createdAt));
  }

  async createClientEvent(event: InsertClientEvent): Promise<ClientEvent> {
    const [newEvent] = await db.insert(clientEvents).values(event).returning();
    return newEvent;
  }

  async getClientWithEvents(clientId: number): Promise<ClientWithEvents | undefined> {
    const client = await this.getClient(clientId);
    if (!client) return undefined;
    
    const events = await this.getClientEvents(clientId);
    return { ...client, events };
  }

  // Webhook Processing
  async processWebhookEvent(eventData: any): Promise<{ success: boolean; message: string; }> {
    try {
      const { event, customer, sale_id, payment_method, total_price, products, utm } = eventData;
      const phone = customer.phone_number;
      
      // Normalize phone number (remove any formatting)
      const normalizedPhone = phone.replace(/\D/g, '');
      
      // Find or create client
      let client = await this.getClientByPhone(normalizedPhone);
      if (!client) {
        client = await this.createClient({
          name: customer.name,
          email: customer.email || null,
          phone: normalizedPhone,
        });
      }

      // Parse price to decimal
      const priceString = total_price.replace(/[^\d,]/g, '').replace(',', '.');
      const price = parseFloat(priceString);

      // Get product name
      const productName = products[0]?.name || 'Produto não especificado';

      switch (event) {
        case 'PIX_GENERATED':
          // Create pending sale
          await this.createSale({
            clientId: client.id,
            saleId: sale_id,
            product: productName,
            value: price.toString(),
            status: 'pending',
            paymentMethod: payment_method,
            eventType: event,
            utmCampaign: utm?.utm_campaign || null,
            utmMedium: utm?.utm_medium || null,
            utmContent: utm?.utm_content || null,
            originalPrice: total_price,
          });
          return { success: true, message: 'PIX gerado registrado com sucesso' };

        case 'SALE_APPROVED':
          // Check if client has previous abandoned cart or pending PIX
          const previousSales = await db.select().from(sales)
            .where(eq(sales.clientId, client.id))
            .orderBy(desc(sales.date));

          let status = 'realized';
          let message = 'Venda aprovada registrada';

          // Check if this is a recovery
          const hasAbandonedCart = previousSales.some(sale => 
            sale.eventType === 'ABANDONED_CART' || sale.status === 'lost'
          );
          const hasPendingPix = previousSales.some(sale => 
            sale.eventType === 'PIX_GENERATED' && sale.status === 'pending'
          );

          if (hasAbandonedCart || hasPendingPix) {
            status = 'recovered';
            message = 'Venda recuperada registrada com sucesso';
          }

          // Update pending PIX if exists
          if (hasPendingPix) {
            await db.update(sales)
              .set({ status: 'recovered', eventType: event, saleId: sale_id })
              .where(and(
                eq(sales.clientId, client.id),
                eq(sales.status, 'pending')
              ));
          } else {
            // Create new sale
            await this.createSale({
              clientId: client.id,
              saleId: sale_id,
              product: productName,
              value: price.toString(),
              status,
              paymentMethod: payment_method,
              eventType: event,
              utmCampaign: utm?.utm_campaign || null,
              utmMedium: utm?.utm_medium || null,
              utmContent: utm?.utm_content || null,
              originalPrice: total_price,
            });
          }

          return { success: true, message };

        case 'ABANDONED_CART':
          // Create lost sale
          await this.createSale({
            clientId: client.id,
            saleId: sale_id || null,
            product: productName,
            value: price.toString(),
            status: 'lost',
            paymentMethod: payment_method || null,
            eventType: event,
            utmCampaign: utm?.utm_campaign || null,
            utmMedium: utm?.utm_medium || null,
            utmContent: utm?.utm_content || null,
            originalPrice: total_price,
          });
          return { success: true, message: 'Carrinho abandonado registrado' };

        default:
          return { success: false, message: 'Tipo de evento não reconhecido' };
      }
    } catch (error) {
      console.error('Error processing webhook event:', error);
      return { success: false, message: 'Erro ao processar evento do webhook' };
    }
  }
}

export const storage = new DatabaseStorage();
