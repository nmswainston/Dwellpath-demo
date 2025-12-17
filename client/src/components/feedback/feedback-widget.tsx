import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { MessageSquare, ThumbsUp, ThumbsDown, Bug, Lightbulb, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { feedbackApi } from "@/lib/apiClient";

type FeedbackType = 'positive' | 'negative' | 'bug' | 'suggestion' | 'general';

interface FeedbackData {
  type: FeedbackType;
  message: string;
  page: string;
}

const FEEDBACK_TYPES = [
  { type: 'positive' as const, label: 'Positive', icon: ThumbsUp, color: 'bg-brand-primary', description: 'Something works great!' },
  { type: 'negative' as const, label: 'Negative', icon: ThumbsDown, color: 'bg-red-500', description: 'Something needs improvement' },
  { type: 'bug' as const, label: 'Bug Report', icon: Bug, color: 'bg-orange-500', description: 'Report a technical issue' },
  { type: 'suggestion' as const, label: 'Suggestion', icon: Lightbulb, color: 'bg-blue-500', description: 'Suggest a new feature' },
  { type: 'general' as const, label: 'General', icon: MessageSquare, color: 'bg-gray-500', description: 'General feedback' },
];

export default function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<FeedbackType | null>(null);
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  const submitFeedbackMutation = useMutation({
    mutationFn: async (data: FeedbackData) => {
      return await feedbackApi.create(data);
    },
    onSuccess: () => {
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback! We'll review it soon.",
      });
      setIsOpen(false);
      setSelectedType(null);
      setMessage('');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!selectedType || !message.trim()) return;
    
    submitFeedbackMutation.mutate({
      type: selectedType,
      message: message.trim(),
      page: window.location.pathname,
    });
  };

  const handleQuickFeedback = (type: FeedbackType) => {
    const quickMessages = {
      positive: "Great experience using this feature!",
      negative: "This could be improved.",
      bug: "I encountered an issue on this page.",
      suggestion: "I have an idea for improvement.",
      general: "General feedback about the app.",
    };

    submitFeedbackMutation.mutate({
      type,
      message: quickMessages[type],
      page: window.location.pathname,
    });
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          size="sm"
          className="bg-card hover:bg-accent border-border text-muted-foreground hover:text-foreground transition-colors duration-200 shadow-sm hover:shadow-md px-4 py-2 text-sm font-medium"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Feedback
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className="w-96 shadow-lg border border-border bg-card">
        <CardHeader className="pb-3 border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium text-foreground">Feedback</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!selectedType ? (
            <>
              <p className="text-sm text-muted-foreground">
                How was your experience on this page?
              </p>
              
              {/* Quick Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline" 
                  className="h-auto p-3 flex flex-col items-center space-y-1"
                  onClick={() => handleQuickFeedback('positive')}
                  disabled={submitFeedbackMutation.isPending}
                >
                  <ThumbsUp className="h-4 w-4 text-brand-primary" />
                  <span className="text-xs">Great!</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-3 flex flex-col items-center space-y-1"
                  onClick={() => handleQuickFeedback('negative')}
                  disabled={submitFeedbackMutation.isPending}
                >
                  <ThumbsDown className="h-4 w-4 text-red-600" />
                  <span className="text-xs">Needs Work</span>
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or detailed feedback</span>
                </div>
              </div>

              {/* Detailed Feedback Options */}
              <div className="space-y-2">
                {FEEDBACK_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <Button
                      key={type.type}
                      variant="outline"
                      className="w-full justify-start h-auto p-3"
                      onClick={() => setSelectedType(type.type)}
                    >
                      <div className={`w-2 h-2 rounded-full ${type.color} mr-3 flex-shrink-0`} />
                      <div className="text-left">
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-muted-foreground">{type.description}</div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="flex items-center space-x-1">
                  {(() => {
                    const type = FEEDBACK_TYPES.find(t => t.type === selectedType);
                    const Icon = type?.icon || MessageSquare;
                    return (
                      <>
                        <Icon className="h-3 w-3" />
                        <span>{type?.label}</span>
                      </>
                    );
                  })()}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedType(null)}
                  className="text-xs px-2 py-1"
                >
                  Change
                </Button>
              </div>

              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share your thoughts..."
                className="min-h-[100px] resize-none"
                maxLength={500}
              />

              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  {message.length}/500 characters
                </span>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedType(null)}
                  >
                    Back
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSubmit}
                    disabled={!message.trim() || submitFeedbackMutation.isPending}
                  >
                    <Send className="h-3 w-3 mr-1" />
                    Submit
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}