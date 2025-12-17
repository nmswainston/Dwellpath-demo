/**
 * Centralized API Client
 * 
 * In demo mode (VITE_DEMO_MODE=true), returns mock data.
 * Otherwise, makes real API calls to the server.
 */

import type {
  User,
  ResidencyLog,
  Expense,
  JournalEntry,
  AiChat,
  Alert,
  Property,
  AuditDocument,
  UserPreferences,
  OnboardingTour,
  OnboardingStep,
  Feedback,
} from "@shared/schema";

import { demoData as seedDemoData } from "./mockData";

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

// Demo data storage (in-memory, mutable during a session)
// NOTE: structuredClone is supported in modern browsers; fallback keeps dev working.
const mockData = (() => {
  try {
    return structuredClone(seedDemoData);
  } catch {
    return JSON.parse(JSON.stringify(seedDemoData)) as typeof seedDemoData;
  }
})();

// Helper to generate IDs
function generateId(): string {
  return `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Helper to simulate realistic network delay (so loaders feel legit)
function delay(minMs: number = 250, maxMs: number = 600): Promise<void> {
  const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Real API call wrapper
async function realApiCall<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }

  return res.json();
}

// Auth API
export const authApi = {
  getUser: async (): Promise<User> => {
    if (DEMO_MODE) {
      await delay();
      return mockData.user;
    }
    return realApiCall<User>("/api/auth/user");
  },
};

// Dashboard API
export const dashboardApi = {
  getStats: async (): Promise<{
    totalDaysTracked: number;
    activeStates: number;
    estimatedTaxSavings: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  }> => {
    if (DEMO_MODE) {
      await delay();
      return {
        totalDaysTracked: 165,
        activeStates: 2,
        estimatedTaxSavings: 12500,
        riskLevel: 'low',
      };
    }
    return realApiCall("/api/dashboard/stats");
  },

  getResidencyStats: async (year?: number): Promise<Array<{
    state: string;
    totalDays: number;
    daysRemaining: number;
    isAtRisk: boolean;
  }>> => {
    if (DEMO_MODE) {
      await delay();
      return [
        { state: "FL", totalDays: 120, daysRemaining: 63, isAtRisk: false },
        { state: "NY", totalDays: 45, daysRemaining: 138, isAtRisk: false },
      ];
    }
    const url = year ? `/api/dashboard/residency-stats?year=${year}` : "/api/dashboard/residency-stats";
    return realApiCall(url);
  },
};

// Residency Logs API
export const residencyLogsApi = {
  getAll: async (year?: number): Promise<ResidencyLog[]> => {
    if (DEMO_MODE) {
      await delay();
      return mockData.residencyLogs.filter(log => {
        if (!year) return true;
        const logYear = new Date(log.startDate).getFullYear();
        return logYear === year;
      });
    }
    const url = year ? `/api/residency-logs?year=${year}` : "/api/residency-logs";
    return realApiCall(url);
  },

  create: async (log: Omit<ResidencyLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<ResidencyLog> => {
    if (DEMO_MODE) {
      await delay();
      const newLog = {
        ...log,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as ResidencyLog;
      mockData.residencyLogs.push(newLog);
      return newLog;
    }
    return realApiCall("/api/residency-logs", {
      method: "POST",
      body: JSON.stringify(log),
    });
  },

  update: async (id: string, updates: Partial<ResidencyLog>): Promise<ResidencyLog> => {
    if (DEMO_MODE) {
      await delay();
      const index = mockData.residencyLogs.findIndex(log => log.id === id);
      if (index === -1) throw new Error("Residency log not found");
      mockData.residencyLogs[index] = {
        ...mockData.residencyLogs[index],
        ...updates,
        updatedAt: new Date(),
      };
      return mockData.residencyLogs[index];
    }
    return realApiCall(`/api/residency-logs/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  delete: async (id: string): Promise<void> => {
    if (DEMO_MODE) {
      await delay();
      const index = mockData.residencyLogs.findIndex(log => log.id === id);
      if (index !== -1) {
        mockData.residencyLogs.splice(index, 1);
      }
      return;
    }
    await realApiCall(`/api/residency-logs/${id}`, {
      method: "DELETE",
    });
  },
};

// Expenses API
export const expensesApi = {
  getAll: async (state?: string, year?: number): Promise<Expense[]> => {
    if (DEMO_MODE) {
      await delay();
      return mockData.expenses.filter(exp => {
        if (state && exp.state !== state) return false;
        if (year) {
          const expYear = new Date(exp.expenseDate).getFullYear();
          return expYear === year;
        }
        return true;
      });
    }
    const params = new URLSearchParams();
    if (state) params.append("state", state);
    if (year) params.append("year", String(year));
    const url = `/api/expenses${params.toString() ? `?${params}` : ""}`;
    return realApiCall(url);
  },

  create: async (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense> => {
    if (DEMO_MODE) {
      await delay();
      const newExpense = {
        ...expense,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Expense;
      mockData.expenses.push(newExpense);
      return newExpense;
    }
    return realApiCall("/api/expenses", {
      method: "POST",
      body: JSON.stringify(expense),
    });
  },

  update: async (id: string, updates: Partial<Expense>): Promise<Expense> => {
    if (DEMO_MODE) {
      await delay();
      const index = mockData.expenses.findIndex(exp => exp.id === id);
      if (index === -1) throw new Error("Expense not found");
      mockData.expenses[index] = {
        ...mockData.expenses[index],
        ...updates,
        updatedAt: new Date(),
      };
      return mockData.expenses[index];
    }
    return realApiCall(`/api/expenses/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  delete: async (id: string): Promise<void> => {
    if (DEMO_MODE) {
      await delay();
      const index = mockData.expenses.findIndex(exp => exp.id === id);
      if (index !== -1) {
        mockData.expenses.splice(index, 1);
      }
      return;
    }
    await realApiCall(`/api/expenses/${id}`, {
      method: "DELETE",
    });
  },
};

// Journal API
export const journalApi = {
  getAll: async (limit?: number): Promise<JournalEntry[]> => {
    if (DEMO_MODE) {
      await delay();
      const entries = [...mockData.journalEntries];
      return limit ? entries.slice(0, limit) : entries;
    }
    const url = limit ? `/api/journal-entries?limit=${limit}` : "/api/journal-entries";
    return realApiCall(url);
  },

  create: async (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<JournalEntry> => {
    if (DEMO_MODE) {
      await delay();
      const newEntry = {
        ...entry,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as JournalEntry;
      mockData.journalEntries.push(newEntry);
      return newEntry;
    }
    return realApiCall("/api/journal-entries", {
      method: "POST",
      body: JSON.stringify(entry),
    });
  },

  update: async (id: string, updates: Partial<JournalEntry>): Promise<JournalEntry> => {
    if (DEMO_MODE) {
      await delay();
      const index = mockData.journalEntries.findIndex(entry => entry.id === id);
      if (index === -1) throw new Error("Journal entry not found");
      mockData.journalEntries[index] = {
        ...mockData.journalEntries[index],
        ...updates,
        updatedAt: new Date(),
      };
      return mockData.journalEntries[index];
    }
    return realApiCall(`/api/journal-entries/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  delete: async (id: string): Promise<void> => {
    if (DEMO_MODE) {
      await delay();
      const index = mockData.journalEntries.findIndex(entry => entry.id === id);
      if (index !== -1) {
        mockData.journalEntries.splice(index, 1);
      }
      return;
    }
    await realApiCall(`/api/journal-entries/${id}`, {
      method: "DELETE",
    });
  },
};

// AI API
export const aiApi = {
  getChats: async (limit?: number): Promise<AiChat[]> => {
    if (DEMO_MODE) {
      await delay();
      const chats = [...mockData.aiChats];
      return limit ? chats.slice(0, limit) : chats;
    }
    const url = limit ? `/api/ai/chats?limit=${limit}` : "/api/ai/chats";
    return realApiCall(url);
  },

  chat: async (message: string): Promise<{
    userMessage: string;
    aiResponse: string;
    timestamp: string | Date;
  }> => {
    if (DEMO_MODE) {
      await delay(450, 900); // Simulate AI processing time
      const response =
        `Here’s a demo response for: “${message}”\n\n` +
        `Based on your current pattern, you’re comfortably below the 183‑day threshold in NY. ` +
        `To stay audit‑ready, consolidate NY trips, keep Florida domicile ties current (homestead, DL, voter registration), ` +
        `and retain 2–3 proof points per month (utilities, appointments, statements).`;
      const now = new Date();
      const chat = {
        id: generateId(),
        userId: mockData.user.id,
        userMessage: message,
        aiResponse: response,
        createdAt: now,
      } as AiChat;
      mockData.aiChats.unshift(chat);
      return {
        userMessage: message,
        aiResponse: response,
        timestamp: now.toISOString(),
      };
    }
    const result = await realApiCall<{
      userMessage: string;
      aiResponse: string;
      timestamp: string | Date;
    }>("/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({ message }),
    });
    // Ensure timestamp is a string
    if (result.timestamp instanceof Date) {
      result.timestamp = result.timestamp.toISOString();
    }
    return result;
  },

  complianceSummary: async (year: number): Promise<string> => {
    if (DEMO_MODE) {
      await delay(450, 900);
      return (
        `Compliance summary (${year})\n\n` +
        `You’re in good standing. No 183‑day threshold risks detected based on your current entries.\n\n` +
        `Recommended next steps:\n` +
        `- Consolidate NY trips\n` +
        `- Maintain FL proof points monthly\n` +
        `- Export an audit package quarterly`
      );
    }
    return realApiCall("/api/ai/compliance-summary", {
      method: "POST",
      body: JSON.stringify({ year }),
    });
  },

  auditLetter: async (state: string, year: number): Promise<{ letter: string }> => {
    if (DEMO_MODE) {
      await delay(450, 900);
      return {
        letter:
          `Re: Non‑Residency Statement — ${state} (${year})\n\n` +
          `This is a demo letter. In a production build, this would be generated using your verified logs, ` +
          `supporting documentation, and audit‑ready language tailored to ${state}.`,
      };
    }
    return realApiCall("/api/ai/audit-letter", {
      method: "POST",
      body: JSON.stringify({ state, year }),
    });
  },
};

// Alerts API
export const alertsApi = {
  getAll: async (unreadOnly?: boolean): Promise<Alert[]> => {
    if (DEMO_MODE) {
      await delay();
      let alerts = [...mockData.alerts];
      if (unreadOnly) {
        alerts = alerts.filter(alert => !alert.isRead);
      }
      return alerts;
    }
    const url = unreadOnly ? "/api/alerts?unreadOnly=true" : "/api/alerts";
    return realApiCall(url);
  },

  markAsRead: async (id: string): Promise<void> => {
    if (DEMO_MODE) {
      await delay();
      const alert = mockData.alerts.find(a => a.id === id);
      if (alert) {
        alert.isRead = true;
      }
      return;
    }
    await realApiCall(`/api/alerts/${id}/read`, {
      method: "PUT",
    });
  },

  delete: async (id: string): Promise<void> => {
    if (DEMO_MODE) {
      await delay();
      const index = mockData.alerts.findIndex(alert => alert.id === id);
      if (index !== -1) {
        mockData.alerts.splice(index, 1);
      }
      return;
    }
    await realApiCall(`/api/alerts/${id}`, {
      method: "DELETE",
    });
  },
};

// Properties API
export const propertiesApi = {
  getAll: async (): Promise<Property[]> => {
    if (DEMO_MODE) {
      await delay();
      return mockData.properties;
    }
    return realApiCall("/api/properties");
  },

  create: async (property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Promise<Property> => {
    if (DEMO_MODE) {
      await delay();
      const newProperty = {
        ...property,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Property;
      mockData.properties.push(newProperty);
      return newProperty;
    }
    return realApiCall("/api/properties", {
      method: "POST",
      body: JSON.stringify(property),
    });
  },

  update: async (id: string, updates: Partial<Property>): Promise<Property> => {
    if (DEMO_MODE) {
      await delay();
      const index = mockData.properties.findIndex(prop => prop.id === id);
      if (index === -1) throw new Error("Property not found");
      mockData.properties[index] = {
        ...mockData.properties[index],
        ...updates,
        updatedAt: new Date(),
      };
      return mockData.properties[index];
    }
    return realApiCall(`/api/properties/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  delete: async (id: string): Promise<void> => {
    if (DEMO_MODE) {
      await delay();
      const index = mockData.properties.findIndex(prop => prop.id === id);
      if (index !== -1) {
        mockData.properties.splice(index, 1);
      }
      return;
    }
    await realApiCall(`/api/properties/${id}`, {
      method: "DELETE",
    });
  },
};

// Audit Documents API
export const auditDocumentsApi = {
  getAll: async (): Promise<AuditDocument[]> => {
    if (DEMO_MODE) {
      await delay();
      return mockData.auditDocuments;
    }
    return realApiCall("/api/audit-documents");
  },

  generate: async (documentType: string, taxYear: number, state?: string): Promise<Blob> => {
    if (DEMO_MODE) {
      await delay(1500);
      // Return a mock PDF blob
      const mockPdfContent = `%PDF-1.4\nDemo PDF for ${documentType} - ${taxYear}${state ? ` - ${state}` : ""}`;
      return new Blob([mockPdfContent], { type: "application/pdf" });
    }
    const response = await fetch("/api/audit-documents/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ documentType, taxYear, state }),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`${response.status}: ${text}`);
    }
    return response.blob();
  },

  delete: async (id: string): Promise<void> => {
    if (DEMO_MODE) {
      await delay();
      const index = mockData.auditDocuments.findIndex(doc => doc.id === id);
      if (index !== -1) {
        mockData.auditDocuments.splice(index, 1);
      }
      return;
    }
    await realApiCall(`/api/audit-documents/${id}`, {
      method: "DELETE",
    });
  },
};

// User Preferences API
export const preferencesApi = {
  get: async (): Promise<UserPreferences | null> => {
    if (DEMO_MODE) {
      await delay();
      return mockData.preferences;
    }
    return realApiCall("/api/user/preferences");
  },

  update: async (preferences: Partial<UserPreferences>): Promise<UserPreferences> => {
    if (DEMO_MODE) {
      await delay();
      if (!mockData.preferences) {
        mockData.preferences = {
          id: generateId(),
          userId: mockData.user.id,
          theme: "system",
          sidebarCollapsed: false,
          notificationsEnabled: true,
          compactMode: false,
          language: "en",
          timezone: "America/New_York",
          dateFormat: "MM/dd/yyyy",
          currency: "USD",
          createdAt: new Date(),
          updatedAt: new Date(),
        } as UserPreferences;
      }
      mockData.preferences = {
        ...mockData.preferences,
        ...preferences,
        updatedAt: new Date(),
      };
      return mockData.preferences;
    }
    return realApiCall("/api/user/preferences", {
      method: "PUT",
      body: JSON.stringify(preferences),
    });
  },
};

// Onboarding API
export const onboardingApi = {
  getTour: async (tourType?: string): Promise<OnboardingTour | null> => {
    if (DEMO_MODE) {
      await delay();
      return mockData.onboardingTour;
    }
    const url = tourType ? `/api/onboarding/tour?type=${tourType}` : "/api/onboarding/tour";
    return realApiCall(url);
  },

  getSteps: async (tourId: string): Promise<OnboardingStep[]> => {
    if (DEMO_MODE) {
      await delay();
      return mockData.onboardingSteps.filter(step => step.tourId === tourId);
    }
    return realApiCall(`/api/onboarding/tour/${tourId}/steps`);
  },

  startTour: async (userProfile: any, tourType?: string): Promise<{ tour: OnboardingTour; steps: OnboardingStep[] }> => {
    if (DEMO_MODE) {
      await delay();
      const tour = {
        id: generateId(),
        userId: mockData.user.id,
        tourType: tourType || "initial",
        currentStep: 0,
        totalSteps: 6,
        isCompleted: false,
        personalizedRecommendations: [],
        userProfile,
        progress: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      } as OnboardingTour;
      mockData.onboardingTour = tour;
      const steps: OnboardingStep[] = [
        {
          id: generateId(),
          tourId: tour.id,
          stepNumber: 1,
          stepType: "welcome",
          title: "Welcome to Dwellpath",
          description: "A polished demo experience with realistic mock data.",
          targetElement: null,
          content: {
            headline: "Precision residency tracking, made elegant.",
            bullets: [
              "Track days across states",
              "Capture audit-ready proof points",
              "Stay ahead of 183-day thresholds",
            ],
          },
          isCompleted: false,
          completedAt: null,
          createdAt: new Date(),
        } as OnboardingStep,
        {
          id: generateId(),
          tourId: tour.id,
          stepNumber: 2,
          stepType: "profile_setup",
          title: "Your profile",
          description: "We’ll tailor the dashboard for your residency pattern.",
          targetElement: "#profile-form",
          content: {
            primaryState: userProfile?.primaryState || "FL",
            secondaryState: userProfile?.secondaryState || "NY",
            riskTolerance: userProfile?.riskTolerance || "medium",
          },
          isCompleted: false,
          completedAt: null,
          createdAt: new Date(),
        } as OnboardingStep,
        {
          id: generateId(),
          tourId: tour.id,
          stepNumber: 3,
          stepType: "feature_intro",
          title: "Dashboard highlights",
          description: "Key signals at a glance.",
          targetElement: "#sidebar-navigation",
          content: { features: ["Residency Logs", "Alerts", "Export", "AI Assistant"] },
          isCompleted: false,
          completedAt: null,
          createdAt: new Date(),
        } as OnboardingStep,
        {
          id: generateId(),
          tourId: tour.id,
          stepNumber: 4,
          stepType: "recommendation",
          title: "Recommended next steps",
          description: "Demo recommendations that feel product-ready.",
          targetElement: null,
          content: {
            recommendations: [
              {
                id: "rec_001",
                type: "strategy",
                priority: "high",
                title: "Consolidate NY trips",
                description: "Fewer, longer trips reduce accidental day creep and simplify documentation.",
                actionItems: ["Batch meetings", "Prefer Zoom for low-stakes touchpoints"],
              },
              {
                id: "rec_002",
                type: "tip",
                priority: "medium",
                title: "Capture monthly proof points",
                description: "2–3 proof points per month is a strong habit for audit readiness.",
                actionItems: ["Save utility bill PDF", "Keep appointment receipts"],
              },
            ],
          },
          isCompleted: false,
          completedAt: null,
          createdAt: new Date(),
        } as OnboardingStep,
        {
          id: generateId(),
          tourId: tour.id,
          stepNumber: 5,
          stepType: "feature_intro",
          title: "Set up your tracking",
          description: "Log days and keep your portfolio tidy.",
          targetElement: "#residency-logs",
          content: { setupTasks: ["Log a trip", "Review alerts", "Export a report"] },
          isCompleted: false,
          completedAt: null,
          createdAt: new Date(),
        } as OnboardingStep,
        {
          id: generateId(),
          tourId: tour.id,
          stepNumber: 6,
          stepType: "completion",
          title: "You’re all set",
          description: "Explore the app—everything runs without a backend in Demo Mode.",
          targetElement: null,
          content: { nextSteps: ["Open Dashboard", "Try AI Assistant", "Export a compliance summary"] },
          isCompleted: false,
          completedAt: null,
          createdAt: new Date(),
        } as OnboardingStep,
      ];

      mockData.onboardingSteps = steps;
      return { tour, steps };
    }
    return realApiCall("/api/onboarding/tour/start", {
      method: "POST",
      body: JSON.stringify({ userProfile, tourType }),
    });
  },

  completeStep: async (stepId: string): Promise<OnboardingStep> => {
    if (DEMO_MODE) {
      await delay();
      const step = mockData.onboardingSteps.find(s => s.id === stepId);
      if (!step) throw new Error("Step not found");
      step.isCompleted = true;
      step.completedAt = new Date();
      return step;
    }
    return realApiCall(`/api/onboarding/step/${stepId}/complete`, {
      method: "POST",
    });
  },

  updateTour: async (tourId: string, updates: Partial<OnboardingTour>): Promise<OnboardingTour> => {
    if (DEMO_MODE) {
      await delay();
      if (mockData.onboardingTour && mockData.onboardingTour.id === tourId) {
        mockData.onboardingTour = {
          ...mockData.onboardingTour,
          ...updates,
          updatedAt: new Date(),
        };
        return mockData.onboardingTour;
      }
      throw new Error("Tour not found");
    }
    return realApiCall(`/api/onboarding/tour/${tourId}/update`, {
      method: "POST",
      body: JSON.stringify(updates),
    });
  },
};

// Feedback API
export const feedbackApi = {
  getAll: async (): Promise<Feedback[]> => {
    if (DEMO_MODE) {
      await delay();
      return mockData.feedback;
    }
    return realApiCall("/api/feedback");
  },

  create: async (feedback: { type: string; message: string; page: string }): Promise<Feedback> => {
    if (DEMO_MODE) {
      await delay();
      const newFeedback = {
        userId: mockData.user.id,
        type: feedback.type,
        message: feedback.message,
        page: feedback.page,
        status: "open",
        priority: "medium",
        adminNotes: null,
        resolvedAt: null,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Feedback;
      mockData.feedback.push(newFeedback);
      return newFeedback;
    }
    return realApiCall("/api/feedback", {
      method: "POST",
      body: JSON.stringify(feedback),
    });
  },
};

// User API
export const userApi = {
  completeOnboarding: async (onboardingData: any): Promise<User> => {
    if (DEMO_MODE) {
      await delay();
      mockData.user = {
        ...mockData.user,
        ...onboardingData,
        onboardingCompleted: true,
        onboardingCompletedAt: new Date(),
      };
      return mockData.user;
    }
    return realApiCall("/api/user/onboarding", {
      method: "POST",
      body: JSON.stringify(onboardingData),
    });
  },
};

