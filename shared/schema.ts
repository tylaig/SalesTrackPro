import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: varchar("email", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 50 }),
  company: varchar("company", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  product: varchar("product", { length: 255 }).notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(), // 'realized', 'recovered', 'lost'
  date: timestamp("date").defaultNow().notNull(),
  notes: text("notes"),
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
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
});

export const insertSaleSchema = createInsertSchema(sales).omit({
  id: true,
  date: true,
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
export type Sale = typeof sales.$inferSelect;

export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type SupportTicket = typeof supportTickets.$inferSelect;

// Extended types with relations
export type SaleWithClient = Sale & {
  client: Client;
};

export type SupportTicketWithClient = SupportTicket & {
  client: Client;
};

// Super Admin Tables
export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  features: text("features").notNull().default('[]'),
  maxUsers: integer("max_users").default(0),
  maxWhatsappChips: integer("max_whatsapp_chips").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const webhooks = pgTable("webhooks", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  events: text("events").notNull().default('[]'), // ['payment_pending', 'payment_approved']
  isActive: boolean("is_active").default(true),
  secret: varchar("secret", { length: 100 }),
  lastTriggered: timestamp("last_triggered"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const whatsappChips = pgTable("whatsapp_chips", {
  id: serial("id").primaryKey(),
  chipId: varchar("chip_id", { length: 100 }).notNull().unique(),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("active"), // active, inactive, recovery
  clientId: integer("client_id").references(() => clients.id),
  lastActive: timestamp("last_active"),
  recoveryDate: timestamp("recovery_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userPlans = pgTable("user_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  planId: integer("plan_id").references(() => plans.id),
  isActive: boolean("is_active").default(true),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const webhookEvents = pgTable("webhook_events", {
  id: serial("id").primaryKey(),
  webhookId: integer("webhook_id").references(() => webhooks.id),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  payload: text("payload").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, sent, failed
  responseCode: integer("response_code"),
  responseBody: text("response_body"),
  attempts: integer("attempts").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  sentAt: timestamp("sent_at"),
});

// Relations
export const plansRelations = relations(plans, ({ many }) => ({
  userPlans: many(userPlans),
}));

export const webhooksRelations = relations(webhooks, ({ many }) => ({
  events: many(webhookEvents),
}));

export const whatsappChipsRelations = relations(whatsappChips, ({ one }) => ({
  client: one(clients, {
    fields: [whatsappChips.clientId],
    references: [clients.id],
  }),
}));

export const userPlansRelations = relations(userPlans, ({ one }) => ({
  user: one(users, {
    fields: [userPlans.userId],
    references: [users.id],
  }),
  plan: one(plans, {
    fields: [userPlans.planId],
    references: [plans.id],
  }),
}));

export const webhookEventsRelations = relations(webhookEvents, ({ one }) => ({
  webhook: one(webhooks, {
    fields: [webhookEvents.webhookId],
    references: [webhooks.id],
  }),
}));

// Insert schemas
export const insertPlanSchema = createInsertSchema(plans);
export const insertWebhookSchema = createInsertSchema(webhooks);
export const insertWhatsappChipSchema = createInsertSchema(whatsappChips);
export const insertUserPlanSchema = createInsertSchema(userPlans);
export const insertWebhookEventSchema = createInsertSchema(webhookEvents);

// Types
export type InsertPlan = z.infer<typeof insertPlanSchema>;
export type Plan = typeof plans.$inferSelect;

export type InsertWebhook = z.infer<typeof insertWebhookSchema>;
export type Webhook = typeof webhooks.$inferSelect;

export type InsertWhatsappChip = z.infer<typeof insertWhatsappChipSchema>;
export type WhatsappChip = typeof whatsappChips.$inferSelect;

export type InsertUserPlan = z.infer<typeof insertUserPlanSchema>;
export type UserPlan = typeof userPlans.$inferSelect;

export type InsertWebhookEvent = z.infer<typeof insertWebhookEventSchema>;
export type WebhookEvent = typeof webhookEvents.$inferSelect;

export type UserPlanWithDetails = UserPlan & {
  user: User;
  plan: Plan;
};

export type WebhookWithEvents = Webhook & {
  events: WebhookEvent[];
};

export type WhatsappChipWithClient = WhatsappChip & {
  client?: Client;
};
