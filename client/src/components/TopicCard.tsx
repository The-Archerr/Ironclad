import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Clock, ChevronRight } from "lucide-react";
import { type Topic } from "@shared/schema";
import { Link } from "wouter";

interface TopicCardProps {
  topic: Topic;
  isCompleted?: boolean;
  isLocked?: boolean;
  onMarkComplete?: () => void;
}

export function TopicCard({ 
  topic, 
  isCompleted = false, 
  isLocked = false,
  onMarkComplete 
}: TopicCardProps) {
  if (isLocked) {
    return (
      <Card className="opacity-60 cursor-not-allowed">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex justify-between items-start">
            <span className="line-clamp-2">{topic.title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {topic.description}
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            Complete prerequisites first
          </div>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <Link href={`/topic/${topic.id}`}>
      <Card className="transition-all hover:shadow-md cursor-pointer">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex justify-between items-start">
            <span className="line-clamp-2 hover:text-primary transition-colors">
              {topic.title}
            </span>
            {isCompleted && (
              <span className="flex items-center text-sm text-green-600 dark:text-green-400 font-normal">
                <Check className="h-4 w-4 mr-1" />
                Completed
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {topic.description}
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex items-center text-sm text-primary/80">
            <span>View details</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </div>
          
          {!isCompleted && onMarkComplete && (
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onMarkComplete();
              }}
              variant="ghost"
              size="sm"
              className="text-primary"
            >
              Mark Complete
            </Button>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
