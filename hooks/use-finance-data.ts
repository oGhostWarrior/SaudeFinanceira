"use client";

import useSWR from "swr";
import {
  getCreditCards,
  getFixedExpenses,
  getExtraExpenses,
  getInvestments,
  getIncomeSources,
  getIncomeHistory,
  getFinancialSummary,
  getProfile,
} from "@/lib/actions/finance-actions";

export function useCreditCards() {
  return useSWR("credit-cards", getCreditCards, {
    revalidateOnFocus: false,
  });
}

export function useFixedExpenses() {
  return useSWR("fixed-expenses", getFixedExpenses, {
    revalidateOnFocus: false,
  });
}

export function useExtraExpenses() {
  return useSWR("extra-expenses", getExtraExpenses, {
    revalidateOnFocus: false,
  });
}

export function useInvestments() {
  return useSWR("investments", getInvestments, {
    revalidateOnFocus: false,
  });
}

export function useIncomeSources() {
  return useSWR("income-sources", getIncomeSources, {
    revalidateOnFocus: false,
  });
}

export function useIncomeHistory(sourceId?: string) {
  return useSWR(
    sourceId ? `income-history-${sourceId}` : "income-history",
    () => getIncomeHistory(sourceId),
    { revalidateOnFocus: false }
  );
}

export function useFinancialSummary() {
  return useSWR("financial-summary", getFinancialSummary, {
    revalidateOnFocus: false,
  });
}

export function useProfile() {
  return useSWR("profile", getProfile, {
    revalidateOnFocus: false,
  });
}
