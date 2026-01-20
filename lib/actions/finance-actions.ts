"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  CreditCard,
  CardPurchase,
  FixedExpense,
  ExtraExpense,
  Investment,
  IncomeSource,
  IncomeHistory,
  Profile,
  CreditCardInput,
  CardPurchaseInput,
  FixedExpenseInput,
  ExtraExpenseInput,
  InvestmentInput,
  IncomeSourceInput,
} from "@/lib/types";

// Helper to get current user
async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Not authenticated");
  return user;
}

// ============ PROFILE ============
export async function getProfile(): Promise<Profile | null> {
  const user = await getCurrentUser();
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  
  if (error) return null;
  return data;
}

export async function updateProfile(updates: Partial<Profile>): Promise<Profile | null> {
  const user = await getCurrentUser();
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", user.id)
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  revalidatePath("/");
  return data;
}

// ============ CREDIT CARDS ============
export async function getCreditCards(): Promise<CreditCard[]> {
  const user = await getCurrentUser();
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("credit_cards")
    .select(`
      *,
      purchases:card_purchases(*)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  
  if (error) throw new Error(error.message);
  return data || [];
}

export async function createCreditCard(card: CreditCardInput): Promise<CreditCard> {
  const user = await getCurrentUser();
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("credit_cards")
    .insert({ ...card, user_id: user.id })
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  revalidatePath("/");
  return data;
}

export async function updateCreditCard(id: string, updates: Partial<CreditCardInput>): Promise<CreditCard> {
  const user = await getCurrentUser();
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("credit_cards")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  revalidatePath("/");
  return data;
}

export async function deleteCreditCard(id: string): Promise<void> {
  const user = await getCurrentUser();
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("credit_cards")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  
  if (error) throw new Error(error.message);
  revalidatePath("/");
}

// ============ CARD PURCHASES ============
export async function getCardPurchases(cardId?: string): Promise<CardPurchase[]> {
  const user = await getCurrentUser();
  const supabase = await createClient();
  
  let query = supabase
    .from("card_purchases")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false });
  
  if (cardId) {
    query = query.eq("card_id", cardId);
  }
  
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data || [];
}

export async function createCardPurchase(purchase: CardPurchaseInput): Promise<CardPurchase> {
  const user = await getCurrentUser();
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("card_purchases")
    .insert({ ...purchase, user_id: user.id })
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  revalidatePath("/");
  return data;
}

export async function deleteCardPurchase(id: string): Promise<void> {
  const user = await getCurrentUser();
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("card_purchases")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  
  if (error) throw new Error(error.message);
  revalidatePath("/");
}

// ============ FIXED EXPENSES ============
export async function getFixedExpenses(): Promise<FixedExpense[]> {
  const user = await getCurrentUser();
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("fixed_expenses")
    .select("*")
    .eq("user_id", user.id)
    .order("due_day", { ascending: true });
  
  if (error) throw new Error(error.message);
  return data || [];
}

export async function createFixedExpense(expense: FixedExpenseInput): Promise<FixedExpense> {
  const user = await getCurrentUser();
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("fixed_expenses")
    .insert({ ...expense, user_id: user.id })
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  revalidatePath("/");
  return data;
}

export async function updateFixedExpense(id: string, updates: Partial<FixedExpenseInput>): Promise<FixedExpense> {
  const user = await getCurrentUser();
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("fixed_expenses")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  revalidatePath("/");
  return data;
}

export async function deleteFixedExpense(id: string): Promise<void> {
  const user = await getCurrentUser();
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("fixed_expenses")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  
  if (error) throw new Error(error.message);
  revalidatePath("/");
}

// ============ EXTRA EXPENSES ============
export async function getExtraExpenses(): Promise<ExtraExpense[]> {
  const user = await getCurrentUser();
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("extra_expenses")
    .select("*")
    .eq("user_id", user.id)
    .order("expense_date", { ascending: false });
  
  if (error) throw new Error(error.message);
  return data || [];
}

export async function createExtraExpense(expense: ExtraExpenseInput): Promise<ExtraExpense> {
  const user = await getCurrentUser();
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("extra_expenses")
    .insert({ ...expense, user_id: user.id })
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  revalidatePath("/");
  return data;
}

export async function deleteExtraExpense(id: string): Promise<void> {
  const user = await getCurrentUser();
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("extra_expenses")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  
  if (error) throw new Error(error.message);
  revalidatePath("/");
}

// ============ INVESTMENTS ============
export async function getInvestments(): Promise<Investment[]> {
  const user = await getCurrentUser();
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("investments")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  
  if (error) throw new Error(error.message);
  return data || [];
}

export async function createInvestment(investment: InvestmentInput): Promise<Investment> {
  const user = await getCurrentUser();
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("investments")
    .insert({ ...investment, user_id: user.id })
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  revalidatePath("/");
  return data;
}

export async function updateInvestment(id: string, updates: Partial<InvestmentInput>): Promise<Investment> {
  const user = await getCurrentUser();
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("investments")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  revalidatePath("/");
  return data;
}

export async function deleteInvestment(id: string): Promise<void> {
  const user = await getCurrentUser();
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("investments")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  
  if (error) throw new Error(error.message);
  revalidatePath("/");
}

// ============ INCOME SOURCES ============
export async function getIncomeSources(): Promise<IncomeSource[]> {
  const user = await getCurrentUser();
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("income_sources")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  
  if (error) throw new Error(error.message);
  return data || [];
}

export async function createIncomeSource(source: IncomeSourceInput): Promise<IncomeSource> {
  try {
    const user = await getCurrentUser();
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from("income_sources")
      .insert({ ...source, user_id: user.id })
      .select()
      .single();
    
    if (error) {
      console.error("Erro Supabase:", error.message);
      throw new Error(error.message);
    }
    
    revalidatePath("/");
    return data;
  } catch (err: any) {
    console.error("Erro na Action:", err.message);
    throw err; // Ou retorne um objeto de erro estruturado
  }
}

export async function updateIncomeSource(id: string, updates: Partial<IncomeSourceInput>): Promise<IncomeSource> {
  const user = await getCurrentUser();
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("income_sources")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  revalidatePath("/");
  return data;
}

export async function deleteIncomeSource(id: string): Promise<void> {
  const user = await getCurrentUser();
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("income_sources")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  
  if (error) throw new Error(error.message);
  revalidatePath("/");
}

// ============ INCOME HISTORY ============
export async function getIncomeHistory(sourceId?: string): Promise<IncomeHistory[]> {
  const user = await getCurrentUser();
  const supabase = await createClient();
  
  let query = supabase
    .from("income_history")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false });
  
  if (sourceId) {
    query = query.eq("income_source_id", sourceId);
  }
  
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data || [];
}

export async function createIncomeHistory(history: Omit<IncomeHistory, 'id' | 'user_id' | 'created_at'>): Promise<IncomeHistory> {
  const user = await getCurrentUser();
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("income_history")
    .insert({ ...history, user_id: user.id })
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  revalidatePath("/");
  return data;
}

// ============ DASHBOARD SUMMARY ============
export async function getFinancialSummary() {
  const user = await getCurrentUser();
  const supabase = await createClient();
  
  // Get all data in parallel
  const [
    { data: cards },
    { data: fixedExpenses },
    { data: extraExpenses },
    { data: investments },
    { data: incomeSources },
  ] = await Promise.all([
    supabase.from("credit_cards").select("current_balance, credit_limit").eq("user_id", user.id),
    supabase.from("fixed_expenses").select("amount, is_active").eq("user_id", user.id),
    supabase.from("extra_expenses").select("amount, date").eq("user_id", user.id),
    supabase.from("investments").select("quantity, current_price, purchase_price").eq("user_id", user.id),
    supabase.from("income_sources").select("amount, frequency, is_active").eq("user_id", user.id),
  ]);

  // Calculate totals
  const totalCreditCardDebt = cards?.reduce((sum, c) => sum + Number(c.current_balance), 0) || 0;
  const totalCreditLimit = cards?.reduce((sum, c) => sum + Number(c.credit_limit), 0) || 0;
  
  const monthlyFixedExpenses = fixedExpenses
    ?.filter(e => e.is_active)
    .reduce((sum, e) => sum + Number(e.amount), 0) || 0;
  
  // Extra expenses from current month
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyExtraExpenses = extraExpenses
    ?.filter(e => e.date.startsWith(currentMonth))
    .reduce((sum, e) => sum + Number(e.amount), 0) || 0;
  
  const totalInvestmentValue = investments?.reduce((sum, i) => 
    sum + (Number(i.quantity) * Number(i.current_price)), 0) || 0;
  
  const totalInvestmentCost = investments?.reduce((sum, i) => 
    sum + (Number(i.quantity) * Number(i.purchase_price)), 0) || 0;

  // Calculate monthly income based on frequency
  const frequencyMultiplier: Record<string, number> = {
    'weekly': 4.33,
    'bi-weekly': 2.17,
    'monthly': 1,
    'quarterly': 0.33,
    'annually': 0.083,
  };
  
  const monthlyIncome = incomeSources
    ?.filter(s => s.is_active)
    .reduce((sum, s) => sum + (Number(s.amount) * (frequencyMultiplier[s.frequency] || 1)), 0) || 0;

  const monthlyExpenses = monthlyFixedExpenses + monthlyExtraExpenses + totalCreditCardDebt;
  const monthlyCashFlow = monthlyIncome - monthlyExpenses;
  const totalAssets = totalInvestmentValue;
  const totalLiabilities = totalCreditCardDebt;
  const totalNetWorth = totalAssets - totalLiabilities;
  const savingsRate = monthlyIncome > 0 ? (monthlyCashFlow / monthlyIncome) * 100 : 0;

  return {
    totalNetWorth,
    totalAssets,
    totalLiabilities,
    monthlyIncome,
    monthlyExpenses,
    monthlyCashFlow,
    savingsRate,
    totalCreditCardDebt,
    totalCreditLimit,
    totalInvestmentValue,
    totalInvestmentGain: totalInvestmentValue - totalInvestmentCost,
    cardCount: cards?.length || 0,
    investmentCount: investments?.length || 0,
    incomeSourceCount: incomeSources?.length || 0,
  };
}
