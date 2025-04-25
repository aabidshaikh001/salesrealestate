"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const timeRanges = ["Last 5 Years", "Last 3 Years", "Last Year", "Last 6 Months"]

const data = [
  { date: "2018", rate1: 10000, rate2: 12000 },
  { date: "2019", rate1: 12000, rate2: 14000 },
  { date: "2020", rate1: 11000, rate2: 13500 },
  { date: "2021", rate1: 13000, rate2: 15000 },
  { date: "2022", rate1: 14000, rate2: 16000 },
]

export function PriceTrend() {
  const [timeRange, setTimeRange] = useState("Last 5 Years")

  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardHeader className="flex-col items-start justify-between pb-2 pt-4 px-4">
        <h2 className="text-lg font-bold mb-1">Price Trend Analysis</h2>
        <p className="text-xs text-gray-500 mb-2">The graph shows the quarterly average rates of properties</p>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {timeRanges.map((range) => (
              <SelectItem key={range} value={range}>
                {range}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pb-4">
        <div className="h-[250px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="rate1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="rate2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 10 }} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B7280", fontSize: 10 }}
                tickFormatter={(value) => `₹${value / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                formatter={(value: number) => [`₹${value / 1000}k`, "Rate"]}
              />
              <Area type="monotone" dataKey="rate1" stroke="#3B82F6" fill="url(#rate1)" strokeWidth={2} />
              <Area type="monotone" dataKey="rate2" stroke="#EF4444" fill="url(#rate2)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

