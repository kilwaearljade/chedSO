"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

export const description = "An interactive area chart"

interface ChartDataPoint {
  date: string;
  messages: number;
  appointments: number;
}

interface ChartAreaInteractiveProps {
  chartData?: ChartDataPoint[];
}

const defaultChartData = [
  { date: "2024-04-01", messages: 222, appointments: 150 },
  { date: "2024-04-02", messages: 97, appointments: 180 },
  { date: "2024-04-03", messages: 167, appointments: 120 },
  { date: "2024-04-04", messages: 242, appointments: 260 },
  { date: "2024-04-05", messages: 373, appointments: 290 },
  { date: "2024-04-06", messages: 301, appointments: 340 },
  { date: "2024-04-07", messages: 245, appointments: 180 },
  { date: "2024-04-08", messages: 409, appointments: 320 },
  { date: "2024-04-09", messages: 59, appointments: 110 },
  { date: "2024-04-10", messages: 261, appointments: 190 },
  { date: "2024-04-11", messages: 327, appointments: 350 },
  { date: "2024-04-12", messages: 292, appointments: 210 },
  { date: "2024-04-13", messages: 342, appointments: 380 },
  { date: "2024-04-14", messages: 137, appointments: 220 },
  { date: "2024-04-15", messages: 120, appointments: 170 },
  { date: "2024-04-16", messages: 138, appointments: 190 },
  { date: "2024-04-17", messages: 446, appointments: 360 },
  { date: "2024-04-18", messages: 364, appointments: 410 },
  { date: "2024-04-19", messages: 243, appointments: 180 },
  { date: "2024-04-20", messages: 89, appointments: 150 },
  { date: "2024-04-21", messages: 137, appointments: 200 },
  { date: "2024-04-22", messages: 224, appointments: 170 },
  { date: "2024-04-23", messages: 138, appointments: 230 },
  { date: "2024-04-24", messages: 387, appointments: 290 },
  { date: "2024-04-25", messages: 215, appointments: 250 },
  { date: "2024-04-26", messages: 75, appointments: 130 },
  { date: "2024-04-27", messages: 383, appointments: 420 },
  { date: "2024-04-28", messages: 122, appointments: 180 },
  { date: "2024-04-29", messages: 315, appointments: 240 },
  { date: "2024-04-30", messages: 454, appointments: 380 },
  { date: "2024-05-01", messages: 165, appointments: 220 },
  { date: "2024-05-02", messages: 293, appointments: 310 },
  { date: "2024-05-03", messages: 247, appointments: 190 },
  { date: "2024-05-04", messages: 385, appointments: 420 },
  { date: "2024-05-05", messages: 481, appointments: 390 },
  { date: "2024-05-06", messages: 498, appointments: 520 },
  { date: "2024-05-07", messages: 388, appointments: 300 },
  { date: "2024-05-08", messages: 149, appointments: 210 },
  { date: "2024-05-09", messages: 227, appointments: 180 },
  { date: "2024-05-10", messages: 293, appointments: 330 },
  { date: "2024-05-11", messages: 335, appointments: 270 },
  { date: "2024-05-12", messages: 197, appointments: 240 },
  { date: "2024-05-13", messages: 197, appointments: 160 },
  { date: "2024-05-14", messages: 448, appointments: 490 },
  { date: "2024-05-15", messages: 473, appointments: 380 },
  { date: "2024-05-16", messages: 338, appointments: 400 },
  { date: "2024-05-17", messages: 499, appointments: 420 },
  { date: "2024-05-18", messages: 315, appointments: 350 },
  { date: "2024-05-19", messages: 235, appointments: 180 },
  { date: "2024-05-20", messages: 177, appointments: 230 },
  { date: "2024-05-21", messages: 82, appointments: 140 },
  { date: "2024-05-22", messages: 81, appointments: 120 },
  { date: "2024-05-23", messages: 252, appointments: 290 },
  { date: "2024-05-24", messages: 294, appointments: 220 },
  { date: "2024-05-25", messages: 201, appointments: 250 },
  { date: "2024-05-26", messages: 213, appointments: 170 },
  { date: "2024-05-27", messages: 420, appointments: 460 },
  { date: "2024-05-28", messages: 233, appointments: 190 },
  { date: "2024-05-29", messages: 78, appointments: 130 },
  { date: "2024-05-30", messages: 340, appointments: 280 },
  { date: "2024-05-31", messages: 178, appointments: 230 },
  { date: "2024-06-01", messages: 178, appointments: 200 },
  { date: "2024-06-02", messages: 470, appointments: 410 },
  { date: "2024-06-03", messages: 103, appointments: 160 },
  { date: "2024-06-04", messages: 439, appointments: 380 },
  { date: "2024-06-05", messages: 88, appointments: 140 },
  { date: "2024-06-06", messages: 294, appointments: 250 },
  { date: "2024-06-07", messages: 323, appointments: 370 },
  { date: "2024-06-08", messages: 385, appointments: 320 },
  { date: "2024-06-09", messages: 438, appointments: 480 },
  { date: "2024-06-10", messages: 155, appointments: 200 },
  { date: "2024-06-11", messages: 92, appointments: 150 },
  { date: "2024-06-12", messages: 492, appointments: 420 },
  { date: "2024-06-13", messages: 81, appointments: 130 },
  { date: "2024-06-14", messages: 426, appointments: 380 },
  { date: "2024-06-15", messages: 307, appointments: 350 },
  { date: "2024-06-16", messages: 371, appointments: 310 },
  { date: "2024-06-17", messages: 475, appointments: 520 },
  { date: "2024-06-18", messages: 107, appointments: 170 },
  { date: "2024-06-19", messages: 341, appointments: 290 },
  { date: "2024-06-20", messages: 408, appointments: 450 },
  { date: "2024-06-21", messages: 169, appointments: 210 },
  { date: "2024-06-22", messages: 317, appointments: 270 },
  { date: "2024-06-23", messages: 480, appointments: 530 },
  { date: "2024-06-24", messages: 132, appointments: 180 },
  { date: "2024-06-25", messages: 141, appointments: 190 },
  { date: "2024-06-26", messages: 434, appointments: 380 },
  { date: "2024-06-27", messages: 448, appointments: 490 },
  { date: "2024-06-28", messages: 149, appointments: 200 },
  { date: "2024-06-29", messages: 103, appointments: 160 },
  { date: "2024-06-30", messages: 446, appointments: 400 },
] as ChartDataPoint[]

const chartConfig = {
  messages: {
    label: "Messages",
    color: "var(--primary)",
  },
  appointments: {
    label: "Appointments",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function ChartAreaInteractive({ chartData: propChartData }: ChartAreaInteractiveProps = {}) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")
  
  // Use prop data if provided, otherwise use default
  const chartData = propChartData || defaultChartData

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  // Filter data based on time range
  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const now = new Date()
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    } else if (timeRange === "365d") {
      daysToSubtract = 365
    }
    const startDate = new Date(now)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Activity Overview</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Messages and Appointments activity
          </span>
          <span className="@[540px]/card:hidden">Activity</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="365d">Last year</ToggleGroupItem>
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
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="365d" className="rounded-lg">
                Last year
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
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-messages)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-messages)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-appointments)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-appointments)"
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
                const date = new Date(value)
                if (isNaN(date.getTime())) {
                  // If date parsing fails, try to format the string directly
                  return value
                }
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    const date = new Date(value)
                    if (isNaN(date.getTime())) {
                      return value
                    }
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="appointments"
              type="natural"
              fill="url(#fillMobile)"
              stroke="var(--color-appointments)"
              stackId="a"
            />
            <Area
              dataKey="messages"
              type="natural"
              fill="url(#fillDesktop)"
              stroke="var(--color-messages)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
