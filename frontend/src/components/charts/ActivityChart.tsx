import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const PURPLE = '#8b5cf6' // validated chart palette

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
                <stop offset="0%" stopColor={PURPLE} stopOpacity={0.28} />
                <stop offset="100%" stopColor={PURPLE} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#26263a" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: '#9a9ab0', fontSize: 11, fontFamily: 'Fira Code' }}
              axisLine={{ stroke: '#26263a' }}
              tickLine={false}
              minTickGap={24}
            />
            <YAxis
              tick={{ fill: '#9a9ab0', fontSize: 11, fontFamily: 'Fira Code' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ stroke: PURPLE, strokeOpacity: 0.4 }}
              contentStyle={{
                background: '#101018',
                border: '1px solid #26263a',
                borderRadius: 8,
                color: '#ececf1',
                fontSize: 12,
                fontFamily: 'Fira Code',
              }}
              labelStyle={{ color: '#9a9ab0' }}
            />
            <Area type="monotone" dataKey="commits" stroke={PURPLE} strokeWidth={2} fill="url(#activityFill)" dot={false} activeDot={{ r: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
