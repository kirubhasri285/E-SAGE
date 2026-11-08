import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getStreets, getAllStreetNames, addMarksToStreet, updateUserPoints,
  getUsers, getStreetAvg
} from '@/lib/store';
import { CheckCircle, LogOut, MapPin, Recycle, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

export default function WorkerDashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [street, setStreet] = useState('');
  const [marks, setMarks] = useState('');
  const [citizen, setCitizen] = useState('');

  if (!user) return null;

  const citizensOnStreet = getUsers().filter(u => u.role === 'citizen' && u.street === street);
  const streets = getStreets().sort((a, b) => getStreetAvg(b) - getStreetAvg(a));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const m = parseInt(marks);
    if (!street) { toast({ title: 'Select a street', variant: 'destructive' }); return; }
    if (isNaN(m) || m < 1 || m > 20) {
      toast({ title: 'Marks must be 1–20', variant: 'destructive' });
      return;
    }

    addMarksToStreet(street, m);

    // Award points to citizen if selected
    if (citizen) {
      updateUserPoints(citizen, m);
      toast({ title: `✅ ${m} marks submitted`, description: 'Street & citizen scores updated.' });
    } else {
      toast({ title: `✅ ${m} marks submitted to ${street}` });
    }

    setMarks('');
    setCitizen('');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="eco-gradient px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Recycle className="w-6 h-6 text-primary-foreground" />
            <h1 className="font-heading text-lg font-bold text-primary-foreground">E-SAGE Worker</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-primary-foreground/80 capitalize">{user.username}</span>
            <Button variant="ghost" size="icon" onClick={logout} className="text-primary-foreground hover:bg-primary-foreground/20">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 space-y-6">
        {/* Grade Form */}
        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-5 space-y-4 animate-fade-in-up">
          <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" /> Grade Segregation
          </h2>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Select Street</label>
            <Select value={street} onValueChange={v => { setStreet(v); setCitizen(''); }}>
              <SelectTrigger><SelectValue placeholder="Choose street" /></SelectTrigger>
              <SelectContent>
                {getAllStreetNames().map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {street && citizensOnStreet.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Citizen (optional)</label>
              <Select value={citizen} onValueChange={setCitizen}>
                <SelectTrigger><SelectValue placeholder="Select citizen" /></SelectTrigger>
                <SelectContent>
                  {citizensOnStreet.map(c => (
                    <SelectItem key={c.id} value={c.id} className="capitalize">{c.username}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Marks (1–20)</label>
            <Input
              type="number"
              min={1}
              max={20}
              value={marks}
              onChange={e => setMarks(e.target.value)}
              placeholder="Enter marks"
              className="h-11"
            />
            <p className="text-xs text-muted-foreground">Rate the waste segregation quality</p>
          </div>

          <Button type="submit" className="w-full eco-gradient border-0 text-primary-foreground">
            <CheckCircle className="w-4 h-4 mr-2" /> Submit Marks
          </Button>
        </form>

        {/* Street Scores */}
        <div className="glass-card rounded-2xl p-5 animate-fade-in-up">
          <h3 className="font-heading font-semibold text-foreground mb-4">Street Scores</h3>
          <div className="space-y-3">
            {streets.map(s => (
              <div key={s.name} className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{s.name}</p>
                  <Progress value={getStreetAvg(s) * 5} className="h-2 mt-1" />
                </div>
                <span className="text-sm font-semibold text-foreground">{getStreetAvg(s)}</span>
                <span className="text-xs text-muted-foreground capitalize">({s.category})</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
