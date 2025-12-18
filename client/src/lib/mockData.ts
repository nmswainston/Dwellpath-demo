/**
 * Demo-mode data that feels real.
 * Used when VITE_DEMO_MODE=true (no backend required).
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

const now = new Date();
const currentYear = now.getFullYear();

type DemoData = {
  user: User;
  residencyLogs: ResidencyLog[];
  expenses: Expense[];
  journalEntries: JournalEntry[];
  aiChats: AiChat[];
  alerts: Alert[];
  properties: Property[];
  auditDocuments: AuditDocument[];
  preferences: UserPreferences | null;
  onboardingTour: OnboardingTour | null;
  onboardingSteps: OnboardingStep[];
  feedback: Feedback[];
};

/**
 * IMPORTANT:
 * - `amount` is a decimal in the DB schema, but comes across to the client as a string in many setups.
 *   This demo data uses strings like "84.20" to keep things realistic.
 * - Date columns (e.g. startDate/expenseDate) are represented as YYYY-MM-DD strings.
 */
export const demoData: DemoData = {
  user: {
    id: "demo-user-axc_019",
    email: "alex.chen@dwellpath.demo",
    firstName: "Alexander",
    lastName: "Chen",
    profileImageUrl: null,
    userType: "snowbird",
    primaryState: "FL",
    secondaryState: "NY",
    taxYear: String(currentYear),
    riskTolerance: "medium",
    notifications: true,
    onboardingCompleted: true,
    onboardingCompletedAt: now,
    createdAt: new Date(currentYear, 0, 3),
    updatedAt: now,
  } as User,

  residencyLogs: [
    {
      id: "rl_001",
      userId: "demo-user-axc_019",
      state: "FL",
      startDate: `${currentYear}-01-08`,
      endDate: `${currentYear}-02-02`,
      purpose: "Primary residence",
      notes: "Settled in Naples. Utility bills + HOA statements saved for audit binder.",
      isAutoDetected: false,
      latitude: null,
      longitude: null,
      accuracy: null,
      createdAt: new Date(currentYear, 0, 8),
      updatedAt: now,
    } as ResidencyLog,
    {
      id: "rl_002",
      userId: "demo-user-axc_019",
      state: "NY",
      startDate: `${currentYear}-02-11`,
      endDate: `${currentYear}-02-18`,
      purpose: "Business meetings",
      notes:
        "Client on-sites + board dinner. Keep receipts and calendar entries. Long note edge case: This entry intentionally includes a longer narrative to verify wrapping, line-height, and layout resilience across cards, tables, and detail views without feeling like placeholder text.",
      isAutoDetected: true,
      latitude: "40.7127760",
      longitude: "-74.0059740",
      accuracy: "42.50",
      createdAt: new Date(currentYear, 1, 11),
      updatedAt: now,
    } as ResidencyLog,
    {
      id: "rl_003",
      userId: "demo-user-axc_019",
      state: "FL",
      startDate: `${currentYear}-03-01`,
      endDate: `${currentYear}-03-22`,
      purpose: "Primary residence",
      notes: "Routine month: medical appointments + home maintenance.",
      isAutoDetected: false,
      latitude: null,
      longitude: null,
      accuracy: null,
      createdAt: new Date(currentYear, 2, 1),
      updatedAt: now,
    } as ResidencyLog,
    {
      id: "rl_004",
      userId: "demo-user-axc_019",
      state: "NY",
      startDate: `${currentYear}-04-07`,
      endDate: `${currentYear}-04-12`,
      purpose: "Family",
      notes: "Quick visit. Ensure days-in-state remain below comfort threshold.",
      isAutoDetected: false,
      latitude: null,
      longitude: null,
      accuracy: null,
      createdAt: new Date(currentYear, 3, 7),
      updatedAt: now,
    } as ResidencyLog,
    {
      id: "rl_005",
      userId: "demo-user-axc_019",
      state: "FL",
      startDate: `${currentYear}-05-02`,
      endDate: `${currentYear}-05-26`,
      purpose: "Primary residence",
      notes: "Collected domicile tie documentation (DL, voter reg, homestead).",
      isAutoDetected: false,
      latitude: null,
      longitude: null,
      accuracy: null,
      createdAt: new Date(currentYear, 4, 2),
      updatedAt: now,
    } as ResidencyLog,
  ],

  expenses: [
    {
      id: "ex_001",
      userId: "demo-user-axc_019",
      state: "NY",
      amount: "84.20",
      category: "Dining",
      description: "Client dinner (Midtown)",
      expenseDate: `${currentYear}-02-12`,
      receiptUrl: null,
      createdAt: new Date(currentYear, 1, 12),
      updatedAt: now,
    } as Expense,
    {
      id: "ex_002",
      userId: "demo-user-axc_019",
      state: "NY",
      amount: "212.60",
      category: "Transportation",
      description: "Car service (airport transfers)",
      expenseDate: `${currentYear}-02-14`,
      receiptUrl: null,
      createdAt: new Date(currentYear, 1, 14),
      updatedAt: now,
    } as Expense,
    {
      id: "ex_003",
      userId: "demo-user-axc_019",
      state: "FL",
      amount: "148.00",
      category: "Utilities",
      description: "Electric bill — Naples condo",
      expenseDate: `${currentYear}-03-05`,
      receiptUrl: null,
      createdAt: new Date(currentYear, 2, 5),
      updatedAt: now,
    } as Expense,
    {
      id: "ex_004",
      userId: "demo-user-axc_019",
      state: "FL",
      amount: "1290.00",
      category: "Housing",
      description: "HOA dues",
      expenseDate: `${currentYear}-03-10`,
      receiptUrl: null,
      createdAt: new Date(currentYear, 2, 10),
      updatedAt: now,
    } as Expense,
    {
      id: "ex_005",
      userId: "demo-user-axc_019",
      state: "FL",
      amount: "58.44",
      category: "Travel",
      description: "Toll + parking (Tampa day trip)",
      expenseDate: `${currentYear}-05-06`,
      receiptUrl: null,
      createdAt: new Date(currentYear, 4, 6),
      updatedAt: now,
    } as Expense,
    {
      id: "ex_006",
      userId: "demo-user-axc_019",
      state: "NY",
      amount: "36.19",
      category: "Dining",
      description: "Coffee meetings (3x)",
      expenseDate: `${currentYear}-04-10`,
      receiptUrl: null,
      createdAt: new Date(currentYear, 3, 10),
      updatedAt: now,
    } as Expense,
  ],

  journalEntries: [
    {
      id: "je_001",
      userId: "demo-user-axc_019",
      entryDate: `${currentYear}-02-12`,
      state: "NY",
      title: "NYC work trip — notes",
      content:
        "Kept a tight schedule. Saved calendar events + receipts. Reminder: avoid unnecessary days; fly out early when possible.",
      category: "work",
      createdAt: new Date(currentYear, 1, 12),
      updatedAt: now,
    } as JournalEntry,
    {
      id: "je_002",
      userId: "demo-user-axc_019",
      entryDate: `${currentYear}-03-09`,
      state: "FL",
      title: "Home maintenance + domicile ties",
      content:
        "Collected homestead exemption letter, updated voter registration, and filed updated insurance declarations page.",
      category: "housing",
      createdAt: new Date(currentYear, 2, 9),
      updatedAt: now,
    } as JournalEntry,
    {
      id: "je_003",
      userId: "demo-user-axc_019",
      entryDate: `${currentYear}-05-03`,
      state: "FL",
      title: "Travel plan for summer",
      content:
        "Plan: keep NY under 60 days total this year. Consider shifting meetings to Zoom and consolidating on-sites into one trip.",
      category: "travel",
      createdAt: new Date(currentYear, 4, 3),
      updatedAt: now,
    } as JournalEntry,
  ],

  aiChats: [
    {
      id: "ai_001",
      userId: "demo-user-axc_019",
      userMessage: "How many more days can I spend in NY this year?",
      aiResponse:
        "Based on your current log, you’re well under the 183‑day threshold. For audit safety, consider a conservative internal cap (e.g., 120 days) and document your Florida domicile ties throughout the year.",
      createdAt: new Date(currentYear, 4, 8),
    } as AiChat,
  ],

  alerts: [
    {
      id: "al_001",
      userId: "demo-user-axc_019",
      type: "threshold_warning",
      state: "NY",
      title: "NY day-count check-in",
      message:
        "You’re trending safely, but keep business trips consolidated. Consider setting an internal cap for NY days for audit resilience.",
      isRead: false,
      severity: "medium",
      createdAt: new Date(currentYear, 4, 10),
    } as Alert,
    {
      id: "al_002",
      userId: "demo-user-axc_019",
      type: "compliance_alert",
      state: "FL",
      title: "Documentation reminder",
      message:
        "Save two proof points this month (utility bill, bank statement, HOA letter, or medical appointment receipt) to support FL domicile.",
      isRead: true,
      severity: "low",
      createdAt: new Date(currentYear, 2, 20),
    } as Alert,
  ],

  properties: [
    {
      id: "pr_001",
      userId: "demo-user-axc_019",
      name: "Naples Primary Condo",
      address: "820 Gulf Shore Blvd N",
      city: "Naples",
      state: "FL",
      zipCode: "34102",
      propertyType: "primary",
      purchaseDate: "2021-11-18",
      estimatedValue: "1850000.00",
      ownershipPercentage: "100.00",
      isHomestead: true,
      notes: "Homestead filed. Keep annual property tax bill handy.",
      imageUrl: null,
      createdAt: new Date(currentYear, 0, 2),
      updatedAt: now,
    } as Property,
    {
      id: "pr_002",
      userId: "demo-user-axc_019",
      name: "Hudson Valley Retreat",
      address: "14 Orchard Ridge Rd",
      city: "Cold Spring",
      state: "NY",
      zipCode: "10516",
      propertyType: "secondary",
      purchaseDate: "2018-06-04",
      estimatedValue: "920000.00",
      ownershipPercentage: "100.00",
      isHomestead: false,
      notes: "Limit NY days; consolidate visits around holidays.",
      imageUrl: null,
      createdAt: new Date(currentYear, 0, 4),
      updatedAt: now,
    } as Property,
  ],

  auditDocuments: [],

  preferences: {
    id: "pref_001",
    userId: "demo-user-axc_019",
    theme: "system",
    sidebarCollapsed: false,
    notificationsEnabled: true,
    compactMode: false,
    language: "en",
    timezone: "America/New_York",
    dateFormat: "MM/dd/yyyy",
    currency: "USD",
    createdAt: new Date(currentYear, 0, 3),
    updatedAt: now,
  } as UserPreferences,

  onboardingTour: null,
  onboardingSteps: [],
  feedback: [],
};


