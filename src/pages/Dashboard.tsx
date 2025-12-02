import { Layout } from '@/components/Layout';
import { LayoutDashboard, FileText, Clock, CheckCircle } from 'lucide-react';

const Dashboard = () => {
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
            <p className="text-3xl font-bold">—</p>
          </div>
          <div className="p-6 rounded-xl bg-[#0F172A] shadow-md space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">In Progress</span>
            </div>
            <p className="text-3xl font-bold">—</p>
          </div>
          <div className="p-6 rounded-xl bg-[#0F172A] shadow-md space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Completed</span>
            </div>
            <p className="text-3xl font-bold">—</p>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-[#0F172A] shadow-md flex flex-col items-center justify-center py-16">
          <LayoutDashboard className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="mb-2 text-xl font-semibold">Coming Soon</h2>
          <p className="text-center max-w-md text-sm text-muted-foreground">
            Dashboard analytics and insights will be available here
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
