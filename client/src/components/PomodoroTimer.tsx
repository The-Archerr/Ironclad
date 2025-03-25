import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, RotateCcw, Coffee } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

type TimerMode = "work" | "break";

export function PomodoroTimer() {
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [mode, setMode] = useState<TimerMode>("work");
  const [timeLeft, setTimeLeft] = useState(workMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Reset timer when changing work/break minutes
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(mode === "work" ? workMinutes * 60 : breakMinutes * 60);
    }
  }, [workMinutes, breakMinutes, mode, isRunning]);

  // Timer logic
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      intervalId = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      // Time's up - switch modes
      const newMode = mode === "work" ? "break" : "work";
      setMode(newMode);
      setTimeLeft(newMode === "work" ? workMinutes * 60 : breakMinutes * 60);
      
      // Play sound and show notification
      const audio = new Audio("/sounds/bell.mp3");
      audio.play().catch(() => {}); // Ignore if browser blocks audio
      
      toast({
        title: `${mode === "work" ? "Work" : "Break"} session completed!`,
        description: `Time for a ${mode === "work" ? "break" : "new work session"}.`,
      });
      
      // If work session ended, log it
      if (mode === "work" && sessionStartTime && user) {
        logPomodoroSession();
      }
      
      // Start a new session timer if switching to work mode
      if (newMode === "work") {
        setSessionStartTime(new Date());
      }
    }

    return () => clearInterval(intervalId);
  }, [isRunning, timeLeft, mode, workMinutes, breakMinutes]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const toggleTimer = useCallback(() => {
    // If starting the timer and in work mode, set session start time
    if (!isRunning && mode === "work") {
      setSessionStartTime(new Date());
    }
    
    // If stopping the timer and in work mode with a session in progress, log it
    if (isRunning && mode === "work" && sessionStartTime && user) {
      logPomodoroSession();
    }
    
    setIsRunning((prev) => !prev);
  }, [isRunning, mode, sessionStartTime, user]);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(mode === "work" ? workMinutes * 60 : breakMinutes * 60);
    setSessionStartTime(null);
  }, [mode, workMinutes, breakMinutes]);

  const switchMode = useCallback(() => {
    setIsRunning(false);
    const newMode = mode === "work" ? "break" : "work";
    setMode(newMode);
    setTimeLeft(newMode === "work" ? workMinutes * 60 : breakMinutes * 60);
    
    // If switching to work mode, set session start time
    if (newMode === "work") {
      setSessionStartTime(new Date());
    } else {
      setSessionStartTime(null);
    }
  }, [mode, workMinutes, breakMinutes]);

  const logPomodoroSession = async () => {
    if (!user || !sessionStartTime) return;
    
    try {
      const endTime = new Date();
      const durationMinutes = Math.round((endTime.getTime() - sessionStartTime.getTime()) / 60000);
      
      // Only log if the session lasted at least 1 minute
      if (durationMinutes < 1) return;
      
      await apiRequest("POST", `/api/users/${user.id}/pomodoro-sessions`, {
        userId: user.id,
        startTime: sessionStartTime,
        endTime: endTime,
        workMinutes: durationMinutes,
        breakMinutes: breakMinutes
      });
    } catch (error) {
      console.error("Failed to log pomodoro session:", error);
    } finally {
      setSessionStartTime(null);
    }
  };

  // Calculate progress percentage
  const totalSeconds = mode === "work" ? workMinutes * 60 : breakMinutes * 60;
  const progressPercentage = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Pomodoro Timer</span>
          <span className={`text-sm font-normal px-2 py-1 rounded ${
            mode === "work" 
              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" 
              : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          }`}>
            {mode === "work" ? "Work" : "Break"}
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="text-center mb-6">
          <div className="text-5xl font-semibold mb-2">{formatTime(timeLeft)}</div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Work Time</label>
            <Select
              value={workMinutes.toString()}
              onValueChange={(value) => setWorkMinutes(parseInt(value))}
              disabled={isRunning}
            >
              <SelectTrigger>
                <SelectValue placeholder="Work minutes" />
              </SelectTrigger>
              <SelectContent>
                {[15, 20, 25, 30, 35, 40, 45, 50, 55, 60].map((min) => (
                  <SelectItem key={min} value={min.toString()}>
                    {min} minutes
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Break Time</label>
            <Select
              value={breakMinutes.toString()}
              onValueChange={(value) => setBreakMinutes(parseInt(value))}
              disabled={isRunning}
            >
              <SelectTrigger>
                <SelectValue placeholder="Break minutes" />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 15, 20, 25, 30].map((min) => (
                  <SelectItem key={min} value={min.toString()}>
                    {min} minutes
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="justify-between">
        <div className="flex space-x-2">
          <Button 
            onClick={toggleTimer}
            variant="default"
            className={mode === "work" ? "bg-primary" : "bg-green-600 hover:bg-green-700"}
          >
            {isRunning ? (
              <>
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-1" />
                Start
              </>
            )}
          </Button>
          
          <Button onClick={resetTimer} variant="outline">
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
        
        <Button onClick={switchMode} variant="ghost">
          {mode === "work" ? (
            <>
              <Coffee className="h-4 w-4 mr-1" />
              Switch to Break
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-1" />
              Switch to Work
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
