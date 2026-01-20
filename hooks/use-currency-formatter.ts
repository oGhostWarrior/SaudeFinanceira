"use client";

import { useCallback } from "react";
import { useProfile } from "@/hooks/use-finance-data";

export function useCurrencyFormatter() {
  const { data: profile, isLoading } = useProfile();

  const formatCurrency = useCallback((value: number) => {
    const locale = profile?.language || "pt-BR";
    const currency = profile?.currency || "BRL";

    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }, [profile]);

  return { formatCurrency, isLoading, profile };
}