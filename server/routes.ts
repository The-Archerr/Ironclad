import express, { type Express, type Request, type Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertCommunityNoteSchema, insertNoteVoteSchema, insertUserProgressSchema, insertPomodoroSessionSchema, insertTaskSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Authentication routes
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      
      const user = await storage.createUser(userData);
      
      // Don't return password in response
      const { password, ...userWithoutPassword } = user;
      
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      return res.status(500).json({ message: "Error creating user" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      const user = await storage.getUserByEmail(email);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Don't return password in response
      const { password: _, ...userWithoutPassword } = user;
      
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: "Error during login" });
    }
  });

  app.post("/api/auth/google", async (req: Request, res: Response) => {
    try {
      const { googleId, name, email, profilePicUrl } = req.body;
      
      if (!googleId || !email) {
        return res.status(400).json({ message: "Google ID and email are required" });
      }
      
      // Check if user already exists with this Google ID
      let user = await storage.getUserByGoogleId(googleId);
      
      if (!user) {
        // Check if user exists with this email
        user = await storage.getUserByEmail(email);
        
        if (user) {
          // Update existing user with Google ID
          user = await storage.updateUser(user.id, { googleId }) as typeof user;
        } else {
          // Create new user
          user = await storage.createUser({
            name,
            email,
            googleId,
            profilePicUrl,
            password: null // No password for Google auth
          });
        }
      }
      
      // Don't return password in response
      const { password: _, ...userWithoutPassword } = user;
      
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: "Error during Google authentication" });
    }
  });

  // User routes
  app.get("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return password in response
      const { password, ...userWithoutPassword } = user;
      
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching user" });
    }
  });

  app.patch("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updatedUser = await storage.updateUser(userId, req.body);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return password in response
      const { password, ...userWithoutPassword } = updatedUser;
      
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: "Error updating user" });
    }
  });

  // Course routes
  app.get("/api/courses", async (req: Request, res: Response) => {
    try {
      const courses = await storage.getCourses();
      return res.status(200).json(courses);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching courses" });
    }
  });

  app.get("/api/courses/:id", async (req: Request, res: Response) => {
    try {
      const courseId = parseInt(req.params.id);
      
      if (isNaN(courseId)) {
        return res.status(400).json({ message: "Invalid course ID" });
      }
      
      const course = await storage.getCourse(courseId);
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      return res.status(200).json(course);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching course" });
    }
  });

  // Topic routes
  app.get("/api/courses/:courseId/topics", async (req: Request, res: Response) => {
    try {
      const courseId = parseInt(req.params.courseId);
      
      if (isNaN(courseId)) {
        return res.status(400).json({ message: "Invalid course ID" });
      }
      
      const topics = await storage.getTopics(courseId);
      return res.status(200).json(topics);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching topics" });
    }
  });

  app.get("/api/topics/:id", async (req: Request, res: Response) => {
    try {
      const topicId = parseInt(req.params.id);
      
      if (isNaN(topicId)) {
        return res.status(400).json({ message: "Invalid topic ID" });
      }
      
      const topic = await storage.getTopic(topicId);
      
      if (!topic) {
        return res.status(404).json({ message: "Topic not found" });
      }
      
      return res.status(200).json(topic);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching topic" });
    }
  });

  // Resource routes
  app.get("/api/topics/:topicId/resources", async (req: Request, res: Response) => {
    try {
      const topicId = parseInt(req.params.topicId);
      
      if (isNaN(topicId)) {
        return res.status(400).json({ message: "Invalid topic ID" });
      }
      
      const resources = await storage.getResourcesByTopic(topicId);
      return res.status(200).json(resources);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching resources" });
    }
  });

  // Community notes routes
  app.get("/api/topics/:topicId/notes", async (req: Request, res: Response) => {
    try {
      const topicId = parseInt(req.params.topicId);
      
      if (isNaN(topicId)) {
        return res.status(400).json({ message: "Invalid topic ID" });
      }
      
      const notes = await storage.getNotesByTopic(topicId);
      return res.status(200).json(notes);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching notes" });
    }
  });

  app.post("/api/topics/:topicId/notes", async (req: Request, res: Response) => {
    try {
      const topicId = parseInt(req.params.topicId);
      
      if (isNaN(topicId)) {
        return res.status(400).json({ message: "Invalid topic ID" });
      }
      
      const noteData = insertCommunityNoteSchema.parse({
        ...req.body,
        topicId
      });
      
      const note = await storage.createNote(noteData);
      return res.status(201).json(note);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      return res.status(500).json({ message: "Error creating note" });
    }
  });

  app.post("/api/notes/:noteId/vote", async (req: Request, res: Response) => {
    try {
      const noteId = parseInt(req.params.noteId);
      
      if (isNaN(noteId)) {
        return res.status(400).json({ message: "Invalid note ID" });
      }
      
      const voteData = insertNoteVoteSchema.parse({
        ...req.body,
        noteId
      });
      
      const vote = await storage.voteNote(voteData);
      return res.status(200).json(vote);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      return res.status(500).json({ message: "Error voting on note" });
    }
  });

  // Progress routes
  app.get("/api/users/:userId/progress/:topicId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const topicId = parseInt(req.params.topicId);
      
      if (isNaN(userId) || isNaN(topicId)) {
        return res.status(400).json({ message: "Invalid user ID or topic ID" });
      }
      
      const progress = await storage.getUserTopicProgress(userId, topicId);
      
      if (!progress) {
        return res.status(404).json({ message: "Progress not found" });
      }
      
      return res.status(200).json(progress);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching progress" });
    }
  });

  app.post("/api/users/:userId/progress", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const progressData = insertUserProgressSchema.parse({
        ...req.body,
        userId
      });
      
      const progress = await storage.markTopicComplete(progressData);
      return res.status(200).json(progress);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      return res.status(500).json({ message: "Error updating progress" });
    }
  });

  app.get("/api/users/:userId/completed-topics", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const completedTopics = await storage.getUserCompletedTopics(userId);
      return res.status(200).json(completedTopics);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching completed topics" });
    }
  });

  app.get("/api/users/:userId/in-progress-courses", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const inProgressCourses = await storage.getUserInProgressCourses(userId);
      return res.status(200).json(inProgressCourses);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching in-progress courses" });
    }
  });

  // Streak routes
  app.get("/api/users/:userId/streak", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const streak = await storage.getUserStreak(userId);
      
      if (!streak) {
        return res.status(200).json({ currentStreak: 0, lastActive: new Date() });
      }
      
      return res.status(200).json(streak);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching streak" });
    }
  });

  // Pomodoro routes
  app.post("/api/users/:userId/pomodoro-sessions", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const sessionData = insertPomodoroSessionSchema.parse({
        ...req.body,
        userId
      });
      
      const session = await storage.createPomodoroSession(sessionData);
      return res.status(201).json(session);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      return res.status(500).json({ message: "Error creating pomodoro session" });
    }
  });

  app.get("/api/users/:userId/pomodoro-sessions", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const sessions = await storage.getUserPomodoroSessions(userId);
      return res.status(200).json(sessions);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching pomodoro sessions" });
    }
  });

  // Task routes
  app.get("/api/users/:userId/tasks", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const tasks = await storage.getUserTasks(userId);
      return res.status(200).json(tasks);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching tasks" });
    }
  });

  app.post("/api/users/:userId/tasks", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const taskData = insertTaskSchema.parse({
        ...req.body,
        userId
      });
      
      const task = await storage.createTask(taskData);
      return res.status(201).json(task);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      return res.status(500).json({ message: "Error creating task" });
    }
  });

  app.patch("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const taskId = parseInt(req.params.id);
      
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      
      const task = await storage.updateTask(taskId, req.body);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      return res.status(200).json(task);
    } catch (error) {
      return res.status(500).json({ message: "Error updating task" });
    }
  });

  app.delete("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const taskId = parseInt(req.params.id);
      
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      
      const success = await storage.deleteTask(taskId);
      
      if (!success) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: "Error deleting task" });
    }
  });

  // Quiz routes
  app.get("/api/topics/:topicId/quizzes", async (req: Request, res: Response) => {
    try {
      const topicId = parseInt(req.params.topicId);
      const quizzes = await storage.getQuizzesByTopic(topicId);
      res.status(200).json(quizzes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quizzes" });
    }
  });
  
  app.get("/api/quizzes/:id", async (req: Request, res: Response) => {
    try {
      const quizId = parseInt(req.params.id);
      const quiz = await storage.getQuiz(quizId);
      
      if (quiz) {
        // Get questions for this quiz
        const questions = await storage.getQuestionsByQuiz(quizId);
        res.status(200).json({ quiz, questions });
      } else {
        res.status(404).json({ error: "Quiz not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quiz" });
    }
  });
  
  app.post("/api/topics/:topicId/generate-quiz", async (req: Request, res: Response) => {
    try {
      const topicId = parseInt(req.params.topicId);
      const result = await storage.generateQuizForTopic(topicId);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate quiz" });
    }
  });
  
  app.post("/api/quizzes/:quizId/attempt", async (req: Request, res: Response) => {
    try {
      const { userId, score, maxScore, answers } = req.body;
      const quizId = parseInt(req.params.quizId);
      
      // Validate request body
      if (!userId || score === undefined || !maxScore || !answers || !Array.isArray(answers)) {
        return res.status(400).json({ error: "Invalid request body" });
      }
      
      // Create the quiz attempt
      const attempt = await storage.createQuizAttempt({
        userId,
        quizId,
        score,
        maxScore,
        completedAt: new Date()
      });
      
      // Save all answers
      const savedAnswers = [];
      for (const answer of answers) {
        savedAnswers.push(await storage.saveQuizAnswer({
          attemptId: attempt.id,
          questionId: answer.questionId,
          userAnswer: answer.userAnswer,
          isCorrect: answer.isCorrect
        }));
      }
      
      // Add points to user
      const quiz = await storage.getQuiz(quizId);
      if (quiz) {
        // Award points based on score percentage
        const scorePercentage = score / maxScore;
        const pointsToAward = Math.round(quiz.pointsToEarn * scorePercentage);
        
        if (pointsToAward > 0) {
          await storage.addUserPoints(userId, pointsToAward);
        }
        
        // Check for perfect score achievement
        if (score === maxScore) {
          // Get all user's perfect scores
          const attempts = await storage.getUserQuizAttempts(userId);
          const perfectScores = attempts.filter(a => a.score === a.maxScore);
          
          // Get the achievement for perfect scores
          const achievements = await storage.getAchievements();
          const perfectScoreAchievement = achievements.find(a => 
            a.type === 'perfect_score'
          );
          
          // Unlock achievement if threshold is met
          if (perfectScoreAchievement && perfectScores.length >= perfectScoreAchievement.threshold) {
            await storage.unlockAchievement(userId, perfectScoreAchievement.id);
          }
        }
        
        // Check for quiz mastery achievement
        const attempts = await storage.getUserQuizAttempts(userId);
        const achievements = await storage.getAchievements();
        const quizMasteryAchievement = achievements.find(a => 
          a.type === 'quiz_mastery'
        );
        
        if (quizMasteryAchievement && attempts.length >= quizMasteryAchievement.threshold) {
          await storage.unlockAchievement(userId, quizMasteryAchievement.id);
        }
      }
      
      res.status(201).json({ 
        attempt, 
        answers: savedAnswers 
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to save quiz attempt" });
    }
  });
  
  app.get("/api/users/:userId/quiz-attempts", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const quizId = req.query.quizId ? parseInt(req.query.quizId as string) : undefined;
      
      const attempts = await storage.getUserQuizAttempts(userId, quizId);
      res.status(200).json(attempts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quiz attempts" });
    }
  });
  
  // Achievement routes
  app.get("/api/achievements", async (req: Request, res: Response) => {
    try {
      const achievements = await storage.getAchievements();
      res.status(200).json(achievements);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch achievements" });
    }
  });
  
  app.get("/api/users/:userId/achievements", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const achievements = await storage.getUserAchievements(userId);
      res.status(200).json(achievements);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user achievements" });
    }
  });
  
  app.get("/api/users/:userId/points", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const points = await storage.getUserPoints(userId);
      
      if (points) {
        res.status(200).json(points);
      } else {
        // Return default values if user has no points yet
        res.status(200).json({
          userId,
          points: 0,
          level: 1
        });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user points" });
    }
  });

  return httpServer;
}
