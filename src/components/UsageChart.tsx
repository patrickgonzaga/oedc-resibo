'use client';

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface UsageChartProps {
  data: any[];
}

export default function UsageChart({ data }: UsageChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500 italic">
        No usage data available to display
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
        <XAxis 
          dataKey="month" 
          stroke="#475569" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
          dy={10}
        />
        <YAxis 
          stroke="#475569" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
          tickFormatter={(value) => `₱${value}`}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#0f172a', 
            border: '1px solid #1e293b', 
            borderRadius: '16px',
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#fff'
          }}
          itemStyle={{ color: '#3b82f6' }}
        />
        <Area 
          type="monotone" 
          dataKey="amount" 
          stroke="#3b82f6" 
          strokeWidth={4}
          fillOpacity={1} 
          fill="url(#colorAmount)" 
          animationDuration={1500}
        />
        <Line 
          type="monotone" 
          dataKey="consumption" 
          stroke="#64748b" 
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
