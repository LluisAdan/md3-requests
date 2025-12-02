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
      return "bg-[#1A2B1A] text-[#4ADE80] border-[#4ADE80]/20";
    case "in-progress":
      return "bg-[#1E293B] text-[#60A5FA] border-[#60A5FA]/20";
    case "completed":
    case "done":
      return "bg-[#1F2A37] text-[#38BDF8] border-[#38BDF8]/20";
    case "closed":
      return "bg-[#2C2C2C] text-[#A1A1AA] border-[#A1A1AA]/20";
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
