import { sql, relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  date,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  // Onboarding data
  userType: varchar("user_type"), // snowbird, remote-worker, property-owner, frequent-traveler
  primaryState: varchar("primary_state"),
  secondaryState: varchar("secondary_state"),
  taxYear: varchar("tax_year").default("2024"),
  riskTolerance: varchar("risk_tolerance").default("medium"), // conservative, medium, aggressive
  notifications: boolean("notifications").default(true),
  // Premium features (to be added in future migrations)
  // subscriptionTier: varchar("subscription_tier").default("free"), // free, premium, concierge  
  // autoLocationTracking: boolean("auto_location_tracking").default(false),
  // netWorth: varchar("net_worth"), // For wealth-focused features
  // primaryAccountant: varchar("primary_accountant"), // CPA contact info
  onboardingCompleted: boolean("onboarding_completed").default(false),
  onboardingCompletedAt: timestamp("onboarding_completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Residency day logs
export const residencyLogs = pgTable("residency_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  state: varchar("state", { length: 2 }).notNull(), // State abbreviation (CA, NY, etc.)
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  purpose: text("purpose"), // Business, vacation, family, etc.
  notes: text("notes"),
  isAutoDetected: boolean("is_auto_detected").default(false), // GPS-detected vs manual entry
  latitude: decimal("latitude", { precision: 10, scale: 7 }), // Location coordinates
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  accuracy: decimal("accuracy", { precision: 8, scale: 2 }), // GPS accuracy in meters
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Location tracking events
export const locationEvents = pgTable("location_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  eventType: varchar("event_type").notNull(), // 'enter' or 'exit'
  state: varchar("state", { length: 2 }).notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: decimal("longitude", { precision: 10, scale: 7 }).notNull(),
  accuracy: decimal("accuracy", { precision: 8, scale: 2 }).notNull(),
  timestamp: timestamp("timestamp").notNull(),
  processed: boolean("processed").default(false), // Whether this event created a residency log
  createdAt: timestamp("created_at").defaultNow(),
});

// State-based expenses
export const expenses = pgTable("expenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  state: varchar("state", { length: 2 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  category: varchar("category").notNull(), // Hotel, dining, transportation, etc.
  description: text("description"),
  expenseDate: date("expense_date").notNull(),
  receiptUrl: text("receipt_url"), // Optional receipt storage
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Residency journal entries
export const journalEntries = pgTable("journal_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  entryDate: date("entry_date").notNull(),
  state: varchar("state", { length: 2 }),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  category: varchar("category").notNull(), // travel, housing, work, medical, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI chat history
export const aiChats = pgTable("ai_chats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  userMessage: text("user_message").notNull(),
  aiResponse: text("ai_response").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User alerts and notifications
export const alerts = pgTable("alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type").notNull(), // threshold_warning, compliance_alert, etc.
  state: varchar("state", { length: 2 }),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  severity: varchar("severity").default("medium"), // low, medium, high, critical
  createdAt: timestamp("created_at").defaultNow(),
});

// Properties and assets tracking (wealth-focused feature)
export const properties = pgTable("properties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(), // Property name/title
  address: text("address").notNull(),
  city: varchar("city").notNull(),
  state: varchar("state", { length: 2 }).notNull(),
  zipCode: varchar("zip_code"),
  propertyType: varchar("property_type").notNull(), // primary, secondary, investment, rental
  purchaseDate: date("purchase_date"),
  estimatedValue: decimal("estimated_value", { precision: 12, scale: 2 }),
  ownershipPercentage: decimal("ownership_percentage", { precision: 5, scale: 2 }).default("100.00"),
  isHomestead: boolean("is_homestead").default(false),
  notes: text("notes"),
  imageUrl: text("image_url"), // Property photo URL
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Sticky ties tracking for residency determination
export const stickyTies = pgTable("sticky_ties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  state: varchar("state", { length: 2 }).notNull(),
  tieType: varchar("tie_type").notNull(), // drivers_license, voter_registration, bank_accounts, etc.
  description: text("description"),
  establishedDate: date("established_date"),
  isActive: boolean("is_active").default(true),
  weight: integer("weight").default(1), // Importance score for residency determination
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Premium subscription tracking
export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tier: varchar("tier").notNull(), // free, premium, concierge
  status: varchar("status").notNull(), // active, cancelled, past_due
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  features: text("features").array(), // Enabled features for this subscription
  monthlyPrice: decimal("monthly_price", { precision: 8, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Concierge service requests (premium feature)
export const conciergeRequests = pgTable("concierge_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  requestType: varchar("request_type").notNull(), // consultation, audit_prep, tax_planning
  priority: varchar("priority").default("medium"), // low, medium, high, urgent
  subject: varchar("subject").notNull(),
  description: text("description").notNull(),
  status: varchar("status").default("pending"), // pending, assigned, in_progress, completed
  assignedTo: varchar("assigned_to"), // Staff member handling the request
  estimatedHours: decimal("estimated_hours", { precision: 4, scale: 2 }),
  actualHours: decimal("actual_hours", { precision: 4, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  residencyLogs: many(residencyLogs),
  expenses: many(expenses),
  journalEntries: many(journalEntries),
  aiChats: many(aiChats),
  alerts: many(alerts),
  locationEvents: many(locationEvents),
  auditDocuments: many(auditDocuments),
  properties: many(properties),
  stickyTies: many(stickyTies),
  subscriptions: many(subscriptions),
  conciergeRequests: many(conciergeRequests),
  preferences: one(userPreferences, {
    fields: [users.id],
    references: [userPreferences.userId],
  }),
  onboardingTours: many(onboardingTours),
}));

export const residencyLogsRelations = relations(residencyLogs, ({ one }) => ({
  user: one(users, {
    fields: [residencyLogs.userId],
    references: [users.id],
  }),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  user: one(users, {
    fields: [expenses.userId],
    references: [users.id],
  }),
}));

export const journalEntriesRelations = relations(journalEntries, ({ one }) => ({
  user: one(users, {
    fields: [journalEntries.userId],
    references: [users.id],
  }),
}));

export const aiChatsRelations = relations(aiChats, ({ one }) => ({
  user: one(users, {
    fields: [aiChats.userId],
    references: [users.id],
  }),
}));

export const alertsRelations = relations(alerts, ({ one }) => ({
  user: one(users, {
    fields: [alerts.userId],
    references: [users.id],
  }),
}));

export const locationEventsRelations = relations(locationEvents, ({ one }) => ({
  user: one(users, {
    fields: [locationEvents.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertResidencyLogSchema = createInsertSchema(residencyLogs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAiChatSchema = createInsertSchema(aiChats).omit({
  id: true,
  createdAt: true,
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
});

export const insertLocationEventSchema = createInsertSchema(locationEvents).omit({
  id: true,
  createdAt: true,
});

// New wealth-focused insert schemas
export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type exports for properties (consolidated with other types at end of file)

export const insertStickyTieSchema = createInsertSchema(stickyTies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertConciergeRequestSchema = createInsertSchema(conciergeRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Audit documents table
export const auditDocuments = pgTable("audit_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  documentType: varchar("document_type").notNull(), // 'full_audit_package', 'state_summary', 'expense_report', etc.
  taxYear: integer("tax_year").notNull(),
  state: varchar("state", { length: 2 }), // Optional: specific state focus
  title: varchar("title").notNull(),
  description: text("description"),
  pdfUrl: text("pdf_url"), // Storage URL for generated PDF
  generatedAt: timestamp("generated_at").defaultNow(),
  metadata: jsonb("metadata"), // Additional document metadata
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAuditDocumentSchema = createInsertSchema(auditDocuments).omit({
  id: true,
  createdAt: true,
});

// Relations for audit documents
export const auditDocumentsRelations = relations(auditDocuments, ({ one }) => ({
  user: one(users, {
    fields: [auditDocuments.userId],
    references: [users.id],
  }),
}));

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Onboarding tours table
export const onboardingTours = pgTable("onboarding_tours", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  tourType: varchar("tour_type").notNull(), // 'initial', 'feature_discovery', 'advanced'
  currentStep: integer("current_step").default(0),
  totalSteps: integer("total_steps").notNull(),
  isCompleted: boolean("is_completed").default(false),
  personalizedRecommendations: jsonb("personalized_recommendations"), // AI-generated recommendations
  userProfile: jsonb("user_profile"), // User's answers to onboarding questions
  progress: jsonb("progress").default(sql`'{}'::jsonb`), // Step completion tracking
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Onboarding steps table
export const onboardingSteps = pgTable("onboarding_steps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tourId: varchar("tour_id").notNull().references(() => onboardingTours.id),
  stepNumber: integer("step_number").notNull(),
  stepType: varchar("step_type").notNull(), // 'welcome', 'profile_setup', 'feature_intro', 'recommendation', 'completion'
  title: varchar("title").notNull(),
  description: text("description"),
  targetElement: varchar("target_element"), // CSS selector for UI element to highlight
  content: jsonb("content"), // Step-specific content and instructions
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type OnboardingTour = typeof onboardingTours.$inferSelect;
export type InsertOnboardingTour = typeof onboardingTours.$inferInsert;
export type OnboardingStep = typeof onboardingSteps.$inferSelect;
export type InsertOnboardingStep = typeof onboardingSteps.$inferInsert;

// User preferences table for personalized UI settings
export const userPreferences = pgTable("user_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  theme: varchar("theme").default("system"),
  sidebarCollapsed: boolean("sidebar_collapsed").default(false),
  notificationsEnabled: boolean("notifications_enabled").default(true),
  compactMode: boolean("compact_mode").default(false),
  language: varchar("language").default("en"),
  timezone: varchar("timezone").default("America/New_York"),
  dateFormat: varchar("date_format").default("MM/dd/yyyy"),
  currency: varchar("currency").default("USD"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));



export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = typeof userPreferences.$inferInsert;

// Additional relations for new wealth-focused tables
export const propertiesRelations = relations(properties, ({ one }) => ({
  user: one(users, {
    fields: [properties.userId],
    references: [users.id],
  }),
}));

export const stickyTiesRelations = relations(stickyTies, ({ one }) => ({
  user: one(users, {
    fields: [stickyTies.userId],
    references: [users.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

export const conciergeRequestsRelations = relations(conciergeRequests, ({ one }) => ({
  user: one(users, {
    fields: [conciergeRequests.userId],
    references: [users.id],
  }),
}));

// Type exports for new wealth-focused tables
export type Property = typeof properties.$inferSelect;
export type InsertPropertyType = z.infer<typeof insertPropertySchema>;

export type StickyTie = typeof stickyTies.$inferSelect;
export type InsertStickyTie = z.infer<typeof insertStickyTieSchema>;

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

export type ConciergeRequest = typeof conciergeRequests.$inferSelect;
export type InsertConciergeRequest = z.infer<typeof insertConciergeRequestSchema>;

// Feedback table
export const feedback = pgTable("feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type").notNull(), // 'positive', 'negative', 'bug', 'suggestion', 'general'
  message: text("message").notNull(),
  page: varchar("page").notNull(), // The page/route where feedback was submitted
  status: varchar("status").default("open"), // 'open', 'in-progress', 'resolved', 'closed'
  priority: varchar("priority").default("medium"), // 'low', 'medium', 'high', 'critical'
  adminNotes: text("admin_notes"), // Internal notes for team
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const feedbackRelations = relations(feedback, ({ one }) => ({
  user: one(users, {
    fields: [feedback.userId],
    references: [users.id],
  }),
}));

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  priority: true,
  adminNotes: true,
  resolvedAt: true,
});

export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = typeof feedback.$inferInsert;
export type ResidencyLog = typeof residencyLogs.$inferSelect;
export type InsertResidencyLog = z.infer<typeof insertResidencyLogSchema>;
export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type AiChat = typeof aiChats.$inferSelect;
export type InsertAiChat = z.infer<typeof insertAiChatSchema>;
export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type LocationEvent = typeof locationEvents.$inferSelect;
export type InsertLocationEvent = z.infer<typeof insertLocationEventSchema>;
export type AuditDocument = typeof auditDocuments.$inferSelect;
export type InsertAuditDocument = z.infer<typeof insertAuditDocumentSchema>;

// State Risk Scorecard Schema
export const stateRiskProfiles = pgTable("state_risk_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  state: varchar("state", { length: 2 }).notNull(),
  stateName: varchar("state_name", { length: 50 }).notNull(),
  
  // Sticky ties tracking
  driversLicense: boolean("drivers_license").default(false),
  homeOwnership: boolean("home_ownership").default(false),
  voterRegistration: boolean("voter_registration").default(false),
  bankAccounts: boolean("bank_accounts").default(false),
  professionalLicense: boolean("professional_license").default(false),
  
  // Risk assessment
  riskScore: integer("risk_score").default(0),
  riskLevel: varchar("risk_level", { length: 20 }).default("unknown"),
  
  // Metadata
  lastCalculated: timestamp("last_calculated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const stateRiskProfilesRelations = relations(stateRiskProfiles, ({ one }) => ({
  user: one(users, {
    fields: [stateRiskProfiles.userId],
    references: [users.id],
  }),
}));



export const insertStateRiskProfileSchema = createInsertSchema(stateRiskProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type StateRiskProfile = typeof stateRiskProfiles.$inferSelect;
export type InsertStateRiskProfile = z.infer<typeof insertStateRiskProfileSchema>;
