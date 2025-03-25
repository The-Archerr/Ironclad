import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { formatRelativeTime } from "@/lib/date";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Award, 
  Calendar, 
  Trophy, 
  BarChart3, 
  BookOpen,
  Target
} from "lucide-react";
import type { Achievement, UserPoints } from "@shared/schema";

interface AchievementWithUnlock extends Achievement {
  unlockedAt?: Date;
}

interface ProgressData {
  current: number;
  target: number;
  achievement: Achievement;
}

interface AchievementsListProps {
  showUnlocked?: boolean;
  showProgress?: boolean;
  limit?: number;
}

export function AchievementsList({ 
  showUnlocked = true, 
  showProgress = true, 
  limit 
}: AchievementsListProps) {
  const { user } = useAuth();

  // Get all achievements
  const { data: allAchievements, isLoading: isLoadingAchievements } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements"],
    enabled: !!user,
  });

  // Get user's achievements
  const { data: userAchievements, isLoading: isLoadingUserAchievements } = useQuery<{ 
    achievement: Achievement; 
    unlockedAt: Date;
  }[]>({
    queryKey: user ? [`/api/users/${user.id}/achievements`] : [],
    enabled: !!user,
  });

  // Get user points
  const { data: userPoints, isLoading: isLoadingUserPoints } = useQuery<UserPoints>({
    queryKey: user ? [`/api/users/${user.id}/points`] : [],
    enabled: !!user,
  });

  // Get user's streak
  const { data: userStreak, isLoading: isLoadingStreak } = useQuery<{ streak: number }>({
    queryKey: user ? [`/api/users/${user.id}/streak`] : [],
    enabled: !!user,
  });

  // Get user's completed topics
  const { data: completedTopics, isLoading: isLoadingCompletedTopics } = useQuery<any[]>({
    queryKey: user ? [`/api/users/${user.id}/completed-topics`] : [],
    enabled: !!user,
  });

  // Get user's quiz attempts
  const { data: quizAttempts, isLoading: isLoadingQuizAttempts } = useQuery<any[]>({
    queryKey: user ? [`/api/users/${user.id}/quiz-attempts`] : [],
    enabled: !!user,
  });

  if (!user) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">Please log in to view achievements</p>
        </CardContent>
      </Card>
    );
  }

  if (
    isLoadingAchievements || 
    isLoadingUserAchievements || 
    isLoadingUserPoints ||
    isLoadingStreak ||
    isLoadingCompletedTopics ||
    isLoadingQuizAttempts
  ) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      </div>
    );
  }

  if (!allAchievements || !userAchievements) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">No achievements available</p>
        </CardContent>
      </Card>
    );
  }

  // Combine all achievements with user unlocked status
  const achievements: AchievementWithUnlock[] = allAchievements.map(achievement => {
    const userAchievement = userAchievements.find(
      ua => ua.achievement.id === achievement.id
    );
    
    return {
      ...achievement,
      unlockedAt: userAchievement?.unlockedAt
    };
  });

  // Prepare progress data for in-progress achievements
  const progressData: ProgressData[] = [];
  
  if (showProgress) {
    // Streak achievement progress
    const streakAchievement = achievements.find(a => a.type === 'streak' && !a.unlockedAt);
    if (streakAchievement && userStreak) {
      progressData.push({
        current: userStreak.streak,
        target: streakAchievement.threshold,
        achievement: streakAchievement
      });
    }
    
    // Topic completion achievement progress
    const topicAchievement = achievements.find(a => a.type === 'topic_completion' && !a.unlockedAt);
    if (topicAchievement && completedTopics) {
      progressData.push({
        current: completedTopics.length,
        target: topicAchievement.threshold,
        achievement: topicAchievement
      });
    }
    
    // Quiz mastery achievement progress
    const quizAchievement = achievements.find(a => a.type === 'quiz_mastery' && !a.unlockedAt);
    if (quizAchievement && quizAttempts) {
      progressData.push({
        current: quizAttempts.length,
        target: quizAchievement.threshold,
        achievement: quizAchievement
      });
    }
    
    // Perfect score achievement progress
    const perfectScoreAchievement = achievements.find(a => a.type === 'perfect_score' && !a.unlockedAt);
    if (perfectScoreAchievement && quizAttempts) {
      const perfectScores = quizAttempts.filter(a => a.score === a.maxScore);
      progressData.push({
        current: perfectScores.length,
        target: perfectScoreAchievement.threshold,
        achievement: perfectScoreAchievement
      });
    }
  }

  // Filter based on props
  let filteredAchievements = achievements;
  
  if (showUnlocked && !showProgress) {
    filteredAchievements = achievements.filter(a => a.unlockedAt);
  } else if (!showUnlocked && showProgress) {
    filteredAchievements = achievements.filter(a => !a.unlockedAt);
  }
  
  // Apply limit if provided
  if (limit && filteredAchievements.length > limit) {
    filteredAchievements = filteredAchievements.slice(0, limit);
  }

  // Get achievement icon based on type
  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'streak':
        return <Calendar className="h-5 w-5" />;
      case 'topic_completion':
        return <BookOpen className="h-5 w-5" />;
      case 'course_completion':
        return <Trophy className="h-5 w-5" />;
      case 'perfect_score':
        return <Target className="h-5 w-5" />;
      case 'quiz_mastery':
        return <BarChart3 className="h-5 w-5" />;
      default:
        return <Award className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* User Points Summary */}
      {userPoints && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-lg">Level {userPoints.level}</p>
                <p className="text-sm text-muted-foreground">
                  {userPoints.points} XP total • {(userPoints.level + 1) * 100 - userPoints.points} XP to next level
                </p>
              </div>
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Award className="h-8 w-8 text-primary" />
              </div>
            </div>
            <Progress 
              className="mt-4 h-2" 
              value={((userPoints.points % 100) / 100) * 100} 
            />
          </CardContent>
        </Card>
      )}

      {/* Progress on next achievements */}
      {showProgress && progressData.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">In Progress</h3>
          <div className="grid grid-cols-1 gap-4">
            {progressData.map((progress) => (
              <Card key={progress.achievement.id} className="overflow-hidden">
                <div className="flex items-center p-4 gap-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    {getAchievementIcon(progress.achievement.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium">{progress.achievement.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {progress.achievement.description}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Progress 
                        value={(progress.current / progress.target) * 100} 
                        className="flex-1 h-2"
                      />
                      <span className="text-sm font-medium whitespace-nowrap">
                        {progress.current}/{progress.target}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Unlocked achievements */}
      {showUnlocked && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">
            {showProgress ? "Unlocked Achievements" : "Achievements"}
          </h3>
          
          {filteredAchievements.filter(a => a.unlockedAt).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAchievements
                .filter(a => a.unlockedAt)
                .sort((a, b) => {
                  if (a.unlockedAt && b.unlockedAt) {
                    return new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime();
                  }
                  return 0;
                })
                .map(achievement => (
                  <Card key={achievement.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-full bg-primary/10">
                            {getAchievementIcon(achievement.type)}
                          </div>
                          <CardTitle className="text-base">{achievement.title}</CardTitle>
                        </div>
                        <Badge variant="outline" className="ml-2 shrink-0">
                          +{achievement.points} XP
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2 mt-1">
                        {achievement.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {achievement.unlockedAt && (
                        <p className="text-xs text-muted-foreground">
                          Unlocked {formatRelativeTime(achievement.unlockedAt)}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-6 text-center">
                <p className="text-muted-foreground">
                  No achievements unlocked yet. Keep learning to earn achievements!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}