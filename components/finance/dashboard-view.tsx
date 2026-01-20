"use client";

import { StatCard } from "./stat-card";
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
import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Tooltip,
} from "recharts";

const monthlyNetWorthData = [
  { month: "Aug", netWorth: 145000 },
  { month: "Sep", netWorth: 152000 },
  { month: "Oct", netWorth: 148000 },
  { month: "Nov", netWorth: 158000 },
  { month: "Dec", netWorth: 165000 },
  { month: "Jan", netWorth: 178500 },
];

const cashFlowData = [
  { month: "Aug", income: 11500, expenses: 5200 },
  { month: "Sep", income: 12000, expenses: 5800 },
  { month: "Oct", income: 11800, expenses: 6100 },
  { month: "Nov", income: 13500, expenses: 5500 },
  { month: "Dec", income: 14200, expenses: 7800 },
  { month: "Jan", income: 12300, expenses: 5400 },
];

export function DashboardView() {
  const { data: summary, isLoading: summaryLoading } = useFinancialSummary();
  const { data: cards, isLoading: cardsLoading } = useCreditCards();

  const isLoading = summaryLoading || cardsLoading;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

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

  const expenseBreakdown = [
    { name: "Fixed", value: monthlyExpenses * 0.6, color: "#3b82f6" },
    { name: "Credit Cards", value: creditCardDebt, color: "#10b981" },
    { name: "Extra", value: monthlyExpenses * 0.2, color: "#f59e0b" },
    { name: "Other", value: monthlyExpenses * 0.2, color: "#8b5cf6" },
  ].filter(item => item.value > 0);

  // Get recent purchases from cards
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
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your financial overview at a glance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Net Worth"
          value={formatCurrency(netWorth)}
          icon={DollarSign}
          trend={{ value: 8.2, isPositive: netWorth >= 0 }}
        />
        <StatCard
          title="Monthly Income"
          value={formatCurrency(monthlyIncome)}
          icon={Wallet}
          trend={{ value: 3.5, isPositive: true }}
        />
        <StatCard
          title="Monthly Expenses"
          value={formatCurrency(monthlyExpenses)}
          icon={TrendingDown}
          trend={{ value: -2.1, isPositive: true }}
        />
        <StatCard
          title="Cash Flow"
          value={formatCurrency(monthlyCashFlow)}
          subtitle={`${savingsRate}% savings rate`}
          icon={TrendingUp}
        />
        <StatCard
          title="Investments"
          value={formatCurrency(investmentValue)}
          subtitle={`${investmentGain > 0 ? "+" : ""}${formatCurrency(investmentGain)} gain`}
          icon={PiggyBank}
          trend={{ value: 15.4, isPositive: investmentGain >= 0 }}
        />
        <StatCard
          title="Credit Card Debt"
          value={formatCurrency(creditCardDebt)}
          icon={CreditCard}
          trend={{ value: -5.2, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl bg-card border border-border p-5">
          <h3 className="font-medium text-card-foreground mb-4">
            Net Worth Trend
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyNetWorthData}>
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
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.15 0.01 260)",
                    border: "1px solid oklch(0.25 0.01 260)",
                    borderRadius: "8px",
                    color: "oklch(0.98 0 0)",
                  }}
                  formatter={(value: number) => [formatCurrency(value), "Net Worth"]}
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
            Monthly Cash Flow
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
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
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
                  name="Income"
                  fill="oklch(0.72 0.19 160)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="expenses"
                  name="Expenses"
                  fill="oklch(0.65 0.18 250)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-xl bg-card border border-border p-5">
          <h3 className="font-medium text-card-foreground mb-4">
            Expense Breakdown
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseBreakdown.length > 0 ? expenseBreakdown : [{ name: "No Data", value: 1, color: "#374151" }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {(expenseBreakdown.length > 0 ? expenseBreakdown : [{ name: "No Data", value: 1, color: "#374151" }]).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.15 0.01 260)",
                    border: "1px solid oklch(0.25 0.01 260)",
                    borderRadius: "8px",
                    color: "oklch(0.98 0 0)",
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {expenseBreakdown.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-xl bg-card border border-border p-5">
          <h3 className="font-medium text-card-foreground mb-4">
            Recent Activity
          </h3>
          {recentPurchases.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <CreditCard className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm">No recent transactions</p>
              <p className="text-xs mt-1">Add a credit card and purchases to see activity</p>
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
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      -{formatCurrency(Number(purchase.amount))}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(purchase.purchase_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
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
