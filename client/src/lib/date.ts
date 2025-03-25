import { format, formatDistanceToNow, isToday, isYesterday, addDays, parseISO } from "date-fns";

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  if (isToday(dateObj)) {
    return `Today, ${format(dateObj, "h:mm a")}`;
  } else if (isYesterday(dateObj)) {
    return `Yesterday, ${format(dateObj, "h:mm a")}`;
  } else {
    return format(dateObj, "MMM d, yyyy");
  }
}

export function formatTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "h:mm a");
}

export function formatDatetime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "MMM d, yyyy 'at' h:mm a");
}

export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

export function getDaysBetween(start: Date | string, end: Date | string): number {
  const startDate = typeof start === "string" ? new Date(start) : start;
  const endDate = typeof end === "string" ? new Date(end) : end;
  
  // Reset time component for accurate day calculation
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);
  
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

export function isConsecutiveDay(lastActiveDate: Date | string, today: Date = new Date()): boolean {
  const lastActive = typeof lastActiveDate === "string" ? new Date(lastActiveDate) : lastActiveDate;
  
  // Reset time component for accurate day calculation
  lastActive.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  const yesterday = addDays(today, -1);
  
  return lastActive.getTime() === yesterday.getTime();
}

export function formatDateForInput(date: Date | string | null): string {
  if (!date) return "";
  
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, "yyyy-MM-dd");
}
