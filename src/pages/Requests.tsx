import { useState, useEffect } from 'react';
import { supabase, Request } from '@/lib/supabase';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { FileText, Clock, ArrowUpCircle, Circle } from 'lucide-react';

const Requests = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    setLoading(true);
    
    let query = supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;

    if (error) {
      toast.error('Failed to fetch requests');
      console.error('Error fetching requests:', error);
    } else {
      setRequests(data || []);
    }
    
    setLoading(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return 'default';
      case 'in-progress': return 'warning';
      case 'completed': return 'success';
      case 'closed': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">All Requests</h1>
            <p className="text-muted-foreground mt-1">View and manage internal requests</p>
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-pulse text-muted-foreground">Loading requests...</div>
          </div>
        ) : requests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                {statusFilter === 'all' ? 'No requests found' : `No ${statusFilter} requests found`}
              </p>
              <Link to="/new">
                <Button className="mt-4">Create your first request</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {requests.map((request) => (
              <Link key={request.id} to={`/request/${request.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {request.public_id && (
                            <span className="text-xs font-mono text-muted-foreground">
                              #{request.public_id}
                            </span>
                          )}
                          <Badge variant={getPriorityColor(request.priority)}>
                            <ArrowUpCircle className="h-3 w-3 mr-1" />
                            {request.priority}
                          </Badge>
                          <Badge variant={getStatusColor(request.status)}>
                            <Circle className="h-2 w-2 mr-1 fill-current" />
                            {request.status}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl">{request.title}</CardTitle>
                        <CardDescription className="mt-2 line-clamp-2">
                          {request.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {format(new Date(request.created_at), 'MMM d, yyyy')}
                      </div>
                      <Badge variant="outline">{request.type}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Requests;
