
export enum AppView {
  DASHBOARD = 'dashboard',
  EXPENSES = 'expenses',
  INCOME = 'income',
  BUDGETS = 'budgets',
  REPORTS = 'reports',
  APPROVALS = 'approvals',
  REIMBURSEMENTS = 'reimbursements',
  AI_INSIGHTS = 'ai_insights',
  SETTINGS = 'settings',
  // Company Specific (Admin Workspace)
  ADMIN_DASHBOARD = 'admin_dashboard',
  MANAGE_MEMBERS = 'manage_members',
  BUDGET_MANAGEMENT = 'budget_management',
  EXPENSE_MANAGEMENT = 'expense_management',
  REVENUE = 'revenue',
  AUDIT_LOG = 'audit_log',
  DEPARTMENT = 'department',
  // Personal Specific
  SAVINGS_GOALS = 'savings_goals',
  CATEGORIES = 'categories'
}

export enum ExpenseMode {
  COMPANY = 'company',
  PERSONAL = 'personal'
}

export enum AuthView {
  LOGIN = 'login',
  SIGNUP = 'signup',
  FORGOT_PASSWORD = 'forgot_password',
  VERIFY_OTP = 'verify_otp'
}

export interface Expense {
  id: string;
  date: string;
  amount: number;
  category: string;
  merchant: string;
  paymentMethod: string;
  status: 'pending' | 'approved' | 'rejected' | 'reimbursed';
  notes: string;
}

export interface Income {
  id: string;
  date: string;
  amount: number;
  category: string;
  source: string;
  notes: string;
}

export interface Budget {
  id: string;
  name: string;
  limit: number;
  spent: number;
  categoryNames: string[];
  icon: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  isVerified?: boolean;
}

export interface InsightsData {
  summary: string;
  suggestions: string[];
}
