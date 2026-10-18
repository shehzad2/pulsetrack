import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3 } from "lucide-react";

export interface EventActivityPoint {
  date: string;
  events: number;
  label: string;
}

interface EventActivityChartProps {
  data: EventActivityPoint[];
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(value ?? 0);
}

export default function EventActivityChart({
  data,
}: EventActivityChartProps) {
  return (
    <article className="panel trend-panel">
      <div className="panel-heading">
        <div>
          <h3>Event activity</h3>
          <p>Total recorded events by day</p>
        </div>
        <span className="panel-icon">
          <BarChart3 size={18} />
        </span>
      </div>

      <div className="chart-wrap">
        {data.length === 0 ? (
          <div className="chart-empty">
            <BarChart3 size={28} />
            <strong>No event data for this period</strong>
            <span>
              Events will appear here when your website sends analytics.
            </span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 12, right: 8, left: -16, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="eventFill"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#5368e8" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#5368e8" stopOpacity={0.01} />
                </linearGradient>
              </defs>

              <CartesianGrid
                stroke="#edf0f5"
                strokeDasharray="4 5"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#858da0", fontSize: 12 }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#858da0", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e8ebf2",
                  boxShadow: "0 8px 24px #18264a12",
                }}
                labelFormatter={(label) => `Date: ${label}`}
                formatter={(value) => [formatNumber(Number(value)), "Events"]}
              />
              <Area
                type="monotone"
                dataKey="events"
                stroke="#5368e8"
                strokeWidth={2.5}
                fill="url(#eventFill)"
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="panel-footer">
        <span>
          <span className="legend-dot" /> Recorded events
        </span>
        <span>{data.length} data points</span>
      </div>
    </article>
  );
}
