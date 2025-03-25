import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen } from "lucide-react";
import { Link } from "wouter";
import { type Course } from "@shared/schema";

interface CourseCardProps {
  course: Course;
  progress?: {
    completedTopics: number;
    totalTopics: number;
  };
  inProgress?: boolean;
}

export function CourseCard({ course, progress, inProgress }: CourseCardProps) {
  const progressPercentage = progress 
    ? Math.round((progress.completedTopics / progress.totalTopics) * 100) 
    : 0;

  return (
    <Card className="h-full transition-shadow hover:shadow-md">
      <Link href={`/course/${course.id}`}>
        <a className="block h-full">
          <CardHeader className="pb-2">
            {inProgress && (
              <Badge className="self-start mb-2" variant="secondary">
                In Progress
              </Badge>
            )}
            <CardTitle className="line-clamp-2">{course.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {course.description}
            </p>
            {progress && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Progress</span>
                  <span>{progress.completedTopics}/{progress.totalTopics} topics</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            )}
          </CardContent>
          <CardFooter>
            <div className="flex items-center text-xs text-muted-foreground">
              <BookOpen className="h-3 w-3 mr-1" />
              {progress ? progress.totalTopics : "Multiple"} topics
            </div>
          </CardFooter>
        </a>
      </Link>
    </Card>
  );
}
