import { useState, useEffect } from "react";
import { supabase, Request } from "@/lib/supabase";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";
import { FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Requests = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, activeTab]);

  const fetchRequests = async () => {
    setLoading(true);

    let query = supabase.from("requests").select("*").order("created_at", { ascending: false });

    if (activeTab === "my" && user) {
      query = query.eq("created_by", user.id);
    }

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query;

    if (error) {
      toast.error("Failed to fetch requests");
      console.error("Error fetching requests:", error);
    } else {
      setRequests(data || []);
    }

    setLoading(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "destructive";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return "success";
      case "in-progress":
        return "warning";
      case "completed":
        return "success";
      case "closed":
        return "secondary";
      default:
        return "default";
    }
  };

  const formatStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case "in-progress":
        return "In Progress";
      case "open":
        return "Open";
      case "done":
      case "completed":
        return "Completed";
      case "closed":
        return "Closed";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const renderRequestsTable = () => (
    <>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse text-muted-foreground">Loading requests...</div>
        </div>
      ) : requests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              {statusFilter === "all" ? "No requests found" : `No ${statusFilter} requests found`}
            </p>
            <Link to="/new">
              <Button className="mt-4">Create your first request</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-medium overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead className="hidden md:table-cell">Priority</TableHead>
                  <TableHead className="hidden lg:table-cell">Status</TableHead>
                  <TableHead className="hidden xl:table-cell">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id} className="cursor-pointer group">
                    <TableCell className="font-mono text-sm">
                      <Link to={`/request/${request.id}`} className="text-primary hover:underline font-semibold">
                        #{request.public_id || request.id.slice(0, 8)}
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link to={`/request/${request.id}`} className="hover:text-primary transition-colors">
                        {request.title}
                      </Link>
                      <div className="sm:hidden flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {request.type}
                        </Badge>
                        <Badge variant={getPriorityColor(request.priority)} className="text-xs">
                          {request.priority}
                        </Badge>
                        <Badge variant={getStatusColor(request.status)} className="text-xs">
                          {formatStatusLabel(request.status)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(request.created_at), "MMM d, yyyy")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline">{request.type}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant={getPriorityColor(request.priority)}>{request.priority}</Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant={getStatusColor(request.status)}>{formatStatusLabel(request.status)}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden xl:table-cell">
                      {format(new Date(request.created_at), "MMM d, yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </>
  );

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Requests</h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">View and manage internal requests</p>
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="all" className="flex-1 sm:flex-none">All Requests</TabsTrigger>
            <TabsTrigger value="my" className="flex-1 sm:flex-none">My Requests</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4 md:mt-6">
            {renderRequestsTable()}
          </TabsContent>
          <TabsContent value="my" className="mt-4 md:mt-6">
            {renderRequestsTable()}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Requests;
