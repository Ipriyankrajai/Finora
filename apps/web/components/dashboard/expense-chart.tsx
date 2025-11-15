"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const chartData = [
  { date: "2024-04-01", expenses: 220, income: 400 },
  { date: "2024-04-02", expenses: 197, income: 420 },
  { date: "2024-04-03", expenses: 267, income: 390 },
  { date: "2024-04-04", expenses: 242, income: 500 },
  { date: "2024-04-05", expenses: 373, income: 520 },
  { date: "2024-04-06", expenses: 301, income: 540 },
  { date: "2024-04-07", expenses: 245, income: 480 },
  { date: "2024-04-08", expenses: 409, income: 600 },
  { date: "2024-04-09", expenses: 259, income: 450 },
  { date: "2024-04-10", expenses: 261, income: 480 },
  { date: "2024-04-11", expenses: 327, income: 520 },
  { date: "2024-04-12", expenses: 292, income: 510 },
  { date: "2024-04-13", expenses: 342, income: 550 },
  { date: "2024-04-14", expenses: 237, income: 490 },
  { date: "2024-04-15", expenses: 320, income: 470 },
  { date: "2024-04-16", expenses: 338, income: 520 },
  { date: "2024-04-17", expenses: 446, income: 600 },
  { date: "2024-04-18", expenses: 364, income: 580 },
  { date: "2024-04-19", expenses: 243, income: 450 },
  { date: "2024-04-20", expenses: 289, income: 480 },
  { date: "2024-04-21", expenses: 337, income: 520 },
  { date: "2024-04-22", expenses: 224, income: 490 },
  { date: "2024-04-23", expenses: 338, income: 510 },
  { date: "2024-04-24", expenses: 387, income: 540 },
  { date: "2024-04-25", expenses: 215, income: 470 },
  { date: "2024-04-26", expenses: 275, income: 500 },
  { date: "2024-04-27", expenses: 383, income: 580 },
  { date: "2024-04-28", expenses: 322, income: 520 },
  { date: "2024-04-29", expenses: 315, income: 550 },
  { date: "2024-04-30", expenses: 354, income: 600 },
  { date: "2024-05-01", expenses: 265, income: 480 },
  { date: "2024-05-02", expenses: 293, income: 510 },
  { date: "2024-05-03", expenses: 247, income: 520 },
  { date: "2024-05-04", expenses: 385, income: 580 },
  { date: "2024-05-05", expenses: 281, income: 550 },
  { date: "2024-05-06", expenses: 298, income: 600 },
  { date: "2024-05-07", expenses: 288, income: 540 },
  { date: "2024-05-08", expenses: 349, income: 510 },
  { date: "2024-05-09", expenses: 227, income: 480 },
  { date: "2024-05-10", expenses: 293, income: 530 },
  { date: "2024-05-11", expenses: 335, income: 570 },
  { date: "2024-05-12", expenses: 197, income: 490 },
  { date: "2024-05-13", expenses: 247, income: 520 },
  { date: "2024-05-14", expenses: 248, income: 550 },
  { date: "2024-05-15", expenses: 273, income: 580 },
  { date: "2024-05-16", expenses: 338, income: 600 },
  { date: "2024-05-17", expenses: 299, income: 570 },
  { date: "2024-05-18", expenses: 315, income: 540 },
  { date: "2024-05-19", expenses: 235, income: 500 },
  { date: "2024-05-20", expenses: 177, income: 480 },
  { date: "2024-05-21", expenses: 282, income: 520 },
  { date: "2024-05-22", expenses: 281, income: 550 },
  { date: "2024-05-23", expenses: 252, income: 490 },
  { date: "2024-05-24", expenses: 294, income: 520 },
  { date: "2024-05-25", expenses: 201, income: 500 },
  { date: "2024-05-26", expenses: 213, income: 470 },
  { date: "2024-05-27", expenses: 320, income: 550 },
  { date: "2024-05-28", expenses: 233, income: 510 },
  { date: "2024-05-29", expenses: 278, income: 530 },
  { date: "2024-05-30", expenses: 340, income: 580 },
  { date: "2024-05-31", expenses: 178, income: 490 },
  { date: "2024-06-01", expenses: 278, income: 520 },
  { date: "2024-06-02", expenses: 370, income: 600 },
  { date: "2024-06-03", expenses: 303, income: 550 },
  { date: "2024-06-04", expenses: 339, income: 510 },
  { date: "2024-06-05", expenses: 288, income: 540 },
  { date: "2024-06-06", expenses: 294, income: 520 },
  { date: "2024-06-07", expenses: 323, income: 570 },
  { date: "2024-06-08", expenses: 385, income: 600 },
  { date: "2024-06-09", expenses: 338, income: 580 },
  { date: "2024-06-10", expenses: 355, income: 550 },
  { date: "2024-06-11", expenses: 292, income: 520 },
  { date: "2024-06-12", expenses: 381, income: 510 },
  { date: "2024-06-13", expenses: 281, income: 530 },
  { date: "2024-06-14", expenses: 326, income: 570 },
  { date: "2024-06-15", expenses: 307, income: 590 },
  { date: "2024-06-16", expenses: 371, income: 600 },
  { date: "2024-06-17", expenses: 275, income: 550 },
  { date: "2024-06-18", expenses: 307, income: 520 },
  { date: "2024-06-19", expenses: 341, income: 510 },
  { date: "2024-06-20", expenses: 308, income: 540 },
  { date: "2024-06-21", expenses: 369, income: 580 },
  { date: "2024-06-22", expenses: 317, income: 600 },
  { date: "2024-06-23", expenses: 380, income: 570 },
  { date: "2024-06-24", expenses: 332, income: 550 },
  { date: "2024-06-25", expenses: 241, income: 520 },
  { date: "2024-06-26", expenses: 334, income: 510 },
  { date: "2024-06-27", expenses: 348, income: 530 },
  { date: "2024-06-28", expenses: 249, income: 570 },
  { date: "2024-06-29", expenses: 303, income: 590 },
  { date: "2024-06-30", expenses: 346, income: 600 },
];

const chartConfig = {
  expenses: {
    label: "Expenses",
    color: "var(--primary)",
  },
  income: {
    label: "Income",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date("2024-06-30");
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Spending vs Income</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Financial overview for the last 3 months
          </span>
          <span className="@[540px]/card:hidden">Last 3 months</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-expenses)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-expenses)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-income)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-income)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="income"
              type="natural"
              fill="url(#fillIncome)"
              stroke="var(--color-income)"
              stackId="a"
            />
            <Area
              dataKey="expenses"
              type="natural"
              fill="url(#fillExpenses)"
              stroke="var(--color-expenses)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
