import { useLocale } from '../../i18n'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const TEAL = '#0d9488' // validated chart palette

interface Props {
  breakdown: Record<string, number>
}

/** Single-measure bar chart: commit intent categories. Identity comes from the
 *  x-axis labels, so a single hue is correct (color is not the identifier). */
export default function IntentChart({ breakdown }: Props) {
  const { t } = useLocale()
  const data = Object.entries(breakdown).map(([intent, count]) => ({ intent, count }))
  if (!data.length) return null

  return (
    <div className="rounded-xl border border-edge bg-panel p-4">
      <h3 className="mb-3 text-sm font-medium text-ink">{t.result.intentTitle}</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -16 }} barCategoryGap="28%">
            <CartesianGrid stroke="#26263a" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="intent"
              tick={{ fill: '#9a9ab0', fontSize: 11, fontFamily: 'Fira Code' }}
              axisLine={{ stroke: '#26263a' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#9a9ab0', fontSize: 11, fontFamily: 'Fira Code' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: '#191926', fillOpacity: 0.5 }}
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
            <Bar dataKey="count" fill={TEAL} radius={[4, 4, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
