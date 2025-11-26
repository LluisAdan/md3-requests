import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, Request, RequestLog } from '@/lib/supabase';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [updating, setUpdating] = useState(false);

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
      setSelectedStatus(data?.status || '');
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

  const handleUpdateStatus = async () => {
    if (!request || !selectedStatus) return;
    
    setUpdating(true);
    const { error } = await supabase
      .from('requests')
      .update({ 
        status: selectedStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', request.id);

    if (error) {
      toast.error('Failed to update status');
      console.error('Error updating status:', error);
    } else {
      toast.success('Status updated successfully');
      await fetchRequest();
      await fetchLogs();
    }
    
    setUpdating(false);
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
      <div className="max-w-5xl mx-auto space-y-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Requests
        </Button>

        <Card className="shadow-medium">
          <CardHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold font-mono">
                  #{request.public_id || request.id.slice(0, 8)}
                </h1>
                <Badge variant={getStatusColor(request.status)} className="text-sm px-3 py-1">
                  {request.status}
                </Badge>
              </div>
              
              <div className="flex flex-wrap gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Type:</span>
                  <Badge variant="outline">{request.type}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Priority:</span>
                  <Badge variant={getPriorityColor(request.priority)}>
                    {request.priority}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Created:</span>
                  <span className="font-medium">{format(new Date(request.created_at), 'PPP')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">By:</span>
                  <span className="font-medium">{request.created_by}</span>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-3">Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{request.description}</p>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Update Status</h3>
              <div className="flex gap-3 items-end">
                <div className="flex-1 max-w-xs">
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleUpdateStatus} 
                  disabled={updating || selectedStatus === request.status}
                >
                  {updating ? 'Updating...' : 'Update Status'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Activity / Logs
            </CardTitle>
            <CardDescription>
              {logs.length === 0 
                ? 'No activity recorded yet' 
                : `${logs.length} event${logs.length !== 1 ? 's' : ''} recorded`}
            </CardDescription>
          </CardHeader>
          {logs.length > 0 && (
            <CardContent>
              <div className="space-y-6">
                {logs.map((log, index) => (
                  <div key={log.id} className="flex gap-4">
                    <div className="relative flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-primary shadow-glow" />
                      {index !== logs.length - 1 && (
                        <div className="flex-1 w-px bg-border mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-base">{log.event}</p>
                            <span className="text-xs text-muted-foreground sm:hidden">
                              {format(new Date(log.created_at), 'MMM d, h:mm a')}
                            </span>
                          </div>
                          {log.details && (
                            <div className="text-sm text-muted-foreground space-y-1">
                              {log.details.public_id && (
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">ID:</span>
                                  <span className="font-mono">#{log.details.public_id}</span>
                                </div>
                              )}
                              {log.details.source && (
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">Source:</span>
                                  <span>{log.details.source}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap hidden sm:block">
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
