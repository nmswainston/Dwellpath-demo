import {
  users,
  residencyLogs,
  expenses,
  journalEntries,
  aiChats,
  alerts,
  auditDocuments,
  feedback,
  onboardingTours,
  onboardingSteps,
  type User,
  type UpsertUser,
  type ResidencyLog,
  type InsertResidencyLog,
  type Expense,
  type InsertExpense,
  type JournalEntry,
  type InsertJournalEntry,
  type AiChat,
  type InsertAiChat,
  type Alert,
  type InsertAlert,
  type AuditDocument,
  type InsertAuditDocument,
  type Feedback,
  type InsertFeedback,
  type OnboardingTour,
  type InsertOnboardingTour,
  type OnboardingStep,
  type InsertOnboardingStep,
  properties,
  type Property,
  type InsertPropertyType,
  userPreferences,
  type UserPreferences,
  type InsertUserPreferences,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import { HAS_DATABASE } from "./config";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  completeOnboarding(userId: string, onboardingData: any): Promise<User>;
  
  // Residency logs
  getResidencyLogs(userId: string, year?: number): Promise<ResidencyLog[]>;
  createResidencyLog(log: InsertResidencyLog): Promise<ResidencyLog>;
  updateResidencyLog(id: string, log: Partial<InsertResidencyLog>): Promise<ResidencyLog>;
  deleteResidencyLog(id: string): Promise<void>;
  
  // Get residency stats by state and year
  getResidencyStats(userId: string, year?: number): Promise<Array<{
    state: string;
    totalDays: number;
    daysRemaining: number;
    isAtRisk: boolean;
  }>>;
  
  // Expenses
  getExpenses(userId: string, state?: string, year?: number): Promise<Expense[]>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: string, expense: Partial<InsertExpense>): Promise<Expense>;
  deleteExpense(id: string): Promise<void>;
  
  // Journal entries
  getJournalEntries(userId: string, limit?: number): Promise<JournalEntry[]>;
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  updateJournalEntry(id: string, entry: Partial<InsertJournalEntry>): Promise<JournalEntry>;
  deleteJournalEntry(id: string): Promise<void>;
  
  // AI chat history
  getAiChats(userId: string, limit?: number): Promise<AiChat[]>;
  createAiChat(chat: InsertAiChat): Promise<AiChat>;
  
  // Alerts
  getAlerts(userId: string, unreadOnly?: boolean): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  markAlertAsRead(id: string): Promise<void>;
  
  // Dashboard analytics
  getDashboardStats(userId: string): Promise<{
    totalDaysTracked: number;
    activeStates: number;
    estimatedTaxSavings: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  }>;

  // Audit document methods
  getAuditDocuments(userId: string): Promise<AuditDocument[]>;
  createAuditDocument(document: InsertAuditDocument): Promise<AuditDocument>;
  deleteAuditDocument(id: string): Promise<void>;

  // Properties
  getPropertiesByUserId(userId: string): Promise<Property[]>;
  createProperty(property: InsertPropertyType): Promise<Property>;
  updateProperty(id: string, userId: string, updates: Partial<InsertPropertyType>): Promise<Property>;
  deleteProperty(id: string, userId: string): Promise<void>;

  // Feedback
  getFeedback(userId: string): Promise<Feedback[]>;
  createFeedback(feedbackData: InsertFeedback): Promise<Feedback>;

  // Helper methods for PDF generation
  getResidencyLogsByYear(userId: string, year: number): Promise<ResidencyLog[]>;
  getResidencyLogsByState(userId: string, state: string, year: number): Promise<ResidencyLog[]>;
  getExpensesByYear(userId: string, year: number, state?: string): Promise<Expense[]>;
  getJournalEntriesByYear(userId: string, year: number): Promise<JournalEntry[]>;
  getJournalEntriesByState(userId: string, state: string, year: number): Promise<JournalEntry[]>;
  
  // User preferences
  getUserPreferences(userId: string): Promise<UserPreferences | undefined>;
  upsertUserPreferences(userId: string, preferences: Partial<InsertUserPreferences>): Promise<UserPreferences>;
  
  // Onboarding tours
  getOnboardingTour(userId: string, tourType?: string): Promise<OnboardingTour | undefined>;
  createOnboardingTour(tour: InsertOnboardingTour): Promise<OnboardingTour>;
  updateOnboardingTour(id: string, tour: Partial<InsertOnboardingTour>): Promise<OnboardingTour>;
  getOnboardingSteps(tourId: string): Promise<OnboardingStep[]>;
  createOnboardingStep(step: InsertOnboardingStep): Promise<OnboardingStep>;
  updateOnboardingStep(id: string, step: Partial<InsertOnboardingStep>): Promise<OnboardingStep>;
  completeOnboardingStep(stepId: string): Promise<OnboardingStep>;
}

class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async completeOnboarding(userId: string, onboardingData: any): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({
        userType: onboardingData.userType,
        firstName: onboardingData.firstName,
        lastName: onboardingData.lastName,
        primaryState: onboardingData.primaryState,
        secondaryState: onboardingData.secondaryState,
        taxYear: onboardingData.taxYear,
        riskTolerance: onboardingData.riskTolerance,
        notifications: onboardingData.notifications,
        onboardingCompleted: true,
        onboardingCompletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async getResidencyLogs(userId: string, year?: number): Promise<ResidencyLog[]> {
    if (year) {
      return await db.select().from(residencyLogs)
        .where(and(
          eq(residencyLogs.userId, userId),
          gte(residencyLogs.startDate, `${year}-01-01`),
          lte(residencyLogs.endDate, `${year}-12-31`)
        ))
        .orderBy(desc(residencyLogs.startDate));
    }
    
    return await db.select().from(residencyLogs)
      .where(eq(residencyLogs.userId, userId))
      .orderBy(desc(residencyLogs.startDate));
  }

  async createResidencyLog(log: InsertResidencyLog): Promise<ResidencyLog> {
    const [newLog] = await db.insert(residencyLogs).values(log).returning();
    return newLog;
  }

  async updateResidencyLog(id: string, log: Partial<InsertResidencyLog>): Promise<ResidencyLog> {
    const [updatedLog] = await db
      .update(residencyLogs)
      .set({ ...log, updatedAt: new Date() })
      .where(eq(residencyLogs.id, id))
      .returning();
    return updatedLog;
  }

  async deleteResidencyLog(id: string): Promise<void> {
    await db.delete(residencyLogs).where(eq(residencyLogs.id, id));
  }

  async getResidencyStats(userId: string, year: number = new Date().getFullYear()): Promise<Array<{
    state: string;
    totalDays: number;
    daysRemaining: number;
    isAtRisk: boolean;
  }>> {
    const logs = await this.getResidencyLogs(userId, year);
    const stateStats = new Map<string, number>();
    
    logs.forEach(log => {
      const start = new Date(log.startDate);
      const end = new Date(log.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      stateStats.set(log.state, (stateStats.get(log.state) || 0) + days);
    });
    
    return Array.from(stateStats.entries()).map(([state, totalDays]) => ({
      state,
      totalDays,
      daysRemaining: Math.max(0, 183 - totalDays),
      isAtRisk: totalDays > 150, // Warning at 150 days
    }));
  }

  async getExpenses(userId: string, state?: string, year?: number): Promise<Expense[]> {
    let conditions = [eq(expenses.userId, userId)];
    
    if (state) {
      conditions.push(eq(expenses.state, state));
    }
    
    if (year) {
      conditions.push(
        gte(expenses.expenseDate, `${year}-01-01`),
        lte(expenses.expenseDate, `${year}-12-31`)
      );
    }
    
    return await db.select().from(expenses)
      .where(and(...conditions))
      .orderBy(desc(expenses.expenseDate));
  }

  async createExpense(expense: InsertExpense): Promise<Expense> {
    const [newExpense] = await db.insert(expenses).values(expense).returning();
    return newExpense;
  }

  async updateExpense(id: string, expense: Partial<InsertExpense>): Promise<Expense> {
    const [updatedExpense] = await db
      .update(expenses)
      .set({ ...expense, updatedAt: new Date() })
      .where(eq(expenses.id, id))
      .returning();
    return updatedExpense;
  }

  async deleteExpense(id: string): Promise<void> {
    await db.delete(expenses).where(eq(expenses.id, id));
  }

  async getJournalEntries(userId: string, limit: number = 50): Promise<JournalEntry[]> {
    return await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId))
      .orderBy(desc(journalEntries.entryDate))
      .limit(limit);
  }

  async createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry> {
    const [newEntry] = await db.insert(journalEntries).values(entry).returning();
    return newEntry;
  }

  async updateJournalEntry(id: string, entry: Partial<InsertJournalEntry>): Promise<JournalEntry> {
    const [updatedEntry] = await db
      .update(journalEntries)
      .set({ ...entry, updatedAt: new Date() })
      .where(eq(journalEntries.id, id))
      .returning();
    return updatedEntry;
  }

  async deleteJournalEntry(id: string): Promise<void> {
    await db.delete(journalEntries).where(eq(journalEntries.id, id));
  }

  async getAiChats(userId: string, limit: number = 50): Promise<AiChat[]> {
    return await db
      .select()
      .from(aiChats)
      .where(eq(aiChats.userId, userId))
      .orderBy(desc(aiChats.createdAt))
      .limit(limit);
  }

  async createAiChat(chat: InsertAiChat): Promise<AiChat> {
    const [newChat] = await db.insert(aiChats).values(chat).returning();
    return newChat;
  }

  async getAlerts(userId: string, unreadOnly: boolean = false): Promise<Alert[]> {
    if (unreadOnly) {
      return await db.select().from(alerts)
        .where(and(eq(alerts.userId, userId), eq(alerts.isRead, false)))
        .orderBy(desc(alerts.createdAt));
    }
    
    return await db.select().from(alerts)
      .where(eq(alerts.userId, userId))
      .orderBy(desc(alerts.createdAt));
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const [newAlert] = await db.insert(alerts).values(alert).returning();
    return newAlert;
  }

  async markAlertAsRead(id: string): Promise<void> {
    await db.update(alerts).set({ isRead: true }).where(eq(alerts.id, id));
  }

  async deleteAlert(id: string): Promise<void> {
    await db.delete(alerts).where(eq(alerts.id, id));
  }

  async getDashboardStats(userId: string): Promise<{
    totalDaysTracked: number;
    activeStates: number;
    estimatedTaxSavings: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  }> {
    const currentYear = new Date().getFullYear();
    const logs = await this.getResidencyLogs(userId, currentYear);
    const stateStats = await this.getResidencyStats(userId, currentYear);
    
    const totalDaysTracked = logs.reduce((total, log) => {
      const start = new Date(log.startDate);
      const end = new Date(log.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return total + days;
    }, 0);
    
    const activeStates = stateStats.length;
    
    // Calculate estimated tax savings based on high-tax state avoidance
    const highTaxStates = ['NY', 'CA', 'NJ', 'CT', 'HI'];
    const estimatedTaxSavings = stateStats
      .filter(stat => highTaxStates.includes(stat.state) && stat.totalDays < 183)
      .reduce((total) => total + 15000, 0); // Rough estimate per high-tax state avoided
    
    // Determine risk level
    const maxRisk = Math.max(...stateStats.map(stat => stat.totalDays / 183));
    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    
    if (maxRisk >= 1) riskLevel = 'critical';
    else if (maxRisk >= 0.9) riskLevel = 'high';
    else if (maxRisk >= 0.75) riskLevel = 'medium';
    else riskLevel = 'low';
    
    return {
      totalDaysTracked,
      activeStates,
      estimatedTaxSavings,
      riskLevel,
    };
  }

  // Audit document methods
  async getAuditDocuments(userId: string): Promise<AuditDocument[]> {
    return await db
      .select()
      .from(auditDocuments)
      .where(eq(auditDocuments.userId, userId))
      .orderBy(desc(auditDocuments.createdAt));
  }

  async createAuditDocument(document: InsertAuditDocument): Promise<AuditDocument> {
    const [newDocument] = await db.insert(auditDocuments).values(document).returning();
    return newDocument;
  }

  async deleteAuditDocument(id: string): Promise<void> {
    await db.delete(auditDocuments).where(eq(auditDocuments.id, id));
  }

  // Helper methods for PDF generation
  async getResidencyLogsByYear(userId: string, year: number): Promise<ResidencyLog[]> {
    return await db
      .select()
      .from(residencyLogs)
      .where(
        and(
          eq(residencyLogs.userId, userId),
          gte(residencyLogs.startDate, `${year}-01-01`),
          lte(residencyLogs.endDate, `${year}-12-31`)
        )
      )
      .orderBy(residencyLogs.startDate);
  }

  async getResidencyLogsByState(userId: string, state: string, year: number): Promise<ResidencyLog[]> {
    return await db
      .select()
      .from(residencyLogs)
      .where(
        and(
          eq(residencyLogs.userId, userId),
          eq(residencyLogs.state, state),
          gte(residencyLogs.startDate, `${year}-01-01`),
          lte(residencyLogs.endDate, `${year}-12-31`)
        )
      )
      .orderBy(residencyLogs.startDate);
  }

  async getExpensesByYear(userId: string, year: number, state?: string): Promise<Expense[]> {
    const conditions = [
      eq(expenses.userId, userId),
      gte(expenses.expenseDate, `${year}-01-01`),
      lte(expenses.expenseDate, `${year}-12-31`)
    ];

    if (state) {
      conditions.push(eq(expenses.state, state));
    }

    return await db
      .select()
      .from(expenses)
      .where(and(...conditions))
      .orderBy(expenses.expenseDate);
  }

  async getJournalEntriesByYear(userId: string, year: number): Promise<JournalEntry[]> {
    return await db
      .select()
      .from(journalEntries)
      .where(
        and(
          eq(journalEntries.userId, userId),
          gte(journalEntries.entryDate, `${year}-01-01`),
          lte(journalEntries.entryDate, `${year}-12-31`)
        )
      )
      .orderBy(journalEntries.entryDate);
  }

  async getJournalEntriesByState(userId: string, state: string, year: number): Promise<JournalEntry[]> {
    return await db
      .select()
      .from(journalEntries)
      .where(
        and(
          eq(journalEntries.userId, userId),
          eq(journalEntries.state, state),
          gte(journalEntries.entryDate, `${year}-01-01`),
          lte(journalEntries.entryDate, `${year}-12-31`)
        )
      )
      .orderBy(journalEntries.entryDate);
  }

  // Properties
  async getPropertiesByUserId(userId: string): Promise<Property[]> {
    return await db.select()
      .from(properties)
      .where(eq(properties.userId, userId))
      .orderBy(desc(properties.createdAt));
  }

  async createProperty(propertyData: InsertPropertyType): Promise<Property> {
    const [property] = await db
      .insert(properties)
      .values(propertyData)
      .returning();
    return property;
  }

  async updateProperty(id: string, userId: string, updates: Partial<InsertPropertyType>): Promise<Property> {
    const [property] = await db
      .update(properties)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(properties.id, id), eq(properties.userId, userId)))
      .returning();
    
    if (!property) {
      throw new Error("Property not found or access denied");
    }
    
    return property;
  }

  async deleteProperty(id: string, userId: string): Promise<void> {
    await db
      .delete(properties)
      .where(and(eq(properties.id, id), eq(properties.userId, userId)));
  }

  // Feedback methods
  async getFeedback(userId: string): Promise<Feedback[]> {
    return await db.select()
      .from(feedback)
      .where(eq(feedback.userId, userId))
      .orderBy(desc(feedback.createdAt));
  }

  async createFeedback(feedbackData: InsertFeedback): Promise<Feedback> {
    const [newFeedback] = await db
      .insert(feedback)
      .values(feedbackData)
      .returning();
    return newFeedback;
  }

  // User preferences methods
  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    const [preferences] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));
    return preferences;
  }

  async upsertUserPreferences(userId: string, preferences: Partial<InsertUserPreferences>): Promise<UserPreferences> {
    const [result] = await db
      .insert(userPreferences)
      .values({ ...preferences, userId })
      .onConflictDoUpdate({
        target: userPreferences.userId,
        set: {
          ...preferences,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result;
  }

  // Onboarding tour methods
  async getOnboardingTour(userId: string, tourType?: string): Promise<OnboardingTour | undefined> {
    const conditions = [eq(onboardingTours.userId, userId)];
    if (tourType) {
      conditions.push(eq(onboardingTours.tourType, tourType));
    }
    
    const [tour] = await db
      .select()
      .from(onboardingTours)
      .where(and(...conditions))
      .orderBy(desc(onboardingTours.createdAt))
      .limit(1);
    return tour;
  }

  async createOnboardingTour(tour: InsertOnboardingTour): Promise<OnboardingTour> {
    const [newTour] = await db
      .insert(onboardingTours)
      .values(tour)
      .returning();
    return newTour;
  }

  async updateOnboardingTour(id: string, tour: Partial<InsertOnboardingTour>): Promise<OnboardingTour> {
    const [updatedTour] = await db
      .update(onboardingTours)
      .set({ ...tour, updatedAt: new Date() })
      .where(eq(onboardingTours.id, id))
      .returning();
    
    if (!updatedTour) {
      throw new Error("Onboarding tour not found");
    }
    
    return updatedTour;
  }

  async getOnboardingSteps(tourId: string): Promise<OnboardingStep[]> {
    return await db
      .select()
      .from(onboardingSteps)
      .where(eq(onboardingSteps.tourId, tourId))
      .orderBy(onboardingSteps.stepNumber);
  }

  async createOnboardingStep(step: InsertOnboardingStep): Promise<OnboardingStep> {
    const [newStep] = await db
      .insert(onboardingSteps)
      .values(step)
      .returning();
    return newStep;
  }

  async updateOnboardingStep(id: string, step: Partial<InsertOnboardingStep>): Promise<OnboardingStep> {
    const [updatedStep] = await db
      .update(onboardingSteps)
      .set({ ...step })
      .where(eq(onboardingSteps.id, id))
      .returning();
    
    if (!updatedStep) {
      throw new Error("Onboarding step not found");
    }
    
    return updatedStep;
  }

  async completeOnboardingStep(stepId: string): Promise<OnboardingStep> {
    const [completedStep] = await db
      .update(onboardingSteps)
      .set({ 
        isCompleted: true,
        completedAt: new Date(),
      })
      .where(eq(onboardingSteps.id, stepId))
      .returning();
    
    if (!completedStep) {
      throw new Error("Onboarding step not found");
    }
    
    return completedStep;
  }
}

// Export mock or real storage based on database availability
import { MockStorage } from "./mock-storage";

export const storage = HAS_DATABASE 
  ? new DatabaseStorage() 
  : new MockStorage();
