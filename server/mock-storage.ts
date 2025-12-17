/**
 * Mock storage implementation for NO_DB mode
 * Returns safe placeholder data for all endpoints
 */

import type { IStorage } from "./storage";
import type {
  User,
  UpsertUser,
  ResidencyLog,
  InsertResidencyLog,
  Expense,
  InsertExpense,
  JournalEntry,
  InsertJournalEntry,
  AiChat,
  InsertAiChat,
  Alert,
  InsertAlert,
  AuditDocument,
  InsertAuditDocument,
  Feedback,
  InsertFeedback,
  OnboardingTour,
  InsertOnboardingTour,
  OnboardingStep,
  InsertOnboardingStep,
  Property,
  InsertPropertyType,
  UserPreferences,
  InsertUserPreferences,
} from "@shared/schema";

export class MockStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return {
      id,
      email: "dev@dwellpath.local",
      firstName: "Dev",
      lastName: "User",
      profileImageUrl: null,
      userType: null,
      primaryState: null,
      secondaryState: null,
      taxYear: String(new Date().getFullYear()),
      riskTolerance: "medium",
      notifications: true,
      onboardingCompleted: false,
      onboardingCompletedAt: null,
      createdAt: new Date(),
    } as User;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    return {
      ...userData,
      createdAt: new Date(),
    } as User;
  }

  async completeOnboarding(userId: string, onboardingData: any): Promise<User> {
    const user = await this.getUser(userId);
    return {
      ...user!,
      ...onboardingData,
      onboardingCompleted: true,
      onboardingCompletedAt: new Date(),
    } as User;
  }

  // Residency logs
  async getResidencyLogs(_userId: string, _year?: number): Promise<ResidencyLog[]> {
    return [];
  }

  async createResidencyLog(log: InsertResidencyLog): Promise<ResidencyLog> {
    return {
      ...log,
      id: `mock-${Date.now()}`,
      createdAt: new Date(),
    } as ResidencyLog;
  }

  async updateResidencyLog(id: string, log: Partial<InsertResidencyLog>): Promise<ResidencyLog> {
    return {
      id,
      ...log,
    } as ResidencyLog;
  }

  async deleteResidencyLog(_id: string): Promise<void> {
    // Mock: no-op
  }

  async getResidencyStats(_userId: string, _year?: number): Promise<Array<{
    state: string;
    totalDays: number;
    daysRemaining: number;
    isAtRisk: boolean;
  }>> {
    return [];
  }

  // Expenses
  async getExpenses(_userId: string, _state?: string, _year?: number): Promise<Expense[]> {
    return [];
  }

  async createExpense(expense: InsertExpense): Promise<Expense> {
    return {
      ...expense,
      id: `mock-${Date.now()}`,
      createdAt: new Date(),
    } as Expense;
  }

  async updateExpense(id: string, expense: Partial<InsertExpense>): Promise<Expense> {
    return {
      id,
      ...expense,
    } as Expense;
  }

  async deleteExpense(_id: string): Promise<void> {
    // Mock: no-op
  }

  // Journal entries
  async getJournalEntries(_userId: string, _limit?: number): Promise<JournalEntry[]> {
    return [];
  }

  async createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry> {
    return {
      ...entry,
      id: `mock-${Date.now()}`,
      createdAt: new Date(),
    } as JournalEntry;
  }

  async updateJournalEntry(id: string, entry: Partial<InsertJournalEntry>): Promise<JournalEntry> {
    return {
      id,
      ...entry,
    } as JournalEntry;
  }

  async deleteJournalEntry(_id: string): Promise<void> {
    // Mock: no-op
  }

  // AI chat history
  async getAiChats(_userId: string, _limit?: number): Promise<AiChat[]> {
    return [];
  }

  async createAiChat(chat: InsertAiChat): Promise<AiChat> {
    return {
      ...chat,
      id: `mock-${Date.now()}`,
      createdAt: new Date(),
    } as AiChat;
  }

  // Alerts
  async getAlerts(_userId: string, _unreadOnly?: boolean): Promise<Alert[]> {
    return [];
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    return {
      ...alert,
      id: `mock-${Date.now()}`,
      isRead: false,
      createdAt: new Date(),
    } as Alert;
  }

  async markAlertAsRead(_id: string): Promise<void> {
    // Mock: no-op
  }

  async deleteAlert(_id: string): Promise<void> {
    // Mock: no-op
  }

  // Dashboard analytics
  async getDashboardStats(_userId: string): Promise<{
    totalDaysTracked: number;
    activeStates: number;
    estimatedTaxSavings: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  }> {
    return {
      totalDaysTracked: 0,
      activeStates: 0,
      estimatedTaxSavings: 0,
      riskLevel: 'low',
    };
  }

  // Audit documents
  async getAuditDocuments(_userId: string): Promise<AuditDocument[]> {
    return [];
  }

  async createAuditDocument(document: InsertAuditDocument): Promise<AuditDocument> {
    return {
      ...document,
      id: `mock-${Date.now()}`,
      createdAt: new Date(),
    } as AuditDocument;
  }

  async deleteAuditDocument(_id: string): Promise<void> {
    // Mock: no-op
  }

  // Properties
  async getPropertiesByUserId(_userId: string): Promise<Property[]> {
    return [];
  }

  async createProperty(propertyData: InsertPropertyType): Promise<Property> {
    return {
      ...propertyData,
      id: `mock-${Date.now()}`,
      createdAt: new Date(),
    } as Property;
  }

  async updateProperty(id: string, _userId: string, updates: Partial<InsertPropertyType>): Promise<Property> {
    return {
      id,
      ...updates,
    } as Property;
  }

  async deleteProperty(_id: string, _userId: string): Promise<void> {
    // Mock: no-op
  }

  // Feedback
  async getFeedback(_userId: string): Promise<Feedback[]> {
    return [];
  }

  async createFeedback(feedbackData: InsertFeedback): Promise<Feedback> {
    return {
      ...feedbackData,
      id: `mock-${Date.now()}`,
      createdAt: new Date(),
    } as Feedback;
  }

  // User preferences
  async getUserPreferences(_userId: string): Promise<UserPreferences | undefined> {
    return undefined;
  }

  async upsertUserPreferences(userId: string, preferences: Partial<InsertUserPreferences>): Promise<UserPreferences> {
    return {
      userId,
      ...preferences,
      createdAt: new Date(),
    } as UserPreferences;
  }

  // Onboarding tour methods
  async getOnboardingTour(_userId: string, _tourType?: string): Promise<OnboardingTour | undefined> {
    return undefined;
  }

  async createOnboardingTour(tour: InsertOnboardingTour): Promise<OnboardingTour> {
    return {
      ...tour,
      id: `mock-${Date.now()}`,
      createdAt: new Date(),
    } as OnboardingTour;
  }

  async updateOnboardingTour(id: string, tour: Partial<InsertOnboardingTour>): Promise<OnboardingTour> {
    return {
      id,
      ...tour,
    } as OnboardingTour;
  }

  async getOnboardingSteps(_tourId: string): Promise<OnboardingStep[]> {
    return [];
  }

  async createOnboardingStep(step: InsertOnboardingStep): Promise<OnboardingStep> {
    return {
      ...step,
      id: `mock-${Date.now()}`,
      createdAt: new Date(),
    } as OnboardingStep;
  }

  async updateOnboardingStep(id: string, step: Partial<InsertOnboardingStep>): Promise<OnboardingStep> {
    return {
      id,
      ...step,
    } as OnboardingStep;
  }

  async completeOnboardingStep(stepId: string): Promise<OnboardingStep> {
    // Return a minimal valid OnboardingStep with required fields
    return {
      id: stepId,
      tourId: "mock-tour-id",
      stepNumber: 1,
      stepType: "completion",
      title: "Completed",
      description: null,
      targetElement: null,
      content: null,
      isCompleted: true,
      completedAt: new Date(),
      createdAt: new Date(),
    } as OnboardingStep;
  }

  // Helper methods for PDF generation (not in interface but used by routes)
  async getResidencyLogsByYear(_userId: string, _year: number): Promise<ResidencyLog[]> {
    return [];
  }

  async getResidencyLogsByState(_userId: string, _state: string, _year: number): Promise<ResidencyLog[]> {
    return [];
  }

  async getExpensesByYear(_userId: string, _year: number, _state?: string): Promise<Expense[]> {
    return [];
  }

  async getJournalEntriesByYear(_userId: string, _year: number): Promise<JournalEntry[]> {
    return [];
  }

  async getJournalEntriesByState(_userId: string, _state: string, _year: number): Promise<JournalEntry[]> {
    return [];
  }
}

