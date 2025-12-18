import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { journalApi } from "@/lib/apiClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { handleUnauthorized } from "@/lib/handleUnauthorized";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Edit, Trash2, Book, Search } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import type { JournalEntry } from "@shared/schema";
import { StaggeredPageContent } from "@/components/layout/PageTransition";
import { StateSelectItem } from "@/components/shared/StateSelectItem";

const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

const JOURNAL_CATEGORIES = [
  "Travel",
  "Housing", 
  "Work",
  "Medical",
  "Family",
  "Business",
  "Property",
  "Financial",
  "Legal",
  "Other"
];

export default function Journal() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  
  const [selectedState, setSelectedState] = useState<string>("");
  const [entryDate, setEntryDate] = useState<Date>();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      handleUnauthorized(toast);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: journalEntries = [], isLoading: entriesLoading } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal-entries"],
    enabled: !!isAuthenticated,
  });

  const createEntryMutation = useMutation({
    mutationFn: async (data: any) => {
      await journalApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal-entries"] });
      resetForm();
      toast({
        title: "Success",
        description: "Journal entry created successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        handleUnauthorized(toast);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create journal entry",
        variant: "destructive",
      });
    },
  });

  const updateEntryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await journalApi.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal-entries"] });
      resetForm();
      toast({
        title: "Success",
        description: "Journal entry updated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        handleUnauthorized(toast);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update journal entry",
        variant: "destructive",
      });
    },
  });

  const deleteEntryMutation = useMutation({
    mutationFn: async (id: string) => {
      await journalApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal-entries"] });
      toast({
        title: "Success",
        description: "Journal entry deleted successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        handleUnauthorized(toast);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete journal entry",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSelectedState("none");
    setEntryDate(undefined);
    setTitle("");
    setContent("");
    setCategory("");
    setEditingEntry(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !content || !category || !entryDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const data = {
      entryDate: format(entryDate, "yyyy-MM-dd"),
      state: selectedState === "none" ? undefined : selectedState || undefined,
      title,
      content,
      category,
    };

    if (editingEntry) {
      updateEntryMutation.mutate({ id: editingEntry.id, data });
    } else {
      createEntryMutation.mutate(data);
    }
  };

  const handleEdit = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setSelectedState(entry.state || "none");
    setEntryDate(parseISO(entry.entryDate));
    setTitle(entry.title);
    setContent(entry.content);
    setCategory(entry.category);
  };

  const filteredEntries = journalEntries.filter((entry: JournalEntry) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      entry.title.toLowerCase().includes(searchLower) ||
      entry.content.toLowerCase().includes(searchLower) ||
      entry.category.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AppLayout 
      title="Residency Journal" 
      subtitle="Document your travel, housing, and work activities for audit preparation"
    >
      <div className="page-container">
        <StaggeredPageContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Journal Entry Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 min-w-0">
                  <Plus className="h-5 w-5 text-brand-primary dark:text-accent flex-shrink-0" />
                  <span className="break-words">{editingEntry ? "Edit" : "New"} Journal Entry</span>
                </CardTitle>
                <CardDescription className="break-words">
                  {editingEntry ? "Update your" : "Create a"} timestamped record for audit documentation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="entryDate">Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="entryDate"
                            name="entryDate"
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !entryDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {entryDate ? format(entryDate, "MMM dd, yyyy") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={entryDate}
                            onSelect={setEntryDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State (Optional)</Label>
                      <Select value={selectedState} onValueChange={setSelectedState}>
                        <SelectTrigger id="state" name="state">
                          <SelectValue placeholder="Select a state" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No specific state</SelectItem>
                          {US_STATES.map((state) => (
                            <StateSelectItem
                              key={state.code}
                              value={state.code}
                              stateCode={state.code}
                              label={state.name}
                            />
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Brief summary of the entry..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger id="category" name="category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {JOURNAL_CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Content *</Label>
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Detailed description of activities, location, purpose, people involved, etc..."
                      rows={6}
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    {editingEntry && (
                      <Button type="button" variant="outline" onClick={resetForm}>
                        Cancel
                      </Button>
                    )}
                    <Button 
                      type="submit" 
                      className="flex-1"
                      disabled={createEntryMutation.isPending || updateEntryMutation.isPending}
                    >
                      {createEntryMutation.isPending || updateEntryMutation.isPending 
                        ? "Saving..." 
                        : editingEntry 
                          ? "Update Entry" 
                          : "Create Entry"
                      }
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Journal Entries List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 min-w-0">
                  <Book className="h-5 w-5 text-brand-primary dark:text-accent flex-shrink-0" />
                  <span className="truncate">Journal Entries</span>
                </CardTitle>
                <CardDescription className="break-words">
                  Your recorded activities and notes
                </CardDescription>
                <div className="pt-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-brand-primary dark:text-accent" />
                    <Input
                      placeholder="Search entries..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {entriesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading entries...</p>
                  </div>
                ) : filteredEntries.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      {searchTerm 
                        ? "No entries found matching your search." 
                        : "No journal entries yet. Start documenting your activities!"
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {filteredEntries.map((entry: JournalEntry) => {
                      const stateName = entry.state 
                        ? US_STATES.find(s => s.code === entry.state)?.name || entry.state
                        : null;
                      
                      return (
                        <div key={entry.id} className="border border-border rounded-xl p-4 bg-card shadow-sm">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-2 min-w-0">
                                {entry.state && (
                                  <div
                                    className={cn(
                                      "w-10 h-10 bg-brand-accent dark:bg-accent rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg flex-shrink-0",
                                      "w-6 h-6 bg-primary rounded shadow-none shrink-0 text-primary-foreground/70 text-[10px] leading-none",
                                    )}
                                  >
                                    {entry.state.toUpperCase()}
                                  </div>
                                )}
                                <h4 className="font-medium text-foreground min-w-0 truncate">{entry.title}</h4>
                                <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-full flex-shrink-0">
                                  {entry.category}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {format(parseISO(entry.entryDate), "MMM dd, yyyy")}
                                {stateName && ` • ${stateName}`}
                              </p>
                              <p className="text-sm text-foreground line-clamp-3">
                                {entry.content}
                              </p>
                            </div>
                            <div className="flex space-x-2 ml-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(entry)}
                              >
                                <Edit className="h-4 w-4 text-brand-primary dark:text-accent" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteEntryMutation.mutate(entry.id)}
                                disabled={deleteEntryMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4 text-brand-primary dark:text-accent" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
            </div>
        </StaggeredPageContent>
      </div>
    </AppLayout>
  );
}
