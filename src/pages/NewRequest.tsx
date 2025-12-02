import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

const NewRequest = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: '',
    priority: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to create a request');
      return;
    }

    if (!form.title.trim() || !form.description.trim() || !form.type || !form.priority) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from('requests')
      .insert([
        {
          title: form.title.trim(),
          description: form.description.trim(),
          type: form.type,
          priority: form.priority,
          status: 'open',
          created_by: user.id,
        },
      ])
      .select()
      .single();

    if (error) {
      toast.error('Failed to create request');
      console.error('Error creating request:', error);
    } else {
      toast.success('Request created successfully');
      
      try {
        await fetch('https://hook.eu2.make.com/5hdkgbq34m0q2w8nab4348s4mr5gkndo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            request_id: data.id,
            title: data.title,
            description: data.description,
            type: data.type,
            priority: data.priority,
            created_by: data.created_by,
            created_at: data.created_at,
            updated_at: data.updated_at,
          }),
        });
      } catch (webhookError) {
        console.error('Webhook error:', webhookError);
      }
      
      navigate(`/request/${data.id}`);
    }

    setLoading(false);
  };

  return (
    <Layout>
      <div className="w-full max-w-2xl mx-auto px-4 md:px-0">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Create New Request</h1>
          <p className="text-sm text-muted-foreground mt-1">Submit a new internal request</p>
        </div>

        <Card className="shadow-md border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Plus className="h-5 w-5" />
              Request Details
            </CardTitle>
            <CardDescription className="text-sm">
              Fill in the information below to create your request
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">Title *</Label>
                <Input
                  id="title"
                  placeholder="Brief description of your request"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="h-10 focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed information about your request"
                  rows={6}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                  className="focus:ring-2 focus:ring-primary/40 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-sm font-medium">Type *</Label>
                  <Select value={form.type} onValueChange={(value) => setForm({ ...form, type: value })}>
                    <SelectTrigger id="type" className="h-10 focus:ring-2 focus:ring-primary/40">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bug">Bug Report</SelectItem>
                      <SelectItem value="feature">Feature Request</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                      <SelectItem value="question">Question</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-sm font-medium">Priority *</Label>
                  <Select value={form.priority} onValueChange={(value) => setForm({ ...form, priority: value })}>
                    <SelectTrigger id="priority" className="h-10 focus:ring-2 focus:ring-primary/40">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="flex-1 h-10 disabled:opacity-50 disabled:pointer-events-none focus:ring-2 focus:ring-primary/40"
                >
                  {loading ? 'Creating...' : 'Create Request'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/')}
                  disabled={loading}
                  className="sm:w-auto h-10 focus:ring-2 focus:ring-primary/40"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default NewRequest;
