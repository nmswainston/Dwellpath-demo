import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { aiApi } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { handleUnauthorized } from "@/lib/handleUnauthorized";
import { Bot, Send, Mic, User } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import { AiChat } from "@shared/schema";

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
  { label: "Summarize expenses", query: "Can you summarize my expenses by state for this year?" },
  { label: "Check compliance", query: "Am I at risk of exceeding the 183-day rule in any state?" },
  { label: "Plan travel", query: "How many more days can I spend in California this year?" },
];

export default function AIChat() {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const { data: recentChats = [] } = useQuery<AiChat[]>({
    queryKey: ["/api/ai/chats"],
    select: (data) => data?.slice(0, 3) || [],
  });

  const normalizedRecentChats: ChatMessage[] = recentChats.map((chat) => ({
    userMessage: chat.userMessage,
    aiResponse: chat.aiResponse,
    timestamp: toIsoString(chat.createdAt),
  }));

  const chatMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      setIsTyping(true);
      return await aiApi.chat(userMessage);
    },
    onSuccess: (data) => {
      setIsTyping(false);
      setChatHistory((prev) => [
        {
          userMessage: data.userMessage,
          aiResponse: data.aiResponse,
          timestamp: toIsoString(data.timestamp),
        },
        ...prev,
      ]);
      setMessage("");
      toast({
        title: "Dwellpath AI",
        description: "Your tax compliance question has been answered!",
      });
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    chatMutation.mutate(message);
  };

  const handleQuickQuery = (query: string) => {
    setMessage(query);
    chatMutation.mutate(query);
  };

  const allMessages: ChatMessage[] = [...chatHistory, ...normalizedRecentChats].slice(0, 5);

  return (
    <Card className="winter-card">
      <CardHeader className="header-spacing">
        <div className="grid grid-cols-[1fr_auto] gap-3 items-center">
          <div className="flex items-center gap-2 min-w-0">
            <Bot className="h-5 w-5 text-brand-primary dark:text-accent shrink-0" />
            <CardTitle className="font-heading text-lg font-bold text-brand-primary dark:text-foreground flex items-center gap-2 min-w-0">
              <span className="truncate">Ask Dwellpath AI</span>
              <Badge variant="secondary" className="text-xs bg-status-neutral/10 text-status-neutral font-body px-2 py-0.5 shrink-0">AI</Badge>
            </CardTitle>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></div>
            <span className="text-xs text-brand-text-light/60 dark:text-brand-text-dark/60 font-body whitespace-nowrap">Online</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Chat Messages */}
        <div className="h-80 overflow-y-auto space-y-4 mb-6 border border-border rounded-xl p-4 bg-card shadow-sm">
          {allMessages.length === 0 ? (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="bg-muted rounded-lg px-3 py-2">
                  <p className="text-sm text-brand-text-light dark:text-brand-text-dark font-body wrap-break-word">
                    Hi! I'm your Dwellpath AI assistant. I can help you track residency, analyze expenses, 
                    and prepare audit documents. What would you like to know?
                  </p>
                </div>
                <p className="text-xs text-brand-text-light/60 dark:text-brand-text-dark/60 mt-1">Just now</p>
              </div>
            </div>
          ) : (
            allMessages.map((chat, index) => (
              <div key={index} className="space-y-3">
                {/* User Message */}
                <div className="flex items-start space-x-3 justify-end">
                  <div className="flex-1 min-w-0 text-right">
                    <div className="bg-primary text-primary-foreground rounded-lg px-4 py-3 inline-block max-w-md">
                      <p className="text-sm leading-relaxed wrap-break-word">{chat.userMessage}</p>
                    </div>
                    <p className="text-xs text-brand-text-light/60 dark:text-brand-text-dark/60 mt-1">
                      {format(new Date(chat.timestamp), "h:mm a")}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-brand-text-light/70 dark:text-brand-text-dark/70" />
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="bg-muted rounded-lg px-4 py-3 max-w-4xl">
                      <p className="text-sm text-brand-text-light dark:text-brand-text-dark whitespace-pre-wrap leading-relaxed wrap-break-word">
                        {chat.aiResponse}
                      </p>
                    </div>
                    <p className="text-xs text-brand-text-light/60 dark:text-brand-text-dark/60 mt-1">
                      {format(new Date(chat.timestamp), "h:mm a")}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
          
          {/* Loading indicator */}
          {chatMutation.isPending && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="bg-muted rounded-lg px-3 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce anim-delay-100"></div>
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce anim-delay-200"></div>
                  </div>
                </div>
                <p className="text-xs text-brand-text-light/60 dark:text-brand-text-dark/60 mt-1">AI is thinking...</p>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSubmit} className="flex space-x-2 mb-4">
          <Input
            id="ai-chat-message"
            name="aiChatMessage"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask about residency, expenses, or compliance..."
            className="flex-1"
            disabled={chatMutation.isPending}
          />
          <Button 
            type="submit" 
            disabled={chatMutation.isPending || !message.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
          <Button 
            type="button" 
            variant="outline"
            disabled={chatMutation.isPending}
          >
            <Mic className="h-4 w-4" />
          </Button>
        </form>

        {/* Quick Actions */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-brand-text-light dark:text-brand-text-dark">Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_QUERIES.map((item, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => handleQuickQuery(item.query)}
                disabled={chatMutation.isPending}
              >
                {item.label}
              </Button>
            ))}
          </div>
          <Link href="/ai-assistant">
            <Button variant="ghost" size="sm" className="text-primary mt-2">
              Open Full AI Assistant
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
