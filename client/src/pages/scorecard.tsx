import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { handleUnauthorized } from "@/utils/handleUnauthorized";
import AppLayout from "@/components/layout/app-layout";
import { StaggeredPageContent } from "@/components/layout/page-transition";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Shield, TrendingUp, Calendar, MapPin, DollarSign, Home, Car, Vote } from "lucide-react";
import { cn } from "@/lib/utils";

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
    case 'safe': return 'default';
    case 'low': return 'secondary';
    case 'moderate': return 'outline';
    case 'high': return 'destructive';
    case 'critical': return 'destructive';
    default: return 'outline';
  }
}

function getRiskColor(riskLevel: string) {
  switch (riskLevel) {
    case 'safe': return 'text-brand-primary';
    case 'low': return 'text-brand-text-light dark:text-brand-text-dark';
    case 'moderate': return 'text-brand-text-light/80 dark:text-brand-text-dark/80';
    case 'high': return 'text-brand-text-light/70 dark:text-brand-text-dark/70';
    case 'critical': return 'text-brand-text-light dark:text-brand-text-dark';
    default: return 'text-brand-text-light/70 dark:text-brand-text-dark/70';
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
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-600 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/30 border-t-white"></div>
          </div>
          <h3 className="text-lg font-heading font-semibold text-brand-primary dark:text-foreground mb-2">Loading Scorecard</h3>
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
              <Card className="border-l-4 border-l-brand-bg-dark">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl font-heading font-bold text-brand-primary dark:text-foreground">Overall Risk Assessment</CardTitle>
                      <CardDescription className="font-body text-muted-foreground dark:text-muted-foreground">Your tax residency compliance status across all states</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className={cn("text-3xl font-bold", getRiskColor(overallRisk))}>
                        {overallRisk === 'safe' ? '✅ SAFE' : 
                         overallRisk === 'moderate' ? '⚠️ MODERATE' : 
                         '🚨 HIGH RISK'}
                      </div>
                      <p className="text-sm text-slate-600 mt-1">Tax Year 2024</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 rounded-xl bg-brand-bg-light border border-brand-primary">
                      <div className="text-2xl font-bold text-brand-primary">
                        {mockStateData.filter(s => s.riskLevel === 'safe').length}
                      </div>
                      <div className="text-sm text-brand-text-light">Safe States</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-yellow-50 border border-yellow-200">
                      <div className="text-2xl font-bold text-yellow-600">
                        {mockStateData.filter(s => s.riskLevel === 'moderate').length}
                      </div>
                      <div className="text-sm text-yellow-700">Moderate Risk</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-red-50 border border-red-200">
                      <div className="text-2xl font-bold text-red-600">
                        {mockStateData.filter(s => s.riskLevel === 'high' || s.riskLevel === 'critical').length}
                      </div>
                      <div className="text-sm text-red-700">High Risk</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* State-by-State Breakdown */}
              <div>
                <div className="header-spacing">
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">State-by-State Analysis</h2>
                  <p className="text-slate-600 text-sm mt-1">Detailed risk assessment for each state you've tracked</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {mockStateData.map((stateData) => {
                    const RiskIcon = getRiskIcon(stateData.riskLevel);
                    
                    return (
                      <Card key={stateData.state} className="hover:shadow-lg transition-shadow duration-200">
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 rounded-xl bg-brand-accent dark:bg-accent flex items-center justify-center text-white font-bold text-lg">
                                {stateData.state}
                              </div>
                              <div>
                                <CardTitle className="text-xl">{stateData.stateName}</CardTitle>
                                <CardDescription>Tax residency analysis</CardDescription>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center space-x-2 mb-2">
                                <RiskIcon className={cn("w-5 h-5", getRiskColor(stateData.riskLevel))} />
                                <span className={cn("text-lg font-bold", getRiskColor(stateData.riskLevel))}>
                                  {stateData.riskPercentage}% Safe
                                </span>
                              </div>
                              <Badge variant={getRiskBadgeVariant(stateData.riskLevel)} className="text-xs">
                                {stateData.riskLevel.toUpperCase()} RISK
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-6">
                          {/* Days Tracking */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-brand-primary dark:text-accent" />
                                <span className="text-sm font-medium">Days Tracked</span>
                              </div>
                              <span className="text-sm text-slate-600">
                                {stateData.daysTracked}/{stateData.daysLimit} days
                              </span>
                            </div>
                            <Progress 
                              value={(stateData.daysTracked / stateData.daysLimit) * 100} 
                              className="h-2"
                            />
                            <p className="text-xs text-slate-500 mt-1">
                              {stateData.daysLimit - stateData.daysTracked} days until threshold
                            </p>
                          </div>

                          {/* Expense Activity */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <DollarSign className="w-4 h-4 text-brand-primary dark:text-accent" />
                                <span className="text-sm font-medium">Expense Activity</span>
                              </div>
                              <span className="text-sm text-slate-600">
                                ${stateData.expenseAmount.toLocaleString()}
                              </span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min((stateData.expenseAmount / 50000) * 100, 100)}%` }}
                              />
                            </div>
                          </div>

                          {/* Sticky Ties */}
                          <div>
                            <div className="flex items-center space-x-2 mb-3">
                              <MapPin className="w-4 h-4 text-brand-primary dark:text-accent" />
                              <span className="text-sm font-medium">Sticky Ties</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="flex items-center space-x-2">
                                <Car className={cn("w-3 h-3", stateData.stickyTies.driversLicense ? "text-brand-primary" : "text-slate-400")} />
                                <span className={stateData.stickyTies.driversLicense ? "text-brand-text-light" : "text-slate-500"}>
                                  Driver's License
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Home className={cn("w-3 h-3", stateData.stickyTies.homeOwnership ? "text-brand-primary" : "text-slate-400")} />
                                <span className={stateData.stickyTies.homeOwnership ? "text-brand-text-light" : "text-slate-500"}>
                                  Home Ownership
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Vote className={cn("w-3 h-3", stateData.stickyTies.voterRegistration ? "text-brand-primary" : "text-slate-400")} />
                                <span className={stateData.stickyTies.voterRegistration ? "text-brand-text-light" : "text-slate-500"}>
                                  Voter Registration
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <TrendingUp className={cn("w-3 h-3", stateData.stickyTies.bankAccounts ? "text-brand-primary" : "text-slate-400")} />
                                <span className={stateData.stickyTies.bankAccounts ? "text-brand-text-light" : "text-slate-500"}>
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
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Recommended Actions</CardTitle>
                  <CardDescription>Steps to improve your compliance status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button className="justify-start h-auto p-4 text-left" variant="outline">
                      <div>
                        <div className="font-medium">Update Day Tracking</div>
                        <div className="text-xs text-slate-600 mt-1">Log recent travel</div>
                      </div>
                    </Button>
                    <Button className="justify-start h-auto p-4 text-left" variant="outline">
                      <div>
                        <div className="font-medium">Add Sticky Ties</div>
                        <div className="text-xs text-slate-600 mt-1">Update state connections</div>
                      </div>
                    </Button>
                    <Button className="justify-start h-auto p-4 text-left" variant="outline">
                      <div>
                        <div className="font-medium">Export Report</div>
                        <div className="text-xs text-slate-600 mt-1">Generate compliance summary</div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
        </StaggeredPageContent>
      </div>
    </AppLayout>
  );
}