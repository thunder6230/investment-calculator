import React from 'react';
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
import { useInvestmentPlanner } from '../../context/InvestmentPlannerContext';
import { YearDataPoint, formatCurrency } from './projectionEngine';

function CustomTooltip({ active, payload, label }: Partial<TooltipContentProps<number, string>>) {
  if (!active || !payload?.length) return null;
  const rawData = payload[0].payload as YearDataPoint;
  
  return (
    <div className="tooltip-box">
      <p className="tooltip-title">Year {label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color, margin: '0.2rem 0', fontSize: '0.78rem' }}>
          {entry.name}: {formatCurrency(entry.value as number)}
        </p>
      ))}
      {rawData && rawData.year > 0 && (
        <div style={{ marginTop: '0.5rem', paddingTop: '0.4rem', borderTop: '1px solid var(--border)', fontSize: '0.74rem', color: 'var(--muted)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.2rem' }}>
            <span>Invest: <strong>{formatCurrency(rawData.monthlyContribActive)}/mo</strong></span>
            <span>Fixed Costs: <strong>{formatCurrency(rawData.fixedCostsActive)}/mo</strong></span>
          </div>
          {rawData.milestonesTriggered && rawData.milestonesTriggered.length > 0 && (
            <div style={{ marginTop: '0.25rem', color: 'var(--emerald)', fontWeight: '600' }}>
              🎉 Triggered: {rawData.milestonesTriggered.map((m) => m.name).join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProjectionChart() {
  const { projection, minRate, maxRate } = useInvestmentPlanner();

  return (
    <div className="card chart-card">
      <h2 className="section-title">Portfolio Growth Over Time</h2>
      <p className="chart-legend-hint">
        <span className="dot blue-dot" /> Paid In &nbsp;
        <span className="dot green-dot" /> {minRate}%–{maxRate}% Growth Band &nbsp;
        <span className="dot yellow-dot" /> Midpoint
      </p>
      
      <ResponsiveContainer width="100%" height={380}>
        <AreaChart data={projection.dataPoints} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
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

          {/* Growth band: low boundary */}
          <Area
            type="monotone"
            dataKey="low"
            name={`Growth ${minRate}%`}
            stroke="#22c55e"
            strokeWidth={1.5}
            strokeDasharray="4 2"
            fill="url(#colorLow)"
          />

          {/* Growth band: high boundary */}
          <Area
            type="monotone"
            dataKey="high"
            name={`Growth ${maxRate}%`}
            stroke="#16a34a"
            strokeWidth={2}
            fill="url(#colorBand)"
          />

          {/* Midpoint line */}
          <Area
            type="monotone"
            dataKey="midpoint"
            name="Midpoint Portfolio"
            stroke="#facc15"
            strokeWidth={2}
            strokeDasharray="6 3"
            fill="none"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
