import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Calendar, Target, BookOpen } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { type Task } from "@shared/schema";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";

interface TaskItemProps {
  task: Task;
  topicName?: string;
  onEdit: (task: Task) => void;
}

export function TaskItem({ task, topicName, onEdit }: TaskItemProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const handleCheckboxChange = async () => {
    if (!user) return;
    
    try {
      setIsUpdating(true);
      
      await apiRequest("PATCH", `/api/tasks/${task.id}`, {
        isCompleted: !task.isCompleted
      });
      
      // Invalidate tasks query
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user.id}/tasks`] });
      
      toast({
        title: task.isCompleted ? "Task marked as incomplete" : "Task completed",
        description: task.title,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    
    try {
      setIsDeleting(true);
      
      await apiRequest("DELETE", `/api/tasks/${task.id}`, undefined);
      
      // Invalidate tasks query
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user.id}/tasks`] });
      
      toast({
        title: "Task deleted",
        description: task.title,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  // Format dates
  const scheduledDate = task.scheduledDate 
    ? format(new Date(task.scheduledDate), "MMM d, yyyy")
    : null;
    
  const dueDate = task.dueDate 
    ? format(new Date(task.dueDate), "MMM d, yyyy")
    : null;

  // Get importance text and color
  const importanceMap = {
    1: { text: "Low", color: "text-blue-600 dark:text-blue-400" },
    2: { text: "Medium", color: "text-yellow-600 dark:text-yellow-400" },
    3: { text: "High", color: "text-red-600 dark:text-red-400" },
  };
  
  const importance = importanceMap[task.importance as keyof typeof importanceMap] || 
    importanceMap[1];

  return (
    <>
      <Card className={`transition-opacity ${task.isCompleted ? "opacity-70" : ""}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Checkbox 
              checked={task.isCompleted}
              onCheckedChange={handleCheckboxChange}
              disabled={isUpdating}
              className="mt-1"
            />
            
            <div className="flex-1 min-w-0">
              <h3 className={`font-medium line-clamp-2 ${task.isCompleted ? "line-through text-muted-foreground" : ""}`}>
                {task.title}
              </h3>
              
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                {scheduledDate && (
                  <span className="flex items-center text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    Scheduled: {scheduledDate}
                  </span>
                )}
                
                {dueDate && (
                  <span className="flex items-center text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    Due: {dueDate}
                  </span>
                )}
                
                <span className={`flex items-center ${importance.color}`}>
                  <Target className="h-3 w-3 mr-1" />
                  {importance.text} priority
                </span>
                
                {topicName && (
                  <span className="flex items-center text-muted-foreground">
                    <BookOpen className="h-3 w-3 mr-1" />
                    {topicName}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit(task)}
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500 hover:text-red-600"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete the task "{task.title}"? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
