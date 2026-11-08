import { getReports, getStreets, getStreetAvg, getUsers } from '@/lib/store';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';

const COLORS = ['hsl(142, 76%, 36%)', 'hsl(142, 60%, 50%)', 'hsl(38, 92%, 50%)', 'hsl(200, 80%, 50%)', 'hsl(0, 70%, 55%)', 'hsl(270, 60%, 55%)'];

export function ReportsOverTimeChart() {
  const reports = getReports();

  // Group by week
  const weekMap: Record<string, { total: number; resolved: number }> = {};
  reports.forEach(r => {
    const date = new Date(r.createdAt);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const key = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!weekMap[key]) weekMap[key] = { total: 0, resolved: 0 };
    weekMap[key].total++;
    if (r.status === 'resolved') weekMap[key].resolved++;
  });

  const data = Object.entries(weekMap).map(([week, v]) => ({ week, ...v }));

  return (
    <div className="glass-card rounded-2xl p-5">
      <h3 className="font-heading font-semibold text-foreground mb-4">Reports Over Time</h3>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="week" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
          <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
          <Legend />
          <Line type="monotone" dataKey="total" stroke="hsl(38, 92%, 50%)" strokeWidth={2} name="Total" dot={{ r: 4 }} />
          <Line type="monotone" dataKey="resolved" stroke="hsl(142, 76%, 36%)" strokeWidth={2} name="Resolved" dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ResolutionRateChart() {
  const reports = getReports();
  const resolved = reports.filter(r => r.status === 'resolved').length;
  const pending = reports.filter(r => r.status === 'pending').length;
  const data = [
    { name: 'Resolved', value: resolved },
    { name: 'Pending', value: pending },
  ];

  return (
    <div className="glass-card rounded-2xl p-5">
      <h3 className="font-heading font-semibold text-foreground mb-4">Resolution Rate</h3>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
            {data.map((_, i) => (
              <Cell key={i} fill={i === 0 ? 'hsl(142, 76%, 36%)' : 'hsl(38, 92%, 50%)'} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StreetScoresChart() {
  const streets = getStreets();
  const data = streets.map(s => ({ name: s.name, score: getStreetAvg(s), category: s.category }));

  return (
    <div className="glass-card rounded-2xl p-5">
      <h3 className="font-heading font-semibold text-foreground mb-4">Street Scores</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} angle={-20} textAnchor="end" height={60} />
          <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
          <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
          <Bar dataKey="score" radius={[6, 6, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryDistributionChart() {
  const users = getUsers().filter(u => u.role === 'citizen');
  const catMap: Record<string, number> = {};
  users.forEach(u => { catMap[u.category] = (catMap[u.category] || 0) + 1; });
  const data = Object.entries(catMap).map(([name, value]) => ({ name, value }));

  return (
    <div className="glass-card rounded-2xl p-5">
      <h3 className="font-heading font-semibold text-foreground mb-4">Citizens by Category</h3>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" outerRadius={85} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
