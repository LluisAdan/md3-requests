import { Layout } from '@/components/Layout';
import { FileText, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  open: '#22c55e',
  'in-progress': '#3b82f6',
  completed: '#a855f7',
  done: '#a855f7',
  closed: '#71717a',
};

const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  'in-progress': 'In Progress',
  completed: 'Completed',
  done: 'Completed',
  closed: 'Closed',
};

const ALL_STATUSES = ['open', 'in-progress', 'completed', 'closed'];

type StatusCount = {
  status: string;
  count: number;
};

const Dashboard = () => {
  const [totalRequests, setTotalRequests] = useState<number | null>(null);
  const [openRequests, setOpenRequests] = useState<number | null>(null);
  const [completedRequests, setCompletedRequests] = useState<number | null>(null);
  const [highPriorityRequests, setHighPriorityRequests] = useState<number | null>(null);
  const [statusData, setStatusData] = useState<StatusCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      
      const [totalRes, openRes, completedRes, highRes, allRequests] = await Promise.all([
        supabase.from('requests').select('*', { count: 'exact', head: true }),
        supabase.from('requests').select('*', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('requests').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('requests').select('*', { count: 'exact', head: true }).eq('priority', 'high'),
        supabase.from('requests').select('status'),
      ]);

      setTotalRequests(totalRes.count ?? 0);
      setOpenRequests(openRes.count ?? 0);
      setCompletedRequests(completedRes.count ?? 0);
      setHighPriorityRequests(highRes.count ?? 0);

      // Group by status
      if (allRequests.data) {
        const counts: Record<string, number> = {};
        allRequests.data.forEach((req) => {
          let status = req.status || 'unknown';
          // Normalize "done" to "completed"
          if (status === 'done') status = 'completed';
          counts[status] = (counts[status] || 0) + 1;
        });
        // Ensure all 4 statuses are present
        const chartData = ALL_STATUSES.map((status) => ({
          status,
          count: counts[status] || 0,
        }));
        setStatusData(chartData);
      }

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-[#0F172A] border-border/50 shadow-md">
            <CardContent className="p-6 space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Total Requests</span>
              </div>
              <p className="text-3xl font-bold">
                {loading ? '—' : totalRequests}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-[#0F172A] border-border/50 shadow-md">
            <CardContent className="p-6 space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Open Requests</span>
              </div>
              <p className="text-3xl font-bold">
                {loading ? '—' : openRequests}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-[#0F172A] border-border/50 shadow-md">
            <CardContent className="p-6 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Completed</span>
              </div>
              <p className="text-3xl font-bold">
                {loading ? '—' : completedRequests}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-[#0F172A] border-border/50 shadow-md">
            <CardContent className="p-6 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">High Priority</span>
              </div>
              <p className="text-3xl font-bold">
                {loading ? '—' : highPriorityRequests}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card className="bg-[#0F172A] border-border shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Requests by Status</CardTitle>
              <CardDescription>Distribution of requests by current status</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground">Loading...</div>
              ) : statusData.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground">No data available</div>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        dataKey="count"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={3}
                      >
                        {statusData.map((entry) => (
                          <Cell 
                            key={entry.status} 
                            fill={STATUS_COLORS[entry.status] || '#888888'} 
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [value, STATUS_LABELS[name as string] || name]}
                        contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '8px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
              {!loading && statusData.length > 0 && (
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  {statusData.map((entry) => (
                    <div key={entry.status} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: STATUS_COLORS[entry.status] || '#888888' }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {STATUS_LABELS[entry.status] || entry.status} ({entry.count})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
