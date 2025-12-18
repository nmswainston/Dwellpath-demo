import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { residencyLogsApi } from "@/lib/apiClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { handleUnauthorized } from "@/lib/handleUnauthorized";
import AppLayout from "@/components/layout/AppLayout";
import { StaggeredPageContent } from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Edit, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { ResidencyLog } from "@shared/schema";
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



export default function LogDays() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  
  const [selectedState, setSelectedState] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [purpose, setPurpose] = useState("");
  const [notes, setNotes] = useState("");
  const [editingLog, setEditingLog] = useState<ResidencyLog | null>(null);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      handleUnauthorized(toast);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: residencyLogs = [], isLoading: logsLoading } = useQuery<ResidencyLog[]>({
    queryKey: ["/api/residency-logs"],
    enabled: !!isAuthenticated,
  });

  const createLogMutation = useMutation({
    mutationFn: async (data: any) => {
      await residencyLogsApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/residency-logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/residency-stats"] });
      resetForm();
      toast({
        title: "Success",
        description: "Residency days logged successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        handleUnauthorized(toast);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to log residency days",
        variant: "destructive",
      });
    },
  });

  const updateLogMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await residencyLogsApi.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/residency-logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/residency-stats"] });
      resetForm();
      toast({
        title: "Success",
        description: "Residency log updated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        handleUnauthorized(toast);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update residency log",
        variant: "destructive",
      });
    },
  });

  const deleteLogMutation = useMutation({
    mutationFn: async (id: string) => {
      await residencyLogsApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/residency-logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/residency-stats"] });
      toast({
        title: "Success",
        description: "Residency log deleted successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        handleUnauthorized(toast);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete residency log",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSelectedState("");
    setStartDate(undefined);
    setEndDate(undefined);
    setPurpose("");
    setNotes("");
    setEditingLog(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedState || !startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const data = {
      state: selectedState,
      startDate: format(startDate, "yyyy-MM-dd"),
      endDate: format(endDate, "yyyy-MM-dd"),
      purpose: purpose || undefined,
      notes: notes || undefined,
    };

    if (editingLog) {
      updateLogMutation.mutate({ id: editingLog.id, data });
    } else {
      createLogMutation.mutate(data);
    }
  };

  const handleEdit = (log: ResidencyLog) => {
    setEditingLog(log);
    setSelectedState(log.state);
    setStartDate(parseISO(log.startDate));
    setEndDate(parseISO(log.endDate));
    setPurpose(log.purpose || "");
    setNotes(log.notes || "");
  };

  const calculateDays = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="font-body text-slate">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AppLayout 
      title="Log Residency Days" 
      subtitle="Track your time spent in each state"
    >
      <div className="page-container">
        <StaggeredPageContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Log Entry Form */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 font-heading text-brand-primary dark:text-foreground min-w-0">
                  <Plus className="h-5 w-5 text-brand-primary dark:text-accent flex-shrink-0" />
                  <span className="truncate">{editingLog ? "Edit" : "Add"} Residency Days</span>
                </CardTitle>
                <CardDescription className="font-body text-muted-foreground dark:text-muted-foreground break-words">
                  {editingLog ? "Update your" : "Record your"} time spent in a specific state
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="state" className="form-label">State *</Label>
                    <Select value={selectedState} onValueChange={setSelectedState}>
                      <SelectTrigger id="state" name="state">
                        <SelectValue placeholder="Select a state" />
                      </SelectTrigger>
                      <SelectContent>
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

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="startDate" className="form-label">Start Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="startDate"
                            name="startDate"
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !startDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, "MMM dd, yyyy") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={setStartDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDate" className="form-label">End Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="endDate"
                            name="endDate"
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !endDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, "MMM dd, yyyy") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={setEndDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="purpose">Purpose (Optional)</Label>
                    <Input
                      id="purpose"
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      placeholder="Business meeting, vacation, family visit..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Additional details about your stay..."
                      rows={3}
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    {editingLog && (
                      <Button type="button" variant="outline" onClick={resetForm}>
                        Cancel
                      </Button>
                    )}
                    <Button 
                      type="submit" 
                      className="flex-1"
                      disabled={createLogMutation.isPending || updateLogMutation.isPending}
                    >
                      {createLogMutation.isPending || updateLogMutation.isPending 
                        ? "Saving..." 
                        : editingLog 
                          ? "Update Log" 
                          : "Log Days"
                      }
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Recent Logs */}
            <Card>
              <CardHeader>
                <CardTitle className="break-words">Recent Logs</CardTitle>
                <CardDescription className="break-words">
                  Your recent residency day entries
                </CardDescription>
              </CardHeader>
              <CardContent>
                {logsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="font-body text-muted-foreground dark:text-muted-foreground">Loading logs...</p>
                  </div>
                ) : residencyLogs.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="font-body text-muted-foreground dark:text-muted-foreground">No residency logs yet. Start by adding your first entry!</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {residencyLogs.map((log: ResidencyLog) => {
                      const stateName = US_STATES.find(s => s.code === log.state)?.name || log.state;
                      const days = calculateDays(log.startDate, log.endDate);
                      
                      return (
                        <div key={log.id} className="border border-border rounded-xl p-4 bg-card shadow-sm">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-2 min-w-0">
                                <div
                                  className={cn(
                                    "w-10 h-10 bg-brand-accent dark:bg-accent rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg flex-shrink-0",
                                    "w-6 h-6 bg-primary rounded shadow-none shrink-0 text-primary-foreground/70 text-[10px] leading-none",
                                  )}
                                >
                                  {log.state.toUpperCase()}
                                </div>
                                <h4 className="font-heading font-medium text-brand-primary dark:text-foreground min-w-0 truncate">{stateName}</h4>
                                <span className="text-sm font-body text-muted-foreground dark:text-muted-foreground flex-shrink-0">• {days} day{days !== 1 ? 's' : ''}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {format(parseISO(log.startDate), "MMM dd")} - {format(parseISO(log.endDate), "MMM dd, yyyy")}
                              </p>
                              {log.purpose && (
                                <p className="text-sm text-muted-foreground mt-1">{log.purpose}</p>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(log)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteLogMutation.mutate(log.id)}
                                disabled={deleteLogMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
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
