import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getUsers, getStreets, getStreetsByCategory, getStreetAvg, getReports,
  addReport, getAllStreetNames, getWinners, AreaCategory, Report
} from '@/lib/store';
import {
  Award, BarChart3, Camera, FileText, LogOut, MapPin, Medal,
  Recycle, Star, Trophy, User, BookOpen, QrCode
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import NotificationPanel from '@/components/NotificationPanel';
import QRScanner from '@/components/QRScanner';

type Tab = 'dashboard' | 'report' | 'leaderboard' | 'scan' | 'learn' | 'history';

export default function CitizenDashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);
  if (!user) return null;

  const myReports = getReports().filter(r => r.citizenId === user.id);

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Home', icon: BarChart3 },
    { id: 'report', label: 'Report', icon: Camera },
    { id: 'scan', label: 'Scan', icon: QrCode },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'learn', label: 'Learn', icon: BookOpen },
    { id: 'history', label: 'History', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="eco-gradient px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Recycle className="w-6 h-6 text-primary-foreground" />
            <h1 className="font-heading text-lg font-bold text-primary-foreground">E-SAGE</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-primary-foreground/20 rounded-full px-3 py-1.5">
              <Star className="w-4 h-4 text-primary-foreground" />
              <span className="text-sm font-semibold text-primary-foreground">{user.points} pts</span>
            </div>
            <NotificationPanel userId={user.id} />
            <Button variant="ghost" size="icon" onClick={logout} className="text-primary-foreground hover:bg-primary-foreground/20">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs */}
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
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-4 space-y-6">
        {tab === 'dashboard' && <DashboardTab user={user} reports={myReports} />}
        {tab === 'report' && <ReportTab user={user} toast={toast} />}
        {tab === 'scan' && <QRScanner user={user} onPointsUpdate={() => setRefreshKey(k => k + 1)} />}
        {tab === 'leaderboard' && <LeaderboardTab />}
        {tab === 'learn' && <LearnTab />}
        {tab === 'history' && <HistoryTab reports={myReports} />}
      </main>
    </div>
  );
}

function DashboardTab({ user, reports }: { user: import('@/lib/store').User; reports: Report[] }) {
  const winners = getWinners();
  const latestWinner = winners.length > 0 ? winners[winners.length - 1] : null;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full eco-gradient flex items-center justify-center">
            <User className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-heading font-bold text-foreground capitalize">{user.username}</h2>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {user.street} · <span className="capitalize">{user.category}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard icon={Star} label="Points" value={user.points} color="text-warning" />
        <StatCard icon={FileText} label="Reports" value={reports.length} color="text-info" />
        <StatCard icon={Award} label="Resolved" value={reports.filter(r => r.status === 'resolved').length} color="text-success" />
      </div>

      <div className="glass-card rounded-2xl p-5">
        <h3 className="font-heading font-semibold text-foreground mb-2">Your Progress</h3>
        <Progress value={Math.min(user.points, 100)} className="h-3" />
        <p className="text-xs text-muted-foreground mt-1">{user.points}/100 points to next tier</p>
      </div>

      {latestWinner && (
        <div className="glass-card rounded-2xl p-5 border-warning/30">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-warning" />
            <h3 className="font-heading font-semibold text-foreground">Monthly Winner</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{latestWinner.street}</span> ({latestWinner.category}) — {latestWinner.month}
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number; color: string }) {
  return (
    <div className="glass-card rounded-xl p-4 stat-card-hover">
      <Icon className={`w-5 h-5 ${color} mb-2`} />
      <p className="text-2xl font-heading font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function ReportTab({ user, toast }: { user: import('@/lib/store').User; toast: ReturnType<typeof useToast>['toast'] }) {
  const [desc, setDesc] = useState('');
  const [street, setStreet] = useState(user.street);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc.trim()) {
      toast({ title: 'Description required', variant: 'destructive' });
      return;
    }
    addReport({ citizenId: user.id, citizenName: user.username, street, description: desc, photoUrl: '' });
    toast({ title: 'Report submitted! 📸', description: 'Admin will review it shortly.' });
    setDesc('');
  };

  return (
    <div className="animate-fade-in-up">
      <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-5 space-y-4">
        <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
          <Camera className="w-5 h-5 text-primary" /> Report Waste Issue
        </h2>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Street / Location</label>
          <Select value={street} onValueChange={setStreet}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {getAllStreetNames().map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Description</label>
          <Textarea placeholder="Describe the waste issue..." value={desc} onChange={e => setDesc(e.target.value)} rows={4} />
        </div>
        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center text-muted-foreground">
          <Camera className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Photo upload (simulated)</p>
        </div>
        <Button type="submit" className="w-full eco-gradient border-0 text-primary-foreground">Submit Report</Button>
      </form>
    </div>
  );
}

function LeaderboardTab() {
  const [cat, setCat] = useState<AreaCategory>('urban');
  const streets = getStreetsByCategory(cat).sort((a, b) => getStreetAvg(b) - getStreetAvg(a));
  const citizens = getUsers().filter(u => u.role === 'citizen' && u.category === cat).sort((a, b) => b.points - a.points);

  return (
    <div className="space-y-6 animate-fade-in-up">
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
        <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-warning" /> Street Rankings
        </h3>
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

      <div className="glass-card rounded-2xl p-5">
        <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
          <Medal className="w-5 h-5 text-warning" /> Top Citizens
        </h3>
        <div className="space-y-3">
          {citizens.map((c, i) => (
            <div key={c.id} className="flex items-center gap-3">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                i === 0 ? 'eco-gradient text-primary-foreground' : 'bg-secondary text-secondary-foreground'
              }`}>{i + 1}</span>
              <p className="flex-1 text-sm font-medium text-foreground capitalize">{c.username}</p>
              <span className="text-sm font-semibold text-foreground">{c.points} pts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LearnTab() {
  const items = [
    { title: 'Waste Segregation 101', desc: 'Learn to separate wet, dry, and hazardous waste properly.' },
    { title: 'Composting at Home', desc: 'Turn kitchen waste into nutrient-rich compost.' },
    { title: 'Reduce, Reuse, Recycle', desc: 'Simple steps to minimize your waste footprint.' },
    { title: 'E-Waste Disposal', desc: 'Safe methods for disposing electronic waste.' },
  ];
  return (
    <div className="space-y-3 animate-fade-in-up">
      <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-primary" /> Training Content
      </h2>
      {items.map((item, i) => (
        <div key={i} className="glass-card rounded-xl p-4 stat-card-hover">
          <h4 className="font-semibold text-foreground">{item.title}</h4>
          <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
          <div className="mt-3 h-24 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground text-sm">
            📺 Video placeholder
          </div>
        </div>
      ))}
    </div>
  );
}

function HistoryTab({ reports }: { reports: Report[] }) {
  return (
    <div className="space-y-3 animate-fade-in-up">
      <h2 className="font-heading text-lg font-bold text-foreground">My Reports</h2>
      {reports.length === 0 && <p className="text-muted-foreground text-sm">No reports yet.</p>}
      {reports.map(r => (
        <div key={r.id} className="glass-card rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium text-foreground">{r.street}</p>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              r.status === 'resolved' ? 'bg-primary/15 text-primary' : 'bg-warning/15 text-accent-foreground'
            }`}>{r.status}</span>
          </div>
          <p className="text-sm text-muted-foreground">{r.description}</p>
          <p className="text-xs text-muted-foreground mt-1">{new Date(r.createdAt).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
}
