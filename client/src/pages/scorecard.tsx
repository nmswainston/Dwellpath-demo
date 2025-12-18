import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { handleUnauthorized } from "@/lib/handleUnauthorized";
import AppLayout from "@/components/layout/AppLayout";
import { StaggeredPageContent } from "@/components/layout/PageTransition";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Shield, TrendingUp, Calendar, MapPin, DollarSign, Home, Car, Vote } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatValue } from "@/components/shared/StatValue";

interface StateRiskData {
  state: string;
  stateName: string;
  daysTracked: number;
  daysLimit: number;
  expenseAmount: number;
  stickyTies: {
    driversLicense: boolean;
    homeOwnership: boolean;
    voterRegistration: boolean;
    bankAccounts: boolean;
    professionalLicense: boolean;
  };
  riskScore: number;
  riskLevel: 'safe' | 'low' | 'moderate' | 'high' | 'critical';
  riskPercentage: number;
}

const mockStateData: StateRiskData[] = [
  {
    state: 'NY',
    stateName: 'New York',
    daysTracked: 45,
    daysLimit: 183,
    expenseAmount: 15420,
    stickyTies: {
      driversLicense: false,
      homeOwnership: false,
      voterRegistration: false,
      bankAccounts: true,
      professionalLicense: false
    },
    riskScore: 86,
    riskLevel: 'safe',
    riskPercentage: 86
  },
  {
    state: 'CA',
    stateName: 'California',
    daysTracked: 95,
    daysLimit: 183,
    expenseAmount: 28750,
    stickyTies: {
      driversLicense: true,
      homeOwnership: false,
      voterRegistration: true,
      bankAccounts: true,
      professionalLicense: false
    },
    riskScore: 62,
    riskLevel: 'moderate',
    riskPercentage: 62
  },
  {
    state: 'FL',
    stateName: 'Florida',
    daysTracked: 220,
    daysLimit: 183,
    expenseAmount: 45320,
    stickyTies: {
      driversLicense: true,
      homeOwnership: true,
      voterRegistration: true,
      bankAccounts: true,
      professionalLicense: true
    },
    riskScore: 95,
    riskLevel: 'safe',
    riskPercentage: 95
  },
  {
    state: 'TX',
    stateName: 'Texas',
    daysTracked: 165,
    daysLimit: 183,
    expenseAmount: 22100,
    stickyTies: {
      driversLicense: false,
      homeOwnership: false,
      voterRegistration: false,
      bankAccounts: false,
      professionalLicense: false
    },
    riskScore: 25,
    riskLevel: 'high',
    riskPercentage: 25
  }
];

function getRiskBadgeVariant(riskLevel: string) {
  switch (riskLevel) {
    case 'safe':
    case 'low': return 'default';
    case 'moderate': return 'outline';
    case 'high':
    case 'critical': return 'destructive';
    default: return 'outline';
  }
}

function getRiskColor(riskLevel: string) {
  switch (riskLevel) {
    case 'safe':
    case 'low': return 'text-status-safe';
    case 'moderate': return 'text-status-warning';
    case 'high':
    case 'critical': return 'text-status-risk';
    default: return 'text-status-neutral';
  }
}

function getStatusBadgeClass(riskLevel: string) {
  switch (riskLevel) {
    case 'safe':
    case 'low': return 'status-safe';
    case 'moderate': return 'status-warning';
    case 'high':
    case 'critical': return 'status-risk';
    default: return '';
  }
}

function getRiskIcon(riskLevel: string) {
  switch (riskLevel) {
    case 'safe': return CheckCircle;
    case 'low': return Shield;
    case 'moderate': return AlertTriangle;
    case 'high': return AlertTriangle;
    case 'critical': return AlertTriangle;
    default: return Shield;
  }
}

export default function Scorecard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      handleUnauthorized(toast);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center winter-card p-8 max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/30 border-t-white"></div>
          </div>
          <h3 className="text-lg font-heading font-semibold text-foreground mb-2">Loading Scorecard</h3>
          <p className="font-body text-muted-foreground dark:text-muted-foreground">Calculating your residency risk...</p>
        </div>
      </div>
    );
  }

  const overallRisk = mockStateData.reduce((acc, state) => {
    if (state.riskLevel === 'critical' || state.riskLevel === 'high') return 'high';
    if (state.riskLevel === 'moderate' && acc !== 'high') return 'moderate';
    return acc;
  }, 'safe' as string);

  return (
    <AppLayout 
      title="Residency Scorecard" 
      subtitle="TL;DR: Are you safe or screwed?"
    >
      <div className="page-container">
        <StaggeredPageContent>
          {/* Overall Risk Summary */}
          <section className="space-y-6">
            <Card className="border-l-4 border-l-primary">
              <CardHeader>
                <div className="grid grid-cols-[1fr_auto] gap-4 items-start">
                  <div className="min-w-0">
                    <CardTitle className="text-2xl font-heading font-bold text-foreground break-words">Overall Risk Assessment</CardTitle>
                    <CardDescription className="font-body text-muted-foreground break-words mt-2">Your tax residency compliance status across all states</CardDescription>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={cn("text-3xl font-bold whitespace-nowrap", getRiskColor(overallRisk))}>
                      {overallRisk === 'safe' || overallRisk === 'low' ? '✅ SAFE' : 
                       overallRisk === 'moderate' ? '⚠️ MODERATE' : 
                       '🚨 HIGH RISK'}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">Tax Year 2024</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 rounded-xl bg-status-safe/5 border border-status-safe/20">
                    <StatValue as="div" className="text-status-safe">
                      {mockStateData.filter(s => s.riskLevel === 'safe').length}
                    </StatValue>
                    <div className="text-sm text-foreground">Safe States</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-status-warning/5 border border-status-warning/20">
                    <StatValue as="div" className="text-status-warning">
                      {mockStateData.filter(s => s.riskLevel === 'moderate').length}
                    </StatValue>
                    <div className="text-sm text-status-warning/90">Moderate Risk</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-status-risk/5 border border-status-risk/20">
                    <StatValue as="div" className="text-status-risk">
                      {mockStateData.filter(s => s.riskLevel === 'high' || s.riskLevel === 'critical').length}
                    </StatValue>
                    <div className="text-sm text-status-risk/90">High Risk</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* State-by-State Breakdown */}
          <section className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground tracking-tight">State-by-State Analysis</h2>
              <p className="text-muted-foreground text-sm">Detailed risk assessment for each state you've tracked</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {mockStateData.map((stateData) => {
                    const RiskIcon = getRiskIcon(stateData.riskLevel);
                    
                    return (
                      <Card key={stateData.state} className="hover:shadow-lg transition-shadow duration-200">
                        <CardHeader className="pb-4">
                          <div className="grid grid-cols-[1fr_auto] gap-3 items-start">
                            <div className="flex items-center space-x-3 min-w-0">
                              <div
                                className={cn(
                                  "w-10 h-10 bg-brand-accent dark:bg-accent rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg flex-shrink-0",
                                  "w-12 h-12 bg-primary text-primary-foreground/60 shadow-none",
                                )}
                              >
                                {stateData.state.toUpperCase()}
                              </div>
                              <div className="min-w-0 flex-1">
                                <CardTitle className="text-xl break-words">{stateData.stateName}</CardTitle>
                                <CardDescription className="break-words">Tax residency analysis</CardDescription>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="flex items-center justify-end gap-2 mb-2">
                                <RiskIcon className={cn("w-5 h-5 shrink-0", getRiskColor(stateData.riskLevel))} />
                                <span className={cn("text-lg font-bold whitespace-nowrap numeric", getRiskColor(stateData.riskLevel))}>
                                  {stateData.riskPercentage}% Safe
                                </span>
                              </div>
                              <Badge variant={getRiskBadgeVariant(stateData.riskLevel)} className={cn("text-xs state-badge", getStatusBadgeClass(stateData.riskLevel))}>
                                {stateData.riskLevel.toUpperCase()} RISK
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-6">
                          {/* Days Tracking */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2 min-w-0 flex-1">
                                <Calendar className="w-4 h-4 text-primary shrink-0" />
                                <span className="text-sm font-medium truncate">Days Tracked</span>
                              </div>
                              <span className="text-sm text-muted-foreground shrink-0 numeric">
                                {stateData.daysTracked}/{stateData.daysLimit} days
                              </span>
                            </div>
                            <Progress 
                              value={(stateData.daysTracked / stateData.daysLimit) * 100} 
                              className="h-2"
                            />
                            <p className="text-xs text-muted-foreground mt-1 numeric">
                              {stateData.daysLimit - stateData.daysTracked} days until threshold
                            </p>
                          </div>

                          {/* Expense Activity */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2 min-w-0 flex-1">
                                <DollarSign className="w-4 h-4 text-primary shrink-0" />
                                <span className="text-sm font-medium truncate">Expense Activity</span>
                              </div>
                              <span className="text-sm text-muted-foreground shrink-0 numeric">
                                ${stateData.expenseAmount.toLocaleString()}
                              </span>
                            </div>
                            <Progress
                              value={Math.min((stateData.expenseAmount / 50000) * 100, 100)}
                              className="h-2 bg-muted"
                            />
                          </div>

                          {/* Sticky Ties */}
                          <div>
                            <div className="flex items-center space-x-2 mb-3 min-w-0">
                              <MapPin className="w-4 h-4 text-primary shrink-0" />
                              <span className="text-sm font-medium min-w-0">Sticky Ties</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="flex items-center space-x-2 min-w-0">
                                <Car className={cn("w-3 h-3 shrink-0", stateData.stickyTies.driversLicense ? "text-primary" : "text-muted-foreground")} />
                                <span className={cn("truncate", stateData.stickyTies.driversLicense ? "text-foreground" : "text-muted-foreground")}>
                                  Driver's License
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 min-w-0">
                                <Home className={cn("w-3 h-3 shrink-0", stateData.stickyTies.homeOwnership ? "text-primary" : "text-muted-foreground")} />
                                <span className={cn("truncate", stateData.stickyTies.homeOwnership ? "text-foreground" : "text-muted-foreground")}>
                                  Home Ownership
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 min-w-0">
                                <Vote className={cn("w-3 h-3 shrink-0", stateData.stickyTies.voterRegistration ? "text-primary" : "text-muted-foreground")} />
                                <span className={cn("truncate", stateData.stickyTies.voterRegistration ? "text-foreground" : "text-muted-foreground")}>
                                  Voter Registration
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 min-w-0">
                                <TrendingUp className={cn("w-3 h-3 shrink-0", stateData.stickyTies.bankAccounts ? "text-primary" : "text-muted-foreground")} />
                                <span className={cn("truncate", stateData.stickyTies.bankAccounts ? "text-foreground" : "text-muted-foreground")}>
                                  Bank Accounts
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex space-x-2 pt-2">
                            <Button variant="outline" size="sm" className="flex-1">
                              View Details
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1">
                              Add Tie
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
            </div>
          </section>

          {/* Quick Actions */}
          <section className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="break-words">Recommended Actions</CardTitle>
                <CardDescription className="break-words">Steps to improve your compliance status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button className="justify-start h-auto p-4 text-left" variant="outline">
                      <div>
                        <div className="font-medium">Update Day Tracking</div>
                        <div className="text-xs text-muted-foreground mt-1">Log recent travel</div>
                      </div>
                    </Button>
                    <Button className="justify-start h-auto p-4 text-left" variant="outline">
                      <div>
                        <div className="font-medium">Add Sticky Ties</div>
                        <div className="text-xs text-muted-foreground mt-1">Update state connections</div>
                      </div>
                    </Button>
                    <Button className="justify-start h-auto p-4 text-left" variant="outline">
                      <div>
                        <div className="font-medium">Export Report</div>
                        <div className="text-xs text-muted-foreground mt-1">Generate compliance summary</div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
            </Card>
          </section>
        </StaggeredPageContent>
      </div>
    </AppLayout>
  );
}