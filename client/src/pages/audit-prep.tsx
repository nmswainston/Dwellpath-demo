import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { auditDocumentsApi } from "@/lib/apiClient";
import { FileText, Download, Trash2, FileCheck, FileBarChart, Calculator, AlertCircle, Calendar, Building2 } from "lucide-react";
import type { AuditDocument } from "@shared/schema";
import { StaggeredPageContent } from "@/components/layout/PageTransition";

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
const states = [
  { code: 'FL', name: 'Florida' },
  { code: 'NY', name: 'New York' },
  { code: 'CA', name: 'California' },
  { code: 'TX', name: 'Texas' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'NV', name: 'Nevada' },
  { code: 'CO', name: 'Colorado' },
  { code: 'MI', name: 'Michigan' },
  { code: 'IL', name: 'Illinois' },
  { code: 'PA', name: 'Pennsylvania' },
];

import AppLayout from "@/components/layout/AppLayout";

export default function AuditPrep() {
  const [documentType, setDocumentType] = useState<string>('');
  const [taxYear, setTaxYear] = useState<number>(currentYear);
  const [state, setState] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: auditDocuments = [], isLoading } = useQuery<AuditDocument[]>({
    queryKey: ['/api/audit-documents'],
  });

  const generateDocumentMutation = useMutation({
    mutationFn: async (params: { documentType: string; taxYear: number; state?: string }) => {
      const blob = await auditDocumentsApi.generate(params.documentType, params.taxYear, params.state);
      
      // Download the PDF
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const filename = `${params.documentType}-${params.taxYear}${params.state ? `-${params.state}` : ''}.pdf`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast({
        title: "Document Generated",
        description: "Your audit document has been generated and downloaded.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/audit-documents'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (id: string) => {
      await auditDocumentsApi.delete(id);
    },
    onSuccess: () => {
      toast({
        title: "Document Deleted",
        description: "The audit document has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/audit-documents'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerateDocument = () => {
    if (!documentType || !taxYear) {
      toast({
        title: "Missing Information",
        description: "Please select document type and tax year.",
        variant: "destructive",
      });
      return;
    }

    if (documentType === 'state_summary' && !state) {
      toast({
        title: "Missing State",
        description: "Please select a state for the state summary.",
        variant: "destructive",
      });
      return;
    }

    generateDocumentMutation.mutate({
      documentType,
      taxYear,
      state: documentType === 'state_summary' || documentType === 'expense_report' ? state : undefined,
    });
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'full_audit_package':
        return FileCheck;
      case 'state_summary':
        return Building2;
      case 'expense_report':
        return Calculator;
      default:
        return FileText;
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'full_audit_package':
        return 'Full Audit Package';
      case 'state_summary':
        return 'State Summary';
      case 'expense_report':
        return 'Expense Report';
      default:
        return type;
    }
  };

  return (
    <AppLayout 
      title="Audit Preparation" 
      subtitle="Generate comprehensive documentation packages for tax audits and compliance reviews"
    >
      <div className="page-container">
        <StaggeredPageContent>

      {/* Document Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 font-heading text-lg font-bold text-brand-primary dark:text-foreground">
            <FileBarChart className="h-5 w-5 text-brand-primary dark:text-accent" />
            <span>Generate Audit Document</span>
          </CardTitle>
          <CardDescription>
            Create professional PDF reports with your residency data, expenses, and compliance analysis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Document Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="document-type">Document Type</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger id="document-type" name="document-type">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_audit_package">
                    <div className="flex items-center space-x-2">
                      <FileCheck className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Full Audit Package</div>
                        <div className="text-xs text-muted-foreground">Complete documentation</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="state_summary">
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4" />
                      <div>
                        <div className="font-medium">State Summary</div>
                        <div className="text-xs text-muted-foreground">Single state focus</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="expense_report">
                    <div className="flex items-center space-x-2">
                      <Calculator className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Expense Report</div>
                        <div className="text-xs text-muted-foreground">Detailed expenses</div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tax Year Selection */}
            <div className="space-y-2">
              <Label htmlFor="tax-year">Tax Year</Label>
              <Select value={taxYear.toString()} onValueChange={(value) => setTaxYear(parseInt(value))}>
                <SelectTrigger id="tax-year" name="tax-year">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* State Selection (conditional) */}
            {(documentType === 'state_summary' || documentType === 'expense_report') && (
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger id="state" name="state">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((st) => (
                      <SelectItem key={st.code} value={st.code}>
                        {st.name} ({st.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <Button 
            onClick={handleGenerateDocument} 
            disabled={generateDocumentMutation.isPending}
            className="w-full"
          >
            {generateDocumentMutation.isPending ? (
              "Generating Document..."
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Generate & Download PDF
              </>
            )}
          </Button>

          {/* Information Alert */}
          <div className="flex items-start space-x-3 p-4 bg-[hsl(var(--status-neutral)/0.08)] border border-[hsl(var(--status-neutral)/0.20)] rounded-xl">
            <AlertCircle className="h-5 w-5 text-status-neutral mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground">Professional Documentation</p>
              <p className="text-muted-foreground">
                Generated PDFs include detailed residency logs, expense summaries, risk assessments, 
                and compliance analysis suitable for tax professionals and audit reviews.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Document History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Document History</span>
          </CardTitle>
          <CardDescription>
            Previously generated audit documents and reports.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground">Loading documents...</div>
            </div>
          ) : auditDocuments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <div className="text-muted-foreground">No audit documents generated yet</div>
              <div className="text-sm text-muted-foreground">
                Generate your first document using the form above
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {auditDocuments.map((doc) => {
                const IconComponent = getDocumentIcon(doc.documentType);
                return (
                  <div key={doc.id} className="flex items-center justify-between p-4 border border-border rounded-xl bg-card shadow-sm">
                    <div className="flex items-start space-x-4 min-w-0 flex-1">
                      <IconComponent className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium break-words">{doc.title}</h4>
                        <p className="text-sm text-muted-foreground break-words">{doc.description}</p>
                        <div className="flex items-center space-x-4 mt-2 flex-wrap gap-2">
                          <Badge variant="secondary">
                            {getDocumentTypeLabel(doc.documentType)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Generated: {doc.generatedAt ? new Date(doc.generatedAt).toLocaleDateString() : 'Unknown'}
                          </span>
                          {doc.state && (
                            <Badge variant="outline">{doc.state}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteDocumentMutation.mutate(doc.id)}
                        disabled={deleteDocumentMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
        </StaggeredPageContent>
      </div>
    </AppLayout>
  );
}