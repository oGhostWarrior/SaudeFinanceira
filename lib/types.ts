// Database types matching Supabase schema
export interface Profile {
  id: string;
  full_name: string | null;
  currency: string;
  language: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreditCard {
  id: string;
  user_id: string;
  name: string;
  last_four: string;
  credit_limit: number;
  current_balance: number;
  due_date: number;
  color: string;
  created_at: string;
  updated_at: string;
  // Joined data
  purchases?: CardPurchase[];
}

export interface CardPurchase {
  id: string;
  card_id: string;
  user_id: string;
  description: string;
  amount: number;
  purchase_date: string;
  category: string;
  is_installment: boolean;
  current_installment: number | null;
  total_installments: number | null;
  created_at: string;
}

export interface FixedExpense {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  category: 'utilities' | 'insurance' | 'subscriptions' | 'rent' | 'taxes' | 'transportation' | 'food' | 'entertainment' | 'health_care' | 'education' | 'other';
  due_day: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExtraExpense {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  expense_date: string;
  category: string;
  created_at: string;
}

export interface Investment {
  id: string;
  user_id: string;
  name: string;
  type: 'stock' | 'etf' | 'bond' | 'mutual_fund' | 'crypto' | 'real_estate';
  symbol: string | null;
  quantity: number;
  purchase_price: number;
  current_price: number;
  purchase_date: string;
  created_at: string;
  updated_at: string;
}

export interface IncomeSource {
  id: string;
  user_id: string;
  name: string;
  type: 'active' | 'passive' | 'alternative';
  amount: number;
  frequency: 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'annually';
  source: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface IncomeHistory {
  id: string;
  income_source_id: string;
  user_id: string;
  amount: number;
  date: string;
  notes: string | null;
  created_at: string;
}

export interface MonthlyChartData {
  month: string;
  income: number;
  expenses: number;
  netWorth: number;
}

export interface ExpenseBreakdownItem {
  name: string;
  value: number;
  color: string;
}

export interface ExpenseChartData {
  month: string;
  fixed: number;
  extra: number;
}

export interface IncomeChartData {
  month: string;
  active: number;
  passive: number;
  alternative: number;
}

export interface InvestmentChartData {
  month: string;
  value: number;
}

export interface FinancialSummary {
  totalNetWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyCashFlow: number;
  savingsRate: number;
  totalCreditCardDebt: number;
  totalCreditLimit: number;
  totalInvestmentValue: number;
  totalInvestmentGain: number;
  cardCount: number;
  investmentCount: number;
  incomeSourceCount: number;

  monthlyData: MonthlyChartData[];
  expenseBreakdown: ExpenseBreakdownItem[];
  expenseChartData: ExpenseChartData[];
  incomeChartData: IncomeChartData[];
  investmentChartData: InvestmentChartData[];
}

// Input types for creating/updating records
export type CreditCardInput = Omit<CreditCard, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'purchases'>;
export type CardPurchaseInput = Omit<CardPurchase, 'id' | 'user_id' | 'created_at'>;
export type FixedExpenseInput = Omit<FixedExpense, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
export type ExtraExpenseInput = Omit<ExtraExpense, 'id' | 'user_id' | 'created_at'>;
export type InvestmentInput = Omit<Investment, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
export type IncomeSourceInput = Omit<IncomeSource, 'id' | 'user_id' | 'created_at' | 'updated_at'>;