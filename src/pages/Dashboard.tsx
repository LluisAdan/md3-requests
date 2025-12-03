import { Layout } from '@/components/Layout';
import { FileText, Clock, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const Dashboard = () => {
  const [totalRequests, setTotalRequests] = useState<number | null>(null);
  const [openRequests, setOpenRequests] = useState<number | null>(null);
  const [highPriorityRequests, setHighPriorityRequests] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      
      const [totalRes, openRes, highRes] = await Promise.all([
        supabase.from('requests').select('*', { count: 'exact', head: true }),
        supabase.from('requests').select('*', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('requests').select('*', { count: 'exact', head: true }).eq('priority', 'high'),
      ]);

      setTotalRequests(totalRes.count ?? 0);
      setOpenRequests(openRes.count ?? 0);
      setHighPriorityRequests(highRes.count ?? 0);
      setLoading(false);
    };

    fetchStats();
  }, []);

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto space-y-6 px-4 md:px-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Overview of your requests and activity</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-[#0F172A] shadow-md space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Requests</span>
            </div>
            <p className="text-3xl font-bold">
              {loading ? '—' : totalRequests}
            </p>
          </div>
          <div className="p-6 rounded-xl bg-[#0F172A] shadow-md space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Open Requests</span>
            </div>
            <p className="text-3xl font-bold">
              {loading ? '—' : openRequests}
            </p>
          </div>
          <div className="p-6 rounded-xl bg-[#0F172A] shadow-md space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">High Priority</span>
            </div>
            <p className="text-3xl font-bold">
              {loading ? '—' : highPriorityRequests}
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
