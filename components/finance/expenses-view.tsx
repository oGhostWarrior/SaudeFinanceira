"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { useFixedExpenses, useExtraExpenses, useFinancialSummary } from "@/hooks/use-finance-data"; // Importar useFinancialSummary
import { useCurrencyFormatter } from "@/hooks/use-currency-formatter";
import { createFixedExpense, createExtraExpense, updateFixedExpense, deleteFixedExpense, deleteExtraExpense } from "@/lib/actions/finance-actions";
import type { FixedExpense, ExtraExpense } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Plus,
  Home,
  Lightbulb,
  Shield,
  Tv,
  MoreHorizontal,
  Calendar,
  DollarSign,
  Gift,
  Wrench,
  ShoppingBag,
  Heart,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { mutate } from "swr";

const categoryConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  rent: { icon: <Home className="h-4 w-4" />, color: "#3b82f6" },
  utilities: { icon: <Lightbulb className="h-4 w-4" />, color: "#10b981" },
  insurance: { icon: <Shield className="h-4 w-4" />, color: "#f59e0b" },
  subscriptions: { icon: <Tv className="h-4 w-4" />, color: "#8b5cf6" },
  other: { icon: <MoreHorizontal className="h-4 w-4" />, color: "#6b7280" },
};

const extraCategoryIcons: Record<string, React.ReactNode> = {
  Gifts: <Gift className="h-4 w-4" />,
  Maintenance: <Wrench className="h-4 w-4" />,
  Shopping: <ShoppingBag className="h-4 w-4" />,
  Healthcare: <Heart className="h-4 w-4" />,
};

function AddFixedExpenseDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    amount: "",
    category: "other" as FixedExpense["category"],
    due_day: "1",
    is_active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createFixedExpense({
        name: form.name,
        amount: Number.parseFloat(form.amount),
        category: form.category,
        due_day: Number.parseInt(form.due_day),
        is_active: form.is_active,
      });
      await mutate("fixed-expenses");
      await mutate("financial-summary");
      setOpen(false);
      setForm({ name: "", amount: "", category: "other", due_day: "1", is_active: true });
      onSuccess();
    } catch {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Fixed Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add Fixed Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Rent, Netflix, etc." required className="bg-input border-border" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="100.00" required className="bg-input border-border" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="due">Due Day</Label>
              <Input id="due" type="number" min="1" max="31" value={form.due_day} onChange={(e) => setForm({ ...form, due_day: e.target.value })} className="bg-input border-border" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={form.category} onValueChange={(value) => setForm({ ...form, category: value as FixedExpense["category"] })}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rent">Rent</SelectItem>
                <SelectItem value="utilities">Utilities</SelectItem>
                <SelectItem value="insurance">Insurance</SelectItem>
                <SelectItem value="subscriptions">Subscriptions</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Add Expense
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddExtraExpenseDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    description: "",
    amount: "",
    category: "Shopping",
    date: new Date().toISOString().split("T")[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createExtraExpense({
        description: form.description,
        amount: Number.parseFloat(form.amount),
        category: form.category,
        expense_date: form.date,
      });
      await mutate("extra-expenses");
      await mutate("financial-summary");
      setOpen(false);
      setForm({ description: "", amount: "", category: "Shopping", date: new Date().toISOString().split("T")[0] });
      onSuccess();
    } catch {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Plus className="h-4 w-4" />
          Add Extra Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add Extra Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="desc">Description</Label>
            <Input id="desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Birthday gift, Car repair, etc." required className="bg-input border-border" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="50.00" required className="bg-input border-border" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="bg-input border-border" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={form.category} onValueChange={(value) => setForm({ ...form, category: value })}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Shopping">Shopping</SelectItem>
                <SelectItem value="Gifts">Gifts</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Add Expense
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ExpensesView() {
  const [activeTab, setActiveTab] = useState<"fixed" | "extra">("fixed");
  
  // Hooks de dados
  const { data: fixedExpenses, isLoading: fixedLoading } = useFixedExpenses();
  const { data: extraExpenses, isLoading: extraLoading } = useExtraExpenses();
  const { data: summary, isLoading: summaryLoading } = useFinancialSummary(); // Novo hook
  const { formatCurrency } = useCurrencyFormatter();

  const isLoading = fixedLoading || extraLoading || summaryLoading;

  const expenses = fixedExpenses || [];
  const extras = extraExpenses || [];

  const totalFixed = expenses.filter(e => e.is_active).reduce((sum, e) => sum + Number(e.amount), 0);
  const totalExtra = extras.reduce((sum, e) => sum + Number(e.amount), 0);

  const toggleExpense = async (expense: FixedExpense) => {
    await updateFixedExpense(expense.id, { is_active: !expense.is_active });
    await mutate("fixed-expenses");
    await mutate("financial-summary");
  };

  const handleDeleteFixed = async (id: string) => {
    await deleteFixedExpense(id);
    await mutate("fixed-expenses");
    await mutate("financial-summary");
  };

  const handleDeleteExtra = async (id: string) => {
    await deleteExtraExpense(id);
    await mutate("extra-expenses");
    await mutate("financial-summary");
  };

  // Group fixed expenses by category
  const expensesByCategory = expenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = { total: 0, items: [] };
    }
    if (expense.is_active) {
      acc[expense.category].total += Number(expense.amount);
    }
    acc[expense.category].items.push(expense);
    return acc;
  }, {} as Record<string, { total: number; items: FixedExpense[] }>);

  const pieData = Object.entries(expensesByCategory).map(([category, data]) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    value: data.total,
    color: categoryConfig[category]?.color || "#6b7280",
  })).filter(item => item.value > 0);

  const monthlyTrendData = summary?.expenseChartData || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Despesas</h1>
          <p className="text-muted-foreground text-sm mt-1">
             Acompanhe despesas fixas e gastos extras
          </p>
        </div>
        <div className="flex gap-2">
          {/* @ts-ignore */}
          <AddExtraExpenseDialog onSuccess={() => {}} />
          {/* @ts-ignore */}
          <AddFixedExpenseDialog onSuccess={() => {}} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-card border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Mensal Fixo</p>
              <p className="text-xl font-semibold text-foreground">
                {formatCurrency(totalFixed)}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-card border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Extras (Mês)</p>
              <p className="text-xl font-semibold text-foreground">
                {formatCurrency(totalExtra)}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-card border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Despesas</p>
              <p className="text-xl font-semibold text-foreground">
                {formatCurrency(totalFixed + totalExtra)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-xl bg-card border border-border p-5">
          <h3 className="font-medium text-card-foreground mb-4">Por Categoria</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData.length > 0 ? pieData : [{ name: "Sem Dados", value: 1, color: "#374151" }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                >
                  {(pieData.length > 0 ? pieData : [{ name: "Sem Dados", value: 1, color: "#374151" }]).map((entry, index) => (
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
                  itemStyle={{ color: "oklch(0.98 0 0)" }}
                  formatter={(value: number, name: string) => [formatCurrency(value), name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="text-foreground font-medium">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-xl bg-card border border-border p-5">
          <h3 className="font-medium text-card-foreground mb-4">Tendência Mensal</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrendData}>
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
                  tickFormatter={(v) => `R$${(v / 1000).toFixed(1)}k`}
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
                <Bar dataKey="fixed" name="Fixas" stackId="a" fill="oklch(0.72 0.19 160)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="extra" name="Extras" stackId="a" fill="oklch(0.75 0.15 80)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-card border border-border overflow-hidden">
        <div className="flex border-b border-border">
          <button
            type="button"
            onClick={() => setActiveTab("fixed")}
            className={cn(
              "flex-1 px-4 py-3 text-sm font-medium transition-colors",
              activeTab === "fixed"
                ? "text-primary border-b-2 border-primary bg-primary/5"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Fixed Expenses ({expenses.filter(e => e.is_active).length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("extra")}
            className={cn(
              "flex-1 px-4 py-3 text-sm font-medium transition-colors",
              activeTab === "extra"
                ? "text-primary border-b-2 border-primary bg-primary/5"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Extra Expenses ({extras.length})
          </button>
        </div>

        <div className="p-5">
          {activeTab === "fixed" ? (
            expenses.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No fixed expenses yet</p>
                <p className="text-sm mt-1">Add your recurring expenses to track them</p>
              </div>
            ) : (
              <div className="space-y-3">
                {expenses.map((expense) => {
                  const config = categoryConfig[expense.category];
                  return (
                    <div
                      key={expense.id}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-lg border transition-all group",
                        expense.is_active
                          ? "border-border bg-secondary/30"
                          : "border-border/50 bg-secondary/10 opacity-60"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${config?.color}20`, color: config?.color }}
                        >
                          {config?.icon}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{expense.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="secondary" className="text-xs capitalize">
                              {expense.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Due on day {expense.due_day}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-semibold text-foreground">
                          {formatCurrency(Number(expense.amount))}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleDeleteFixed(expense.id)}
                          className="p-1.5 rounded text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <Switch
                          checked={expense.is_active}
                          onCheckedChange={() => toggleExpense(expense)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : extras.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No extra expenses yet</p>
              <p className="text-sm mt-1">Add one-time or occasional expenses here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {extras.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-secondary/30 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                      {extraCategoryIcons[expense.category] || <MoreHorizontal className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{expense.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className="text-xs">
                          {expense.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(expense.expense_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-foreground">
                      {formatCurrency(Number(expense.amount))}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleDeleteExtra(expense.id)}
                      className="p-1.5 rounded text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
