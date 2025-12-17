import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { expensesApi } from "@/lib/apiClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { handleUnauthorized } from "@/utils/handleUnauthorized";
import AppLayout from "@/components/layout/app-layout";
import { StaggeredPageContent } from "@/components/layout/page-transition";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Edit, Trash2, Receipt } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import type { Expense } from "@shared/schema";

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

const EXPENSE_CATEGORIES = [
  "Accommodation",
  "Transportation", 
  "Dining",
  "Entertainment",
  "Healthcare",
  "Professional Services",
  "Utilities",
  "Groceries",
  "Other"
];

export default function Expenses() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  
  const [selectedState, setSelectedState] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [expenseDate, setExpenseDate] = useState<Date>();
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filterState, setFilterState] = useState<string>("all");

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      handleUnauthorized(toast);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: expenses = [], isLoading: expensesLoading } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
    enabled: !!isAuthenticated,
  });

  const createExpenseMutation = useMutation({
    mutationFn: async (data: any) => {
      await expensesApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      resetForm();
      toast({
        title: "Success",
        description: "Expense recorded successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        handleUnauthorized(toast);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to record expense",
        variant: "destructive",
      });
    },
  });

  const updateExpenseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await expensesApi.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      resetForm();
      toast({
        title: "Success",
        description: "Expense updated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        handleUnauthorized(toast);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update expense",
        variant: "destructive",
      });
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: string) => {
      await expensesApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      toast({
        title: "Success",
        description: "Expense deleted successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        handleUnauthorized(toast);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete expense",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSelectedState("");
    setAmount("");
    setCategory("");
    setDescription("");
    setExpenseDate(undefined);
    setEditingExpense(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedState || !amount || !category || !expenseDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate amount is a positive number
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    const data = {
      state: selectedState,
      amount: amountNum.toFixed(2),
      category,
      description: description || undefined,
      expenseDate: format(expenseDate, "yyyy-MM-dd"),
    };

    if (editingExpense) {
      updateExpenseMutation.mutate({ id: editingExpense.id, data });
    } else {
      createExpenseMutation.mutate(data);
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setSelectedState(expense.state);
    setAmount(expense.amount);
    setCategory(expense.category);
    setDescription(expense.description || "");
    setExpenseDate(parseISO(expense.expenseDate));
  };

  const filteredExpenses = filterState === "all" 
    ? expenses 
    : expenses.filter((expense: Expense) => expense.state === filterState);

  const totalByState = expenses.reduce((acc: Record<string, number>, expense: Expense) => {
    acc[expense.state] = (acc[expense.state] || 0) + parseFloat(expense.amount);
    return acc;
  }, {});

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="font-body text-slate">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AppLayout 
      title="Expense Tracking" 
      subtitle="Manage your state-based expenses for tax purposes"
    >
      <div className="page-container">
        <StaggeredPageContent>
          {/* State Summary Section */}
          <div className="mb-8">
            <div className="mb-6">
              <h2 className="section-title font-heading text-brand-primary dark:text-foreground">Expense Summary</h2>
              <p className="section-subtitle font-body text-muted-foreground dark:text-muted-foreground">Overview of expenses by state</p>
            </div>
            <div className="card-grid card-grid-4 md:grid-cols-3 lg:grid-cols-4">
            {Object.entries(totalByState).map(([state, total]) => {
              const stateName = US_STATES.find(s => s.code === state)?.name || state;
              return (
                <Card key={state}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="w-6 h-6 bg-primary rounded flex items-center justify-center text-white text-xs font-bold">
                            {state}
                          </div>
                          <p className="text-sm font-medium text-gray-900">{stateName}</p>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">${total.toLocaleString()}</p>
                      </div>
                      <Receipt className="h-8 w-8 text-brand-primary dark:text-accent" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Expense Entry Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 font-heading text-brand-primary dark:text-foreground">
                  <Plus className="h-5 w-5 text-brand-primary dark:text-accent" />
                  <span>{editingExpense ? "Edit" : "Add"} Expense</span>
                </CardTitle>
                <CardDescription className="font-body text-muted-foreground dark:text-muted-foreground">
                  {editingExpense ? "Update your" : "Record an"} expense with state location for audit tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Select value={selectedState} onValueChange={setSelectedState}>
                      <SelectTrigger className="text-foreground">
                        <SelectValue placeholder="Select a state" className="text-foreground" />
                      </SelectTrigger>
                      <SelectContent className="text-foreground">
                        {US_STATES.map((state) => (
                          <SelectItem key={state.code} value={state.code} className="text-foreground">
                            {state.name} ({state.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="amount">Amount *</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="text-foreground">
                          <SelectValue placeholder="Select category" className="text-foreground" />
                        </SelectTrigger>
                        <SelectContent className="text-foreground">
                          {EXPENSE_CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat} className="text-foreground">
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="expenseDate">Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !expenseDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {expenseDate ? format(expenseDate, "MMM dd, yyyy") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={expenseDate}
                          onSelect={setExpenseDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Hotel stay, restaurant meal, gas..."
                      rows={3}
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    {editingExpense && (
                      <Button type="button" variant="outline" onClick={resetForm}>
                        Cancel
                      </Button>
                    )}
                    <Button 
                      type="submit" 
                      className="flex-1"
                      disabled={createExpenseMutation.isPending || updateExpenseMutation.isPending}
                    >
                      {createExpenseMutation.isPending || updateExpenseMutation.isPending 
                        ? "Saving..." 
                        : editingExpense 
                          ? "Update Expense" 
                          : "Add Expense"
                      }
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Recent Expenses */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Expenses</CardTitle>
                <CardDescription>
                  Your recent expense entries
                </CardDescription>
                <div className="pt-2">
                  <Select value={filterState} onValueChange={setFilterState}>
                    <SelectTrigger className="w-48 text-foreground">
                      <SelectValue className="text-foreground" />
                    </SelectTrigger>
                    <SelectContent className="text-foreground">
                      <SelectItem value="all" className="text-foreground">All States</SelectItem>
                      {US_STATES.map((state) => (
                        <SelectItem key={state.code} value={state.code} className="text-foreground">
                          {state.name} ({state.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {expensesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading expenses...</p>
                  </div>
                ) : filteredExpenses.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">
                      {filterState === "all" 
                        ? "No expenses recorded yet. Start by adding your first expense!" 
                        : `No expenses found for ${US_STATES.find(s => s.code === filterState)?.name}.`
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {filteredExpenses.map((expense: Expense) => {
                      const stateName = US_STATES.find(s => s.code === expense.state)?.name || expense.state;
                      
                      return (
                        <div key={expense.id} className="border border-border rounded-xl p-4 bg-card shadow-sm">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <div className="w-6 h-6 bg-primary rounded flex items-center justify-center text-white text-xs font-bold">
                                  {expense.state}
                                </div>
                                <h4 className="font-medium text-gray-900">${parseFloat(expense.amount).toLocaleString()}</h4>
                                <span className="text-sm text-gray-500">• {expense.category}</span>
                              </div>
                              <p className="text-sm text-gray-600">
                                {stateName} • {format(parseISO(expense.expenseDate), "MMM dd, yyyy")}
                              </p>
                              {expense.description && (
                                <p className="text-sm text-gray-500 mt-1">{expense.description}</p>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(expense)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteExpenseMutation.mutate(expense.id)}
                                disabled={deleteExpenseMutation.isPending}
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
          </div>
        </StaggeredPageContent>
      </div>
    </AppLayout>
  );
}
