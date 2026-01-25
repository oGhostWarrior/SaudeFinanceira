"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useInvestments, useFinancialSummary } from "@/hooks/use-finance-data";
import { useCurrencyFormatter } from "@/hooks/use-currency-formatter";
import { createInvestment, deleteInvestment, updateInvestment, updateCryptoPrices } from "@/lib/actions/finance-actions";
import type { Investment } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Bitcoin,
  BarChart3,
  Building2,
  Landmark,
  Layers,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Loader2,
  Trash2,
  RefreshCw,
} from "lucide-react";
import {
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

const typeConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  stock: { icon: <BarChart3 className="h-4 w-4" />, color: "#3b82f6", label: "Stocks" },
  etf: { icon: <Layers className="h-4 w-4" />, color: "#10b981", label: "ETFs" },
  bond: { icon: <Landmark className="h-4 w-4" />, color: "#f59e0b", label: "Bonds" },
  mutual_fund: { icon: <Building2 className="h-4 w-4" />, color: "#8b5cf6", label: "Mutual Funds" },
  crypto: { icon: <Bitcoin className="h-4 w-4" />, color: "#f97316", label: "Crypto" },
  real_estate: { icon: <Building2 className="h-4 w-4" />, color: "#06b6d4", label: "Real Estate" },
};

function AddInvestmentDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "stock" as Investment["type"],
    symbol: "",
    quantity: "",
    purchase_price: "",
    current_price: "",
    purchase_date: new Date().toISOString().split("T")[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createInvestment({
        name: form.name,
        type: form.type,
        symbol: form.symbol || null,
        quantity: Number.parseFloat(form.quantity),
        purchase_price: Number.parseFloat(form.purchase_price),
        current_price: Number.parseFloat(form.current_price),
        purchase_date: form.purchase_date,
      });
      await mutate("investments");
      await mutate("financial-summary");
      setOpen(false);
      setForm({ name: "", type: "stock", symbol: "", quantity: "", purchase_price: "", current_price: "", purchase_date: new Date().toISOString().split("T")[0] });
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
          Add Investment
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add Investment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Apple Inc." required className="bg-input border-border" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol</Label>
              <Input id="symbol" value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value.toUpperCase() })} placeholder="AAPL" className="bg-input border-border" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={form.type} onValueChange={(value) => setForm({ ...form, type: value as Investment["type"] })}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stock">Stock</SelectItem>
                <SelectItem value="etf">ETF</SelectItem>
                <SelectItem value="crypto">Cryptocurrency</SelectItem>
                <SelectItem value="bond">Bond</SelectItem>
                <SelectItem value="mutual_fund">Mutual Fund</SelectItem>
                <SelectItem value="real_estate">Real Estate</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" type="number" step="any" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="10" required className="bg-input border-border" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchasePrice">Purchase Price</Label>
              <Input id="purchasePrice" type="number" step="0.01" value={form.purchase_price} onChange={(e) => setForm({ ...form, purchase_price: e.target.value })} placeholder="150.00" required className="bg-input border-border" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentPrice">Current Price</Label>
              <Input id="currentPrice" type="number" step="0.01" value={form.current_price} onChange={(e) => setForm({ ...form, current_price: e.target.value })} placeholder="175.00" required className="bg-input border-border" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Purchase Date</Label>
            <Input id="date" type="date" value={form.purchase_date} onChange={(e) => setForm({ ...form, purchase_date: e.target.value })} className="bg-input border-border" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Add Investment
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function InvestmentsView() {
  const [filter, setFilter] = useState<string>("all");
  const { data: investments, isLoading: invLoading } = useInvestments();
  const { data: summary, isLoading: summaryLoading } = useFinancialSummary();
  const [isUpdating, setIsUpdating] = useState(false);
  const { formatCurrency } = useCurrencyFormatter();
  const isLoading = invLoading || summaryLoading;

  const portfolioHistoryData = summary?.investmentChartData || [];

  const handleUpdatePrices = async () => {
    setIsUpdating(true);
    try {
      await updateCryptoPrices();
      await mutate("investments");
      await mutate("financial-summary");
      toast.success("Cotações atualizadas com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar cotações.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
  }

  const investmentsList = investments || [];

  const totalValue = investmentsList.reduce((sum, inv) => sum + Number(inv.quantity) * Number(inv.current_price), 0);
  const totalCost = investmentsList.reduce((sum, inv) => sum + Number(inv.quantity) * Number(inv.purchase_price), 0);
  const totalGain = totalValue - totalCost;
  const gainPercent = totalCost > 0 ? ((totalGain / totalCost) * 100).toFixed(2) : "0";

  const filteredInvestments = filter === "all" 
    ? investmentsList 
    : investmentsList.filter(inv => inv.type === filter);

  // Group by type for pie chart
  const allocationData = Object.entries(
    investmentsList.reduce((acc, inv) => {
      const value = Number(inv.quantity) * Number(inv.current_price);
      acc[inv.type] = (acc[inv.type] || 0) + value;
      return acc;
    }, {} as Record<string, number>)
  ).map(([type, value]) => ({
    name: typeConfig[type]?.label || type,
    value,
    color: typeConfig[type]?.color || "#6b7280",
  }));

  const cryptoInvestments = investmentsList.filter(inv => inv.type === "crypto");
  const traditionalInvestments = investmentsList.filter(inv => inv.type !== "crypto");

  const cryptoValue = cryptoInvestments.reduce((sum, inv) => sum + Number(inv.quantity) * Number(inv.current_price), 0);
  const traditionalValue = traditionalInvestments.reduce((sum, inv) => sum + Number(inv.quantity) * Number(inv.current_price), 0);

  const handleDelete = async (id: string) => {
    await deleteInvestment(id);
    await mutate("investments");
    await mutate("financial-summary");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Investimentos</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Acompanhe o desempenho e a alocação do seu portfólio.
          </p>
        </div>
        <AddInvestmentDialog onSuccess={() => {}} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl bg-card border border-border p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total Portfolio</p>
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <p className="text-2xl font-semibold text-foreground mt-2">
            {formatCurrency(totalValue)}
          </p>
          <div className="flex items-center gap-1 mt-2">
            {Number(gainPercent) >= 0 ? (
              <ArrowUpRight className="h-4 w-4 text-emerald-500" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-destructive" />
            )}
            <span className={cn("text-sm font-medium", Number(gainPercent) >= 0 ? "text-emerald-500" : "text-destructive")}>
              {gainPercent}%
            </span>
            <span className="text-xs text-muted-foreground">all time</span>
          </div>
        </div>

        <div className="rounded-xl bg-card border border-border p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total Perdas/Ganhos</p>
            {totalGain >= 0 ? (
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            ) : (
              <TrendingDown className="h-5 w-5 text-destructive" />
            )}
          </div>
          <p className={cn("text-2xl font-semibold mt-2", totalGain >= 0 ? "text-emerald-500" : "text-destructive")}>
            {totalGain >= 0 ? "+" : ""}{formatCurrency(totalGain)}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Cost basis: {formatCurrency(totalCost)}
          </p>
        </div>

        <div className="rounded-xl bg-card border border-border p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Ativos tradicionais</p>
            <BarChart3 className="h-5 w-5 text-chart-2" />
          </div>
          <p className="text-2xl font-semibold text-foreground mt-2">
            {formatCurrency(traditionalValue)}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {totalValue > 0 ? ((traditionalValue / totalValue) * 100).toFixed(1) : 0}% do portfolio
          </p>
        </div>

        <div className="rounded-xl bg-card border border-border p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Criptomoedas</p>
            <Bitcoin className="h-5 w-5 text-chart-5" />
          </div>
          <p className="text-2xl font-semibold text-foreground mt-2">
            {formatCurrency(cryptoValue)}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {totalValue > 0 ? ((cryptoValue / totalValue) * 100).toFixed(1) : 0}% do portfolio
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl bg-card border border-border p-5">
          <h3 className="font-medium text-card-foreground mb-4">Evolução do Valor Investido (Custo)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={portfolioHistoryData}>
                <defs>
                  <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.72 0.19 160)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.72 0.19 160)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.01 260)" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(1)}k`} />
                <Tooltip contentStyle={{ backgroundColor: "oklch(0.15 0.01 260)", border: "1px solid oklch(0.25 0.01 260)", borderRadius: "8px", color: "oklch(0.98 0 0)" }} formatter={(value: number) => [formatCurrency(value), "Valor Investido"]} />
                <Area type="monotone" dataKey="value" stroke="oklch(0.72 0.19 160)" strokeWidth={2} fill="url(#portfolioGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl bg-card border border-border p-5">
          <h3 className="font-medium text-card-foreground mb-4">Alocação de ativos</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData.length > 0 ? allocationData : [{ name: "No Data", value: 1, color: "#374151" }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                >
                  {(allocationData.length > 0 ? allocationData : [{ name: "No Data", value: 1, color: "#374151" }]).map((entry, index) => (
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
            {allocationData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="text-foreground font-medium">
                  {totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(1) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-card border border-border overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-medium text-card-foreground">Holdings</h3>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-secondary border-0 text-sm text-foreground rounded-md px-3 py-1.5 focus:ring-2 focus:ring-primary"
            >
              <option value="all">Todos Ativos</option>
              <option value="stock">Açoes</option>
              <option value="etf">ETFs</option>
              <option value="crypto">Crypto</option>
              <option value="bond">Titulos</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleUpdatePrices} 
              disabled={isUpdating}
              className="gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", isUpdating && "animate-spin")} />
              {isUpdating ? "Atualizando..." : "Atualizar Cotações"}
            </Button>

            <AddInvestmentDialog onSuccess={() => {}} />
          </div>

        {filteredInvestments.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No investments yet</p>
            <p className="text-sm mt-1">Add your first investment to start tracking your portfolio</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Ativo</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Quantidade</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Custo Medio</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Preço Atual</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Valor</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Perdas/Ganhos</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground" />
                </tr>
              </thead>
              <tbody>
                {filteredInvestments.map((inv) => {
                  const currentValue = Number(inv.quantity) * Number(inv.current_price);
                  const costBasis = Number(inv.quantity) * Number(inv.purchase_price);
                  const gain = currentValue - costBasis;
                  const gainPct = costBasis > 0 ? ((gain / costBasis) * 100).toFixed(2) : "0";
                  const config = typeConfig[inv.type];

                  return (
                    <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${config?.color}20`, color: config?.color }}
                          >
                            {config?.icon}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{inv.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {inv.symbol && <span className="text-xs text-muted-foreground">{inv.symbol}</span>}
                              <Badge variant="secondary" className="text-xs">
                                {config?.label}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right text-foreground">
                        {inv.type === "crypto" ? Number(inv.quantity).toFixed(4) : inv.quantity}
                      </td>
                      <td className="p-4 text-right text-muted-foreground">
                        {formatCurrency(Number(inv.purchase_price))}
                      </td>
                      <td className="p-4 text-right text-foreground font-medium">
                        {formatCurrency(Number(inv.current_price))}
                      </td>
                      <td className="p-4 text-right text-foreground font-medium">
                        {formatCurrency(currentValue)}
                      </td>
                      <td className="p-4 text-right">
                        <div className={cn("font-medium", gain >= 0 ? "text-emerald-500" : "text-destructive")}>
                          {gain >= 0 ? "+" : ""}{formatCurrency(gain)}
                        </div>
                        <div className={cn("text-xs", gain >= 0 ? "text-emerald-500" : "text-destructive")}>
                          {gain >= 0 ? "+" : ""}{gainPct}%
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(inv.id)}
                          className="p-1.5 rounded text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
