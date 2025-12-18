import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { aiApi } from "@/lib/apiClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { handleUnauthorized } from "@/lib/handleUnauthorized";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, Mic, User, Download, FileText, Calculator } from "lucide-react";
import { format } from "date-fns";
import { StaggeredPageContent } from "@/components/layout/PageTransition";
import type { AiChat } from "@shared/schema";

interface ChatMessage {
  userMessage: string;
  aiResponse: string;
  timestamp: string;
}

function toIsoString(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  if (typeof value === "number") return new Date(value).toISOString();
  return new Date().toISOString();
}

const QUICK_QUERIES = [
  { 
    label: "Days remaining in CA", 
    query: "How many days do I have left in California this year?",
    icon: Calculator 
  },
  { 
    label: "Summarize expenses", 
    query: "Can you summarize my expenses by state for this year?",
    icon: Calculator 
  },
  { 
    label: "Compliance check", 
    query: "Am I at risk of exceeding the 183-day rule in any state?",
    icon: FileText 
  },
  { 
    label: "Draft NY letter", 
    query: "Draft a non-residency affidavit letter for New York",
    icon: FileText 
  },
  { 
    label: "Travel planning", 
    query: "What's the optimal way to plan my remaining travel this year?",
    icon: Calculator 
  },
  { 
    label: "Audit prep", 
    query: "What documents should I prepare for a potential audit?",
    icon: Download 
  },
];

export default function AIAssistant() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      handleUnauthorized(toast);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: recentChats = [] } = useQuery<AiChat[]>({
    queryKey: ["/api/ai/chats"],
    select: (data) => data.slice(0, 10),
    enabled: !!isAuthenticated,
  });

  const chatMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      return await aiApi.chat(userMessage);
    },
    onSuccess: (data) => {
      setChatHistory((prev) => [
        {
          userMessage: data.userMessage,
          aiResponse: data.aiResponse,
          timestamp: toIsoString(data.timestamp),
        },
        ...prev,
      ]);
      setMessage("");
      scrollToBottom();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        handleUnauthorized(toast);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    },
  });

  const complianceSummaryMutation = useMutation({
    mutationFn: async () => {
      const year = new Date().getFullYear();
      return await aiApi.complianceSummary(year);
    },
    onSuccess: (summary) => {
      setChatHistory(prev => [{
        userMessage: "Generate a compliance summary for this year",
        aiResponse: summary,
        timestamp: new Date().toISOString(),
      }, ...prev]);
      scrollToBottom();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        handleUnauthorized(toast);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to generate compliance summary",
        variant: "destructive",
      });
    },
  });

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    // Only scroll the messages list itself (avoid scrolling the whole page container).
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior });
      return;
    }

    // Fallback if the container ref isn't available for some reason.
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    chatMutation.mutate(message);
  };

  const handleQuickQuery = (query: string) => {
    setMessage(query);
    chatMutation.mutate(query);
  };

  const normalizedRecentChats: ChatMessage[] = recentChats.map((chat) => ({
    userMessage: chat.userMessage,
    aiResponse: chat.aiResponse,
    timestamp: toIsoString(chat.createdAt),
  }));

  const allMessages: ChatMessage[] = [...chatHistory, ...normalizedRecentChats].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background dark:bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="font-body text-muted-foreground dark:text-muted-foreground">Loading AI Assistant...</p>
        </div>
      </div>
    );
  }

  return (
    <AppLayout 
      title="AI Assistant" 
      subtitle="Get instant answers about residency compliance and tax planning"
    >
      <div className="page-container">
        <main className="flex-1 overflow-hidden">
          <StaggeredPageContent>
            {/* Quick Query Templates */}
            <section className="space-y-6">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 font-heading text-brand-primary dark:text-foreground">
                    <Bot className="h-5 w-5 text-brand-primary dark:text-accent" />
                    Quick Query Templates
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {QUICK_QUERIES.map((query, index) => {
                    const Icon = query.icon;
                    return (
                      <Button
                        key={index}
                        variant="outline"
                        onClick={() => handleQuickQuery(query.query)}
                        disabled={chatMutation.isPending}
                        className="h-auto p-4 text-left justify-start hover:bg-accent/50 transition-all duration-200"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-brand-primary dark:text-accent" />
                          <div>
                            <div className="font-medium">{query.label}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-32">{query.query}</div>
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
              {/* Main Chat Area */}
            <div className="lg:col-span-2 flex flex-col">
              <Card className="flex-1 flex flex-col">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2 text-foreground min-w-0 flex-1">
                      <Bot className="h-5 w-5 text-brand-primary dark:text-accent" />
                      <span>Dwellpath AI Assistant</span>
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-brand-primary rounded-full"></div>
                      <span className="text-xs text-muted-foreground">Online</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col pt-4">
                  {/* Chat Messages */}
                  <div
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto space-y-6 mb-6 border border-border rounded-xl p-6 bg-card shadow-sm"
                  >
                    {allMessages.length === 0 ? (
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <Bot className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <div className="flex-1">
                          <div className="bg-muted rounded-lg px-4 py-3">
                            <p className="text-sm text-foreground">
                              Hello! I'm your Dwellpath AI assistant, specialized in precision residency tracking and compliance. 
                              I can help you with:
                            </p>
                            <ul className="text-sm text-foreground mt-2 space-y-1">
                              <li>• Analyzing your residency status and 183-day compliance</li>
                              <li>• Summarizing expenses by state for audit purposes</li>
                              <li>• Drafting non-residency letters and legal documents</li>
                              <li>• Planning future travel to optimize tax savings</li>
                              <li>• Preparing documentation for potential audits</li>
                            </ul>
                            <p className="text-sm text-foreground mt-2">
                              What would you like to know about your residency status?
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Just now</p>
                        </div>
                      </div>
                    ) : (
                      allMessages.map((chat: any, index) => (
                        <div key={index} className="space-y-4">
                          {/* User Message */}
                          <div className="flex items-start space-x-3 justify-end">
                            <div className="flex-1 text-right">
                              <div className="bg-primary text-primary-foreground rounded-lg px-4 py-3 inline-block max-w-2xl">
                                <p className="text-sm whitespace-pre-wrap">{chat.userMessage}</p>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {format(new Date(chat.timestamp || chat.createdAt), "MMM dd, h:mm a")}
                              </p>
                            </div>
                            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>

                          {/* AI Response */}
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                              <Bot className="h-4 w-4 text-primary-foreground" />
                            </div>
                            <div className="flex-1">
                              <div className="bg-muted rounded-lg px-4 py-3">
                                <p className="text-sm text-foreground whitespace-pre-wrap">
                                  {chat.aiResponse}
                                </p>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {format(new Date(chat.timestamp || chat.createdAt), "MMM dd, h:mm a")}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    
                    {/* Loading indicator */}
                    {(chatMutation.isPending || complianceSummaryMutation.isPending) && (
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <Bot className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <div className="flex-1">
                          <div className="bg-muted rounded-lg px-4 py-3">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce anim-delay-100"></div>
                              <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce anim-delay-200"></div>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">AI is analyzing your data...</p>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Chat Input */}
                  <form onSubmit={handleSubmit} className="flex space-x-2">
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Ask me anything about your residency status, compliance, or tax planning..."
                      className="flex-1 min-h-[50px] max-h-32 resize-none"
                      disabled={chatMutation.isPending || complianceSummaryMutation.isPending}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmit(e);
                        }
                      }}
                    />
                    <div className="flex flex-col space-y-2">
                      <Button 
                        type="submit" 
                        disabled={chatMutation.isPending || complianceSummaryMutation.isPending || !message.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        disabled={chatMutation.isPending || complianceSummaryMutation.isPending}
                      >
                        <Mic className="h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar with Quick Actions */}
            <div className="space-y-6">
              {/* Quick Questions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {QUICK_QUERIES.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <Button
                          key={index}
                          variant="outline"
                          className="w-full justify-start text-left h-auto p-3"
                          onClick={() => handleQuickQuery(item.query)}
                          disabled={chatMutation.isPending || complianceSummaryMutation.isPending}
                        >
                          <Icon className="mr-3 h-4 w-4 flex-shrink-0" />
                          <span className="text-sm">{item.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Advanced Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Advanced Tools</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => complianceSummaryMutation.mutate()}
                      disabled={chatMutation.isPending || complianceSummaryMutation.isPending}
                    >
                      <FileText className="mr-3 h-4 w-4" />
                      Generate Compliance Report
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleQuickQuery("Generate a detailed audit preparation checklist")}
                      disabled={chatMutation.isPending || complianceSummaryMutation.isPending}
                    >
                      <Download className="mr-3 h-4 w-4" />
                      Audit Prep Checklist
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* AI Capabilities */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">AI Capabilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-start space-x-2">
                      <Badge variant="secondary" className="mt-0.5">📊</Badge>
                      <p>Real-time analysis of your residency data and compliance status</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Badge variant="secondary" className="mt-0.5">📝</Badge>
                      <p>Draft legal documents and audit defense letters</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Badge variant="secondary" className="mt-0.5">🎯</Badge>
                      <p>Personalized tax planning strategies and recommendations</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Badge variant="secondary" className="mt-0.5">⚠️</Badge>
                      <p>Risk assessment and early warning alerts</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
              </div>
            </section>
          </StaggeredPageContent>
        </main>
      </div>
    </AppLayout>
  );
}
