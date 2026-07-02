import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const BLUE = '#3b82f6' // validated chart palette

interface Props {
  trend: Record<string, number>
}

/** Single-series area chart: commits per month. One hue, no legend (title names the series). */
export default function ActivityChart({ trend }: Props) {
  const data = Object.entries(trend).map(([month, commits]) => ({ month, commits }))
  if (!data.length) return null

  return (
    <div className="rounded-xl border border-edge bg-panel p-4">
      <h3 className="mb-3 text-sm font-medium text-ink">Commit activity by month</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
            <defs>
              <linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={BLUE} stopOpacity={0.28} />
                <stop offset="100%" stopColor={BLUE} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1e2a44" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: '#8b9cb8', fontSize: 11, fontFamily: 'Fira Code' }}
              axisLine={{ stroke: '#1e2a44' }}
              tickLine={false}
              minTickGap={24}
            />
            <YAxis
              tick={{ fill: '#8b9cb8', fontSize: 11, fontFamily: 'Fira Code' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ stroke: BLUE, strokeOpacity: 0.4 }}
              contentStyle={{
                background: '#0e1626',
                border: '1px solid #1e2a44',
                borderRadius: 8,
                color: '#e2e8f0',
                fontSize: 12,
                fontFamily: 'Fira Code',
              }}
              labelStyle={{ color: '#8b9cb8' }}
            />
            <Area type="monotone" dataKey="commits" stroke={BLUE} strokeWidth={2} fill="url(#activityFill)" dot={false} activeDot={{ r: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
