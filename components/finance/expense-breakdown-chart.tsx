"use client";

import React, { useState, useMemo } from "react";
import { PieChart, Pie, Sector, ResponsiveContainer, Cell, Tooltip } from "recharts";
import { useCurrencyFormatter } from "@/hooks/use-currency-formatter";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/language-provider";

const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value, currencyFormatter } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
        <g>
            <text x={cx} y={cy} dy={-10} textAnchor="middle" fill="#888888" fontSize={12}>
                {payload.name}
            </text>
            <text x={cx} y={cy} dy={20} textAnchor="middle" fill={fill} fontSize={16} fontWeight="bold">
                {currencyFormatter(value)}
            </text>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 6}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
            />
            <Sector
                cx={cx}
                cy={cy}
                startAngle={startAngle}
                endAngle={endAngle}
                innerRadius={outerRadius + 8}
                outerRadius={outerRadius + 12}
                fill={fill}
                opacity={0.3}
            />
        </g>
    );
};

interface ExpenseBreakdownChartProps {
    data: {
        name: string;
        value: number;
        color: string;
    }[];
}

export function ExpenseBreakdownChart({ data }: ExpenseBreakdownChartProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const { formatCurrency } = useCurrencyFormatter();
    const { t } = useLanguage();

    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index);
    };

    const safeData = useMemo(() => {
        if (!data || data.length === 0) {
            return [{ name: t("common.noData"), value: 1, color: "#374151" }];
        }
        return data;
    }, [data]);

    const activeItem = safeData[activeIndex] || safeData[0];

    return (
        <div className="flex flex-col h-full w-full">
            <div className="h-[250px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            activeIndex={activeIndex}
                            activeShape={(props: any) => renderActiveShape({ ...props, currencyFormatter: formatCurrency })}
                            data={safeData}
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={85}
                            paddingAngle={3}
                            dataKey="value"
                            onMouseEnter={onPieEnter}
                            stroke="none"
                        >
                            {safeData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap gap-2 justify-center mt-2 px-2">
                {safeData.map((entry, index) => (
                    <div
                        key={entry.name}
                        className={cn(
                            "flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs cursor-pointer transition-all",
                            index === activeIndex
                                ? "bg-secondary border-primary/20 text-foreground scale-105 shadow-sm"
                                : "bg-transparent border-transparent text-muted-foreground hover:bg-secondary/50"

                        )}
                        onMouseEnter={() => setActiveIndex(index)}
                    >
                        <div
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="font-medium truncate max-w-[100px]">{entry.name}</span>
                        <span className="text-[10px] opacity-70 ml-1">
                            {((entry.value / safeData.reduce((a, b) => a + b.value, 0)) * 100).toFixed(0)}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
