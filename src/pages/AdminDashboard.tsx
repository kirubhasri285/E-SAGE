import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getStreets, getStreetsByCategory, getStreetAvg, getReports, resolveReport,
  getWinners, declareWinner, AreaCategory, getUsers, Report
} from '@/lib/store';
import {
  Award, BarChart3, CheckCircle, Eye, FileText, LogOut, MapPin,
  Recycle, Shield, Trophy, Users, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { ReportsOverTimeChart, ResolutionRateChart, StreetScoresChart, CategoryDistributionChart } from '@/components/AdminCharts';

type Tab = 'overview' | 'reports' | 'leaderboard' | 'winners';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>('overview');

  if (!user) return null;

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'winners', label: 'Winners', icon: Award },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="eco-gradient px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary-foreground" />
            <h1 className="font-heading text-lg font-bold text-primary-foreground">E-SAGE Admin</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-primary-foreground/80 capitalize">{user.username}</span>
            <Button variant="ghost" size="icon" onClick={logout} className="text-primary-foreground hover:bg-primary-foreground/20">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <nav className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex overflow-x-auto">
          {tabs.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  tab === t.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />{t.label}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-4 space-y-6">
        {tab === 'overview' && <OverviewTab />}
        {tab === 'reports' && <ReportsTab toast={toast} />}
        {tab === 'leaderboard' && <LeaderboardTab />}
        {tab === 'winners' && <WinnersTab toast={toast} />}
      </main>
    </div>
  );
}

function OverviewTab() {
  const users = getUsers();
  const reports = getReports();
  const streets = getStreets();

  const stats = [
    { icon: Users, label: 'Citizens', value: users.filter(u => u.role === 'citizen').length, color: 'text-primary' },
    { icon: MapPin, label: 'Streets', value: streets.length, color: 'text-info' },
    { icon: FileText, label: 'Reports', value: reports.length, color: 'text-warning' },
    { icon: CheckCircle, label: 'Resolved', value: reports.filter(r => r.status === 'resolved').length, color: 'text-success' },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.label} className="glass-card rounded-xl p-4 stat-card-hover">
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <p className="text-2xl font-heading font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ReportsOverTimeChart />
        <ResolutionRateChart />
        <StreetScoresChart />
        <CategoryDistributionChart />
      </div>

      <div className="glass-card rounded-2xl p-5">
        <h3 className="font-heading font-semibold text-foreground mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {reports.slice(-5).reverse().map(r => (
            <div key={r.id} className="flex items-start gap-3 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-foreground"><span className="font-medium capitalize">{r.citizenName}</span> reported on {r.street}</p>
                <p className="text-muted-foreground text-xs">{r.description.slice(0, 60)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReportsTab({ toast }: { toast: ReturnType<typeof useToast>['toast'] }) {
  const [reports, setReports] = useState(getReports());

  const handleResolve = (id: string) => {
    resolveReport(id);
    setReports(getReports());
    toast({ title: 'Report resolved ✅' });
  };

  return (
    <div className="space-y-3 animate-fade-in-up">
      <h2 className="font-heading text-lg font-bold text-foreground">All Reports</h2>
      {reports.map(r => (
        <div key={r.id} className="glass-card rounded-xl p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">{r.street}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{r.description}</p>
              <p className="text-xs text-muted-foreground mt-1">
                By <span className="capitalize">{r.citizenName}</span> · {new Date(r.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                r.status === 'resolved' ? 'bg-primary/15 text-primary' : 'bg-warning/15 text-accent-foreground'
              }`}>{r.status}</span>
              {r.status === 'pending' && (
                <Button size="sm" variant="outline" onClick={() => handleResolve(r.id)} className="text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" /> Resolve
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function LeaderboardTab() {
  const [cat, setCat] = useState<AreaCategory>('urban');
  const streets = getStreetsByCategory(cat).sort((a, b) => getStreetAvg(b) - getStreetAvg(a));

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex gap-2">
        {(['urban', 'rural', 'high-density'] as AreaCategory[]).map(c => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
              cat === c ? 'eco-gradient text-primary-foreground' : 'bg-secondary text-secondary-foreground'
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="glass-card rounded-2xl p-5">
        <div className="space-y-3">
          {streets.map((s, i) => (
            <div key={s.name} className="flex items-center gap-3">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                i === 0 ? 'eco-gradient text-primary-foreground' : 'bg-secondary text-secondary-foreground'
              }`}>{i + 1}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{s.name}</p>
                <Progress value={getStreetAvg(s) * 5} className="h-2 mt-1" />
              </div>
              <span className="text-sm font-semibold text-foreground">{getStreetAvg(s)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WinnersTab({ toast }: { toast: ReturnType<typeof useToast>['toast'] }) {
  const [winners, setWinners] = useState(getWinners());
  const [month, setMonth] = useState('');
  const [cat, setCat] = useState<AreaCategory>('urban');

  const handleDeclare = () => {
    if (!month) { toast({ title: 'Enter month', variant: 'destructive' }); return; }
    const streets = getStreetsByCategory(cat).sort((a, b) => getStreetAvg(b) - getStreetAvg(a));
    if (streets.length === 0) { toast({ title: 'No streets in category', variant: 'destructive' }); return; }
    const top = streets[0];
    declareWinner(month, top.name, cat, getStreetAvg(top));
    setWinners(getWinners());
    toast({ title: `🏆 ${top.name} declared winner for ${month}!` });
    setMonth('');
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
          <Trophy className="w-5 h-5 text-warning" /> Declare Monthly Winner
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input placeholder="Month (e.g. March 2026)" value={month} onChange={e => setMonth(e.target.value)} />
          <Select value={cat} onValueChange={v => setCat(v as AreaCategory)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {(['urban', 'rural', 'high-density'] as AreaCategory[]).map(c => (
                <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleDeclare} className="eco-gradient border-0 text-primary-foreground">
            <Award className="w-4 h-4 mr-2" /> Declare
          </Button>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-5">
        <h3 className="font-heading font-semibold text-foreground mb-4">Winner History</h3>
        {winners.length === 0 && <p className="text-sm text-muted-foreground">No winners declared yet.</p>}
        <div className="space-y-3">
          {winners.map((w, i) => (
            <div key={i} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
              <div>
                <p className="text-sm font-medium text-foreground">{w.street}</p>
                <p className="text-xs text-muted-foreground capitalize">{w.category} · Score: {w.score}</p>
              </div>
              <span className="text-sm text-muted-foreground">{w.month}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
