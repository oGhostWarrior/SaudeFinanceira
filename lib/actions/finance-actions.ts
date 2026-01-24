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
  FinancialSummary,
  MonthlyChartData,
  ExpenseBreakdownItem,
  ExpenseChartData,
  IncomeChartData,
  InvestmentChartData,
} from "@/lib/types";

// Helper to get current user
async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Usuário não autenticado");
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
  
  // 1. Inserir a compra
  const { data: newPurchase, error } = await supabase
    .from("card_purchases")
    .insert({ ...purchase, user_id: user.id })
    .select()
    .single();
  
  if (error) throw new Error(error.message);

  // 2. Atualizar o saldo do cartão (Limite Usado)
  const { data: card, error: cardError } = await supabase
    .from("credit_cards")
    .select("current_balance")
    .eq("id", purchase.card_id)
    .single();

  if (!cardError && card) {
    const newBalance = Number(card.current_balance) + Number(purchase.amount);
    
    await supabase
      .from("credit_cards")
      .update({ current_balance: newBalance })
      .eq("id", purchase.card_id);
  }

  revalidatePath("/");
  return newPurchase;
}

export async function deleteCardPurchase(id: string): Promise<void> {
  const user = await getCurrentUser();
  const supabase = await createClient();
  
  // 1. Buscar a compra antes de deletar
  const { data: purchase, error: fetchError } = await supabase
    .from("card_purchases")
    .select("amount, card_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchError) throw new Error(fetchError.message);

  // 2. Deletar a compra
  const { error } = await supabase
    .from("card_purchases")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  
  if (error) throw new Error(error.message);

  // 3. Atualizar o saldo do cartão (Libera o limite total)
  const { data: card, error: cardError } = await supabase
    .from("credit_cards")
    .select("current_balance")
    .eq("id", purchase.card_id)
    .single();

  if (!cardError && card) {
    const newBalance = Number(card.current_balance) - Number(purchase.amount);
    
    await supabase
      .from("credit_cards")
      .update({ current_balance: newBalance })
      .eq("id", purchase.card_id);
  }

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
// ============ CRIPTO PRICE UPDATE (Via USDT) ============
export async function updateCryptoPrices(): Promise<void> {
  const user = await getCurrentUser();
  const supabase = await createClient();
  const { data: investments, error } = await supabase
    .from("investments")
    .select("id, symbol")
    .eq("user_id", user.id)
    .eq("type", "crypto");

  if (error) throw new Error(error.message);
  if (!investments || investments.length === 0) return;

  //Obter a cotação base: USDT -> BRL
  let usdtBrlPrice = 0;
  try {
    const response = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=USDTBRL", { 
      next: { revalidate: 60 }
    });
    
    if (response.ok) {
      const data = await response.json();
      usdtBrlPrice = Number(data.price);
    } else {
      console.error("Erro ao obter cotação USDT/BRL");
      return;
    }
  } catch (e) {
    console.error("Erro de conexão com Binance API (USDT)", e);
    return;
  }

  const updatePromises = investments.map(async (inv) => {
    if (!inv.symbol) return;
    const symbol = inv.symbol.toUpperCase();
    
    let finalPriceBrl = 0;
    if (symbol === "USDT") {
      finalPriceBrl = usdtBrlPrice;
    } else {
      const pair = `${symbol}USDT`; 
      try {
        const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${pair}`, {
          next: { revalidate: 60 }
        });
        
        if (response.ok) {
          const data = await response.json();
          const priceInUsdt = Number(data.price);
          finalPriceBrl = priceInUsdt * usdtBrlPrice;
        } else {
          const pairBrl = `${symbol}BRL`;
          const responseBrl = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${pairBrl}`, { next: { revalidate: 60 } });
          if (responseBrl.ok) {
             const dataBrl = await responseBrl.json();
             finalPriceBrl = Number(dataBrl.price);
          } else {
             console.warn(`Par ${pair} (e fallback BRL) não encontrado na Binance.`);
          }
        }
      } catch (e) {
        console.error(`Erro ao atualizar ${symbol}:`, e);
      }
    }

    if (finalPriceBrl > 0) {
      await supabase
        .from("investments")
        .update({ 
          current_price: finalPriceBrl,
          updated_at: new Date().toISOString()
        })
        .eq("id", inv.id);
    }
  });

  await Promise.all(updatePromises);
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
    throw err;
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

// ============ DASHBOARD SUMMARY============
export async function getFinancialSummary(): Promise<FinancialSummary> {
  const user = await getCurrentUser();
  const supabase = await createClient();
  
  // Datas para filtro
  const today = new Date();
  const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1).toISOString();
  const [
    { data: cards },
    { data: fixedExpenses },
    { data: extraExpenses },
    { data: investments },
    { data: incomeSources },
    { data: incomeHistory },
    { data: cardPurchases }
  ] = await Promise.all([
    supabase.from("credit_cards").select("current_balance, credit_limit, card_purchases(amount, is_installment, total_installments)").eq("user_id", user.id),
    supabase.from("fixed_expenses").select("amount, is_active, category").eq("user_id", user.id),
    supabase.from("extra_expenses").select("amount, expense_date, category").eq("user_id", user.id).gte("expense_date", sixMonthsAgo),
    supabase.from("investments").select("quantity, current_price, purchase_price, purchase_date, type").eq("user_id", user.id),
    supabase.from("income_sources").select("id, amount, frequency, is_active, type").eq("user_id", user.id),
    supabase.from("income_history").select("amount, date, income_source_id").eq("user_id", user.id).gte("date", sixMonthsAgo),
    supabase.from("card_purchases").select("amount, purchase_date, category, is_installment, total_installments").eq("user_id", user.id).gte("purchase_date", sixMonthsAgo)
  ]);

  // --- CÁLCULOS TOTAIS (SNAPSHOT ATUAL) ---
  const totalCreditCardDebt = cards?.reduce((sum, c) => sum + Number(c.current_balance), 0) || 0;
  const totalCreditLimit = cards?.reduce((sum, c) => sum + Number(c.credit_limit), 0) || 0;
  
  // Fatura mensal atual (parcelas + à vista do mês)
  let currentMonthlyCardBill = 0;
  cards?.forEach(card => {
    const purchases = card.card_purchases as any[];
    if (purchases) {
      purchases.forEach(p => {
        if (p.is_installment && p.total_installments && p.total_installments > 0) {
          currentMonthlyCardBill += (Number(p.amount) / p.total_installments);
        } else {
          currentMonthlyCardBill += Number(p.amount);
        }
      });
    }
  });

  const monthlyFixedExpenses = fixedExpenses
    ?.filter(e => e.is_active)
    .reduce((sum, e) => sum + Number(e.amount), 0) || 0;
  
  const currentMonthStr = today.toISOString().slice(0, 7);
  const monthlyExtraExpenses = extraExpenses
    ?.filter(e => e.expense_date.startsWith(currentMonthStr))
    .reduce((sum, e) => sum + Number(e.amount), 0) || 0;
  
  const totalInvestmentValue = investments?.reduce((sum, i) => 
    sum + (Number(i.quantity) * Number(i.current_price)), 0) || 0;
  
  const totalInvestmentCost = investments?.reduce((sum, i) => 
    sum + (Number(i.quantity) * Number(i.purchase_price)), 0) || 0;

  const frequencyMultiplier: Record<string, number> = {
    'weekly': 4.33, 'bi-weekly': 2.17, 'monthly': 1, 'quarterly': 0.33, 'annually': 0.083,
  };
  
  const monthlyIncome = incomeSources
    ?.filter(s => s.is_active)
    .reduce((sum, s) => sum + (Number(s.amount) * (frequencyMultiplier[s.frequency] || 1)), 0) || 0;

  const monthlyExpenses = monthlyFixedExpenses + monthlyExtraExpenses + currentMonthlyCardBill;
  const monthlyCashFlow = monthlyIncome - monthlyExpenses;
  const totalAssets = totalInvestmentValue;
  const totalLiabilities = totalCreditCardDebt;
  const totalNetWorth = totalAssets - totalLiabilities;
  const savingsRate = monthlyIncome > 0 ? (monthlyCashFlow / monthlyIncome) * 100 : 0;
  // --- CÁLCULOS HISTÓRICOS (GRÁFICOS) ---
  const expenseChartData: ExpenseChartData[] = [];
  const incomeChartData: IncomeChartData[] = [];
  const investmentChartData: InvestmentChartData[] = [];
  const monthlyData: MonthlyChartData[] = [];
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthKey = d.toISOString().slice(0, 7);
    const monthLabel = d.toLocaleDateString('pt-BR', { month: 'short' });

   const monthIncomeHistory = incomeHistory?.filter(h => h.date.startsWith(monthKey)) || [];
    
    // Agrupa por Ativa/Passiva
    let activeIncomeSum = 0;
    let passiveIncomeSum = 0;

    monthIncomeHistory.forEach(h => {
      const source = incomeSources?.find(s => s.id === h.income_source_id);
      if (source?.type === 'passive') {
        passiveIncomeSum += Number(h.amount);
      } else {
        activeIncomeSum += Number(h.amount);
      }
    });

    // Se mês atual e sem histórico, usa projeção baseada nas fontes ativas
    if (i === 0 && activeIncomeSum === 0 && passiveIncomeSum === 0) {
       incomeSources?.filter(s => s.is_active).forEach(s => {
          const val = Number(s.amount) * (frequencyMultiplier[s.frequency] || 1);
          if (s.type === 'passive') passiveIncomeSum += val;
          else activeIncomeSum += val;
       });
    }

    const totalIncomeMonth = activeIncomeSum + passiveIncomeSum;
    incomeChartData.push({ month: monthLabel, active: activeIncomeSum, passive: passiveIncomeSum });

    // 2. Despesas do mês
    // Extra
    const extraSum = extraExpenses
      ?.filter(e => e.expense_date.startsWith(monthKey))
      .reduce((sum, e) => sum + Number(e.amount), 0) || 0;
    
    // Cartão (estimado)
    const cardSum = cardPurchases
      ?.filter(p => p.purchase_date.startsWith(monthKey))
      .reduce((sum, p) => {
        if (p.is_installment && p.total_installments) {
          return sum + (Number(p.amount) / p.total_installments); 
        }
        return sum + Number(p.amount);
      }, 0) || 0;

    // Fixas (Assumimos constante para histórico)
    const fixedSum = monthlyFixedExpenses;

    const totalExpensesMonth = fixedSum + extraSum + cardSum;
    expenseChartData.push({ month: monthLabel, fixed: fixedSum, extra: extraSum }); // Nota: O gráfico de despesas pede Fixed vs Extra (pode somar cartão no extra ou ignorar)

    monthlyData.push({
      month: monthLabel,
      income: totalIncomeMonth,
      expenses: totalExpensesMonth,
      netWorth: 0 // Calculado abaixo
    });

    // 3. Investimentos (Histórico de Custo)
    // Soma purchase_price * quantity de investimentos comprados ATÉ o fim deste mês
    const monthEndDate = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString();
    
    const investedCostUntilNow = investments
      ?.filter(inv => inv.purchase_date <= monthEndDate)
      .reduce((sum, inv) => sum + (Number(inv.quantity) * Number(inv.purchase_price)), 0) || 0;

    investmentChartData.push({
      month: monthLabel,
      value: investedCostUntilNow
    });
  }

  // Calcular Net Worth Histórico (Retroativo)
  let currentCalculatedNetWorth = totalNetWorth;
  for (let i = monthlyData.length - 1; i >= 0; i--) {
    monthlyData[i].netWorth = currentCalculatedNetWorth;
    const cashFlow = monthlyData[i].income - monthlyData[i].expenses;
    currentCalculatedNetWorth = currentCalculatedNetWorth - cashFlow;
  }

  // --- CÁLCULO DE CATEGORIAS (PIE CHART) ---
  const categoryMap = new Map<string, number>();
  fixedExpenses?.forEach(e => {
    if(e.is_active) {
      const cat = e.category || "Outros";
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + Number(e.amount));
    }
  });
  extraExpenses?.filter(e => e.expense_date.startsWith(currentMonthStr)).forEach(e => {
    const cat = e.category || "Outros";
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + Number(e.amount));
  });
  cardPurchases?.filter(p => p.purchase_date.startsWith(currentMonthStr)).forEach(p => {
    const cat = p.category || "Shopping";
    const val = p.is_installment && p.total_installments ? (Number(p.amount) / p.total_installments) : Number(p.amount);
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + val);
  });

  const categoryColors: Record<string, string> = {
    'Shopping': '#3b82f6', 'Groceries': '#10b981', 'Mercado': '#10b981',
    'Entertainment': '#f59e0b', 'Lazer': '#f59e0b', 'Transportation': '#ef4444',
    'Transporte': '#ef4444', 'Travel': '#8b5cf6', 'Viagem': '#8b5cf6',
    'Dining': '#ec4899', 'Alimentação': '#ec4899', 'utilities': '#06b6d4',
    'insurance': '#64748b', 'subscriptions': '#6366f1', 'rent': '#d946ef',
    'Outros': '#9ca3af',
  };

  const expenseBreakdown: ExpenseBreakdownItem[] = Array.from(categoryMap.entries()).map(([name, value]) => ({
    name,
    value,
    color: categoryColors[name] || '#9ca3af'
  })).sort((a, b) => b.value - a.value);

  return {
    totalNetWorth,
    totalAssets,
    totalLiabilities,
    monthlyIncome,
    monthlyExpenses,
    monthlyCashFlow,
    savingsRate,
    totalCreditCardDebt: currentMonthlyCardBill,
    totalCreditLimit,
    totalInvestmentValue,
    totalInvestmentGain: totalInvestmentValue - totalInvestmentCost,
    cardCount: cards?.length || 0,
    investmentCount: investments?.length || 0,
    incomeSourceCount: incomeSources?.length || 0,
    monthlyData,
    expenseBreakdown,
    expenseChartData,
    incomeChartData,
    investmentChartData
  };
}