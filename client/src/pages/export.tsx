import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { handleUnauthorized } from "@/utils/handleUnauthorized";
import AppLayout from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Download, FileText, Receipt, Calendar, Shield, BookOpen } from "lucide-react";
import { StaggeredPageContent } from "@/components/layout/page-transition";

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

export default function Export() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [selectedState, setSelectedState] = useState<string>("");
  const [exportYear, setExportYear] = useState<string>(new Date().getFullYear().toString());
  const [letterContent, setLetterContent] = useState("");

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      handleUnauthorized(toast);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: residencyStats = [] } = useQuery({
    queryKey: ["/api/dashboard/residency-stats", { year: parseInt(exportYear) }],
    enabled: !!isAuthenticated,
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ["/api/expenses", { year: parseInt(exportYear) }],
    enabled: !!isAuthenticated,
  });

  const { data: residencyLogs = [] } = useQuery({
    queryKey: ["/api/residency-logs", { year: parseInt(exportYear) }],
    enabled: !!isAuthenticated,
  });

  const { data: journalEntries = [] } = useQuery({
    queryKey: ["/api/journal-entries"],
    enabled: !!isAuthenticated,
  });

  const complianceSummaryMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/ai/compliance-summary", { 
        year: parseInt(exportYear) 
      });
      return await response.json();
    },
    onSuccess: (data) => {
      const blob = new Blob([generateComplianceReport(data)], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dwellpath-compliance-summary-${exportYear}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "Compliance summary exported successfully",
      });
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

  const auditLetterMutation = useMutation({
    mutationFn: async () => {
      if (!selectedState) throw new Error("State is required");
      const response = await apiRequest("POST", "/api/ai/audit-letter", { 
        state: selectedState,
        year: parseInt(exportYear)
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setLetterContent(data.letter);
      toast({
        title: "Success",
        description: "Audit letter generated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        handleUnauthorized(toast);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to generate audit letter",
        variant: "destructive",
      });
    },
  });

  const generateComplianceReport = (data: any) => {
    return `DWELLPATH COMPLIANCE SUMMARY FOR ${exportYear}
Generated on: ${new Date().toLocaleDateString()}

OVERVIEW
========
${data.summary}

RISK ASSESSMENT
===============
${data.riskAssessment}

RECOMMENDATIONS
===============
${data.recommendations.map((rec: string, i: number) => `${i + 1}. ${rec}`).join('\n')}

RESIDENCY STATISTICS
====================
${residencyStats.map((stat: any) => {
  const stateName = US_STATES.find(s => s.code === stat.state)?.name || stat.state;
  return `${stateName} (${stat.state}): ${stat.totalDays} days (${stat.daysRemaining} remaining)`;
}).join('\n')}

EXPENSE SUMMARY
===============
Total Expenses: $${expenses.reduce((sum: number, exp: any) => sum + parseFloat(exp.amount), 0).toLocaleString()}
By State:
${Object.entries(
  expenses.reduce((acc: Record<string, number>, exp: any) => {
    acc[exp.state] = (acc[exp.state] || 0) + parseFloat(exp.amount);
    return acc;
  }, {})
).map(([state, total]) => `${state}: $${(total as number).toLocaleString()}`).join('\n')}

TRAVEL LOG
==========
${residencyLogs.map((log: any) => {
  const stateName = US_STATES.find(s => s.code === log.state)?.name || log.state;
  return `${log.startDate} to ${log.endDate}: ${stateName} (${log.purpose || 'Personal'})`;
}).join('\n')}

This report contains confidential tax and residency information.
Generated by Dwellpath.
`;
  };

  const exportResidencyData = () => {
    const csvContent = [
      ['State', 'Start Date', 'End Date', 'Days', 'Purpose', 'Notes'].join(','),
      ...residencyLogs.map((log: any) => [
        log.state,
        log.startDate,
        log.endDate,
        Math.ceil((new Date(log.endDate).getTime() - new Date(log.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1,
        log.purpose || '',
        log.notes || ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dwellpath-residency-data-${exportYear}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Residency data exported successfully",
    });
  };

  const exportExpenseData = () => {
    const csvContent = [
      ['Date', 'State', 'Amount', 'Category', 'Description'].join(','),
      ...expenses.map((expense: any) => [
        expense.expenseDate,
        expense.state,
        expense.amount,
        expense.category,
        expense.description || ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dwellpath-expenses-${exportYear}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Expense data exported successfully",
    });
  };

  const exportJournalData = () => {
    const csvContent = [
      ['Date', 'State', 'Title', 'Category', 'Content'].join(','),
      ...journalEntries.map((entry: any) => [
        entry.entryDate,
        entry.state || '',
        entry.title,
        entry.category,
        entry.content
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dwellpath-journal-${exportYear}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Journal entries exported successfully",
    });
  };

  const downloadLetter = () => {
    if (!letterContent) return;
    
    const blob = new Blob([letterContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-letter-${selectedState}-${exportYear}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Audit letter downloaded successfully",
    });
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading export tools...</p>
        </div>
      </div>
    );
  }

  return (
    <AppLayout 
      title="Export & Audit Tools" 
      subtitle="Generate reports and documentation for tax compliance and audit preparation"
    >
      <div className="page-container">
        <StaggeredPageContent>
            {/* Export Controls */}
            <Card className="mb-8">
            <CardHeader>
              <CardTitle>Export Settings</CardTitle>
              <CardDescription>
                Configure the data range and format for your exports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="exportYear">Export Year</Label>
                  <Select value={exportYear} onValueChange={setExportYear}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 5 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Data Summary for {exportYear}</Label>
                  <div className="text-sm text-gray-600 pt-2">
                    <p>{residencyLogs.length} residency logs</p>
                    <p>{expenses.length} expense records</p>
                    <p>{journalEntries.length} journal entries</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Data Exports */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 font-heading text-lg font-bold text-brand-primary dark:text-foreground">
                    <Download className="h-5 w-5 text-brand-primary dark:text-accent" />
                    <span>Data Exports</span>
                  </CardTitle>
                  <CardDescription>
                    Export your raw data in CSV format for analysis or backup
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={exportResidencyData}
                    disabled={residencyLogs.length === 0}
                  >
                    <Calendar className="mr-3 h-4 w-4 text-brand-primary dark:text-accent" />
                    Export Residency Logs ({residencyLogs.length} records)
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={exportExpenseData}
                    disabled={expenses.length === 0}
                  >
                    <Receipt className="mr-3 h-4 w-4 text-brand-primary dark:text-accent" />
                    Export Expense Records ({expenses.length} records)
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={exportJournalData}
                    disabled={journalEntries.length === 0}
                  >
                    <BookOpen className="mr-3 h-4 w-4 text-brand-primary dark:text-accent" />
                    Export Journal Entries ({journalEntries.length} records)
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 font-heading text-lg font-bold text-brand-primary dark:text-foreground">
                    <Shield className="h-5 w-5 text-brand-primary dark:text-accent" />
                    <span>Compliance Reports</span>
                  </CardTitle>
                  <CardDescription>
                    AI-generated summaries and analysis for tax compliance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => complianceSummaryMutation.mutate()}
                    disabled={complianceSummaryMutation.isPending || residencyStats.length === 0}
                  >
                    <FileText className="mr-3 h-4 w-4 text-brand-primary dark:text-accent" />
                    {complianceSummaryMutation.isPending 
                      ? "Generating Compliance Summary..." 
                      : "Generate Compliance Summary"
                    }
                  </Button>
                  
                  <div className="text-sm text-gray-600">
                    <p>Includes risk assessment, recommendations, and detailed statistics for {exportYear}.</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Audit Letter Generator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 font-heading text-lg font-bold text-brand-primary dark:text-foreground">
                  <FileText className="h-5 w-5 text-brand-primary dark:text-accent" />
                  <span>Audit Letter Generator</span>
                </CardTitle>
                <CardDescription>
                  Generate professional non-residency affidavit letters for specific states
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="auditState">Target State</Label>
                  <Select value={selectedState} onValueChange={setSelectedState}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state for audit letter" />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.map((state) => (
                        <SelectItem key={state.code} value={state.code}>
                          {state.name} ({state.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  className="w-full"
                  onClick={() => auditLetterMutation.mutate()}
                  disabled={auditLetterMutation.isPending || !selectedState || residencyStats.length === 0}
                >
                  {auditLetterMutation.isPending 
                    ? "Generating Letter..." 
                    : "Generate Audit Letter"
                  }
                </Button>

                {letterContent && (
                  <>
                    <Separator />
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Generated Letter Preview</Label>
                        <Button size="sm" onClick={downloadLetter}>
                          <Download className="mr-2 h-4 w-4 text-brand-primary dark:text-accent" />
                          Download
                        </Button>
                      </div>
                      <Textarea
                        value={letterContent}
                        onChange={(e) => setLetterContent(e.target.value)}
                        rows={12}
                        className="font-mono text-sm"
                        placeholder="Generated audit letter will appear here..."
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        You can edit the letter content before downloading.
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Export Guidelines */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-heading text-lg font-bold text-brand-primary dark:text-foreground">Export Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Data Exports</h4>
                  <ul className="space-y-1">
                    <li>• CSV files can be opened in Excel or imported into other systems</li>
                    <li>• All dates are in YYYY-MM-DD format for consistency</li>
                    <li>• Fields with commas are automatically quoted</li>
                    <li>• Keep backups of exported data in secure locations</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Audit Preparation</h4>
                  <ul className="space-y-1">
                    <li>• Compliance summaries provide AI-analyzed insights</li>
                    <li>• Audit letters are templates that may need customization</li>
                    <li>• Review all generated content before submitting to authorities</li>
                    <li>• Consider consulting a tax professional for complex cases</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </StaggeredPageContent>  
      </div>
    </AppLayout>
  );
}
