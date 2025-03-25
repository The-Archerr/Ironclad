import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AppLayout } from "@/components/Layout";
import { AchievementsList } from "@/components/AchievementsList";
import { useAuth } from "@/lib/auth";
import { Award, Trophy, Star, Target, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPoints } from "@shared/schema";

export default function AchievementsPage() {
  const { user } = useAuth();

  // Get user points
  const { data: userPoints, isLoading: isLoadingUserPoints } = useQuery<UserPoints>({
    queryKey: user ? [`/api/users/${user.id}/points`] : [],
    enabled: !!user,
  });

  if (!user) {
    return (
      <AppLayout>
        <div className="container mx-auto py-6 px-4">
          <Card>
            <CardContent className="py-16 text-center">
              <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Login to View Achievements</h2>
              <p className="text-muted-foreground mb-6">
                Track your progress and unlock achievements as you learn.
              </p>
              <Link href="/auth">
                <div className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                  Login
                  <ChevronRight className="ml-2 h-4 w-4" />
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-6 px-4 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Achievements</h1>
            <p className="text-muted-foreground">
              Track your progress and unlock rewards
            </p>
          </div>

          {isLoadingUserPoints ? (
            <Skeleton className="h-12 w-[180px]" />
          ) : userPoints ? (
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Level</p>
                <p className="text-2xl font-semibold">Level {userPoints.level}</p>
              </div>
              <div className="border-l border-border pl-4">
                <p className="text-sm text-muted-foreground">Points</p>
                <p className="text-2xl font-semibold">{userPoints.points} XP</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Level</p>
                <p className="text-2xl font-semibold">Level 1</p>
              </div>
              <div className="border-l border-border pl-4">
                <p className="text-sm text-muted-foreground">Points</p>
                <p className="text-2xl font-semibold">0 XP</p>
              </div>
            </div>
          )}
        </div>

        <Tabs defaultValue="all">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Achievements</TabsTrigger>
            <TabsTrigger value="unlocked">Unlocked</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <AchievementsList showUnlocked={true} showProgress={true} />
          </TabsContent>

          <TabsContent value="unlocked" className="space-y-6">
            <AchievementsList showUnlocked={true} showProgress={false} />
          </TabsContent>

          <TabsContent value="in-progress" className="space-y-6">
            <AchievementsList showUnlocked={false} showProgress={true} />
          </TabsContent>
        </Tabs>

        {/* Badges explanation */}
        <Card>
          <CardHeader>
            <CardTitle>About Achievement Badges</CardTitle>
            <CardDescription>
              Earn achievements as you progress through your learning journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-primary/10 shrink-0">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Streak Master</h3>
                  <p className="text-sm text-muted-foreground">
                    Achieve a 7-day learning streak by logging in and completing topics daily
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-primary/10 shrink-0">
                  <Star className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Topic Explorer</h3>
                  <p className="text-sm text-muted-foreground">
                    Complete 10 topics across any courses
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-primary/10 shrink-0">
                  <Trophy className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Course Champion</h3>
                  <p className="text-sm text-muted-foreground">
                    Complete all topics in any course
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-primary/10 shrink-0">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Quiz Wizard</h3>
                  <p className="text-sm text-muted-foreground">
                    Achieve perfect scores on 5 different quizzes
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}