import {
  users, courses, topics, resources, communityNotes, noteVotes, userProgress,
  userStreaks, pomodoroSessions, tasks, quizzes, quizQuestions, userQuizAttempts,
  userQuizAnswers, achievements, userAchievements, userPoints, QuestionType, AchievementType,
  type User, type InsertUser, type Course, type InsertCourse,
  type Topic, type InsertTopic, type Resource, type InsertResource,
  type CommunityNote, type InsertCommunityNote, type NoteVote, type InsertNoteVote,
  type UserProgress, type InsertUserProgress, type UserStreak, type InsertUserStreak,
  type PomodoroSession, type InsertPomodoroSession, type Task, type InsertTask,
  type Quiz, type InsertQuiz, type QuizQuestion, type InsertQuizQuestion,
  type UserQuizAttempt, type InsertUserQuizAttempt, type UserQuizAnswer, type InsertUserQuizAnswer,
  type Achievement, type InsertAchievement, type UserAchievement, type InsertUserAchievement,
  type UserPoints, type InsertUserPoints
} from "@shared/schema";

// Define the storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Course operations
  getCourses(): Promise<Course[]>;
  getCourse(id: number): Promise<Course | undefined>;
  getCoursesByIds(ids: number[]): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  
  // Topic operations
  getTopics(courseId: number): Promise<Topic[]>;
  getTopic(id: number): Promise<Topic | undefined>;
  createTopic(topic: InsertTopic): Promise<Topic>;
  
  // Resource operations
  getResourcesByTopic(topicId: number): Promise<Resource[]>;
  createResource(resource: InsertResource): Promise<Resource>;
  
  // Community note operations
  getNotesByTopic(topicId: number): Promise<CommunityNote[]>;
  createNote(note: InsertCommunityNote): Promise<CommunityNote>;
  voteNote(vote: InsertNoteVote): Promise<NoteVote>;
  
  // Progress operations
  getUserTopicProgress(userId: number, topicId: number): Promise<UserProgress | undefined>;
  markTopicComplete(progress: InsertUserProgress): Promise<UserProgress>;
  getUserCompletedTopics(userId: number): Promise<UserProgress[]>;
  getUserInProgressCourses(userId: number): Promise<{course: Course, completedTopics: number, totalTopics: number}[]>;
  
  // Streak operations
  getUserStreak(userId: number): Promise<UserStreak | undefined>;
  updateUserStreak(userId: number, streak: number): Promise<UserStreak>;
  
  // Pomodoro operations
  createPomodoroSession(session: InsertPomodoroSession): Promise<PomodoroSession>;
  getUserPomodoroSessions(userId: number): Promise<PomodoroSession[]>;
  
  // Task operations
  getUserTasks(userId: number): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Quiz operations
  getQuizzesByTopic(topicId: number): Promise<Quiz[]>;
  getQuiz(id: number): Promise<Quiz | undefined>;
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  
  // Quiz question operations
  getQuestionsByQuiz(quizId: number): Promise<QuizQuestion[]>;
  createQuizQuestion(question: InsertQuizQuestion): Promise<QuizQuestion>;
  
  // Quiz attempt operations
  createQuizAttempt(attempt: InsertUserQuizAttempt): Promise<UserQuizAttempt>;
  getUserQuizAttempts(userId: number, quizId?: number): Promise<UserQuizAttempt[]>;
  saveQuizAnswer(answer: InsertUserQuizAnswer): Promise<UserQuizAnswer>;
  
  // Achievement operations
  getAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: number): Promise<{
    achievement: Achievement;
    unlockedAt: Date;
  }[]>;
  unlockAchievement(userId: number, achievementId: number): Promise<UserAchievement>;
  
  // User points operations
  getUserPoints(userId: number): Promise<UserPoints | undefined>;
  addUserPoints(userId: number, pointsToAdd: number): Promise<UserPoints>;
  
  // AI functions
  generateQuizForTopic(topicId: number): Promise<{
    quiz: Quiz;
    questions: QuizQuestion[];
  }>;
}

// Implement in-memory storage
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private courses: Map<number, Course>;
  private topics: Map<number, Topic>;
  private resources: Map<number, Resource>;
  private communityNotes: Map<number, CommunityNote>;
  private noteVotes: Map<number, NoteVote>;
  private userProgress: Map<number, UserProgress>;
  private userStreaks: Map<number, UserStreak>;
  private pomodoroSessions: Map<number, PomodoroSession>;
  private tasks: Map<number, Task>;
  private quizzes: Map<number, Quiz>;
  private quizQuestions: Map<number, QuizQuestion>;
  private userQuizAttempts: Map<number, UserQuizAttempt>;
  private userQuizAnswers: Map<number, UserQuizAnswer>;
  private achievements: Map<number, Achievement>;
  private userAchievements: Map<number, UserAchievement>;
  private userPoints: Map<number, UserPoints>;
  
  private userId: number;
  private courseId: number;
  private topicId: number;
  private resourceId: number;
  private noteId: number;
  private voteId: number;
  private progressId: number;
  private streakId: number;
  private sessionId: number;
  private taskId: number;
  private quizId: number;
  private questionId: number;
  private attemptId: number;
  private answerId: number;
  private achievementId: number;
  private userAchievementId: number;
  private userPointsId: number;

  constructor() {
    this.users = new Map();
    this.courses = new Map();
    this.topics = new Map();
    this.resources = new Map();
    this.communityNotes = new Map();
    this.noteVotes = new Map();
    this.userProgress = new Map();
    this.userStreaks = new Map();
    this.pomodoroSessions = new Map();
    this.tasks = new Map();
    this.quizzes = new Map();
    this.quizQuestions = new Map();
    this.userQuizAttempts = new Map();
    this.userQuizAnswers = new Map();
    this.achievements = new Map();
    this.userAchievements = new Map();
    this.userPoints = new Map();
    
    this.userId = 1;
    this.courseId = 1;
    this.topicId = 1;
    this.resourceId = 1;
    this.noteId = 1;
    this.voteId = 1;
    this.progressId = 1;
    this.streakId = 1;
    this.sessionId = 1;
    this.taskId = 1;
    this.quizId = 1;
    this.questionId = 1;
    this.attemptId = 1;
    this.answerId = 1;
    this.achievementId = 1;
    this.userAchievementId = 1;
    this.userPointsId = 1;

    // Initialize with sample data
    this.initSampleData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.googleId === googleId);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser: User = { ...user, id, createdAt: new Date() };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Course operations
  async getCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }

  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async getCoursesByIds(ids: number[]): Promise<Course[]> {
    return ids.map(id => this.courses.get(id)).filter(Boolean) as Course[];
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const id = this.courseId++;
    const newCourse: Course = { ...course, id, createdAt: new Date() };
    this.courses.set(id, newCourse);
    return newCourse;
  }

  // Topic operations
  async getTopics(courseId: number): Promise<Topic[]> {
    return Array.from(this.topics.values())
      .filter(topic => topic.courseId === courseId)
      .sort((a, b) => a.order - b.order);
  }

  async getTopic(id: number): Promise<Topic | undefined> {
    return this.topics.get(id);
  }

  async createTopic(topic: InsertTopic): Promise<Topic> {
    const id = this.topicId++;
    const newTopic: Topic = { ...topic, id, createdAt: new Date() };
    this.topics.set(id, newTopic);
    return newTopic;
  }

  // Resource operations
  async getResourcesByTopic(topicId: number): Promise<Resource[]> {
    return Array.from(this.resources.values())
      .filter(resource => resource.topicId === topicId);
  }

  async createResource(resource: InsertResource): Promise<Resource> {
    const id = this.resourceId++;
    const newResource: Resource = { ...resource, id, createdAt: new Date() };
    this.resources.set(id, newResource);
    return newResource;
  }

  // Community note operations
  async getNotesByTopic(topicId: number): Promise<CommunityNote[]> {
    return Array.from(this.communityNotes.values())
      .filter(note => note.topicId === topicId);
  }

  async createNote(note: InsertCommunityNote): Promise<CommunityNote> {
    const id = this.noteId++;
    const newNote: CommunityNote = { 
      ...note, 
      id, 
      likes: 0, 
      dislikes: 0, 
      createdAt: new Date() 
    };
    this.communityNotes.set(id, newNote);
    return newNote;
  }

  async voteNote(vote: InsertNoteVote): Promise<NoteVote> {
    const id = this.voteId++;
    const newVote: NoteVote = { ...vote, id, createdAt: new Date() };
    
    // Update existing vote if exists
    const existingVote = Array.from(this.noteVotes.values())
      .find(v => v.noteId === vote.noteId && v.userId === vote.userId);
    
    if (existingVote) {
      // Remove old vote count
      const note = this.communityNotes.get(vote.noteId);
      if (note) {
        if (existingVote.vote === 1) {
          note.likes = Math.max(0, note.likes - 1);
        } else {
          note.dislikes = Math.max(0, note.dislikes - 1);
        }
        
        // Add new vote
        if (vote.vote === 1) {
          note.likes += 1;
        } else {
          note.dislikes += 1;
        }
        
        this.communityNotes.set(note.id, note);
      }
      
      // Update vote
      this.noteVotes.set(existingVote.id, {
        ...existingVote,
        vote: vote.vote
      });
      
      return this.noteVotes.get(existingVote.id) as NoteVote;
    } else {
      // Add new vote
      this.noteVotes.set(id, newVote);
      
      // Update note count
      const note = this.communityNotes.get(vote.noteId);
      if (note) {
        if (vote.vote === 1) {
          note.likes += 1;
        } else {
          note.dislikes += 1;
        }
        this.communityNotes.set(note.id, note);
      }
      
      return newVote;
    }
  }

  // Progress operations
  async getUserTopicProgress(userId: number, topicId: number): Promise<UserProgress | undefined> {
    return Array.from(this.userProgress.values())
      .find(progress => progress.userId === userId && progress.topicId === topicId);
  }

  async markTopicComplete(progress: InsertUserProgress): Promise<UserProgress> {
    const existing = await this.getUserTopicProgress(progress.userId, progress.topicId);
    
    if (existing) {
      const updated = { 
        ...existing, 
        isCompleted: progress.isCompleted,
        completedAt: progress.isCompleted ? new Date() : null
      };
      this.userProgress.set(existing.id, updated);
      return updated;
    }
    
    const id = this.progressId++;
    const newProgress: UserProgress = { 
      ...progress, 
      id, 
      completedAt: progress.isCompleted ? new Date() : null, 
      createdAt: new Date() 
    };
    this.userProgress.set(id, newProgress);
    
    // Update user streak if needed
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const userStreak = await this.getUserStreak(progress.userId);
    if (userStreak) {
      const lastActiveDate = new Date(userStreak.lastActive);
      lastActiveDate.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((today.getTime() - lastActiveDate.getTime()) / (24 * 60 * 60 * 1000));
      
      if (diffDays === 1) {
        // Consecutive day, increase streak
        await this.updateUserStreak(progress.userId, userStreak.currentStreak + 1);
      } else if (diffDays > 1) {
        // Streak broken, reset to 1
        await this.updateUserStreak(progress.userId, 1);
      }
      // If diffDays is 0, it's the same day, so don't change the streak
    } else {
      // First time user is completing a topic
      await this.updateUserStreak(progress.userId, 1);
    }
    
    return newProgress;
  }

  async getUserCompletedTopics(userId: number): Promise<UserProgress[]> {
    return Array.from(this.userProgress.values())
      .filter(progress => progress.userId === userId && progress.isCompleted)
      .sort((a, b) => {
        if (a.completedAt && b.completedAt) {
          return b.completedAt.getTime() - a.completedAt.getTime();
        }
        return 0;
      });
  }

  async getUserInProgressCourses(userId: number): Promise<{course: Course, completedTopics: number, totalTopics: number}[]> {
    // Get all user progress items
    const allUserProgress = Array.from(this.userProgress.values())
      .filter(progress => progress.userId === userId);
    
    // Get completed topic IDs
    const completedTopicIds = allUserProgress
      .filter(progress => progress.isCompleted)
      .map(progress => progress.topicId);
    
    // Get all topics user has interacted with
    const userTopicIds = Array.from(new Set(
      allUserProgress.map(progress => progress.topicId)
    ));
    
    // Get those topics
    const userTopics = userTopicIds.map(id => this.topics.get(id)).filter(Boolean) as Topic[];
    
    // Get course IDs user has interacted with
    const userCourseIds = Array.from(new Set(
      userTopics.map(topic => topic.courseId)
    ));
    
    // Calculate progress for each course
    const result = [];
    for (const courseId of userCourseIds) {
      const course = this.courses.get(courseId);
      if (!course) continue;
      
      const courseTopics = Array.from(this.topics.values())
        .filter(topic => topic.courseId === courseId);
      
      const totalTopics = courseTopics.length;
      const completedTopics = courseTopics
        .filter(topic => completedTopicIds.includes(topic.id))
        .length;
      
      // Only include courses that are in progress (not complete and has progress)
      if (completedTopics > 0 && completedTopics < totalTopics) {
        result.push({
          course,
          completedTopics,
          totalTopics
        });
      }
    }
    
    return result;
  }

  // Streak operations
  async getUserStreak(userId: number): Promise<UserStreak | undefined> {
    return Array.from(this.userStreaks.values())
      .find(streak => streak.userId === userId);
  }

  async updateUserStreak(userId: number, streak: number): Promise<UserStreak> {
    const existing = await this.getUserStreak(userId);
    
    if (existing) {
      const updated = { 
        ...existing, 
        currentStreak: streak,
        lastActive: new Date()
      };
      this.userStreaks.set(existing.id, updated);
      return updated;
    }
    
    const id = this.streakId++;
    const newStreak: UserStreak = {
      id,
      userId,
      currentStreak: streak,
      lastActive: new Date(),
      createdAt: new Date()
    };
    this.userStreaks.set(id, newStreak);
    return newStreak;
  }

  // Pomodoro operations
  async createPomodoroSession(session: InsertPomodoroSession): Promise<PomodoroSession> {
    const id = this.sessionId++;
    const newSession: PomodoroSession = { ...session, id, createdAt: new Date() };
    this.pomodoroSessions.set(id, newSession);
    return newSession;
  }

  async getUserPomodoroSessions(userId: number): Promise<PomodoroSession[]> {
    return Array.from(this.pomodoroSessions.values())
      .filter(session => session.userId === userId)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }

  // Task operations
  async getUserTasks(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter(task => task.userId === userId);
  }

  async createTask(task: InsertTask): Promise<Task> {
    const id = this.taskId++;
    const newTask: Task = { ...task, id, createdAt: new Date() };
    this.tasks.set(id, newTask);
    return newTask;
  }

  async updateTask(id: number, taskData: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, ...taskData };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // Quiz operations
  async getQuizzesByTopic(topicId: number): Promise<Quiz[]> {
    return Array.from(this.quizzes.values())
      .filter(quiz => quiz.topicId === topicId);
  }

  async getQuiz(id: number): Promise<Quiz | undefined> {
    return this.quizzes.get(id);
  }

  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    const id = this.quizId++;
    const newQuiz: Quiz = { ...quiz, id, createdAt: new Date() };
    this.quizzes.set(id, newQuiz);
    return newQuiz;
  }

  // Quiz question operations
  async getQuestionsByQuiz(quizId: number): Promise<QuizQuestion[]> {
    return Array.from(this.quizQuestions.values())
      .filter(question => question.quizId === quizId);
  }

  async createQuizQuestion(question: InsertQuizQuestion): Promise<QuizQuestion> {
    const id = this.questionId++;
    const newQuestion: QuizQuestion = { ...question, id, createdAt: new Date() };
    this.quizQuestions.set(id, newQuestion);
    return newQuestion;
  }

  // Quiz attempt operations
  async createQuizAttempt(attempt: InsertUserQuizAttempt): Promise<UserQuizAttempt> {
    const id = this.attemptId++;
    const newAttempt: UserQuizAttempt = { ...attempt, id, createdAt: new Date() };
    this.userQuizAttempts.set(id, newAttempt);
    return newAttempt;
  }

  async getUserQuizAttempts(userId: number, quizId?: number): Promise<UserQuizAttempt[]> {
    let attempts = Array.from(this.userQuizAttempts.values())
      .filter(attempt => attempt.userId === userId);
      
    if (quizId !== undefined) {
      attempts = attempts.filter(attempt => attempt.quizId === quizId);
    }
    
    return attempts.sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
  }

  async saveQuizAnswer(answer: InsertUserQuizAnswer): Promise<UserQuizAnswer> {
    const id = this.answerId++;
    const newAnswer: UserQuizAnswer = { ...answer, id, createdAt: new Date() };
    this.userQuizAnswers.set(id, newAnswer);
    return newAnswer;
  }

  // Achievement operations
  async getAchievements(): Promise<Achievement[]> {
    return Array.from(this.achievements.values());
  }

  async getUserAchievements(userId: number): Promise<{ achievement: Achievement; unlockedAt: Date; }[]> {
    const userAchievements = Array.from(this.userAchievements.values())
      .filter(ua => ua.userId === userId);
      
    return userAchievements.map(ua => {
      const achievement = this.achievements.get(ua.achievementId);
      if (!achievement) {
        throw new Error(`Achievement not found: ${ua.achievementId}`);
      }
      return {
        achievement,
        unlockedAt: ua.unlockedAt
      };
    }).sort((a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime());
  }

  async unlockAchievement(userId: number, achievementId: number): Promise<UserAchievement> {
    // Check if already unlocked
    const existing = Array.from(this.userAchievements.values())
      .find(ua => ua.userId === userId && ua.achievementId === achievementId);
      
    if (existing) {
      return existing;
    }
    
    // Add points to user
    const achievement = this.achievements.get(achievementId);
    if (!achievement) {
      throw new Error(`Achievement not found: ${achievementId}`);
    }
    
    await this.addUserPoints(userId, achievement.points);
    
    // Create new user achievement
    const id = this.userAchievementId++;
    const newUserAchievement: UserAchievement = {
      id,
      userId,
      achievementId,
      unlockedAt: new Date(),
      createdAt: new Date()
    };
    
    this.userAchievements.set(id, newUserAchievement);
    return newUserAchievement;
  }

  // User points operations
  async getUserPoints(userId: number): Promise<UserPoints | undefined> {
    return Array.from(this.userPoints.values())
      .find(points => points.userId === userId);
  }

  async addUserPoints(userId: number, pointsToAdd: number): Promise<UserPoints> {
    const existing = await this.getUserPoints(userId);
    
    if (existing) {
      // Calculate new level based on points
      // Simple level calculation: level = floor(points / 100) + 1
      const newPoints = existing.points + pointsToAdd;
      const newLevel = Math.floor(newPoints / 100) + 1;
      
      const updated: UserPoints = {
        ...existing,
        points: newPoints,
        level: newLevel,
        updatedAt: new Date()
      };
      
      this.userPoints.set(existing.id, updated);
      return updated;
    }
    
    // First time user is earning points
    const id = this.userPointsId++;
    const newUserPoints: UserPoints = {
      id,
      userId,
      points: pointsToAdd,
      level: Math.floor(pointsToAdd / 100) + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.userPoints.set(id, newUserPoints);
    return newUserPoints;
  }
  
  // AI functions
  async generateQuizForTopic(topicId: number): Promise<{ quiz: Quiz; questions: QuizQuestion[]; }> {
    const topic = await this.getTopic(topicId);
    if (!topic) {
      throw new Error(`Topic not found: ${topicId}`);
    }
    
    // Create a new quiz
    const quiz: InsertQuiz = {
      topicId,
      title: `Quiz on ${topic.title}`,
      description: `Test your knowledge on ${topic.title}`,
      difficulty: 1,
      pointsToEarn: 10
    };
    
    const createdQuiz = await this.createQuiz(quiz);
    
    // Generate 5 quiz questions
    const questions: QuizQuestion[] = [];
    
    // Question 1: Multiple choice
    const question1: InsertQuizQuestion = {
      quizId: createdQuiz.id,
      questionText: `What is the main purpose of ${topic.title}?`,
      questionType: QuestionType.MULTIPLE_CHOICE,
      options: [
        'To improve application performance',
        'To enhance security features',
        'To simplify complex processes',
        'To standardize coding practices'
      ],
      correctAnswer: 'To simplify complex processes',
      explanation: `The main purpose of ${topic.title} is to simplify complex processes, making development more efficient.`
    };
    questions.push(await this.createQuizQuestion(question1));
    
    // Question 2: True/False
    const question2: InsertQuizQuestion = {
      quizId: createdQuiz.id,
      questionText: `Is ${topic.title} commonly used in modern web development?`,
      questionType: QuestionType.TRUE_FALSE,
      options: ['True', 'False'],
      correctAnswer: 'True',
      explanation: `Yes, ${topic.title} is widely adopted in modern web development practices.`
    };
    questions.push(await this.createQuizQuestion(question2));
    
    // Question 3: Multiple choice
    const question3: InsertQuizQuestion = {
      quizId: createdQuiz.id,
      questionText: `Which of the following is NOT associated with ${topic.title}?`,
      questionType: QuestionType.MULTIPLE_CHOICE,
      options: [
        'Code reusability',
        'Automated testing',
        'Manual deployment processes',
        'Continuous integration'
      ],
      correctAnswer: 'Manual deployment processes',
      explanation: `${topic.title} promotes automation and efficiency, so manual deployment processes are generally not associated with it.`
    };
    questions.push(await this.createQuizQuestion(question3));
    
    // Question 4: True/False
    const question4: InsertQuizQuestion = {
      quizId: createdQuiz.id,
      questionText: `${topic.title} requires specialized hardware to implement.`,
      questionType: QuestionType.TRUE_FALSE,
      options: ['True', 'False'],
      correctAnswer: 'False',
      explanation: `${topic.title} is a software/methodological approach that doesn't typically require specialized hardware.`
    };
    questions.push(await this.createQuizQuestion(question4));
    
    // Question 5: Multiple choice
    const question5: InsertQuizQuestion = {
      quizId: createdQuiz.id,
      questionText: `Which of these companies is known for pioneering ${topic.title}?`,
      questionType: QuestionType.MULTIPLE_CHOICE,
      options: [
        'Google',
        'Amazon',
        'Microsoft',
        'All of the above'
      ],
      correctAnswer: 'All of the above',
      explanation: `Google, Amazon, and Microsoft have all made significant contributions to the development and adoption of ${topic.title}.`
    };
    questions.push(await this.createQuizQuestion(question5));
    
    return {
      quiz: createdQuiz,
      questions
    };
  }

  // Initialize with sample data
  private initSampleData() {
    // Sample users
    const user1: User = {
      id: this.userId++,
      name: "John Doe",
      email: "john@example.com",
      password: "password123", // In real app, this would be hashed
      age: 28,
      bio: "Passionate learner and tech enthusiast",
      profilePicUrl: "https://i.pravatar.cc/150?u=john",
      googleId: null,
      createdAt: new Date()
    };
    this.users.set(user1.id, user1);

    const user2: User = {
      id: this.userId++,
      name: "Jane Smith",
      email: "jane@example.com",
      password: "password456",
      age: 24,
      bio: "Computer science student",
      profilePicUrl: "https://i.pravatar.cc/150?u=jane",
      googleId: null,
      createdAt: new Date()
    };
    this.users.set(user2.id, user2);

    // Sample courses
    const course1: Course = {
      id: this.courseId++,
      title: "Web Development Fundamentals",
      description: "Learn the basics of web development, including HTML, CSS, and JavaScript",
      imageUrl: "https://cdn.pixabay.com/photo/2016/11/19/14/00/code-1839406_1280.jpg",
      createdAt: new Date()
    };
    this.courses.set(course1.id, course1);

    const course2: Course = {
      id: this.courseId++,
      title: "Data Structures and Algorithms",
      description: "Master the essential computer science concepts for technical interviews",
      imageUrl: "https://cdn.pixabay.com/photo/2016/11/19/22/52/coding-1841550_1280.jpg",
      createdAt: new Date()
    };
    this.courses.set(course2.id, course2);

    const course3: Course = {
      id: this.courseId++,
      title: "Machine Learning Basics",
      description: "Introduction to machine learning concepts and algorithms",
      imageUrl: "https://cdn.pixabay.com/photo/2020/01/22/10/18/ai-4784917_1280.jpg",
      createdAt: new Date()
    };
    this.courses.set(course3.id, course3);
    
    const course4: Course = {
      id: this.courseId++,
      title: "Mobile App Development",
      description: "Learn to build native and cross-platform mobile applications for iOS and Android",
      imageUrl: "https://cdn.pixabay.com/photo/2019/10/09/07/28/development-4536630_1280.png",
      createdAt: new Date()
    };
    this.courses.set(course4.id, course4);
    
    const course5: Course = {
      id: this.courseId++,
      title: "Cybersecurity Essentials",
      description: "Understand fundamental concepts of network security, encryption, and threat analysis",
      imageUrl: "https://cdn.pixabay.com/photo/2017/05/10/22/28/cyber-security-2301976_1280.jpg",
      createdAt: new Date()
    };
    this.courses.set(course5.id, course5);
    
    const course6: Course = {
      id: this.courseId++,
      title: "Cloud Computing and DevOps",
      description: "Learn about cloud services, CI/CD pipelines, and infrastructure as code",
      imageUrl: "https://cdn.pixabay.com/photo/2018/05/16/18/13/cloud-3406627_1280.jpg",
      createdAt: new Date()
    };
    this.courses.set(course6.id, course6);
    
    const course7: Course = {
      id: this.courseId++,
      title: "Blockchain Technology",
      description: "Explore the fundamentals of blockchain, cryptocurrency, and smart contracts",
      imageUrl: "https://cdn.pixabay.com/photo/2018/01/18/07/31/bitcoin-3089728_1280.jpg",
      createdAt: new Date()
    };
    this.courses.set(course7.id, course7);
    
    const course8: Course = {
      id: this.courseId++,
      title: "UI/UX Design Principles",
      description: "Master the art of creating intuitive and user-friendly digital experiences",
      imageUrl: "https://cdn.pixabay.com/photo/2017/10/10/21/47/laptop-2838921_1280.jpg",
      createdAt: new Date()
    };
    this.courses.set(course8.id, course8);
    
    const course9: Course = {
      id: this.courseId++,
      title: "Game Development with Unity",
      description: "Create interactive 2D and 3D games using the Unity game engine",
      imageUrl: "https://cdn.pixabay.com/photo/2021/09/07/07/11/game-6603047_1280.jpg",
      createdAt: new Date()
    };
    this.courses.set(course9.id, course9);
    
    const course10: Course = {
      id: this.courseId++,
      title: "Big Data and Analytics",
      description: "Learn to process, analyze, and derive insights from large datasets",
      imageUrl: "https://cdn.pixabay.com/photo/2017/02/20/14/18/data-2082627_1280.jpg",
      createdAt: new Date()
    };
    this.courses.set(course10.id, course10);

    // Sample topics for course 1 (Web Development)
    const topic1: Topic = {
      id: this.topicId++,
      courseId: course1.id,
      title: "HTML Basics",
      description: "Learn the fundamentals of HTML, the markup language of the web",
      order: 1,
      prerequisites: [],
      createdAt: new Date()
    };
    this.topics.set(topic1.id, topic1);

    const topic2: Topic = {
      id: this.topicId++,
      courseId: course1.id,
      title: "CSS Styling",
      description: "Style your web pages with CSS",
      order: 2,
      prerequisites: [topic1.id],
      createdAt: new Date()
    };
    this.topics.set(topic2.id, topic2);

    const topic3: Topic = {
      id: this.topicId++,
      courseId: course1.id,
      title: "JavaScript Essentials",
      description: "Add interactivity to your web pages with JavaScript",
      order: 3,
      prerequisites: [topic1.id, topic2.id],
      createdAt: new Date()
    };
    this.topics.set(topic3.id, topic3);
    
    const topic3_1: Topic = {
      id: this.topicId++,
      courseId: course1.id,
      title: "Responsive Web Design",
      description: "Create websites that work on all devices using media queries and flexible layouts",
      order: 4,
      prerequisites: [topic2.id],
      createdAt: new Date()
    };
    this.topics.set(topic3_1.id, topic3_1);
    
    const topic3_2: Topic = {
      id: this.topicId++,
      courseId: course1.id,
      title: "Web APIs and AJAX",
      description: "Learn to use JavaScript to communicate with servers and external APIs",
      order: 5,
      prerequisites: [topic3.id],
      createdAt: new Date()
    };
    this.topics.set(topic3_2.id, topic3_2);
    
    const topic3_3: Topic = {
      id: this.topicId++,
      courseId: course1.id,
      title: "Modern Frontend Frameworks",
      description: "Introduction to React, Vue, and Angular for building complex web applications",
      order: 6,
      prerequisites: [topic3.id, topic3_2.id],
      createdAt: new Date()
    };
    this.topics.set(topic3_3.id, topic3_3);
    
    const topic3_4: Topic = {
      id: this.topicId++,
      courseId: course1.id,
      title: "Web Accessibility",
      description: "Make your websites usable by everyone, including people with disabilities",
      order: 7,
      prerequisites: [topic1.id, topic2.id],
      createdAt: new Date()
    };
    this.topics.set(topic3_4.id, topic3_4);
    
    const topic3_5: Topic = {
      id: this.topicId++,
      courseId: course1.id,
      title: "Backend Integration",
      description: "Connect your frontend to backend services and databases",
      order: 8,
      prerequisites: [topic3_2.id, topic3_3.id],
      createdAt: new Date()
    };
    this.topics.set(topic3_5.id, topic3_5);

    // Sample topics for course 2 (Data Structures)
    const topic4: Topic = {
      id: this.topicId++,
      courseId: course2.id,
      title: "Arrays and Strings",
      description: "Fundamentals of array and string manipulation",
      order: 1,
      prerequisites: [],
      createdAt: new Date()
    };
    this.topics.set(topic4.id, topic4);

    const topic5: Topic = {
      id: this.topicId++,
      courseId: course2.id,
      title: "Linked Lists",
      description: "Understanding linked list data structures",
      order: 2,
      prerequisites: [topic4.id],
      createdAt: new Date()
    };
    this.topics.set(topic5.id, topic5);
    
    const topic5_1: Topic = {
      id: this.topicId++,
      courseId: course2.id,
      title: "Stacks and Queues",
      description: "Learn about LIFO and FIFO data structures and their applications",
      order: 3,
      prerequisites: [topic5.id],
      createdAt: new Date()
    };
    this.topics.set(topic5_1.id, topic5_1);
    
    const topic5_2: Topic = {
      id: this.topicId++,
      courseId: course2.id,
      title: "Trees and Graphs",
      description: "Explore hierarchical and network data structures",
      order: 4,
      prerequisites: [topic5.id],
      createdAt: new Date()
    };
    this.topics.set(topic5_2.id, topic5_2);
    
    const topic5_3: Topic = {
      id: this.topicId++,
      courseId: course2.id,
      title: "Sorting Algorithms",
      description: "Master different methods for organizing data efficiently",
      order: 5,
      prerequisites: [topic4.id],
      createdAt: new Date()
    };
    this.topics.set(topic5_3.id, topic5_3);
    
    const topic5_4: Topic = {
      id: this.topicId++,
      courseId: course2.id,
      title: "Dynamic Programming",
      description: "Solve complex problems by breaking them down into simpler subproblems",
      order: 6,
      prerequisites: [topic5_3.id],
      createdAt: new Date()
    };
    this.topics.set(topic5_4.id, topic5_4);
    
    const topic5_5: Topic = {
      id: this.topicId++,
      courseId: course2.id,
      title: "Hash Tables",
      description: "Understand key-value storage for efficient data retrieval",
      order: 7,
      prerequisites: [topic4.id],
      createdAt: new Date()
    };
    this.topics.set(topic5_5.id, topic5_5);
    
    // Topics for Machine Learning Basics (course3)
    const topic6: Topic = {
      id: this.topicId++,
      courseId: course3.id,
      title: "Introduction to Machine Learning",
      description: "Understand the basic concepts, types, and applications of machine learning",
      order: 1,
      prerequisites: [],
      createdAt: new Date()
    };
    this.topics.set(topic6.id, topic6);
    
    const topic7: Topic = {
      id: this.topicId++,
      courseId: course3.id,
      title: "Data Preprocessing",
      description: "Learn techniques for cleaning, transforming, and preparing data for ML models",
      order: 2,
      prerequisites: [topic6.id],
      createdAt: new Date()
    };
    this.topics.set(topic7.id, topic7);
    
    const topic8: Topic = {
      id: this.topicId++,
      courseId: course3.id,
      title: "Supervised Learning",
      description: "Explore classification and regression algorithms with labeled data",
      order: 3,
      prerequisites: [topic7.id],
      createdAt: new Date()
    };
    this.topics.set(topic8.id, topic8);
    
    const topic9: Topic = {
      id: this.topicId++,
      courseId: course3.id,
      title: "Unsupervised Learning",
      description: "Discover patterns and structures in unlabeled data using clustering algorithms",
      order: 4,
      prerequisites: [topic7.id],
      createdAt: new Date()
    };
    this.topics.set(topic9.id, topic9);
    
    const topic10: Topic = {
      id: this.topicId++,
      courseId: course3.id,
      title: "Neural Networks Fundamentals",
      description: "Understand the building blocks of deep learning systems",
      order: 5,
      prerequisites: [topic8.id, topic9.id],
      createdAt: new Date()
    };
    this.topics.set(topic10.id, topic10);
    
    const topic11: Topic = {
      id: this.topicId++,
      courseId: course3.id,
      title: "Model Evaluation",
      description: "Learn methods to assess and improve the performance of ML models",
      order: 6,
      prerequisites: [topic8.id],
      createdAt: new Date()
    };
    this.topics.set(topic11.id, topic11);
    
    // Topics for Mobile App Development (course4)
    const topic12: Topic = {
      id: this.topicId++,
      courseId: course4.id,
      title: "Mobile Platform Fundamentals",
      description: "Understanding iOS and Android ecosystems and architecture",
      order: 1,
      prerequisites: [],
      createdAt: new Date()
    };
    this.topics.set(topic12.id, topic12);
    
    const topic13: Topic = {
      id: this.topicId++,
      courseId: course4.id,
      title: "Native App Development",
      description: "Building iOS apps with Swift and Android apps with Kotlin",
      order: 2,
      prerequisites: [topic12.id],
      createdAt: new Date()
    };
    this.topics.set(topic13.id, topic13);
    
    const topic14: Topic = {
      id: this.topicId++,
      courseId: course4.id,
      title: "Cross-Platform Development",
      description: "Creating mobile apps with React Native and Flutter",
      order: 3,
      prerequisites: [topic12.id],
      createdAt: new Date()
    };
    this.topics.set(topic14.id, topic14);
    
    const topic15: Topic = {
      id: this.topicId++,
      courseId: course4.id,
      title: "Mobile UI/UX Design",
      description: "Principles of creating intuitive and engaging mobile interfaces",
      order: 4,
      prerequisites: [topic12.id],
      createdAt: new Date()
    };
    this.topics.set(topic15.id, topic15);
    
    const topic16: Topic = {
      id: this.topicId++,
      courseId: course4.id,
      title: "Backend Services for Mobile",
      description: "Integrating APIs, databases, and cloud services with mobile apps",
      order: 5,
      prerequisites: [topic13.id, topic14.id],
      createdAt: new Date()
    };
    this.topics.set(topic16.id, topic16);
    
    // Topics for Cybersecurity Essentials (course5)
    const topic17: Topic = {
      id: this.topicId++,
      courseId: course5.id,
      title: "Security Fundamentals",
      description: "Core concepts of information security and cybersecurity",
      order: 1,
      prerequisites: [],
      createdAt: new Date()
    };
    this.topics.set(topic17.id, topic17);
    
    const topic18: Topic = {
      id: this.topicId++,
      courseId: course5.id,
      title: "Network Security",
      description: "Protecting network infrastructure from unauthorized access and attacks",
      order: 2,
      prerequisites: [topic17.id],
      createdAt: new Date()
    };
    this.topics.set(topic18.id, topic18);
    
    const topic19: Topic = {
      id: this.topicId++,
      courseId: course5.id,
      title: "Cryptography",
      description: "Understanding encryption, hashing, and secure communication protocols",
      order: 3,
      prerequisites: [topic17.id],
      createdAt: new Date()
    };
    this.topics.set(topic19.id, topic19);
    
    const topic20: Topic = {
      id: this.topicId++,
      courseId: course5.id,
      title: "Security Assessment",
      description: "Methods for identifying vulnerabilities and testing security measures",
      order: 4,
      prerequisites: [topic18.id, topic19.id],
      createdAt: new Date()
    };
    this.topics.set(topic20.id, topic20);

    // Sample resources
    const resource1: Resource = {
      id: this.resourceId++,
      topicId: topic1.id,
      title: "MDN HTML Guide",
      url: "https://developer.mozilla.org/en-US/docs/Web/HTML",
      type: "web",
      createdAt: new Date()
    };
    this.resources.set(resource1.id, resource1);

    const resource2: Resource = {
      id: this.resourceId++,
      topicId: topic1.id,
      title: "HTML Crash Course",
      url: "https://www.youtube.com/watch?v=UB1O30fR-EE",
      type: "video",
      createdAt: new Date()
    };
    this.resources.set(resource2.id, resource2);

    const resource3: Resource = {
      id: this.resourceId++,
      topicId: topic2.id,
      title: "MDN CSS Reference",
      url: "https://developer.mozilla.org/en-US/docs/Web/CSS",
      type: "web",
      createdAt: new Date()
    };
    this.resources.set(resource3.id, resource3);

    // Sample community notes
    const note1: CommunityNote = {
      id: this.noteId++,
      topicId: topic1.id,
      userId: user1.id,
      content: "Remember to always include doctype at the beginning of your HTML file! ```html\n<!DOCTYPE html>\n```",
      likes: 5,
      dislikes: 0,
      createdAt: new Date()
    };
    this.communityNotes.set(note1.id, note1);

    const note2: CommunityNote = {
      id: this.noteId++,
      topicId: topic2.id,
      userId: user2.id,
      content: "CSS Grid and Flexbox are two powerful layout systems. Here's a quick comparison:\n\n| Feature | Flexbox | Grid |\n| --- | --- | --- |\n| Dimension | 1D | 2D |\n| Item Alignment | Easy | Complex |\n| Use case | Components | Layouts |",
      likes: 3,
      dislikes: 1,
      createdAt: new Date()
    };
    this.communityNotes.set(note2.id, note2);

    // Sample user progress
    const progress1: UserProgress = {
      id: this.progressId++,
      userId: user1.id,
      topicId: topic1.id,
      isCompleted: true,
      completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    };
    this.userProgress.set(progress1.id, progress1);

    const progress2: UserProgress = {
      id: this.progressId++,
      userId: user1.id,
      topicId: topic2.id,
      isCompleted: true,
      completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    };
    this.userProgress.set(progress2.id, progress2);

    const progress3: UserProgress = {
      id: this.progressId++,
      userId: user1.id,
      topicId: topic3.id,
      isCompleted: false,
      completedAt: null,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    };
    this.userProgress.set(progress3.id, progress3);

    // Sample user streaks
    const streak1: UserStreak = {
      id: this.streakId++,
      userId: user1.id,
      currentStreak: 3,
      lastActive: new Date(),
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    };
    this.userStreaks.set(streak1.id, streak1);

    // Sample tasks
    const task1: Task = {
      id: this.taskId++,
      userId: user1.id,
      title: "Complete HTML exercises",
      topicId: topic1.id,
      scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      importance: 2,
      isCompleted: false,
      createdAt: new Date()
    };
    this.tasks.set(task1.id, task1);

    const task2: Task = {
      id: this.taskId++,
      userId: user1.id,
      title: "Build a sample CSS page",
      topicId: topic2.id,
      scheduledDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      importance: 3,
      isCompleted: false,
      createdAt: new Date()
    };
    this.tasks.set(task2.id, task2);
    
    // Sample achievements
    const achievement1: Achievement = {
      id: this.achievementId++,
      title: "Streak Master",
      description: "Maintain a 7-day learning streak",
      type: AchievementType.STREAK,
      threshold: 7,
      points: 100,
      badgeUrl: "https://cdn-icons-png.flaticon.com/512/6941/6941697.png",
      createdAt: new Date()
    };
    this.achievements.set(achievement1.id, achievement1);
    
    const achievement2: Achievement = {
      id: this.achievementId++,
      title: "Topic Explorer",
      description: "Complete 10 topics",
      type: AchievementType.TOPIC_COMPLETION,
      threshold: 10,
      points: 150,
      badgeUrl: "https://cdn-icons-png.flaticon.com/512/2910/2910824.png",
      createdAt: new Date()
    };
    this.achievements.set(achievement2.id, achievement2);
    
    const achievement3: Achievement = {
      id: this.achievementId++,
      title: "Course Champion",
      description: "Complete an entire course",
      type: AchievementType.COURSE_COMPLETION,
      threshold: 1,
      points: 300,
      badgeUrl: "https://cdn-icons-png.flaticon.com/512/2583/2583344.png",
      createdAt: new Date()
    };
    this.achievements.set(achievement3.id, achievement3);
    
    const achievement4: Achievement = {
      id: this.achievementId++,
      title: "Quiz Wizard",
      description: "Achieve perfect scores on 5 quizzes",
      type: AchievementType.PERFECT_SCORE,
      threshold: 5,
      points: 200,
      badgeUrl: "https://cdn-icons-png.flaticon.com/512/2228/2228087.png",
      createdAt: new Date()
    };
    this.achievements.set(achievement4.id, achievement4);
    
    const achievement5: Achievement = {
      id: this.achievementId++,
      title: "Quiz Master",
      description: "Complete 10 quizzes",
      type: AchievementType.QUIZ_MASTERY,
      threshold: 10,
      points: 150,
      badgeUrl: "https://cdn-icons-png.flaticon.com/512/4207/4207253.png",
      createdAt: new Date()
    };
    this.achievements.set(achievement5.id, achievement5);
    
    // Sample quiz for HTML Basics
    const htmlQuiz: Quiz = {
      id: this.quizId++,
      topicId: topic1.id,
      title: "HTML Basics Quiz",
      description: "Test your knowledge of HTML fundamentals",
      difficulty: 1,
      pointsToEarn: 10,
      createdAt: new Date()
    };
    this.quizzes.set(htmlQuiz.id, htmlQuiz);
    
    // Quiz questions for HTML quiz
    const htmlQ1: QuizQuestion = {
      id: this.questionId++,
      quizId: htmlQuiz.id,
      questionText: "What does HTML stand for?",
      questionType: QuestionType.MULTIPLE_CHOICE,
      options: [
        "Hyper Text Markup Language",
        "High Tech Modern Language",
        "Hyper Transfer Markup Language",
        "Hyperlink Text Management Language"
      ],
      correctAnswer: "Hyper Text Markup Language",
      explanation: "HTML stands for Hyper Text Markup Language, which is the standard markup language for creating web pages.",
      createdAt: new Date()
    };
    this.quizQuestions.set(htmlQ1.id, htmlQ1);
    
    const htmlQ2: QuizQuestion = {
      id: this.questionId++,
      quizId: htmlQuiz.id,
      questionText: "Which tag is used to create a hyperlink in HTML?",
      questionType: QuestionType.MULTIPLE_CHOICE,
      options: [
        "<link>",
        "<a>",
        "<href>",
        "<url>"
      ],
      correctAnswer: "<a>",
      explanation: "The <a> (anchor) tag is used to create hyperlinks in HTML, typically with an href attribute that specifies the link's destination.",
      createdAt: new Date()
    };
    this.quizQuestions.set(htmlQ2.id, htmlQ2);
    
    const htmlQ3: QuizQuestion = {
      id: this.questionId++,
      quizId: htmlQuiz.id,
      questionText: "HTML elements are nested within each other.",
      questionType: QuestionType.TRUE_FALSE,
      options: ["True", "False"],
      correctAnswer: "True",
      explanation: "HTML elements can contain other elements, creating a nested structure often referred to as the DOM (Document Object Model).",
      createdAt: new Date()
    };
    this.quizQuestions.set(htmlQ3.id, htmlQ3);
    
    // Sample quiz for JavaScript Essentials
    const jsQuiz: Quiz = {
      id: this.quizId++,
      topicId: topic3.id,
      title: "JavaScript Fundamentals Quiz",
      description: "Test your knowledge of JavaScript basics",
      difficulty: 2,
      pointsToEarn: 15,
      createdAt: new Date()
    };
    this.quizzes.set(jsQuiz.id, jsQuiz);
    
    // Quiz questions for JavaScript quiz
    const jsQ1: QuizQuestion = {
      id: this.questionId++,
      quizId: jsQuiz.id,
      questionText: "Which of these is NOT a JavaScript data type?",
      questionType: QuestionType.MULTIPLE_CHOICE,
      options: [
        "String",
        "Boolean",
        "Integer",
        "Object"
      ],
      correctAnswer: "Integer",
      explanation: "JavaScript doesn't have an Integer type specifically. It has Number, which includes both integers and floating-point values.",
      createdAt: new Date()
    };
    this.quizQuestions.set(jsQ1.id, jsQ1);
    
    const jsQ2: QuizQuestion = {
      id: this.questionId++,
      quizId: jsQuiz.id,
      questionText: "JavaScript is a case-sensitive language.",
      questionType: QuestionType.TRUE_FALSE,
      options: ["True", "False"],
      correctAnswer: "True",
      explanation: "JavaScript is case-sensitive, meaning that 'myVariable' and 'myvariable' would be treated as different variables.",
      createdAt: new Date()
    };
    this.quizQuestions.set(jsQ2.id, jsQ2);
    
    // Grant some achievements to users
    const userAchievement1: UserAchievement = {
      id: this.userAchievementId++,
      userId: user1.id,
      achievementId: achievement1.id,
      unlockedAt: new Date(new Date().setDate(new Date().getDate() - 5)),
      createdAt: new Date(new Date().setDate(new Date().getDate() - 5))
    };
    this.userAchievements.set(userAchievement1.id, userAchievement1);
    
    // Set user points
    const userPoints1: UserPoints = {
      id: this.userPointsId++,
      userId: user1.id,
      points: 250,
      level: 3,
      createdAt: new Date(new Date().setDate(new Date().getDate() - 14)),
      updatedAt: new Date(new Date().setDate(new Date().getDate() - 2))
    };
    this.userPoints.set(userPoints1.id, userPoints1);
    
    const userPoints2: UserPoints = {
      id: this.userPointsId++,
      userId: user2.id,
      points: 100,
      level: 2,
      createdAt: new Date(new Date().setDate(new Date().getDate() - 7)),
      updatedAt: new Date(new Date().setDate(new Date().getDate() - 3))
    };
    this.userPoints.set(userPoints2.id, userPoints2);
  }
}

export const storage = new MemStorage();
