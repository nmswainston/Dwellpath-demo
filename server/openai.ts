import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export async function processSnowbirdQuery(
  userMessage: string,
  userContext: {
    residencyStats: Array<{ state: string; totalDays: number; daysRemaining: number; isAtRisk: boolean }>;
    recentExpenses: Array<{ state: string; amount: string; category: string; description: string }>;
    dashboardStats: {
      totalDaysTracked: number;
      activeStates: number;
      estimatedTaxSavings: number;
      riskLevel: string;
    };
  }
): Promise<string> {
  try {
    const systemPrompt = `You are a specialized AI assistant for Dwellpath, a residency day tracker app that helps users avoid becoming unintended tax residents in high-tax states. You help with:

1. Residency compliance and 183-day rule guidance
2. State tax planning and optimization strategies
3. Expense tracking and categorization advice
4. Audit preparation and documentation
5. Travel planning to minimize tax exposure

Current user context:
- Total days tracked this year: ${userContext.dashboardStats.totalDaysTracked}
- Active states: ${userContext.dashboardStats.activeStates}
- Estimated tax savings: $${userContext.dashboardStats.estimatedTaxSavings.toLocaleString()}
- Risk level: ${userContext.dashboardStats.riskLevel}

Residency status by state:
${userContext.residencyStats.map(stat => 
  `- ${stat.state}: ${stat.totalDays} days spent, ${stat.daysRemaining} days remaining ${stat.isAtRisk ? '(⚠️ HIGH RISK)' : ''}`
).join('\n')}

Recent expenses:
${userContext.recentExpenses.slice(0, 5).map(exp => 
  `- ${exp.state}: $${exp.amount} for ${exp.category} (${exp.description})`
).join('\n')}

Provide helpful, accurate advice while being concise and actionable. Focus on compliance, tax optimization, and practical next steps.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "I apologize, but I couldn't process your request. Please try again.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to process AI query. Please check your OpenAI API configuration.");
  }
}

export async function generateComplianceSummary(
  residencyStats: Array<{ state: string; totalDays: number; daysRemaining: number; isAtRisk: boolean }>,
  year: number
): Promise<{
  summary: string;
  recommendations: string[];
  riskAssessment: string;
}> {
  try {
    const prompt = `As a tax compliance expert, analyze this residency data for ${year} and provide a comprehensive summary:

Residency breakdown:
${residencyStats.map(stat => 
  `- ${stat.state}: ${stat.totalDays} days (${stat.daysRemaining} remaining before 183-day threshold)`
).join('\n')}

Provide a JSON response with:
1. "summary": A brief overview of the user's residency status
2. "recommendations": Array of 3-5 specific action items
3. "riskAssessment": Overall risk level and key concerns

Focus on 183-day rule compliance, audit defense strategies, and tax optimization.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 800,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      summary: result.summary || "Unable to generate summary",
      recommendations: result.recommendations || [],
      riskAssessment: result.riskAssessment || "Unable to assess risk",
    };
  } catch (error) {
    console.error("Error generating compliance summary:", error);
    throw new Error("Failed to generate compliance summary");
  }
}

export async function generateAuditLetter(
  userInfo: { name: string; },
  residencyStats: Array<{ state: string; totalDays: number; }>,
  state: string,
  year: number
): Promise<string> {
  try {
    const prompt = `Generate a professional non-residency affidavit letter for ${userInfo.name} to contest ${state} state tax residency for ${year}.

Residency data:
${residencyStats.map(stat => `- ${stat.state}: ${stat.totalDays} days`).join('\n')}

The letter should:
1. Formally declare non-residency in ${state}
2. Reference the 183-day rule and provide specific day counts
3. Include standard legal language for tax residency disputes
4. Be professional and audit-ready
5. Include placeholders for signature and date

Format as a formal business letter.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
    });

    return response.choices[0].message.content || "Failed to generate audit letter";
  } catch (error) {
    console.error("Error generating audit letter:", error);
    throw new Error("Failed to generate audit letter");
  }
}
