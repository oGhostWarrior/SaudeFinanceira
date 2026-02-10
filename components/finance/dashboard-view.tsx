"use client";

import { StatCard } from "./stat-card";
import { ExpenseBreakdownChart } from "./expense-breakdown-chart";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  CreditCard,
  Wallet,
  Loader2,
} from "lucide-react";
import { useFinancialSummary, useCreditCards } from "@/hooks/use-finance-data";
import { useCurrencyFormatter } from "@/hooks/use-currency-formatter";
import { useLanguage } from "@/components/providers/language-provider";
import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  Tooltip,
} from "recharts";

export function DashboardView() {
  const { data: summary, isLoading: summaryLoading } = useFinancialSummary();
  const { data: cards, isLoading: cardsLoading } = useCreditCards();
  const { formatCurrency } = useCurrencyFormatter();
  const { t, language: lang } = useLanguage();

  const isLoading = summaryLoading || cardsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const netWorth = summary?.totalNetWorth || 0;
  const monthlyIncome = summary?.monthlyIncome || 0;
  const monthlyExpenses = summary?.monthlyExpenses || 0;
  const monthlyCashFlow = summary?.monthlyCashFlow || 0;
  const investmentValue = summary?.totalInvestmentValue || 0;
  const investmentGain = summary?.totalInvestmentGain || 0;
  const creditCardDebt = summary?.totalCreditCardDebt || 0;
  const savingsRate = summary?.savingsRate?.toFixed(1) || "0";
  const monthlyData = summary?.monthlyData || [];

  const netWorthData = monthlyData.map(d => ({
    month: d.month,
    netWorth: d.netWorth
  }));

  const cashFlowData = monthlyData.map(d => ({
    month: d.month,
    income: d.income,
    expenses: d.expenses
  }));

  const expenseBreakdown = summary?.expenseBreakdown || [];

  const recentPurchases = cards
    ?.flatMap((card) =>
      (card.purchases || []).map((p) => ({ ...p, cardName: card.name }))
    )
    .sort(
      (a, b) =>
        new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime()
    )
    .slice(0, 6) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{t("dashboard.title")}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {t("dashboard.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title={t("dashboard.stats.netWorth")}
          value={formatCurrency(netWorth)}
          icon={DollarSign}
          trend={{ value: 0, isPositive: netWorth >= 0 }}
          explanation={t("dashboard.stats.netWorthDesc")}
        />
        <StatCard
          title={t("dashboard.stats.monthlyIncome")}
          value={formatCurrency(monthlyIncome)}
          icon={Wallet}
          trend={{ value: 0, isPositive: true }}
          explanation={t("dashboard.stats.monthlyIncomeDesc")}
        />
        <StatCard
          title={t("dashboard.stats.monthlyExpenses")}
          value={formatCurrency(monthlyExpenses)}
          icon={TrendingDown}
          trend={{ value: 0, isPositive: true }}
          explanation={t("dashboard.stats.monthlyExpensesDesc")}
        />
        <StatCard
          title={t("dashboard.stats.cashFlow")}
          value={formatCurrency(monthlyCashFlow)}
          subtitle={`${savingsRate}% ${t("dashboard.stats.savingsRate")}`}
          icon={TrendingUp}
          explanation={t("dashboard.stats.cashFlowDesc")}
        />
        <StatCard
          title={t("dashboard.stats.investments")}
          value={formatCurrency(investmentValue)}
          subtitle={`${investmentGain > 0 ? "+" : ""}${formatCurrency(investmentGain)} ${t("dashboard.stats.investmentReturn")}`}
          icon={PiggyBank}
          trend={{ value: 0, isPositive: investmentGain >= 0 }}
          explanation={t("dashboard.stats.investmentsDesc")}
        />
        <StatCard
          title={t("dashboard.stats.cardBill")}
          value={formatCurrency(creditCardDebt)}
          icon={CreditCard}
          trend={{ value: 0, isPositive: true }}
          explanation={t("dashboard.stats.cardBillDesc")}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl bg-card border border-border p-5">
          <h3 className="font-medium text-card-foreground mb-4">
            {t("dashboard.charts.netWorthEvolution")}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={netWorthData}>
                <defs>
                  <linearGradient
                    id="netWorthGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="oklch(0.72 0.19 160)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="oklch(0.72 0.19 160)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.25 0.01 260)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }}
                  tickFormatter={(v: number) => `R$${(v / 1000).toFixed(1)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.15 0.01 260)",
                    border: "1px solid oklch(0.25 0.01 260)",
                    borderRadius: "8px",
                    color: "oklch(0.98 0 0)",
                  }}
                  formatter={(value: number) => [formatCurrency(value), t("dashboard.stats.netWorth")]}
                />
                <Area
                  type="monotone"
                  dataKey="netWorth"
                  stroke="oklch(0.72 0.19 160)"
                  strokeWidth={2}
                  fill="url(#netWorthGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl bg-card border border-border p-5">
          <h3 className="font-medium text-card-foreground mb-4">
            {t("dashboard.charts.monthlyCashFlow")}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlowData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.25 0.01 260)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }}
                  tickFormatter={(v: number) => `R$${(v / 1000).toFixed(1)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.15 0.01 260)",
                    border: "1px solid oklch(0.25 0.01 260)",
                    borderRadius: "8px",
                    color: "oklch(0.98 0 0)",
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Bar
                  dataKey="income"
                  name={t("dashboard.charts.income")}
                  fill="oklch(0.72 0.19 160)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="expenses"
                  name={t("dashboard.charts.expenses")}
                  fill="oklch(0.65 0.18 250)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-xl bg-card border border-border p-5 flex flex-col">
          <h3 className="font-medium text-card-foreground mb-4">
            {t("dashboard.charts.expenseBreakdown")}
          </h3>
          <div className="flex-1 min-h-[300px]">
            <ExpenseBreakdownChart data={expenseBreakdown} />
          </div>
        </div>

        <div className="lg:col-span-2 rounded-xl bg-card border border-border p-5">
          <h3 className="font-medium text-card-foreground mb-4">
            {t("dashboard.recentActivity.title")}
          </h3>
          {recentPurchases.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <CreditCard className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm">{t("dashboard.recentActivity.noTransactions")}</p>
              <p className="text-xs mt-1">{t("dashboard.recentActivity.noTransactionsDesc")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPurchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {purchase.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {purchase.cardName} - {purchase.category}
                        {purchase.is_installment && purchase.total_installments && (
                          <span className="ml-2 text-orange-500">
                            ({purchase.total_installments}x)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      -{formatCurrency(Number(purchase.amount))}
                    </p>
                    {purchase.is_installment && purchase.total_installments && (
                      <p className="text-[10px] text-muted-foreground">
                        ({t("dashboard.recentActivity.installment")}: {formatCurrency(Number(purchase.amount) / purchase.total_installments)})
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground text-capitalize">
                      {new Date(purchase.purchase_date).toLocaleDateString(lang, {
                        day: "2-digit",
                        month: "short",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}