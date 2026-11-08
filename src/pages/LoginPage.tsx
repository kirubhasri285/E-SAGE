import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { findUser, createUser, UserRole, AreaCategory, getAllStreetNames, getAllCategories } from '@/lib/store';
import { Leaf, Recycle, Shield, Truck, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const ROLE_INFO: Record<UserRole, { icon: React.ElementType; label: string; desc: string }> = {
  citizen: { icon: User, label: 'Citizen', desc: 'Report waste & earn points' },
  worker: { icon: Truck, label: 'Worker', desc: 'Grade segregation quality' },
  admin: { icon: Shield, label: 'Admin', desc: 'Monitor & manage system' },
};

export default function LoginPage() {
  const { login } = useAuth();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<UserRole>('citizen');
  const [street, setStreet] = useState('');
  const [category, setCategory] = useState<AreaCategory>('urban');
  const [isNew, setIsNew] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast({ title: 'Username required', variant: 'destructive' });
      return;
    }

    let user = findUser(username, role);
    if (!user) {
      if (!isNew) {
        setIsNew(true);
        toast({ title: 'User not found', description: 'Select your street & category to register.' });
        return;
      }
      if (!street) {
        toast({ title: 'Select a street', variant: 'destructive' });
        return;
      }
      user = createUser(username, role, street, category);
      toast({ title: 'Account created! Welcome to E-SAGE 🌱' });
    }
    login(user);
  };

  const RoleIcon = ROLE_INFO[role].icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full eco-gradient opacity-10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full eco-gradient opacity-10 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl eco-gradient mb-4">
            <Recycle className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">
            <span className="eco-gradient-text">E-SAGE</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Eco-Friendly Smart Automated Garbage Environment
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Username</label>
            <Input
              placeholder="Enter your username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Role</label>
            <div className="grid grid-cols-3 gap-2">
              {(['citizen', 'worker', 'admin'] as UserRole[]).map(r => {
                const info = ROLE_INFO[r];
                const Icon = info.icon;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => { setRole(r); setIsNew(false); }}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                      role === r
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{info.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground text-center">{ROLE_INFO[role].desc}</p>
          </div>

          {isNew && (
            <div className="space-y-3 animate-fade-in-up">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Street</label>
                <Select value={street} onValueChange={setStreet}>
                  <SelectTrigger><SelectValue placeholder="Select street" /></SelectTrigger>
                  <SelectContent>
                    {getAllStreetNames().map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Area Category</label>
                <Select value={category} onValueChange={v => setCategory(v as AreaCategory)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {getAllCategories().map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <Button type="submit" className="w-full h-11 eco-gradient border-0 text-primary-foreground font-semibold">
            <Leaf className="w-4 h-4 mr-2" />
            {isNew ? 'Register & Enter' : 'Login'}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Demo accounts: alice (citizen), worker1 (worker), admin (admin)
          </p>
        </form>
      </div>
    </div>
  );
}
