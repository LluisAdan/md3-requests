import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard } from 'lucide-react';

const Dashboard = () => {
  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto space-y-4 md:space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">Overview of your requests and activity</p>
        </div>

        <Card className="shadow-medium">
          <CardContent className="flex flex-col items-center justify-center py-12 md:py-16">
            <LayoutDashboard className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground mb-4" />
            <CardTitle className="mb-2 text-lg md:text-xl">Coming Soon</CardTitle>
            <CardDescription className="text-center max-w-md text-xs md:text-sm px-4">
              Dashboard analytics and insights will be available here
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
