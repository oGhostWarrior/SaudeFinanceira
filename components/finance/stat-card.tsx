"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { Info } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  explanation?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
  explanation,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl bg-card border border-border p-5 hover:border-primary/30 transition-colors",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <p className="text-sm text-muted-foreground">{title}</p>
            {explanation && (
              <HoverCard>
                <HoverCardTrigger asChild>
                  <button className="text-muted-foreground/50 hover:text-primary transition-colors cursor-help">
                    <Info className="h-3.5 w-3.5" />
                    <span className="sr-only">Info</span>
                  </button>
                </HoverCardTrigger>
                <HoverCardContent align="start" className="w-80 z-50">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Icon className="h-4 w-4" /> {title}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {explanation}
                    </p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            )}
          </div>
          
          <p className="text-2xl font-semibold text-card-foreground">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <p
              className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-emerald-500" : "text-rose-500"
              )}
            >
              {trend.isPositive ? "+" : ""}
              {trend.value.toFixed(1)}% vs mês anterior
            </p>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </div>
  );
}