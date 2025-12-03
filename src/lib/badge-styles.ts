// Centralized badge styling for priority and status badges

export const getPriorityClasses = (priority: string): string => {
  switch (priority.toLowerCase()) {
    case "high":
      return "bg-[#2B1A1A] text-[#F87171] border-[#F87171]/20";
    case "medium":
      return "bg-[#2B2416] text-[#FBBF24] border-[#FBBF24]/20";
    case "low":
      return "bg-[#1A2B1A] text-[#86EFAC] border-[#86EFAC]/20";
    default:
      return "bg-secondary text-secondary-foreground";
  }
};

export const getStatusClasses = (status: string): string => {
  switch (status.toLowerCase()) {
    case "open":
      return "bg-[#052e16] text-[#22c55e] border-[#22c55e]/30";
    case "in-progress":
      return "bg-[#172554] text-[#3b82f6] border-[#3b82f6]/30";
    case "completed":
    case "done":
      return "bg-[#2e1065] text-[#a855f7] border-[#a855f7]/30";
    case "closed":
      return "bg-[#27272a] text-[#71717a] border-[#71717a]/30";
    default:
      return "bg-secondary text-secondary-foreground";
  }
};

export const formatStatusLabel = (status: string): string => {
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
