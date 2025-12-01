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
      
      // Trigger webhook
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
        // Don't show error to user, just log it
      }
      
      navigate(`/request/${data.id}`);
    }

    setLoading(false);
  };

  return (
    <Layout>
      <div className="w-full max-w-2xl mx-auto">
        <div className="mb-4 md:mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Create New Request</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">Submit a new internal request</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Plus className="h-4 w-4 md:h-5 md:w-5" />
              Request Details
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Fill in the information below to create your request
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm">Title *</Label>
                <Input
                  id="title"
                  placeholder="Brief description of your request"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed information about your request"
                  rows={6}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                  className="text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-sm">Type *</Label>
                  <Select value={form.type} onValueChange={(value) => setForm({ ...form, type: value })}>
                    <SelectTrigger id="type" className="text-sm">
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
                  <Label htmlFor="priority" className="text-sm">Priority *</Label>
                  <Select value={form.priority} onValueChange={(value) => setForm({ ...form, priority: value })}>
                    <SelectTrigger id="priority" className="text-sm">
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
                <Button type="submit" disabled={loading} className="flex-1 text-sm">
                  {loading ? 'Creating...' : 'Create Request'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/')}
                  disabled={loading}
                  className="sm:w-auto text-sm"
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
