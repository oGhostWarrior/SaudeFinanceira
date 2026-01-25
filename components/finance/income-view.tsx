"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { useIncomeSources, useFinancialSummary } from "@/hooks/use-finance-data";
import { useCurrencyFormatter } from "@/hooks/use-currency-formatter";
import { createIncomeSource, updateIncomeSource, deleteIncomeSource } from "@/lib/actions/finance-actions";
import type { IncomeSource } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Plus,
  Briefcase,
  Building2,
  TrendingUp,
  Wallet,
  Youtube,
  ArrowUpRight,
  PiggyBank,
  Loader2,
  Trash2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { mutate } from "swr";

const sourceIcons: Record<string, React.ReactNode> = {
  Salary: <Briefcase className="h-4 w-4" />,
  Investments: <TrendingUp className="h-4 w-4" />,
  "Rental Income": <Building2 className="h-4 w-4" />,
  Freelance: <Briefcase className="h-4 w-4" />,
  YouTube: <Youtube className="h-4 w-4" />,
  Dividends: <PiggyBank className="h-4 w-4" />,
};

function AddIncomeDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "active" as IncomeSource["type"],
    amount: "",
    frequency: "monthly" as IncomeSource["frequency"],
    source: "",
    is_active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createIncomeSource({
        name: form.name,
        type: form.type,
        amount: Number.parseFloat(form.amount),
        frequency: form.frequency,
        source: form.source,
        is_active: form.is_active,
      });
      await mutate("income-sources");
      await mutate("financial-summary");
      setOpen(false);
      setForm({ name: "", type: "active", amount: "", frequency: "monthly", source: "", is_active: true });
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
          Add Income Source
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Adc Fonte de Renda</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Main Salary" required className="bg-input border-border" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(value) => setForm({ ...form, type: value as IncomeSource["type"] })}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="passive">Passive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select value={form.frequency} onValueChange={(value) => setForm({ ...form, frequency: value as IncomeSource["frequency"] })}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="bi-weekly">Quinzenal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="quarterly">Trimestral</SelectItem>
                  <SelectItem value="annually">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Quantia</Label>
              <Input id="amount" type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="5000" required className="bg-input border-border" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Input id="source" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="Company Name" required className="bg-input border-border" />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Adc Fonte de Renda
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function IncomeView() {
  const { data: incomeSources, isLoading } = useIncomeSources();
  const { data: summary, isLoading: summaryLoading } = useFinancialSummary();

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

  const incomeHistoryData = summary?.incomeChartData || [];
  const incomes = incomeSources || [];
  

  const toggleIncome = async (income: IncomeSource) => {
    await updateIncomeSource(income.id, { is_active: !income.is_active });
    await mutate("income-sources");
    await mutate("financial-summary");
  };

  const handleDelete = async (id: string) => {
    await deleteIncomeSource(id);
    await mutate("income-sources");
    await mutate("financial-summary");
  };

  const frequencyMultiplier: Record<string, number> = {
    'weekly': 4.33,
    'bi-weekly': 2.17,
    'monthly': 1,
    'quarterly': 0.33,
    'annually': 0.083,
  };

  const getMonthlyAmount = (income: IncomeSource) => {
    return Number(income.amount) * (frequencyMultiplier[income.frequency] || 1);
  };

  const monthlyIncome = incomes
    .filter(i => i.is_active)
    .reduce((sum, i) => sum + getMonthlyAmount(i), 0);

  const activeIncome = incomes.filter(i => i.type === "active" && i.is_active);
  const passiveIncome = incomes.filter(i => i.type === "passive" && i.is_active);

  const totalActive = activeIncome.reduce((sum, i) => sum + getMonthlyAmount(i), 0);
  const totalPassive = passiveIncome.reduce((sum, i) => sum + getMonthlyAmount(i), 0);

  const passiveRatio = monthlyIncome > 0 ? ((totalPassive / monthlyIncome) * 100).toFixed(1) : "0";
  const annualProjection = monthlyIncome * 12;

  const incomeDistribution = [
    { name: "Active Income", value: totalActive, color: "#3b82f6" },
    { name: "Passive Income", value: totalPassive, color: "#10b981" },
  ].filter(item => item.value > 0);

  const getFrequencyLabel = (freq: string) => {
    switch (freq) {
      case "weekly": return "Weekly";
      case "bi-weekly": return "Bi-weekly";
      case "monthly": return "Monthly";
      case "quarterly": return "Quarterly";
      case "annually": return "Annually";
      default: return freq;
    }
  };

  const projectionData = [];
  const today = new Date();
  for(let i=1; i<=5; i++) {
     const nextMonth = new Date(today.getFullYear(), today.getMonth() + i, 1);
     projectionData.push({
        month: nextMonth.toLocaleDateString('pt-BR', { month: 'short' }),
        cumulative: monthlyIncome * i
     });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Renda</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Acompanhe seus fluxos de renda ativa e passiva.
          </p>
        </div>
        <AddIncomeDialog onSuccess={() => {}} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl bg-card border border-border p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Renda Mensal</p>
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <p className="text-2xl font-semibold text-foreground mt-2">
            {formatCurrency(monthlyIncome)}
          </p>
          <div className="flex items-center gap-1 mt-2">
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-medium text-emerald-500">+5.2%</span>
            <span className="text-xs text-muted-foreground">vs Ultimo Mes</span>
          </div>
        </div>

        <div className="rounded-xl bg-card border border-border p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Renda Ativa</p>
            <Briefcase className="h-5 w-5 text-chart-2" />
          </div>
          <p className="text-2xl font-semibold text-foreground mt-2">
            {formatCurrency(totalActive)}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {activeIncome.length} active source{activeIncome.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="rounded-xl bg-card border border-border p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Renda Passiva</p>
            <PiggyBank className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-2xl font-semibold text-foreground mt-2">
            {formatCurrency(totalPassive)}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {passiveRatio}% do total de renda
          </p>
        </div>

        <div className="rounded-xl bg-card border border-border p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Projeção Anual</p>
            <TrendingUp className="h-5 w-5 text-yellow-500" />
          </div>
          <p className="text-2xl font-semibold text-foreground mt-2">
            {formatCurrency(annualProjection)}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Com base nos fluxos atuais
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl bg-card border border-border p-5">
          <h3 className="font-medium text-card-foreground mb-4">Historico de Renda</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeHistoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.01 260)" vertical={false} />
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
                <Bar dataKey="active" name="Active" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="passive" name="Passive" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl bg-card border border-border p-5">
          <h3 className="font-medium text-card-foreground mb-4">Renda Mista</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={incomeDistribution.length > 0 ? incomeDistribution : [{ name: "No Data", value: 1, color: "#374151" }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                  nameKey="name"
                >
                  {(incomeDistribution.length > 0 ? incomeDistribution : [{ name: "No Data", value: 1, color: "#374151" }]).map((entry, index) => (
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
          <div className="space-y-3 mt-4">
            {incomeDistribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-foreground">
                  {formatCurrency(item.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {monthlyIncome > 0 && (
        <div className="rounded-xl bg-card border border-border p-5">
          <h3 className="font-medium text-card-foreground mb-4">Prejeção em 5 Meses</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projectionData}>
                <defs>
                  <linearGradient id="projectionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.72 0.19 160)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.72 0.19 160)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.01 260)" vertical={false} />
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
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  stroke="oklch(0.72 0.19 160)"
                  strokeWidth={2}
                  fill="url(#projectionGradient)"
                  name="Cumulative Income"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl bg-card border border-border overflow-hidden">
          <div className="p-5 border-b border-border flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-chart-2" />
            <h3 className="font-medium text-card-foreground">Renda Ativa</h3>
          </div>
          <div className="p-5 space-y-3">
            {incomes.filter(i => i.type === "active").length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Sem Fontes de Renda Ativa</p>
              </div>
            ) : (
              incomes.filter(i => i.type === "active").map((income) => (
                <div
                  key={income.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg border transition-all group",
                    income.is_active
                      ? "border-border bg-secondary/30"
                      : "border-border/50 bg-secondary/10 opacity-60"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-chart-2/10 flex items-center justify-center text-chart-2">
                      {sourceIcons[income.source] || <Briefcase className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{income.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">{income.source}</span>
                        <Badge variant="secondary" className="text-xs">
                          {getFrequencyLabel(income.frequency)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        {formatCurrency(Number(income.amount))}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ~{formatCurrency(getMonthlyAmount(income))}/mo
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(income.id)}
                      className="p-1.5 rounded text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <Switch
                      checked={income.is_active}
                      onCheckedChange={() => toggleIncome(income)}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl bg-card border border-border overflow-hidden">
          <div className="p-5 border-b border-border flex items-center gap-2">
            <PiggyBank className="h-5 w-5 text-emerald-500" />
            <h3 className="font-medium text-card-foreground">Renda Passiva</h3>
          </div>
          <div className="p-5 space-y-3">
            {incomes.filter(i => i.type === "passive").length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <PiggyBank className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Sem Fontes de Renda Passiva</p>
              </div>
            ) : (
              incomes.filter(i => i.type === "passive").map((income) => (
                <div
                  key={income.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg border transition-all group",
                    income.is_active
                      ? "border-border bg-secondary/30"
                      : "border-border/50 bg-secondary/10 opacity-60"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                      {sourceIcons[income.source] || <PiggyBank className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{income.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">{income.source}</span>
                        <Badge variant="secondary" className="text-xs">
                          {getFrequencyLabel(income.frequency)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        {formatCurrency(Number(income.amount))}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ~{formatCurrency(getMonthlyAmount(income))}/mes
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(income.id)}
                      className="p-1.5 rounded text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <Switch
                      checked={income.is_active}
                      onCheckedChange={() => toggleIncome(income)}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
