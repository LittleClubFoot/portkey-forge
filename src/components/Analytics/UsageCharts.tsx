import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import type { DailyUsage } from "../../types/config";

interface UsageChartsProps {
  dailyUsage: DailyUsage[];
}

export default function UsageCharts({ dailyUsage }: UsageChartsProps) {
  if (dailyUsage.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm text-center">
        <p className="text-sm text-gray-500">No daily usage data available.</p>
      </div>
    );
  }

  // Format dates for display (show short form)
  const chartData = dailyUsage.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <div className="space-y-6">
      {/* Daily Minutes Bar Chart */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          Daily Watch Time (minutes)
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: "#6b7280" }}
                tickLine={false}
                axisLine={{ stroke: "#d1d5db" }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#6b7280" }}
                tickLine={false}
                axisLine={{ stroke: "#d1d5db" }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "13px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
                labelStyle={{ color: "#111827", fontWeight: 600 }}
                formatter={(value: number) => [`${value} min`, "Watch Time"]}
              />
              <Bar
                dataKey="minutes"
                fill="#6366f1"
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Sessions Line Chart */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          Daily Sessions
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: "#6b7280" }}
                tickLine={false}
                axisLine={{ stroke: "#d1d5db" }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#6b7280" }}
                tickLine={false}
                axisLine={{ stroke: "#d1d5db" }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "13px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
                labelStyle={{ color: "#111827", fontWeight: 600 }}
                formatter={(value: number) => [value, "Sessions"]}
              />
              <Line
                type="monotone"
                dataKey="sessions"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: "#10b981", r: 4 }}
                activeDot={{ r: 6, fill: "#059669" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
