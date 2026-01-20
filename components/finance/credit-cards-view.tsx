"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { useCreditCards } from "@/hooks/use-finance-data";
import { createCreditCard, createCardPurchase, deleteCreditCard, deleteCardPurchase } from "@/lib/actions/finance-actions";
import type { CreditCard, CardPurchase } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  CreditCard as CreditCardIcon,
  Plus,
  Calendar,
  ShoppingBag,
  Utensils,
  Plane,
  Tv,
  Car,
  MoreHorizontal,
  Loader2,
  Trash2,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { mutate } from "swr";

const categoryIcons: Record<string, React.ReactNode> = {
  Shopping: <ShoppingBag className="h-4 w-4" />,
  Groceries: <ShoppingBag className="h-4 w-4" />,
  Entertainment: <Tv className="h-4 w-4" />,
  Transportation: <Car className="h-4 w-4" />,
  Travel: <Plane className="h-4 w-4" />,
  Dining: <Utensils className="h-4 w-4" />,
};

const cardColors = [
  "from-blue-600 to-blue-800",
  "from-emerald-600 to-emerald-800",
  "from-purple-600 to-purple-800",
  "from-orange-600 to-orange-800",
  "from-pink-600 to-pink-800",
];

function CreditCardComponent({ card }: { card: CreditCard }) {
  const utilizationPercent = (Number(card.current_balance) / Number(card.credit_limit)) * 100;
  const availableCredit = Number(card.credit_limit) - Number(card.current_balance);
  const monthlyInvoice = (card.purchases || []).reduce((acc, p) => {
    if (p.is_installment && p.total_installments && p.total_installments > 0) {
      return acc + (Number(p.amount) / p.total_installments);
    }
    return acc + Number(p.amount);
  }, 0);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    }).format(value);

  return (
    <div className={cn(
      "relative rounded-2xl p-6 bg-gradient-to-br overflow-hidden",
      card.color
    )}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-white/70 text-sm">{card.name}</p>
            <p className="text-white text-lg font-medium mt-1">
              **** **** **** {card.last_four}
            </p>
          </div>
          <CreditCardIcon className="h-8 w-8 text-white/50" />
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-white/70">Fatura Atual</span>
            <span className="text-white font-semibold">{formatCurrency(monthlyInvoice)}</span>
          </div>
          <Progress 
            value={utilizationPercent} 
            className="h-1.5 bg-white/20"
          />
          <div className="flex justify-between text-xs">
            <span className="text-white/60">Disponível: {formatCurrency(availableCredit)}</span>
            <span className="text-white/60">Limite: {formatCurrency(Number(card.credit_limit))}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
          <Calendar className="h-4 w-4 text-white/60" />
          <span className="text-xs text-white/60">
            Vencimento dia: {card.due_date}
          </span>
        </div>
      </div>
    </div>
  );
}

function AddCardDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    last_four_digits: "",
    credit_limit: "",
    current_balance: "0",
    due_date: "15",
    color: cardColors[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createCreditCard({
        name: form.name,
        last_four: form.last_four_digits,
        credit_limit: Number.parseFloat(form.credit_limit),
        current_balance: Number.parseFloat(form.current_balance),
        due_date: Number.parseInt(form.due_date),
        color: form.color,
      });
      await mutate("credit-cards");
      await mutate("financial-summary");
      setOpen(false);
      setForm({ name: "", last_four_digits: "", credit_limit: "", current_balance: "0", due_date: "15", color: cardColors[0] });
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
          Novo Cartão
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Adicionar Cartão de Crédito</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Cartão</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Nubank, Visa..." required className="bg-input border-border" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="digits">Últimos 4 Dígitos</Label>
            <Input id="digits" value={form.last_four_digits} onChange={(e) => setForm({ ...form, last_four_digits: e.target.value.slice(0, 4) })} placeholder="1234" maxLength={4} required className="bg-input border-border" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="limit">Limite de Crédito</Label>
              <Input id="limit" type="number" value={form.credit_limit} onChange={(e) => setForm({ ...form, credit_limit: e.target.value })} placeholder="5000" required className="bg-input border-border" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="balance">Fatura Atual (Inicial)</Label>
              <Input id="balance" type="number" value={form.current_balance} onChange={(e) => setForm({ ...form, current_balance: e.target.value })} placeholder="0" className="bg-input border-border" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="due">Dia do Vencimento</Label>
              <Input id="due" type="number" min="1" max="31" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="bg-input border-border" />
            </div>
            <div className="space-y-2">
              <Label>Cor do Cartão</Label>
              <Select value={form.color} onValueChange={(value) => setForm({ ...form, color: value })}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="from-blue-600 to-blue-800">Azul</SelectItem>
                  <SelectItem value="from-emerald-600 to-emerald-800">Verde</SelectItem>
                  <SelectItem value="from-purple-600 to-purple-800">Roxo</SelectItem>
                  <SelectItem value="from-orange-600 to-orange-800">Laranja</SelectItem>
                  <SelectItem value="from-pink-600 to-pink-800">Rosa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Salvar Cartão
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddPurchaseDialog({ cardId, onSuccess }: { cardId: string; onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isInstallment, setIsInstallment] = useState(false);
  const [installments, setInstallments] = useState("2");
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
      await createCardPurchase({
        card_id: cardId,
        description: form.description,
        amount: Number.parseFloat(form.amount),
        category: form.category,
        purchase_date: form.date,
        is_installment: isInstallment,
        current_installment: isInstallment ? 1 : null,
        total_installments: isInstallment ? Number(installments) : null,
      });
      await mutate("credit-cards");
      await mutate("financial-summary");
      setOpen(false);
      setForm({ description: "", amount: "", category: "Shopping", date: new Date().toISOString().split("T")[0] });
      setIsInstallment(false);
      setInstallments("2");
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
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Plus className="h-4 w-4" />
          Adicionar Compra
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Nova Compra</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="desc">Descrição</Label>
            <Input id="desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Ex: Supermercado" required className="bg-input border-border" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor Total</Label>
              <Input id="amount" type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="50.00" required className="bg-input border-border" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input id="date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="bg-input border-border" />
            </div>
          </div>
          
          <div className="flex items-center justify-between py-2">
            <Label htmlFor="installment-mode" className="text-sm font-medium">Compra Parcelada?</Label>
            <Switch
              id="installment-mode"
              checked={isInstallment}
              onCheckedChange={setIsInstallment}
            />
          </div>

          {isInstallment && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <Label htmlFor="installments">Número de Parcelas</Label>
              <Input
                id="installments"
                type="number"
                min="2"
                max="48"
                value={installments}
                onChange={(e) => setInstallments(e.target.value)}
                required={isInstallment}
                className="bg-input border-border"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={form.category} onValueChange={(value) => setForm({ ...form, category: value })}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Shopping">Compras</SelectItem>
                <SelectItem value="Groceries">Mercado</SelectItem>
                <SelectItem value="Entertainment">Lazer</SelectItem>
                <SelectItem value="Transportation">Transporte</SelectItem>
                <SelectItem value="Travel">Viagem</SelectItem>
                <SelectItem value="Dining">Alimentação</SelectItem>
                <SelectItem value="Other">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Salvar Compra
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CreditCardsView() {
  const { data: cards, isLoading } = useCreditCards();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    }).format(value);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const cardsList = cards || [];
  const selectedCard = cardsList.find((c) => c.id === selectedCardId) || cardsList[0];

  // Cálculos Gerais (View Principal)
  const totalBalance = cardsList.reduce((sum, card) => sum + Number(card.current_balance), 0);
  const totalLimit = cardsList.reduce((sum, card) => sum + Number(card.credit_limit), 0);
  
  // Calcular Fatura Mensal Total
  const totalMonthlyInvoice = cardsList.reduce((sum, card) => {
    return sum + (card.purchases || []).reduce((acc, p) => {
      if (p.is_installment && p.total_installments && p.total_installments > 0) {
        return acc + (Number(p.amount) / p.total_installments);
      }
      return acc + Number(p.amount);
    }, 0);
  }, 0);

  const overallUtilization = totalLimit > 0 ? (totalBalance / totalLimit) * 100 : 0;

  const handleDeleteCard = async (id: string) => {
    if(!confirm("Tem certeza que deseja excluir este cartão?")) return;
    await deleteCreditCard(id);
    await mutate("credit-cards");
    await mutate("financial-summary");
    if (selectedCardId === id) setSelectedCardId(null);
  };

  const handleDeletePurchase = async (id: string) => {
    if(!confirm("Excluir esta compra?")) return;
    await deleteCardPurchase(id);
    await mutate("credit-cards");
    await mutate("financial-summary");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Cartões de Crédito</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gerencie seus cartões e acompanhe seus gastos
          </p>
        </div>
        <AddCardDialog onSuccess={() => {}} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-card border border-border p-5">
          {/* Mostra Fatura MENSAL */}
          <p className="text-sm text-muted-foreground">Fatura Total (Mês)</p>
          <p className="text-2xl font-semibold text-foreground mt-1">
            {formatCurrency(totalMonthlyInvoice)}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Em {cardsList.length} cartão{cardsList.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="rounded-xl bg-card border border-border p-5">
          {/* Mostra Limite TOTAL */}
          <p className="text-sm text-muted-foreground">Limite Total</p>
          <p className="text-2xl font-semibold text-foreground mt-1">
            {formatCurrency(totalLimit)}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {formatCurrency(totalLimit - totalBalance)} disponível
          </p>
        </div>
        <div className="rounded-xl bg-card border border-border p-5">
          <p className="text-sm text-muted-foreground">Utilização de Crédito</p>
          <p className="text-2xl font-semibold text-foreground mt-1">
            {overallUtilization.toFixed(1)}%
          </p>
          <Progress value={overallUtilization} className="h-1.5 mt-3" />
        </div>
      </div>

      {cardsList.length === 0 ? (
        <div className="rounded-xl bg-card border border-border p-12 text-center">
          <CreditCardIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Nenhum cartão ainda</h3>
          <p className="text-muted-foreground text-sm mb-4">Adicione seu primeiro cartão para começar a controlar.</p>
          <AddCardDialog onSuccess={() => {}} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h3 className="font-medium text-foreground">Seus Cartões</h3>
            {cardsList.map((card) => (
              <div key={card.id} className="relative group">
                <button
                  onClick={() => setSelectedCardId(card.id)}
                  className={cn(
                    "w-full text-left transition-all",
                    selectedCard?.id === card.id 
                      ? "ring-2 ring-primary rounded-2xl scale-[1.02]"
                      : "opacity-75 hover:opacity-100"
                  )}
                >
                  <CreditCardComponent card={card} />
                </button>
                <button
                  onClick={() => handleDeleteCard(card.id)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/20 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/30"
                  title="Excluir Cartão"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {selectedCard && (
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-xl bg-card border border-border p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-card-foreground">Compras Recentes</h3>
                  <AddPurchaseDialog cardId={selectedCard.id} onSuccess={() => {}} />
                </div>
                <div className="space-y-3">
                  {(selectedCard.purchases || []).map((purchase: CardPurchase) => (
                    <div
                      key={purchase.id}
                      className="flex items-center justify-between py-3 border-b border-border last:border-0 group hover:bg-secondary/20 px-2 rounded-md transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
                          {categoryIcons[purchase.category] || <MoreHorizontal className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {purchase.description}
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-muted-foreground">
                              {purchase.category} - {new Date(purchase.purchase_date).toLocaleDateString("pt-BR")}
                            </p>
                            {purchase.is_installment && (
                              <span className="text-[10px] bg-orange-500/10 text-orange-500 px-1.5 py-0.5 rounded-full border border-orange-500/20">
                                {purchase.total_installments}x
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <p className="text-sm font-medium text-foreground">
                          -{formatCurrency(Number(purchase.amount))}
                        </p>
                        {purchase.is_installment && purchase.total_installments && (
                           <p className="text-[10px] text-muted-foreground">
                             (Parcela: {formatCurrency(Number(purchase.amount) / purchase.total_installments)})
                           </p>
                        )}
                        <button
                          onClick={() => handleDeletePurchase(purchase.id)}
                          className="mt-1 p-1 rounded text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                          title="Excluir Compra"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {(!selectedCard.purchases || selectedCard.purchases.length === 0) && (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhuma compra registrada neste cartão.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}