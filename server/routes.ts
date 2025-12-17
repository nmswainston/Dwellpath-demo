import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { 
  insertResidencyLogSchema, 
  insertExpenseSchema, 
  insertJournalEntrySchema,
  insertAiChatSchema,
  insertFeedbackSchema
} from "@shared/schema";
import { 
  processSnowbirdQuery, 
  generateComplianceSummary,
  generateAuditLetter 
} from "./openai";
import { onboardingAI, type UserProfile } from "./onboardingAI";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);
  
  // Debug: Log all registered routes in dev mode
  if (process.env.NODE_ENV !== "production") {
    console.log("📋 Registered API routes:");
    app._router?.stack?.forEach((middleware: any) => {
      if (middleware.route) {
        console.log(`  ${Object.keys(middleware.route.methods).join(', ').toUpperCase()} ${middleware.route.path}`);
      }
    });
  }

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let user = await storage.getUser(userId);
      
      // Create user if it doesn't exist
      if (!user) {
        user = await storage.upsertUser({
          id: userId,
          email: req.user.claims.email || "dev@dwellpath.local",
          firstName: req.user.claims.first_name || "Dev",
          lastName: req.user.claims.last_name || "User",
          profileImageUrl: req.user.claims.profile_image_url || null,
        });
      }
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User onboarding
  app.post('/api/user/onboarding', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const onboardingData = req.body;
      
      const updatedUser = await storage.completeOnboarding(userId, onboardingData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error completing onboarding:", error);
      res.status(500).json({ message: "Failed to complete onboarding" });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get('/api/dashboard/residency-stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
      const stats = await storage.getResidencyStats(userId, year);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching residency stats:", error);
      res.status(500).json({ message: "Failed to fetch residency stats" });
    }
  });

  // Residency logs routes
  app.get('/api/residency-logs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;
      const logs = await storage.getResidencyLogs(userId, year);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching residency logs:", error);
      res.status(500).json({ message: "Failed to fetch residency logs" });
    }
  });

  app.post('/api/residency-logs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertResidencyLogSchema.parse({ ...req.body, userId });
      const log = await storage.createResidencyLog(validatedData);
      
      // Check for threshold alerts
      const stats = await storage.getResidencyStats(userId);
      const stateStats = stats.find(s => s.state === validatedData.state);
      
      if (stateStats && stateStats.isAtRisk && stateStats.daysRemaining < 30) {
        await storage.createAlert({
          userId,
          type: 'threshold_warning',
          state: validatedData.state,
          title: `${validatedData.state} Threshold Warning`,
          message: `You have ${stateStats.daysRemaining} days remaining before reaching the 183-day threshold in ${validatedData.state}.`,
          severity: stateStats.daysRemaining < 10 ? 'critical' : 'high',
        });
      }
      
      res.json(log);
    } catch (error) {
      console.error("Error creating residency log:", error);
      res.status(400).json({ message: "Failed to create residency log" });
    }
  });

  app.put('/api/residency-logs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertResidencyLogSchema.partial().parse(req.body);
      const log = await storage.updateResidencyLog(id, validatedData);
      res.json(log);
    } catch (error) {
      console.error("Error updating residency log:", error);
      res.status(400).json({ message: "Failed to update residency log" });
    }
  });

  app.delete('/api/residency-logs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteResidencyLog(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting residency log:", error);
      res.status(400).json({ message: "Failed to delete residency log" });
    }
  });

  // Expenses routes
  app.get('/api/expenses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const state = req.query.state as string;
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;
      const expenses = await storage.getExpenses(userId, state, year);
      res.json(expenses);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  app.post('/api/expenses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertExpenseSchema.parse({ ...req.body, userId });
      const expense = await storage.createExpense(validatedData);
      res.json(expense);
    } catch (error) {
      console.error("Error creating expense:", error);
      res.status(400).json({ message: "Failed to create expense" });
    }
  });

  app.put('/api/expenses/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertExpenseSchema.partial().parse(req.body);
      const expense = await storage.updateExpense(id, validatedData);
      res.json(expense);
    } catch (error) {
      console.error("Error updating expense:", error);
      res.status(400).json({ message: "Failed to update expense" });
    }
  });

  app.delete('/api/expenses/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteExpense(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting expense:", error);
      res.status(400).json({ message: "Failed to delete expense" });
    }
  });

  // Journal entries routes
  app.get('/api/journal-entries', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const entries = await storage.getJournalEntries(userId, limit);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      res.status(500).json({ message: "Failed to fetch journal entries" });
    }
  });

  app.post('/api/journal-entries', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertJournalEntrySchema.parse({ ...req.body, userId });
      const entry = await storage.createJournalEntry(validatedData);
      res.json(entry);
    } catch (error) {
      console.error("Error creating journal entry:", error);
      res.status(400).json({ message: "Failed to create journal entry" });
    }
  });

  // AI Assistant routes
  app.get('/api/ai/chats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const chats = await storage.getAiChats(userId, limit);
      res.json(chats);
    } catch (error) {
      console.error("Error fetching AI chats:", error);
      res.status(500).json({ message: "Failed to fetch AI chats" });
    }
  });

  app.post('/api/ai/chat', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      // Get user context for AI
      const [residencyStats, recentExpenses, dashboardStats] = await Promise.all([
        storage.getResidencyStats(userId),
        storage.getExpenses(userId, undefined, new Date().getFullYear()),
        storage.getDashboardStats(userId),
      ]);

      const userContext = {
        residencyStats,
        recentExpenses: recentExpenses.slice(0, 10).map(exp => ({
          state: exp.state,
          amount: exp.amount,
          category: exp.category,
          description: exp.description || '',
        })),
        dashboardStats,
      };

      const aiResponse = await processSnowbirdQuery(message, userContext);
      
      // Save chat to history
      const chat = await storage.createAiChat({
        userId,
        userMessage: message,
        aiResponse,
      });

      res.json({
        userMessage: message,
        aiResponse,
        timestamp: chat.createdAt,
      });
    } catch (error) {
      console.error("Error processing AI chat:", error);
      res.status(500).json({ message: "Failed to process AI chat" });
    }
  });

  app.post('/api/ai/compliance-summary', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const year = req.body.year || new Date().getFullYear();
      
      const residencyStats = await storage.getResidencyStats(userId, year);
      const summary = await generateComplianceSummary(residencyStats, year);
      
      res.json(summary);
    } catch (error) {
      console.error("Error generating compliance summary:", error);
      res.status(500).json({ message: "Failed to generate compliance summary" });
    }
  });

  app.post('/api/ai/audit-letter', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { state, year } = req.body;
      
      if (!state || !year) {
        return res.status(400).json({ message: "State and year are required" });
      }

      const [user, residencyStats] = await Promise.all([
        storage.getUser(userId),
        storage.getResidencyStats(userId, year),
      ]);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const userInfo = {
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
      };

      const letter = await generateAuditLetter(userInfo, residencyStats, state, year);
      res.json({ letter });
    } catch (error) {
      console.error("Error generating audit letter:", error);
      res.status(500).json({ message: "Failed to generate audit letter" });
    }
  });

  // Alerts routes
  app.get('/api/alerts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const unreadOnly = req.query.unreadOnly === 'true';
      const alerts = await storage.getAlerts(userId, unreadOnly);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.put('/api/alerts/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.markAlertAsRead(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking alert as read:", error);
      res.status(400).json({ message: "Failed to mark alert as read" });
    }
  });

  app.delete('/api/alerts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteAlert(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting alert:", error);
      res.status(400).json({ message: "Failed to delete alert" });
    }
  });

  // Properties routes
  app.get("/api/properties", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const properties = await storage.getPropertiesByUserId(userId);
      res.json(properties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  app.post("/api/properties", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const propertyData = { ...req.body, userId };
      const property = await storage.createProperty(propertyData);
      res.json(property);
    } catch (error) {
      console.error("Error creating property:", error);
      res.status(500).json({ message: "Failed to create property" });
    }
  });

  app.put("/api/properties/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const propertyId = req.params.id;
      const property = await storage.updateProperty(propertyId, userId, req.body);
      res.json(property);
    } catch (error) {
      console.error("Error updating property:", error);
      res.status(500).json({ message: "Failed to update property" });
    }
  });

  app.patch("/api/properties/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const propertyId = req.params.id;
      const property = await storage.updateProperty(propertyId, userId, req.body);
      res.json(property);
    } catch (error) {
      console.error("Error updating property:", error);
      res.status(500).json({ message: "Failed to update property" });
    }
  });

  app.delete("/api/properties/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const propertyId = req.params.id;
      await storage.deleteProperty(propertyId, userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting property:", error);
      res.status(500).json({ message: "Failed to delete property" });
    }
  });

  // Audit document routes
  app.get('/api/audit-documents', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const documents = await storage.getAuditDocuments(userId);
      res.json(documents);
    } catch (error) {
      console.error('Error fetching audit documents:', error);
      res.status(500).json({ message: 'Failed to fetch audit documents' });
    }
  });

  app.post('/api/audit-documents/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { documentType, taxYear, state } = req.body;
      
      // Import PDF generator here to avoid circular dependency
      const { PDFGenerator } = await import('./pdfGenerator');
      const pdfGenerator = new PDFGenerator();
      
      let pdfBuffer: Buffer;
      let title: string;
      let description: string;

      switch (documentType) {
        case 'full_audit_package':
          pdfBuffer = await pdfGenerator.generateFullAuditPackage(userId, taxYear);
          title = `Full Audit Package - ${taxYear}`;
          description = `Complete tax residency documentation for ${taxYear}`;
          break;
        case 'state_summary':
          if (!state) {
            return res.status(400).json({ message: 'State is required for state summary' });
          }
          pdfBuffer = await pdfGenerator.generateStateSummary(userId, state, taxYear);
          title = `${state} State Summary - ${taxYear}`;
          description = `Tax residency summary for ${state} in ${taxYear}`;
          break;
        case 'expense_report':
          pdfBuffer = await pdfGenerator.generateExpenseReport(userId, taxYear, state);
          title = `Expense Report${state ? ` - ${state}` : ''} - ${taxYear}`;
          description = `Detailed expense report for ${taxYear}${state ? ` in ${state}` : ''}`;
          break;
        default:
          return res.status(400).json({ message: 'Invalid document type' });
      }

      // In a production environment, you would upload the PDF to cloud storage
      // For now, we'll return the PDF directly and save metadata to database
      const auditDocument = await storage.createAuditDocument({
        userId,
        documentType,
        taxYear,
        state,
        title,
        description,
        pdfUrl: null, // Would be cloud storage URL in production
        generatedAt: new Date(),
        metadata: {
          fileSize: pdfBuffer.length,
          generatedBy: 'system'
        }
      });

      // Set headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error generating audit document:', error);
      res.status(500).json({ message: 'Failed to generate audit document' });
    }
  });

  app.delete('/api/audit-documents/:id', isAuthenticated, async (req: any, res) => {
    try {
      await storage.deleteAuditDocument(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting audit document:', error);
      res.status(500).json({ message: 'Failed to delete audit document' });
    }
  });

  // User preferences routes
  app.get('/api/user/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const preferences = await storage.getUserPreferences(userId);
      res.json(preferences);
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      res.status(500).json({ message: 'Failed to fetch user preferences' });
    }
  });

  app.put('/api/user/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const preferences = await storage.upsertUserPreferences(userId, req.body);
      res.json(preferences);
    } catch (error) {
      console.error('Error updating user preferences:', error);
      res.status(500).json({ message: 'Failed to update user preferences' });
    }
  });

  // Feedback routes
  app.get('/api/feedback', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const feedbackList = await storage.getFeedback(userId);
      res.json(feedbackList);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      res.status(500).json({ message: 'Failed to fetch feedback' });
    }
  });

  app.post('/api/feedback', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const feedbackData = insertFeedbackSchema.parse({
        ...req.body,
        userId
      });
      
      const feedback = await storage.createFeedback(feedbackData);
      res.status(201).json(feedback);
    } catch (error) {
      console.error('Error creating feedback:', error);
      res.status(500).json({ message: 'Failed to create feedback' });
    }
  });

  // Onboarding tour routes
  app.get('/api/onboarding/tour', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tourType = req.query.type as string || 'initial';
      
      const tour = await storage.getOnboardingTour(userId, tourType);
      res.json(tour);
    } catch (error) {
      console.error("Error fetching onboarding tour:", error);
      res.status(500).json({ message: "Failed to fetch onboarding tour" });
    }
  });

  app.post('/api/onboarding/tour/start', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { userProfile, tourType = 'initial' } = req.body;
      
      // Generate AI-powered recommendations
      const personalizedRecommendations = await onboardingAI.generatePersonalizedRecommendations(userProfile);
      
      // Create onboarding tour
      const tour = await storage.createOnboardingTour({
        userId,
        tourType,
        totalSteps: 6, // Welcome, Profile, Features, Recommendations, Setup, Complete
        personalizedRecommendations,
        userProfile,
        progress: {},
      });

      // Create initial steps
      const steps = [
        {
          tourId: tour.id,
          stepNumber: 1,
          stepType: 'welcome',
          title: 'Welcome to Domicile',
          description: 'Your precision residency tracking journey begins here',
          content: await onboardingAI.generateStepContent('welcome', userProfile),
        },
        {
          tourId: tour.id,
          stepNumber: 2,
          stepType: 'profile_setup',
          title: 'Complete Your Profile',
          description: 'Help us personalize your experience',
          targetElement: '#profile-form',
          content: await onboardingAI.generateStepContent('profile_setup', userProfile),
        },
        {
          tourId: tour.id,
          stepNumber: 3,
          stepType: 'feature_intro',
          title: 'Key Features Tour',
          description: 'Discover tools that match your needs',
          targetElement: '#sidebar-navigation',
          content: { features: ['Residency Logs', 'Alerts', 'AI Assistant'] },
        },
        {
          tourId: tour.id,
          stepNumber: 4,
          stepType: 'recommendation',
          title: 'Personalized Recommendations',
          description: 'AI-powered insights for your situation',
          content: { recommendations: personalizedRecommendations },
        },
        {
          tourId: tour.id,
          stepNumber: 5,
          stepType: 'feature_intro',
          title: 'Set Up Tracking',
          description: 'Configure your monitoring preferences',
          targetElement: '#residency-logs',
          content: { setupTasks: ['Add first location', 'Set alerts', 'Enable notifications'] },
        },
        {
          tourId: tour.id,
          stepNumber: 6,
          stepType: 'completion',
          title: 'You\'re All Set!',
          description: 'Start tracking with confidence',
          content: { nextSteps: ['Add your first location', 'Explore the dashboard', 'Review recommendations'] },
        }
      ];

      // Create all steps
      for (const step of steps) {
        await storage.createOnboardingStep(step);
      }

      res.json({ tour, steps });
    } catch (error) {
      console.error("Error starting onboarding tour:", error);
      res.status(500).json({ message: "Failed to start onboarding tour" });
    }
  });

  app.get('/api/onboarding/tour/:tourId/steps', isAuthenticated, async (req: any, res) => {
    try {
      const { tourId } = req.params;
      const steps = await storage.getOnboardingSteps(tourId);
      res.json(steps);
    } catch (error) {
      console.error("Error fetching onboarding steps:", error);
      res.status(500).json({ message: "Failed to fetch onboarding steps" });
    }
  });

  app.post('/api/onboarding/step/:stepId/complete', isAuthenticated, async (req: any, res) => {
    try {
      const { stepId } = req.params;
      const completedStep = await storage.completeOnboardingStep(stepId);
      res.json(completedStep);
    } catch (error) {
      console.error("Error completing onboarding step:", error);
      res.status(500).json({ message: "Failed to complete onboarding step" });
    }
  });

  app.post('/api/onboarding/tour/:tourId/update', isAuthenticated, async (req: any, res) => {
    try {
      const { tourId } = req.params;
      const updates = req.body;
      
      const updatedTour = await storage.updateOnboardingTour(tourId, updates);
      res.json(updatedTour);
    } catch (error) {
      console.error("Error updating onboarding tour:", error);
      res.status(500).json({ message: "Failed to update onboarding tour" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
