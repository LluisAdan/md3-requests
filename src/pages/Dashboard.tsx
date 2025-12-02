import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { LayoutDashboard } from 'lucide-react';

const Dashboard = () => {
  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto space-y-6 px-4 md:px-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Overview of your requests and activity</p>
        </div>

        <Card className="shadow-md border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <LayoutDashboard className="h-16 w-16 text-muted-foreground mb-4" />
            <CardTitle className="mb-2 text-xl">Coming Soon</CardTitle>
            <CardDescription className="text-center max-w-md text-sm">
              Dashboard analytics and insights will be available here
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
