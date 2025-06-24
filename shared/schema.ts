import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  password: varchar("password", { length: 100 }).notNull(),
  role: varchar("role", { length: 20 }).default("user"),
  isActive: boolean("is_active").default(true),
  requirePasswordChange: boolean("require_password_change").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }).notNull().unique(), // Phone as unique identifier
  company: varchar("company", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => clients.id),
  saleId: varchar("sale_id", { length: 50 }), // External sale ID from webhook
  product: varchar("product", { length: 255 }).notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(), // pending, realized, recovered, lost
  paymentMethod: varchar("payment_method", { length: 100 }),
  eventType: varchar("event_type", { length: 50 }), // PIX_GENERATED, SALE_APPROVED, ABANDONED_CART
  recoverySource: varchar("recovery_source", { length: 20 }), // 'pix' | 'cart'
  utmCampaign: text("utm_campaign"),
  utmMedium: text("utm_medium"),
  utmContent: text("utm_content"),
  originalPrice: varchar("original_price", { length: 50 }), // Store as received "R$ 97,90"
  date: timestamp("date").defaultNow().notNull(),
});

export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  description: text("description").notNull(),
  priority: varchar("priority", { length: 20 }).notNull(), // 'low', 'medium', 'high', 'urgent'
  status: varchar("status", { length: 20 }).notNull(), // 'open', 'in_progress', 'closed'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const clientsRelations = relations(clients, ({ many }) => ({
  sales: many(sales),
  supportTickets: many(supportTickets),
}));

export const salesRelations = relations(sales, ({ one }) => ({
  client: one(clients, {
    fields: [sales.clientId],
    references: [clients.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  // users don't have direct tickets anymore
}));

export const supportTicketsRelations = relations(supportTickets, ({ one }) => ({
  client: one(clients, {
    fields: [supportTickets.clientId],
    references: [clients.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
});

export const insertSaleSchema = createInsertSchema(sales).omit({
  id: true,
  date: true,
}).extend({
  recoverySource: z.string().optional(),
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;

export type InsertSale = z.infer<typeof insertSaleSchema>;
export type Sale = typeof sales.$inferSelect & {
  saleId?: string | null;
  eventType?: string | null;
  recoverySource?: string | null;
  utmCampaign?: string | null;
  utmMedium?: string | null;
  utmContent?: string | null;
  originalPrice?: string | null;
};

export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type SupportTicket = typeof supportTickets.$inferSelect;

// Extended types with relations
export type SaleWithClient = Sale & {
  client: Client;
};

export type SupportTicketWithClient = SupportTicket & {
  client: Client;
};



// Client event history table
export const clientEvents = pgTable("client_events", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id, { onDelete: "cascade" }),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  transactionId: varchar("transaction_id", { length: 255 }),
  saleId: integer("sale_id").references(() => sales.id, { onDelete: "cascade" }),
  product: varchar("product", { length: 255 }),
  value: decimal("value", { precision: 10, scale: 2 }),
  paymentMethod: varchar("payment_method", { length: 100 }),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations

export const clientEventsRelations = relations(clientEvents, ({ one }) => ({
  client: one(clients, {
    fields: [clientEvents.clientId],
    references: [clients.id],
  }),
  sale: one(sales, {
    fields: [clientEvents.saleId],
    references: [sales.id],
  }),
}));

// Insert schemas
export const insertClientEventSchema = createInsertSchema(clientEvents);

// Types
export type InsertClientEvent = z.infer<typeof insertClientEventSchema>;
export type ClientEvent = typeof clientEvents.$inferSelect;

export type ClientWithEvents = Client & {
  events: ClientEvent[];
};
