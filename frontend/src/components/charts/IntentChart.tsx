import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const AMBER = '#d97706' // validated chart palette

interface Props {
  breakdown: Record<string, number>
}

/** Single-measure bar chart: commit intent categories. Identity comes from the
 *  x-axis labels, so a single hue is correct (color is not the identifier). */
export default function IntentChart({ breakdown }: Props) {
  const data = Object.entries(breakdown).map(([intent, count]) => ({ intent, count }))
  if (!data.length) return null

  return (
    <div className="rounded-xl border border-edge bg-panel p-4">
      <h3 className="mb-3 text-sm font-medium text-ink">Commit intent breakdown</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -16 }} barCategoryGap="28%">
            <CartesianGrid stroke="#1e2a44" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="intent"
              tick={{ fill: '#8b9cb8', fontSize: 11, fontFamily: 'Fira Code' }}
              axisLine={{ stroke: '#1e2a44' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#8b9cb8', fontSize: 11, fontFamily: 'Fira Code' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: '#16203a', fillOpacity: 0.5 }}
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
            <Bar dataKey="count" fill={AMBER} radius={[4, 4, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
