'use client'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface ProgressChartProps {
  codeEntityCount: number;
  messagesSent: number;
}

const ProgressChart = ({ codeEntityCount, messagesSent }: ProgressChartProps) => {
  // Dynamic or historical mock data scaled against your actual indexed entity count
  const data = [
    { day: 'Mon', queries: Math.round(messagesSent * 0.1), entities: Math.round(codeEntityCount * 0.2) },
    { day: 'Tue', queries: Math.round(messagesSent * 0.15), entities: Math.round(codeEntityCount * 0.35) },
    { day: 'Wed', queries: Math.round(messagesSent * 0.2), entities: Math.round(codeEntityCount * 0.5) },
    { day: 'Thu', queries: Math.round(messagesSent * 0.12), entities: Math.round(codeEntityCount * 0.65) },
    { day: 'Fri', queries: Math.round(messagesSent * 0.25), entities: Math.round(codeEntityCount * 0.8) },
    { day: 'Sat', queries: Math.round(messagesSent * 0.08), entities: Math.round(codeEntityCount * 0.9) },
    { day: 'Sun', queries: Math.round(messagesSent * 0.1), entities: codeEntityCount },
  ]

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorEntities" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis dataKey="day" stroke="#71717a" fontSize={12} tickLine={false} />
          <YAxis stroke="#71717a" fontSize={12} tickLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5' }}
          />
          <Area type="monotone" dataKey="entities" name="Indexed Entities" stroke="#10b981" fillOpacity={1} fill="url(#colorEntities)" strokeWidth={2} />
          <Area type="monotone" dataKey="queries" name="Queries Processed" stroke="#6366f1" fillOpacity={1} fill="url(#colorQueries)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default ProgressChart