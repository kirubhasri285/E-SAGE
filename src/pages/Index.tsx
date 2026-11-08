import { useAuth } from '@/contexts/AuthContext';
import LoginPage from '@/pages/LoginPage';
import CitizenDashboard from '@/pages/CitizenDashboard';
import WorkerDashboard from '@/pages/WorkerDashboard';
import AdminDashboard from '@/pages/AdminDashboard';

const Index = () => {
  const { user } = useAuth();

  if (!user) return <LoginPage />;
  if (user.role === 'citizen') return <CitizenDashboard />;
  if (user.role === 'worker') return <WorkerDashboard />;
  if (user.role === 'admin') return <AdminDashboard />;

  return <LoginPage />;
};

export default Index;
