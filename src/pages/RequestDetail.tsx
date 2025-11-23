import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, Request, RequestLog } from '@/lib/supabase';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { ArrowLeft, Calendar, User, ArrowUpCircle, Circle, Clock } from 'lucide-react';

const RequestDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<Request | null>(null);
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchRequest();
      fetchLogs();
    }
  }, [id]);

  const fetchRequest = async () => {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      toast.error('Failed to fetch request');
      console.error('Error fetching request:', error);
      navigate('/');
    } else {
      setRequest(data);
    }
    
    setLoading(false);
  };

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from('request_logs')
      .select('*')
      .eq('request_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching logs:', error);
    } else {
      setLogs(data || []);
    }
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

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse text-muted-foreground">Loading request...</div>
        </div>
      </Layout>
    );
  }

  if (!request) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Request not found</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Back to Requests
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Requests
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  {request.public_id && (
                    <span className="text-sm font-mono text-muted-foreground">
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
                  <Badge variant="outline">{request.type}</Badge>
                </div>
                <CardTitle className="text-2xl">{request.title}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{request.description}</p>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Created</span>
                </div>
                <p className="font-medium">{format(new Date(request.created_at), 'PPP')}</p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Updated</span>
                </div>
                <p className="font-medium">{format(new Date(request.updated_at), 'PPP')}</p>
              </div>

              {request.assigned_to && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Assigned to</span>
                  </div>
                  <p className="font-medium">{request.assigned_to}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
            <CardDescription>
              {logs.length === 0 
                ? 'No activity recorded yet' 
                : `${logs.length} event${logs.length !== 1 ? 's' : ''} recorded`}
            </CardDescription>
          </CardHeader>
          {logs.length > 0 && (
            <CardContent>
              <div className="space-y-4">
                {logs.map((log, index) => (
                  <div key={log.id} className="flex gap-4">
                    <div className="relative flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-primary" />
                      {index !== logs.length - 1 && (
                        <div className="flex-1 w-px bg-border mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{log.event}</p>
                          {log.details && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {JSON.stringify(log.details)}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                          {format(new Date(log.created_at), 'MMM d, h:mm a')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default RequestDetail;
