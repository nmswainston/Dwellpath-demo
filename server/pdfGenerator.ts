import puppeteer from 'puppeteer';
import { storage } from './storage';
import type { User, ResidencyLog, Expense, JournalEntry } from '@shared/schema';

export interface AuditReportData {
  user: User;
  taxYear: number;
  state?: string;
  residencyLogs: ResidencyLog[];
  expenses: Expense[];
  journalEntries: JournalEntry[];
  summary: {
    totalDaysInState: number;
    totalExpenses: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    complianceStatus: string;
  };
}

export class PDFGenerator {
  private async getBrowser() {
    return await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  async generateFullAuditPackage(userId: string, taxYear: number): Promise<Buffer> {
    const data = await this.gatherAuditData(userId, taxYear);
    const html = this.generateFullAuditHTML(data);
    
    const browser = await this.getBrowser();
    const page = await browser.newPage();
    
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '1in',
        right: '0.75in',
        bottom: '1in',
        left: '0.75in'
      }
    });
    
    await browser.close();
    return Buffer.from(pdf);
  }

  async generateStateSummary(userId: string, state: string, taxYear: number): Promise<Buffer> {
    const data = await this.gatherStateSpecificData(userId, state, taxYear);
    const html = this.generateStateSummaryHTML(data);
    
    const browser = await this.getBrowser();
    const page = await browser.newPage();
    
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '1in',
        right: '0.75in',
        bottom: '1in',
        left: '0.75in'
      }
    });
    
    await browser.close();
    return Buffer.from(pdf);
  }

  async generateExpenseReport(userId: string, taxYear: number, state?: string): Promise<Buffer> {
    const expenses = await storage.getExpensesByYear(userId, taxYear, state);
    const user = await storage.getUser(userId);
    
    const html = this.generateExpenseReportHTML({
      user: user!,
      expenses,
      taxYear,
      state,
      totalAmount: expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0)
    });
    
    const browser = await this.getBrowser();
    const page = await browser.newPage();
    
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '1in',
        right: '0.75in',
        bottom: '1in',
        left: '0.75in'
      }
    });
    
    await browser.close();
    return Buffer.from(pdf);
  }

  private async gatherAuditData(userId: string, taxYear: number): Promise<AuditReportData> {
    const user = await storage.getUser(userId);
    const residencyLogs = await storage.getResidencyLogsByYear(userId, taxYear);
    const expenses = await storage.getExpensesByYear(userId, taxYear);
    const journalEntries = await storage.getJournalEntriesByYear(userId, taxYear);

    // Calculate summary statistics
    const totalDaysInState = residencyLogs.reduce((total, log) => {
      const start = new Date(log.startDate);
      const end = new Date(log.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return total + days;
    }, 0);

    const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

    // Simple risk assessment
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    const stateGroups = this.groupByState(residencyLogs);
    
    for (const [state, logs] of Object.entries(stateGroups)) {
      const stateDays = logs.reduce((total, log) => {
        const start = new Date(log.startDate);
        const end = new Date(log.endDate);
        return total + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      }, 0);
      
      if (stateDays >= 183) riskLevel = 'critical';
      else if (stateDays >= 150) riskLevel = 'high';
      else if (stateDays >= 120) riskLevel = 'medium';
    }

    return {
      user: user!,
      taxYear,
      residencyLogs,
      expenses,
      journalEntries,
      summary: {
        totalDaysInState,
        totalExpenses,
        riskLevel,
        complianceStatus: riskLevel === 'critical' ? 'At Risk' : 'Compliant'
      }
    };
  }

  private async gatherStateSpecificData(userId: string, state: string, taxYear: number): Promise<AuditReportData> {
    const user = await storage.getUser(userId);
    const residencyLogs = await storage.getResidencyLogsByState(userId, state, taxYear);
    const expenses = await storage.getExpensesByYear(userId, taxYear, state);
    const journalEntries = await storage.getJournalEntriesByState(userId, state, taxYear);

    const totalDaysInState = residencyLogs.reduce((total, log) => {
      const start = new Date(log.startDate);
      const end = new Date(log.endDate);
      return total + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }, 0);

    const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (totalDaysInState >= 183) riskLevel = 'critical';
    else if (totalDaysInState >= 150) riskLevel = 'high';
    else if (totalDaysInState >= 120) riskLevel = 'medium';

    return {
      user: user!,
      taxYear,
      state,
      residencyLogs,
      expenses,
      journalEntries,
      summary: {
        totalDaysInState,
        totalExpenses,
        riskLevel,
        complianceStatus: riskLevel === 'critical' ? 'At Risk' : 'Compliant'
      }
    };
  }

  private groupByState(logs: ResidencyLog[]): Record<string, ResidencyLog[]> {
    return logs.reduce((acc, log) => {
      if (!acc[log.state]) acc[log.state] = [];
      acc[log.state].push(log);
      return acc;
    }, {} as Record<string, ResidencyLog[]>);
  }

  private generateFullAuditHTML(data: AuditReportData): string {
    const stateGroups = this.groupByState(data.residencyLogs);
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Tax Residency Audit Package - ${data.taxYear}</title>
      <style>
        body { font-family: 'Arial', sans-serif; margin: 0; padding: 20px; color: #333; }
        .header { text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #2563eb; margin: 0; font-size: 28px; }
        .header .subtitle { color: #6b7280; margin: 10px 0; }
        .section { margin: 30px 0; page-break-inside: avoid; }
        .section h2 { color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
        .section h3 { color: #374151; margin-top: 25px; }
        .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; }
        .summary-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; background: #f9fafb; }
        .summary-card h4 { margin: 0 0 10px 0; color: #374151; }
        .summary-card .value { font-size: 24px; font-weight: bold; color: #2563eb; }
        .risk-critical { color: #dc2626; }
        .risk-high { color: #ea580c; }
        .risk-medium { color: #d97706; }
        .risk-low { color: #16a34a; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; }
        th { background: #f9fafb; font-weight: 600; }
        tr:nth-child(even) { background: #f9fafb; }
        .page-break { page-break-before: always; }
        .journal-entry { margin: 20px 0; border-left: 4px solid #2563eb; padding-left: 20px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Tax Residency Audit Package</h1>
        <div class="subtitle">Generated for ${data.user.firstName} ${data.user.lastName}</div>
        <div class="subtitle">Tax Year: ${data.taxYear}</div>
        <div class="subtitle">Generated: ${new Date().toLocaleDateString()}</div>
      </div>

      <div class="section">
        <h2>Executive Summary</h2>
        <div class="summary-grid">
          <div class="summary-card">
            <h4>Total Days Tracked</h4>
            <div class="value">${data.summary.totalDaysInState}</div>
          </div>
          <div class="summary-card">
            <h4>Total Expenses</h4>
            <div class="value">$${data.summary.totalExpenses.toLocaleString()}</div>
          </div>
          <div class="summary-card">
            <h4>Risk Assessment</h4>
            <div class="value risk-${data.summary.riskLevel}">${data.summary.riskLevel.toUpperCase()}</div>
          </div>
          <div class="summary-card">
            <h4>Compliance Status</h4>
            <div class="value">${data.summary.complianceStatus}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>State-by-State Analysis</h2>
        ${Object.entries(stateGroups).map(([state, logs]) => {
          const stateDays = logs.reduce((total, log) => {
            const start = new Date(log.startDate);
            const end = new Date(log.endDate);
            return total + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          }, 0);
          
          return `
            <h3>${state} - ${stateDays} days (${stateDays >= 183 ? 'EXCEEDS THRESHOLD' : 'Within Limits'})</h3>
            <table>
              <thead>
                <tr>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Days</th>
                  <th>Purpose</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                ${logs.map(log => {
                  const start = new Date(log.startDate);
                  const end = new Date(log.endDate);
                  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                  return `
                    <tr>
                      <td>${log.startDate}</td>
                      <td>${log.endDate}</td>
                      <td>${days}</td>
                      <td>${log.purpose || 'N/A'}</td>
                      <td>${log.notes || 'N/A'}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          `;
        }).join('')}
      </div>

      <div class="section page-break">
        <h2>Expense Summary</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>State</th>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${data.expenses.map(expense => `
              <tr>
                <td>${expense.expenseDate}</td>
                <td>${expense.state}</td>
                <td>${expense.category}</td>
                <td>${expense.description || 'N/A'}</td>
                <td>$${parseFloat(expense.amount).toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      ${data.journalEntries.length > 0 ? `
      <div class="section page-break">
        <h2>Journal Entries</h2>
        ${data.journalEntries.map(entry => `
          <div class="journal-entry">
            <h4>${entry.title} - ${entry.entryDate}</h4>
            <p><strong>State:</strong> ${entry.state || 'N/A'} | <strong>Category:</strong> ${entry.category}</p>
            <p>${entry.content}</p>
          </div>
        `).join('')}
      </div>
      ` : ''}

      <div class="footer">
        Generated by Dwellpath<br>
        This document contains confidential tax information
      </div>
    </body>
    </html>
    `;
  }

  private generateStateSummaryHTML(data: AuditReportData): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${data.state} Tax Residency Summary - ${data.taxYear}</title>
      <style>
        body { font-family: 'Arial', sans-serif; margin: 0; padding: 20px; color: #333; }
        .header { text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #2563eb; margin: 0; font-size: 28px; }
        .section { margin: 30px 0; }
        .section h2 { color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
        .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; }
        .summary-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; background: #f9fafb; }
        .summary-card h4 { margin: 0 0 10px 0; color: #374151; }
        .summary-card .value { font-size: 24px; font-weight: bold; color: #2563eb; }
        .risk-critical { color: #dc2626; }
        .risk-high { color: #ea580c; }
        .risk-medium { color: #d97706; }
        .risk-low { color: #16a34a; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; }
        th { background: #f9fafb; font-weight: 600; }
        tr:nth-child(even) { background: #f9fafb; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${data.state} Tax Residency Summary</h1>
        <div class="subtitle">Generated for ${data.user.firstName} ${data.user.lastName}</div>
        <div class="subtitle">Tax Year: ${data.taxYear}</div>
        <div class="subtitle">Generated: ${new Date().toLocaleDateString()}</div>
      </div>

      <div class="section">
        <h2>Summary</h2>
        <div class="summary-grid">
          <div class="summary-card">
            <h4>Days in ${data.state}</h4>
            <div class="value">${data.summary.totalDaysInState}</div>
          </div>
          <div class="summary-card">
            <h4>Expenses in ${data.state}</h4>
            <div class="value">$${data.summary.totalExpenses.toLocaleString()}</div>
          </div>
          <div class="summary-card">
            <h4>Risk Level</h4>
            <div class="value risk-${data.summary.riskLevel}">${data.summary.riskLevel.toUpperCase()}</div>
          </div>
          <div class="summary-card">
            <h4>Status</h4>
            <div class="value">${data.summary.complianceStatus}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Residency Log</h2>
        <table>
          <thead>
            <tr>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Days</th>
              <th>Purpose</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            ${data.residencyLogs.map(log => {
              const start = new Date(log.startDate);
              const end = new Date(log.endDate);
              const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
              return `
                <tr>
                  <td>${log.startDate}</td>
                  <td>${log.endDate}</td>
                  <td>${days}</td>
                  <td>${log.purpose || 'N/A'}</td>
                  <td>${log.notes || 'N/A'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <div class="footer">
        Generated by Dwellpath
      </div>
    </body>
    </html>
    `;
  }

  private generateExpenseReportHTML(data: { user: User; expenses: Expense[]; taxYear: number; state?: string; totalAmount: number }): string {
    const expensesByCategory = data.expenses.reduce((acc, expense) => {
      if (!acc[expense.category]) acc[expense.category] = [];
      acc[expense.category].push(expense);
      return acc;
    }, {} as Record<string, Expense[]>);

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Expense Report ${data.state ? `- ${data.state}` : ''} - ${data.taxYear}</title>
      <style>
        body { font-family: 'Arial', sans-serif; margin: 0; padding: 20px; color: #333; }
        .header { text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #2563eb; margin: 0; font-size: 28px; }
        .section { margin: 30px 0; }
        .section h2 { color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
        .summary-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; background: #f9fafb; margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; }
        th { background: #f9fafb; font-weight: 600; }
        tr:nth-child(even) { background: #f9fafb; }
        .total { font-weight: bold; background: #2563eb; color: white; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Expense Report${data.state ? ` - ${data.state}` : ''}</h1>
        <div class="subtitle">Generated for ${data.user.firstName} ${data.user.lastName}</div>
        <div class="subtitle">Tax Year: ${data.taxYear}</div>
        <div class="subtitle">Generated: ${new Date().toLocaleDateString()}</div>
      </div>

      <div class="summary-card">
        <h3>Total Expenses: $${data.totalAmount.toLocaleString()}</h3>
        <p>Number of transactions: ${data.expenses.length}</p>
      </div>

      ${Object.entries(expensesByCategory).map(([category, expenses]) => {
        const categoryTotal = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
        return `
          <div class="section">
            <h2>${category} - $${categoryTotal.toLocaleString()}</h2>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                  ${!data.state ? '<th>State</th>' : ''}
                </tr>
              </thead>
              <tbody>
                ${expenses.map(expense => `
                  <tr>
                    <td>${expense.expenseDate}</td>
                    <td>${expense.description || 'N/A'}</td>
                    <td>$${parseFloat(expense.amount).toLocaleString()}</td>
                    ${!data.state ? `<td>${expense.state}</td>` : ''}
                  </tr>
                `).join('')}
                <tr class="total">
                  <td>Category Total</td>
                  <td></td>
                  <td>$${categoryTotal.toLocaleString()}</td>
                  ${!data.state ? '<td></td>' : ''}
                </tr>
              </tbody>
            </table>
          </div>
        `;
      }).join('')}

      <div class="footer">
        Generated by Dwellpath
      </div>
    </body>
    </html>
    `;
  }
}