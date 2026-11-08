import { useState } from 'react';
import { QrCode, ScanLine, CheckCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { updateUserPoints, User } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';

const BIN_TYPES = [
  { id: 'wet', label: 'Wet Waste', color: 'bg-green-600', emoji: '🟢', points: 5 },
  { id: 'dry', label: 'Dry Waste', color: 'bg-blue-600', emoji: '🔵', points: 5 },
  { id: 'hazardous', label: 'Hazardous Waste', color: 'bg-red-600', emoji: '🔴', points: 10 },
  { id: 'ewaste', label: 'E-Waste', color: 'bg-yellow-600', emoji: '🟡', points: 8 },
];

type ScanPhase = 'idle' | 'scanning' | 'result';

export default function QRScanner({ user, onPointsUpdate }: { user: User; onPointsUpdate: () => void }) {
  const { toast } = useToast();
  const [phase, setPhase] = useState<ScanPhase>('idle');
  const [scannedBin, setScannedBin] = useState<typeof BIN_TYPES[0] | null>(null);
  const [todayScans, setTodayScans] = useState(0);

  const MAX_DAILY = 5;

  const handleScan = () => {
    if (todayScans >= MAX_DAILY) {
      toast({ title: 'Daily limit reached', description: `Max ${MAX_DAILY} scans per day`, variant: 'destructive' });
      return;
    }
    setPhase('scanning');
    // Simulate scanning delay
    setTimeout(() => {
      const randomBin = BIN_TYPES[Math.floor(Math.random() * BIN_TYPES.length)];
      setScannedBin(randomBin);
      setPhase('result');
    }, 1800);
  };

  const handleConfirm = () => {
    if (!scannedBin) return;
    updateUserPoints(user.id, scannedBin.points);
    setTodayScans(prev => prev + 1);
    toast({ title: `+${scannedBin.points} bonus points! 🎉`, description: `Proper ${scannedBin.label} segregation recorded.` });
    onPointsUpdate();
    setPhase('idle');
    setScannedBin(null);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="glass-card rounded-2xl p-5 text-center">
        <h2 className="font-heading text-lg font-bold text-foreground flex items-center justify-center gap-2 mb-2">
          <QrCode className="w-5 h-5 text-primary" /> QR Bin Scanner
        </h2>
        <p className="text-sm text-muted-foreground mb-6">Scan a waste bin QR code to log proper segregation and earn bonus points!</p>

        {/* Scanner viewport */}
        <div className="relative mx-auto w-56 h-56 rounded-2xl border-2 border-dashed border-primary/40 bg-secondary/50 flex items-center justify-center overflow-hidden mb-6">
          {phase === 'idle' && (
            <div className="text-center">
              <QrCode className="w-16 h-16 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Tap to scan</p>
            </div>
          )}
          {phase === 'scanning' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-full relative">
                <ScanLine className="w-full h-1 text-primary animate-pulse" />
              </div>
              <div className="absolute inset-0 border-2 border-primary/60 rounded-2xl animate-pulse" />
              <p className="text-sm font-medium text-primary mt-4 animate-pulse">Scanning...</p>
            </div>
          )}
          {phase === 'result' && scannedBin && (
            <div className="text-center animate-fade-in-up">
              <span className="text-5xl">{scannedBin.emoji}</span>
              <p className="text-sm font-semibold text-foreground mt-2">{scannedBin.label}</p>
              <div className="flex items-center justify-center gap-1 mt-1 text-primary">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-bold">+{scannedBin.points} pts</span>
              </div>
            </div>
          )}
        </div>

        {phase === 'idle' && (
          <Button onClick={handleScan} className="eco-gradient border-0 text-primary-foreground w-full max-w-xs">
            <QrCode className="w-4 h-4 mr-2" /> Scan QR Code
          </Button>
        )}
        {phase === 'result' && (
          <Button onClick={handleConfirm} className="eco-gradient border-0 text-primary-foreground w-full max-w-xs">
            <CheckCircle className="w-4 h-4 mr-2" /> Confirm & Earn Points
          </Button>
        )}

        <p className="text-xs text-muted-foreground mt-4">{todayScans}/{MAX_DAILY} scans used today</p>
      </div>

      {/* Bin types guide */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="font-heading font-semibold text-foreground mb-3">Bin Types & Points</h3>
        <div className="grid grid-cols-2 gap-3">
          {BIN_TYPES.map(b => (
            <div key={b.id} className="flex items-center gap-3 rounded-xl bg-secondary/50 p-3">
              <span className="text-2xl">{b.emoji}</span>
              <div>
                <p className="text-sm font-medium text-foreground">{b.label}</p>
                <p className="text-xs text-muted-foreground">+{b.points} pts</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
