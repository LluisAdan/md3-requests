import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard } from 'lucide-react';

const Dashboard = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your requests and activity</p>
        </div>

        <Card className="shadow-medium">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <LayoutDashboard className="h-16 w-16 text-muted-foreground mb-4" />
            <CardTitle className="mb-2">Coming Soon</CardTitle>
            <CardDescription className="text-center max-w-md">
              Dashboard analytics and insights will be available here
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
