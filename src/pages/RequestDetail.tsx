import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { supabase, Request, RequestLog } from "@/lib/supabase";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { ArrowLeft, Calendar, Clock, RotateCcw } from "lucide-react";
import { getPriorityClasses, getStatusClasses, formatStatusLabel } from "@/lib/badge-styles";

type Profile = {
  id: string;
  email: string;
  name: string | null;
};

type LogWithUser = RequestLog & {
  changedByName?: string;
};

const RequestDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [request, setRequest] = useState<Request | null>(null);
  const [logs, setLogs] = useState<LogWithUser[]>([]);
  const [creator, setCreator] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [updating, setUpdating] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (id) {
      fetchRequest();
      fetchLogs();
    }
    // Check if we just created this request
    if (location.state?.created) {
      setNotification({ message: "Request created successfully", type: 'success' });
      setTimeout(() => setNotification(null), 5000);
      // Clear the state so it doesn't show again on refresh
      window.history.replaceState({}, document.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchRequest = async () => {
    setLoading(true);

    const { data, error } = await supabase.from("requests").select("*").eq("id", id).single();

    if (error || !data) {
      console.error("Error fetching request:", error);
      navigate("/");
      setLoading(false);
      return;
    }

    setRequest(data);
    setSelectedStatus(data.status || "");

    if (data.created_by) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, email, name")
        .eq("id", data.created_by)
        .single();

      if (profileError) {
        console.error("Error fetching creator profile:", profileError);
        setCreator(null);
      } else {
        setCreator(profile);
      }
    } else {
      setCreator(null);
    }

    setLoading(false);
  };

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from("request_logs")
      .select("*")
      .eq("request_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching logs:", error);
    } else {
      const logsWithUsers: LogWithUser[] = await Promise.all(
        (data || []).map(async (log) => {
          if (log.details?.changed_by) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("name, email")
              .eq("id", log.details.changed_by)
              .single();
            return {
              ...log,
              changedByName: profile?.name || profile?.email?.split('@')[0] || 'Unknown'
            };
          }
          return log;
        })
      );
      setLogs(logsWithUsers);
    }
  };

  const handleUpdateStatus = async () => {
    if (!request || !selectedStatus || selectedStatus === request.status) return;

    const { data: { user } } = await supabase.auth.getUser();

    setUpdating(true);
    const { error } = await supabase
      .from("requests")
      .update({
        status: selectedStatus,
        assigned_to: user?.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", request.id);

    if (error) {
      setNotification({ message: "Failed to update status", type: 'error' });
      console.error("Error updating status:", error);
    } else {
      setNotification({ message: "Status updated successfully", type: 'success' });
      await fetchRequest();
      await fetchLogs();
    }

    setUpdating(false);
    setTimeout(() => setNotification(null), 5000);
  };

  const getCreatorInitial = () => {
    if (creator?.name) return creator.name.charAt(0).toUpperCase();
    if (creator?.email) return creator.email.charAt(0).toUpperCase();
    return "?";
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
          <Button onClick={() => navigate("/")} className="mt-4 h-10">
            Back to Requests
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full max-w-5xl mx-auto space-y-6 px-4 md:px-0">
        <Button variant="ghost" onClick={() => navigate("/")} className="gap-2 h-10 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Requests
        </Button>

        <Card className="shadow-md border-border/50">
          <CardHeader className="pb-4">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <h1 className="text-3xl sm:text-4xl font-bold font-mono text-foreground">
                  #{request.public_id || request.id.slice(0, 8)}
                </h1>
                <Badge className={`text-sm px-3 py-1 w-fit border ${getStatusClasses(request.status)}`}>
                  {formatStatusLabel(request.status)}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Type:</span>
                  <Badge variant="outline" className="text-xs">{request.type}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Priority:</span>
                  <Badge className={`text-xs border ${getPriorityClasses(request.priority)}`}>
                    {request.priority}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground hidden sm:inline">Created:</span>
                  <span className="font-medium">{format(new Date(request.created_at), "PP")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                    {getCreatorInitial()}
                  </div>
                  <span className="text-muted-foreground hidden sm:inline">By:</span>
                  <span className="font-medium truncate max-w-[150px] sm:max-w-none">
                    {creator?.name || creator?.email || "Unknown user"}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-3 text-foreground">Description</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {request.description}
              </p>
            </div>

            <Separator className="bg-border/50" />

            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-foreground">Update Status</h3>
              {request.status.toLowerCase() === "closed" ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">This request is closed and cannot be modified.</p>
                  <Button 
                    variant="outline"
                    onClick={async () => {
                      const { data: { user } } = await supabase.auth.getUser();
                      setUpdating(true);
                      const { error } = await supabase
                        .from("requests")
                        .update({
                          status: "in-progress",
                          assigned_to: user?.id,
                          updated_at: new Date().toISOString(),
                        })
                        .eq("id", request.id);
                      if (error) {
                        setNotification({ message: "Failed to reopen request", type: 'error' });
                      } else {
                        setNotification({ message: "Request reopened successfully", type: 'success' });
                        await fetchRequest();
                        await fetchLogs();
                      }
                      setUpdating(false);
                      setTimeout(() => setNotification(null), 5000);
                    }}
                    disabled={updating}
                    className="gap-2 h-10"
                  >
                    <RotateCcw className="h-4 w-4" />
                    {updating ? "Reopening..." : "Reopen Request"}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
                  <div className="flex-1 sm:max-w-xs">
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="h-10 focus:ring-2 focus:ring-primary/40">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={handleUpdateStatus} 
                    disabled={updating || selectedStatus === request.status}
                    className="w-full sm:w-auto h-10 disabled:opacity-50 disabled:pointer-events-none focus:ring-2 focus:ring-primary/40"
                  >
                    {updating ? "Updating..." : "Update Status"}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Clock className="h-5 w-5" />
              Activity / Logs
            </CardTitle>
            <CardDescription className="text-sm">
              {logs.length === 0
                ? "No activity recorded yet"
                : `${logs.length} event${logs.length !== 1 ? "s" : ""} recorded`}
            </CardDescription>
          </CardHeader>
          {logs.length > 0 && (
            <CardContent>
              <div className="space-y-6">
                {logs.map((log, index) => (
                  <div key={log.id} className="flex gap-4">
                    <div className="relative flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-primary shadow-glow" />
                      {index !== logs.length - 1 && <div className="flex-1 w-px bg-border/50 mt-2" />}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-foreground uppercase tracking-wide">
                                {log.event.replace(/_/g, ' ')}
                              </span>
                              {log.event === "STATUS_CHANGED" && log.details?.new_status && (
                                <span className="flex items-center gap-1 text-muted-foreground">
                                  → <Badge className={`text-xs border ${getStatusClasses(log.details.new_status)}`}>
                                    {formatStatusLabel(log.details.new_status)}
                                  </Badge>
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground sm:hidden">
                              {format(new Date(log.created_at), "MMM d, h:mm a")}
                              {log.changedByName && ` · by ${log.changedByName}`}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap hidden sm:flex sm:flex-col sm:items-end gap-0.5">
                          <span>{format(new Date(log.created_at), "MMM d, h:mm a")}</span>
                          {log.changedByName && (
                            <span className="text-muted-foreground/70">by {log.changedByName}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        {notification && (
          <div className={`p-4 rounded-lg border text-center transition-all ${
            notification.type === 'success' 
              ? 'bg-[#1A2B1A] border-[#4ADE80]/30 text-[#4ADE80]' 
              : 'bg-[#2B1A1A] border-[#F87171]/30 text-[#F87171]'
          }`}>
            <p className="text-lg font-medium">{notification.message}</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RequestDetail;
