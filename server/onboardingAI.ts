import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface UserProfile {
  userType: 'snowbird' | 'remote-worker' | 'property-owner' | 'frequent-traveler';
  primaryState: string;
  secondaryState?: string;
  netWorthRange: 'under-1m' | '1m-5m' | '5m-10m' | 'over-10m';
  riskTolerance: 'conservative' | 'medium' | 'aggressive';
  currentChallenges: string[];
  goals: string[];
  techSavviness: 'beginner' | 'intermediate' | 'advanced';
}

export interface PersonalizedRecommendation {
  id: string;
  type: 'feature' | 'strategy' | 'warning' | 'tip';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionItems: string[];
  estimatedValue?: string;
  timeToImplement?: string;
  relatedFeatures: string[];
}

export class OnboardingAI {
  // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
  private model = "gpt-4o";

  async generatePersonalizedRecommendations(userProfile: UserProfile): Promise<PersonalizedRecommendation[]> {
    const prompt = `You are an AI advisor for Dwellpath, a premium tax residency tracking platform for high-net-worth individuals. 

Based on the user profile below, generate 5-7 personalized recommendations to help them optimize their tax residency strategy and maximize the value of the platform.

User Profile:
- Type: ${userProfile.userType}
- Primary State: ${userProfile.primaryState}
- Secondary State: ${userProfile.secondaryState || 'None'}
- Net Worth Range: ${userProfile.netWorthRange}
- Risk Tolerance: ${userProfile.riskTolerance}
- Current Challenges: ${userProfile.currentChallenges.join(', ')}
- Goals: ${userProfile.goals.join(', ')}
- Tech Savviness: ${userProfile.techSavviness}

Focus on:
- 183-day rule compliance for their specific states
- Tax optimization strategies
- Platform features most relevant to their profile
- Potential risks and mitigation strategies
- Actionable next steps

Return the response as a JSON array with this structure:
{
  "recommendations": [
    {
      "id": "unique-id",
      "type": "feature|strategy|warning|tip",
      "priority": "high|medium|low", 
      "title": "Clear, actionable title",
      "description": "Detailed explanation of why this matters for their situation",
      "actionItems": ["Specific step 1", "Specific step 2"],
      "estimatedValue": "Potential tax savings or benefit",
      "timeToImplement": "Time estimate",
      "relatedFeatures": ["Feature1", "Feature2"]
    }
  ]
}`;

    try {
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are a premium tax residency advisor and platform specialist for high-net-worth individuals. Provide clear, actionable guidance focused on compliance clarity and strategic optimization based on their specific situation."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 2000
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return result.recommendations || [];
    } catch (error) {
      console.error("Error generating personalized recommendations:", error);
      // Return fallback recommendations
      return this.getFallbackRecommendations(userProfile);
    }
  }

  async generateStepContent(
    stepType: string,
    userProfile: UserProfile,
    context?: any
  ): Promise<any> {
    const prompt = `Generate content for a ${stepType} configuration step for a Dwellpath user.

User Profile:
- Type: ${userProfile.userType}
- Primary State: ${userProfile.primaryState}
- Tech Level: ${userProfile.techSavviness}

The content should reflect a premium advisory tone, be personalized, clear, and actionable. Focus on clarity and guidance rather than risk. Include:
- Configuration message or instruction
- Key points specific to their situation
- Next steps or call-to-action

Return as JSON with: { "content": { "message": "", "keyPoints": [], "callToAction": "" } }`;

    try {
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are a premium residency advisor creating personalized configuration guidance for tax residency tracking. Use an advisory tone focused on clarity and strategic guidance."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.6,
        max_tokens: 800
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return result.content;
    } catch (error) {
      console.error("Error generating step content:", error);
      return this.getFallbackStepContent(stepType);
    }
  }

  private getFallbackRecommendations(userProfile: UserProfile): PersonalizedRecommendation[] {
    const recommendations: PersonalizedRecommendation[] = [
      {
        id: "setup-183-monitoring",
        type: "feature",
        priority: "high",
        title: "Configure 183-Day Rule Monitoring",
        description: `For ${userProfile.primaryState} residents, maintaining clarity on days spent in each state ensures optimal tax residency management.`,
        actionItems: [
          "Enable automatic day tracking",
          "Configure threshold alerts at 150 days",
          "Review your current year status"
        ],
        estimatedValue: "Potential savings of $50K-200K+ annually",
        timeToImplement: "15 minutes",
        relatedFeatures: ["Residency Logs", "Alerts", "Dashboard"]
      },
      {
        id: "document-audit-trail",
        type: "strategy",
        priority: "high",
        title: "Establish Comprehensive Documentation",
        description: "Create comprehensive documentation to maintain clarity and support your residency profile.",
        actionItems: [
          "Start logging daily locations",
          "Upload receipts and travel records",
          "Document ties to your home state"
        ],
        estimatedValue: "Peace of mind + audit protection",
        timeToImplement: "30 minutes daily",
        relatedFeatures: ["Journal", "Expenses", "Documents"]
      }
    ];

    return recommendations;
  }

  private getFallbackStepContent(stepType: string): any {
    const fallbackContent = {
      welcome: {
        message: "Welcome to Dwellpath. We'll configure your residency profile for comprehensive tax residency tracking.",
        keyPoints: [
          "Monitor your days across states automatically",
          "Maintain compliance clarity with 183-day rules",
          "Optimize your residency strategy with strategic guidance"
        ],
        callToAction: "Begin by configuring your residency profile"
      },
      profile_setup: {
        message: "We'll configure Dwellpath for your residency profile based on your specific situation.",
        keyPoints: [
          "We'll customize features for your residency profile",
          "Receive tailored recommendations",
          "Configure relevant monitoring and tracking"
        ],
        callToAction: "Complete your profile configuration to access personalized guidance"
      }
    };

    return fallbackContent[stepType as keyof typeof fallbackContent] || fallbackContent.welcome;
  }
}

export const onboardingAI = new OnboardingAI();