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
import { getPriorityClasses, getStatusClasses, formatStatusLabel } from "@/lib/badge-styles";

type RequestWithAssigned = Request & {
  assignedName?: string;
};

const Requests = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requests, setRequests] = useState<RequestWithAssigned[]>([]);
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
      // Fetch assigned user names
      const requestsWithAssigned: RequestWithAssigned[] = await Promise.all(
        (data || []).map(async (req) => {
          const assignedId = req.assigned_to || req.created_by;
          if (assignedId) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("name, email")
              .eq("id", assignedId)
              .single();
            return {
              ...req,
              assignedName: profile?.name || profile?.email?.split('@')[0] || 'Unknown'
            };
          }
          return { ...req, assignedName: 'Unknown' };
        })
      );
      
      // Sort: non-closed first (by created_at desc), then closed (by created_at desc)
      const sorted = requestsWithAssigned.sort((a, b) => {
        const aIsClosed = a.status.toLowerCase() === "closed";
        const bIsClosed = b.status.toLowerCase() === "closed";
        if (aIsClosed && !bIsClosed) return 1;
        if (!aIsClosed && bIsClosed) return -1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      setRequests(sorted);
    }

    setLoading(false);
  };

  const renderRequestsTable = () => (
    <>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse text-muted-foreground">Loading requests...</div>
        </div>
      ) : requests.length === 0 ? (
        <Card className="shadow-md">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center text-sm">
              {statusFilter === "all" ? "No requests found" : `No ${formatStatusLabel(statusFilter).toLowerCase()} requests found`}
            </p>
            <Link to="/new">
              <Button className="mt-4 h-10">Create your first request</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-md overflow-hidden border-border/50">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="w-[100px] text-muted-foreground font-medium">ID</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Title</TableHead>
                  <TableHead className="hidden sm:table-cell text-muted-foreground font-medium">Type</TableHead>
                  <TableHead className="hidden md:table-cell text-muted-foreground font-medium">Priority</TableHead>
                  <TableHead className="hidden lg:table-cell text-muted-foreground font-medium">Status</TableHead>
                  {activeTab !== "my" && (
                    <TableHead className="hidden lg:table-cell text-muted-foreground font-medium">Assigned</TableHead>
                  )}
                  <TableHead className="hidden xl:table-cell text-muted-foreground font-medium">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow 
                    key={request.id} 
                    className="cursor-pointer group hover:bg-[#1A1F2A] transition-colors border-border/30"
                  >
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
                        <Badge className={`text-xs border ${getPriorityClasses(request.priority)}`}>
                          {request.priority}
                        </Badge>
                        <Badge className={`text-xs border ${getStatusClasses(request.status)}`}>
                          {formatStatusLabel(request.status)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(request.created_at), "MMM d, yyyy")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline" className="text-xs">{request.type}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge className={`text-xs border ${getPriorityClasses(request.priority)}`}>
                        {request.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge className={`text-xs border ${getStatusClasses(request.status)}`}>
                        {formatStatusLabel(request.status)}
                      </Badge>
                    </TableCell>
                    {activeTab !== "my" && (
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {request.assignedName || 'Unknown'}
                      </TableCell>
                    )}
                    <TableCell className="text-muted-foreground text-sm hidden xl:table-cell">
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
      <div className="w-full max-w-7xl mx-auto space-y-6 px-4 md:px-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Requests</h1>
            <p className="text-sm text-muted-foreground mt-1">View and manage internal requests</p>
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px] h-10 focus:ring-2 focus:ring-primary/40">
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
          <TabsList className="w-full sm:w-auto h-10">
            <TabsTrigger value="all" className="flex-1 sm:flex-none h-9">All Requests</TabsTrigger>
            <TabsTrigger value="my" className="flex-1 sm:flex-none h-9">My Requests</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-6">
            {renderRequestsTable()}
          </TabsContent>
          <TabsContent value="my" className="mt-6">
            {renderRequestsTable()}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Requests;
