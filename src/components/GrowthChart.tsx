import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { TooltipContentProps } from 'recharts';
import type { YearDataPoint } from '../utils/investmentCalc';
import { formatCurrency } from '../utils/investmentCalc';

interface Props {
  data: YearDataPoint[];
}

function CustomTooltip({ active, payload, label }: Partial<TooltipContentProps<number, string>>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="tooltip-box">
      <p className="tooltip-title">Year {label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(entry.value as number)}
        </p>
      ))}
    </div>
  );
}

export default function GrowthChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={380}>
      <AreaChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorBand" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4ade80" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#4ade80" stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorPaidIn" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.5} />
            <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis
          dataKey="year"
          stroke="#94a3b8"
          label={{ value: 'Years', position: 'insideBottomRight', offset: -10, fill: '#94a3b8' }}
        />
        <YAxis
          stroke="#94a3b8"
          tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ color: '#cbd5e1' }} />

        {/* Paid-in capital (blue baseline) */}
        <Area
          type="monotone"
          dataKey="paidIn"
          name="Paid In"
          stroke="#60a5fa"
          strokeWidth={2}
          fill="url(#colorPaidIn)"
        />

        {/* Growth band: low boundary – rendered first so high covers it */}
        <Area
          type="monotone"
          dataKey="low"
          name="Growth 5%"
          stroke="#22c55e"
          strokeWidth={1.5}
          strokeDasharray="4 2"
          fill="url(#colorLow)"
        />

        {/* Growth band: high boundary – fills the gap between high and low */}
        <Area
          type="monotone"
          dataKey="high"
          name="Growth 8%"
          stroke="#16a34a"
          strokeWidth={2}
          fill="url(#colorBand)"
        />

        {/* Midpoint line */}
        <Area
          type="monotone"
          dataKey="midpoint"
          name="Midpoint (~6.5%)"
          stroke="#facc15"
          strokeWidth={2}
          strokeDasharray="6 3"
          fill="none"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
