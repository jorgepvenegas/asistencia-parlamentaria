import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { ChartData } from './StackedChart.astro';

interface Props {
  data: ChartData[];
  title?: string;
}

const colors = {
  attended: '#22c55e',
  validAbsent: '#f59e0b',
  invalidAbsent: '#ef4444',
};

export default function StackedChart({ data, title = 'Attendance Distribution' }: Props) {
  console.log('StackedChart data:', data);

  // Aggregate by politician name
  const aggregated = data.reduce<Record<string, { attended: number; validAbsent: number; invalidAbsent: number }>>((acc, item) => {
    const name = String(item.politicianName);
    if (!acc[name]) {
      acc[name] = { attended: 0, validAbsent: 0, invalidAbsent: 0 };
    }
    acc[name].attended += item.attendanceCount;
    acc[name].validAbsent += item.unattendedValidCount;
    acc[name].invalidAbsent += item.unattendedInvalidCount;
    return acc;
  }, {});

  const chartData = Object.entries(aggregated)
    .map(([name, counts]) => ({
      name,
      ...counts,
    }))
    .sort((a, b) => b.attended - a.attended);

  const totalAttended = chartData.reduce((sum, item) => sum + item.attended, 0);
  const totalValidAbsent = chartData.reduce((sum, item) => sum + item.validAbsent, 0);
  const totalInvalidAbsent = chartData.reduce((sum, item) => sum + item.invalidAbsent, 0);

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {title && <h2 className="text-lg font-semibold mb-4 text-gray-900">{title}</h2>}

      <div className="w-full" style={{ height: Math.max(400, chartData.length * 35) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 180, bottom: 20 }}
            role="img"
            aria-label={`${title} - Horizontal stacked bar chart`}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 12 }} domain={[0, 'dataMax']} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11 }}
              width={170}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
              }}
              formatter={(value: number, name: string) => {
                const labels: Record<string, string> = {
                  attended: 'Presente',
                  validAbsent: 'Ausente justificado',
                  invalidAbsent: 'Ausente sin justificación',
                };
                return [`${value} sesiones`, labels[name] || name];
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="square"
              formatter={(value: string) => {
                const labels: Record<string, string> = {
                  attended: 'Presente',
                  validAbsent: 'Ausente justificado',
                  invalidAbsent: 'Ausente sin justificación',
                };
                return labels[value] || value;
              }}
            />
            <Bar
              dataKey="attended"
              stackId="a"
              fill={colors.attended}
              name="attended"
              isAnimationActive={false}
            />
            <Bar
              dataKey="validAbsent"
              stackId="a"
              fill={colors.validAbsent}
              name="validAbsent"
              isAnimationActive={false}
            />
            <Bar
              dataKey="invalidAbsent"
              stackId="a"
              fill={colors.invalidAbsent}
              name="invalidAbsent"
              radius={[0, 4, 4, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-xs text-gray-600 mb-1">Presente</p>
          <p className="text-lg font-bold text-green-600">{totalAttended}</p>
        </div>
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
          <p className="text-xs text-gray-600 mb-1">Ausente justificado</p>
          <p className="text-lg font-bold text-amber-600">{totalValidAbsent}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-xs text-gray-600 mb-1">Ausente sin justificación</p>
          <p className="text-lg font-bold text-red-600">{totalInvalidAbsent}</p>
        </div>
      </div>
    </div>
  );
}
