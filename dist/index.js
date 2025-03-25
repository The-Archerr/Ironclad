// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var QuestionType = {
  MULTIPLE_CHOICE: "multiple_choice",
  TRUE_FALSE: "true_false"
};
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password"),
  age: integer("age"),
  bio: text("bio"),
  profilePicUrl: text("profile_pic_url"),
  googleId: text("google_id").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});
var courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true
});
var topics = pgTable("topics", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  order: integer("order").notNull(),
  prerequisites: json("prerequisites").$type(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertTopicSchema = createInsertSchema(topics).omit({
  id: true,
  createdAt: true
});
var resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  topicId: integer("topic_id").notNull(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  type: text("type").notNull(),
  // "web" or "video"
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertResourceSchema = createInsertSchema(resources).omit({
  id: true,
  createdAt: true
});
var communityNotes = pgTable("community_notes", {
  id: serial("id").primaryKey(),
  topicId: integer("topic_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  likes: integer("likes").default(0).notNull(),
  dislikes: integer("dislikes").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertCommunityNoteSchema = createInsertSchema(communityNotes).omit({
  id: true,
  likes: true,
  dislikes: true,
  createdAt: true
});
var noteVotes = pgTable("note_votes", {
  id: serial("id").primaryKey(),
  noteId: integer("note_id").notNull(),
  userId: integer("user_id").notNull(),
  vote: integer("vote").notNull(),
  // 1 for like, -1 for dislike
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertNoteVoteSchema = createInsertSchema(noteVotes).omit({
  id: true,
  createdAt: true
});
var userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  topicId: integer("topic_id").notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  completedAt: true,
  createdAt: true
});
var userStreaks = pgTable("user_streaks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  currentStreak: integer("current_streak").default(0).notNull(),
  lastActive: timestamp("last_active").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertUserStreakSchema = createInsertSchema(userStreaks).omit({
  id: true,
  createdAt: true
});
var pomodoroSessions = pgTable("pomodoro_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  workMinutes: integer("work_minutes").notNull(),
  breakMinutes: integer("break_minutes").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertPomodoroSessionSchema = createInsertSchema(pomodoroSessions).omit({
  id: true,
  createdAt: true
});
var tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  topicId: integer("topic_id"),
  scheduledDate: timestamp("scheduled_date"),
  dueDate: timestamp("due_date"),
  importance: integer("importance").default(1).notNull(),
  // 1-3 for low, medium, high
  isCompleted: boolean("is_completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true
});
var quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  topicId: integer("topic_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficulty: integer("difficulty").default(1).notNull(),
  // 1=easy, 2=medium, 3=hard
  pointsToEarn: integer("points_to_earn").default(10).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertQuizSchema = createInsertSchema(quizzes).omit({
  id: true,
  createdAt: true
});
var quizQuestions = pgTable("quiz_questions", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").notNull(),
  questionText: text("question_text").notNull(),
  questionType: text("question_type").notNull(),
  // "multiple_choice" or "true_false"
  options: json("options").$type().notNull(),
  // Array of possible answers
  correctAnswer: text("correct_answer").notNull(),
  // For multiple choice, this is one of the options; for true/false, "true" or "false"
  explanation: text("explanation").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertQuizQuestionSchema = createInsertSchema(quizQuestions).omit({
  id: true,
  createdAt: true
});
var userQuizAttempts = pgTable("user_quiz_attempts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  quizId: integer("quiz_id").notNull(),
  score: integer("score").notNull(),
  maxScore: integer("max_score").notNull(),
  completedAt: timestamp("completed_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertUserQuizAttemptSchema = createInsertSchema(userQuizAttempts).omit({
  id: true,
  createdAt: true
});
var userQuizAnswers = pgTable("user_quiz_answers", {
  id: serial("id").primaryKey(),
  attemptId: integer("attempt_id").notNull(),
  questionId: integer("question_id").notNull(),
  userAnswer: text("user_answer").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertUserQuizAnswerSchema = createInsertSchema(userQuizAnswers).omit({
  id: true,
  createdAt: true
});
var AchievementType = {
  STREAK: "streak",
  TOPIC_COMPLETION: "topic_completion",
  COURSE_COMPLETION: "course_completion",
  QUIZ_MASTERY: "quiz_mastery",
  PERFECT_SCORE: "perfect_score"
};
var achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(),
  threshold: integer("threshold").notNull(),
  // e.g., 7 for a 7-day streak, 10 for completing 10 topics
  points: integer("points").notNull(),
  badgeUrl: text("badge_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  createdAt: true
});
var userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  achievementId: integer("achievement_id").notNull(),
  unlockedAt: timestamp("unlocked_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  createdAt: true
});
var userPoints = pgTable("user_points", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  points: integer("points").default(0).notNull(),
  level: integer("level").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var insertUserPointsSchema = createInsertSchema(userPoints).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// server/storage.ts
var MemStorage = class {
  users;
  courses;
  topics;
  resources;
  communityNotes;
  noteVotes;
  userProgress;
  userStreaks;
  pomodoroSessions;
  tasks;
  quizzes;
  quizQuestions;
  userQuizAttempts;
  userQuizAnswers;
  achievements;
  userAchievements;
  userPoints;
  userId;
  courseId;
  topicId;
  resourceId;
  noteId;
  voteId;
  progressId;
  streakId;
  sessionId;
  taskId;
  quizId;
  questionId;
  attemptId;
  answerId;
  achievementId;
  userAchievementId;
  userPointsId;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.courses = /* @__PURE__ */ new Map();
    this.topics = /* @__PURE__ */ new Map();
    this.resources = /* @__PURE__ */ new Map();
    this.communityNotes = /* @__PURE__ */ new Map();
    this.noteVotes = /* @__PURE__ */ new Map();
    this.userProgress = /* @__PURE__ */ new Map();
    this.userStreaks = /* @__PURE__ */ new Map();
    this.pomodoroSessions = /* @__PURE__ */ new Map();
    this.tasks = /* @__PURE__ */ new Map();
    this.quizzes = /* @__PURE__ */ new Map();
    this.quizQuestions = /* @__PURE__ */ new Map();
    this.userQuizAttempts = /* @__PURE__ */ new Map();
    this.userQuizAnswers = /* @__PURE__ */ new Map();
    this.achievements = /* @__PURE__ */ new Map();
    this.userAchievements = /* @__PURE__ */ new Map();
    this.userPoints = /* @__PURE__ */ new Map();
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
    this.initSampleData();
  }
  // User operations
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByEmail(email) {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }
  async getUserByGoogleId(googleId) {
    return Array.from(this.users.values()).find((user) => user.googleId === googleId);
  }
  async createUser(user) {
    const id = this.userId++;
    const newUser = { ...user, id, createdAt: /* @__PURE__ */ new Date() };
    this.users.set(id, newUser);
    return newUser;
  }
  async updateUser(id, userData) {
    const user = this.users.get(id);
    if (!user) return void 0;
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  // Course operations
  async getCourses() {
    return Array.from(this.courses.values());
  }
  async getCourse(id) {
    return this.courses.get(id);
  }
  async getCoursesByIds(ids) {
    return ids.map((id) => this.courses.get(id)).filter(Boolean);
  }
  async createCourse(course) {
    const id = this.courseId++;
    const newCourse = { ...course, id, createdAt: /* @__PURE__ */ new Date() };
    this.courses.set(id, newCourse);
    return newCourse;
  }
  // Topic operations
  async getTopics(courseId) {
    return Array.from(this.topics.values()).filter((topic) => topic.courseId === courseId).sort((a, b) => a.order - b.order);
  }
  async getTopic(id) {
    return this.topics.get(id);
  }
  async createTopic(topic) {
    const id = this.topicId++;
    const newTopic = { ...topic, id, createdAt: /* @__PURE__ */ new Date() };
    this.topics.set(id, newTopic);
    return newTopic;
  }
  // Resource operations
  async getResourcesByTopic(topicId) {
    return Array.from(this.resources.values()).filter((resource) => resource.topicId === topicId);
  }
  async createResource(resource) {
    const id = this.resourceId++;
    const newResource = { ...resource, id, createdAt: /* @__PURE__ */ new Date() };
    this.resources.set(id, newResource);
    return newResource;
  }
  // Community note operations
  async getNotesByTopic(topicId) {
    return Array.from(this.communityNotes.values()).filter((note) => note.topicId === topicId);
  }
  async createNote(note) {
    const id = this.noteId++;
    const newNote = {
      ...note,
      id,
      likes: 0,
      dislikes: 0,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.communityNotes.set(id, newNote);
    return newNote;
  }
  async voteNote(vote) {
    const id = this.voteId++;
    const newVote = { ...vote, id, createdAt: /* @__PURE__ */ new Date() };
    const existingVote = Array.from(this.noteVotes.values()).find((v) => v.noteId === vote.noteId && v.userId === vote.userId);
    if (existingVote) {
      const note = this.communityNotes.get(vote.noteId);
      if (note) {
        if (existingVote.vote === 1) {
          note.likes = Math.max(0, note.likes - 1);
        } else {
          note.dislikes = Math.max(0, note.dislikes - 1);
        }
        if (vote.vote === 1) {
          note.likes += 1;
        } else {
          note.dislikes += 1;
        }
        this.communityNotes.set(note.id, note);
      }
      this.noteVotes.set(existingVote.id, {
        ...existingVote,
        vote: vote.vote
      });
      return this.noteVotes.get(existingVote.id);
    } else {
      this.noteVotes.set(id, newVote);
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
  async getUserTopicProgress(userId, topicId) {
    return Array.from(this.userProgress.values()).find((progress) => progress.userId === userId && progress.topicId === topicId);
  }
  async markTopicComplete(progress) {
    const existing = await this.getUserTopicProgress(progress.userId, progress.topicId);
    if (existing) {
      const updated = {
        ...existing,
        isCompleted: progress.isCompleted,
        completedAt: progress.isCompleted ? /* @__PURE__ */ new Date() : null
      };
      this.userProgress.set(existing.id, updated);
      return updated;
    }
    const id = this.progressId++;
    const newProgress = {
      ...progress,
      id,
      completedAt: progress.isCompleted ? /* @__PURE__ */ new Date() : null,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.userProgress.set(id, newProgress);
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const userStreak = await this.getUserStreak(progress.userId);
    if (userStreak) {
      const lastActiveDate = new Date(userStreak.lastActive);
      lastActiveDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today.getTime() - lastActiveDate.getTime()) / (24 * 60 * 60 * 1e3));
      if (diffDays === 1) {
        await this.updateUserStreak(progress.userId, userStreak.currentStreak + 1);
      } else if (diffDays > 1) {
        await this.updateUserStreak(progress.userId, 1);
      }
    } else {
      await this.updateUserStreak(progress.userId, 1);
    }
    return newProgress;
  }
  async getUserCompletedTopics(userId) {
    return Array.from(this.userProgress.values()).filter((progress) => progress.userId === userId && progress.isCompleted).sort((a, b) => {
      if (a.completedAt && b.completedAt) {
        return b.completedAt.getTime() - a.completedAt.getTime();
      }
      return 0;
    });
  }
  async getUserInProgressCourses(userId) {
    const allUserProgress = Array.from(this.userProgress.values()).filter((progress) => progress.userId === userId);
    const completedTopicIds = allUserProgress.filter((progress) => progress.isCompleted).map((progress) => progress.topicId);
    const userTopicIds = Array.from(new Set(
      allUserProgress.map((progress) => progress.topicId)
    ));
    const userTopics = userTopicIds.map((id) => this.topics.get(id)).filter(Boolean);
    const userCourseIds = Array.from(new Set(
      userTopics.map((topic) => topic.courseId)
    ));
    const result = [];
    for (const courseId of userCourseIds) {
      const course = this.courses.get(courseId);
      if (!course) continue;
      const courseTopics = Array.from(this.topics.values()).filter((topic) => topic.courseId === courseId);
      const totalTopics = courseTopics.length;
      const completedTopics = courseTopics.filter((topic) => completedTopicIds.includes(topic.id)).length;
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
  async getUserStreak(userId) {
    return Array.from(this.userStreaks.values()).find((streak) => streak.userId === userId);
  }
  async updateUserStreak(userId, streak) {
    const existing = await this.getUserStreak(userId);
    if (existing) {
      const updated = {
        ...existing,
        currentStreak: streak,
        lastActive: /* @__PURE__ */ new Date()
      };
      this.userStreaks.set(existing.id, updated);
      return updated;
    }
    const id = this.streakId++;
    const newStreak = {
      id,
      userId,
      currentStreak: streak,
      lastActive: /* @__PURE__ */ new Date(),
      createdAt: /* @__PURE__ */ new Date()
    };
    this.userStreaks.set(id, newStreak);
    return newStreak;
  }
  // Pomodoro operations
  async createPomodoroSession(session) {
    const id = this.sessionId++;
    const newSession = { ...session, id, createdAt: /* @__PURE__ */ new Date() };
    this.pomodoroSessions.set(id, newSession);
    return newSession;
  }
  async getUserPomodoroSessions(userId) {
    return Array.from(this.pomodoroSessions.values()).filter((session) => session.userId === userId).sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }
  // Task operations
  async getUserTasks(userId) {
    return Array.from(this.tasks.values()).filter((task) => task.userId === userId);
  }
  async createTask(task) {
    const id = this.taskId++;
    const newTask = { ...task, id, createdAt: /* @__PURE__ */ new Date() };
    this.tasks.set(id, newTask);
    return newTask;
  }
  async updateTask(id, taskData) {
    const task = this.tasks.get(id);
    if (!task) return void 0;
    const updatedTask = { ...task, ...taskData };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }
  async deleteTask(id) {
    return this.tasks.delete(id);
  }
  // Quiz operations
  async getQuizzesByTopic(topicId) {
    return Array.from(this.quizzes.values()).filter((quiz) => quiz.topicId === topicId);
  }
  async getQuiz(id) {
    return this.quizzes.get(id);
  }
  async createQuiz(quiz) {
    const id = this.quizId++;
    const newQuiz = { ...quiz, id, createdAt: /* @__PURE__ */ new Date() };
    this.quizzes.set(id, newQuiz);
    return newQuiz;
  }
  // Quiz question operations
  async getQuestionsByQuiz(quizId) {
    return Array.from(this.quizQuestions.values()).filter((question) => question.quizId === quizId);
  }
  async createQuizQuestion(question) {
    const id = this.questionId++;
    const newQuestion = { ...question, id, createdAt: /* @__PURE__ */ new Date() };
    this.quizQuestions.set(id, newQuestion);
    return newQuestion;
  }
  // Quiz attempt operations
  async createQuizAttempt(attempt) {
    const id = this.attemptId++;
    const newAttempt = { ...attempt, id, createdAt: /* @__PURE__ */ new Date() };
    this.userQuizAttempts.set(id, newAttempt);
    return newAttempt;
  }
  async getUserQuizAttempts(userId, quizId) {
    let attempts = Array.from(this.userQuizAttempts.values()).filter((attempt) => attempt.userId === userId);
    if (quizId !== void 0) {
      attempts = attempts.filter((attempt) => attempt.quizId === quizId);
    }
    return attempts.sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
  }
  async saveQuizAnswer(answer) {
    const id = this.answerId++;
    const newAnswer = { ...answer, id, createdAt: /* @__PURE__ */ new Date() };
    this.userQuizAnswers.set(id, newAnswer);
    return newAnswer;
  }
  // Achievement operations
  async getAchievements() {
    return Array.from(this.achievements.values());
  }
  async getUserAchievements(userId) {
    const userAchievements3 = Array.from(this.userAchievements.values()).filter((ua) => ua.userId === userId);
    return userAchievements3.map((ua) => {
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
  async unlockAchievement(userId, achievementId) {
    const existing = Array.from(this.userAchievements.values()).find((ua) => ua.userId === userId && ua.achievementId === achievementId);
    if (existing) {
      return existing;
    }
    const achievement = this.achievements.get(achievementId);
    if (!achievement) {
      throw new Error(`Achievement not found: ${achievementId}`);
    }
    await this.addUserPoints(userId, achievement.points);
    const id = this.userAchievementId++;
    const newUserAchievement = {
      id,
      userId,
      achievementId,
      unlockedAt: /* @__PURE__ */ new Date(),
      createdAt: /* @__PURE__ */ new Date()
    };
    this.userAchievements.set(id, newUserAchievement);
    return newUserAchievement;
  }
  // User points operations
  async getUserPoints(userId) {
    return Array.from(this.userPoints.values()).find((points) => points.userId === userId);
  }
  async addUserPoints(userId, pointsToAdd) {
    const existing = await this.getUserPoints(userId);
    if (existing) {
      const newPoints = existing.points + pointsToAdd;
      const newLevel = Math.floor(newPoints / 100) + 1;
      const updated = {
        ...existing,
        points: newPoints,
        level: newLevel,
        updatedAt: /* @__PURE__ */ new Date()
      };
      this.userPoints.set(existing.id, updated);
      return updated;
    }
    const id = this.userPointsId++;
    const newUserPoints = {
      id,
      userId,
      points: pointsToAdd,
      level: Math.floor(pointsToAdd / 100) + 1,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.userPoints.set(id, newUserPoints);
    return newUserPoints;
  }
  // AI functions
  async generateQuizForTopic(topicId) {
    const topic = await this.getTopic(topicId);
    if (!topic) {
      throw new Error(`Topic not found: ${topicId}`);
    }
    const quiz = {
      topicId,
      title: `Quiz on ${topic.title}`,
      description: `Test your knowledge on ${topic.title}`,
      difficulty: 1,
      pointsToEarn: 10
    };
    const createdQuiz = await this.createQuiz(quiz);
    const questions = [];
    const question1 = {
      quizId: createdQuiz.id,
      questionText: `What is the main purpose of ${topic.title}?`,
      questionType: QuestionType.MULTIPLE_CHOICE,
      options: [
        "To improve application performance",
        "To enhance security features",
        "To simplify complex processes",
        "To standardize coding practices"
      ],
      correctAnswer: "To simplify complex processes",
      explanation: `The main purpose of ${topic.title} is to simplify complex processes, making development more efficient.`
    };
    questions.push(await this.createQuizQuestion(question1));
    const question2 = {
      quizId: createdQuiz.id,
      questionText: `Is ${topic.title} commonly used in modern web development?`,
      questionType: QuestionType.TRUE_FALSE,
      options: ["True", "False"],
      correctAnswer: "True",
      explanation: `Yes, ${topic.title} is widely adopted in modern web development practices.`
    };
    questions.push(await this.createQuizQuestion(question2));
    const question3 = {
      quizId: createdQuiz.id,
      questionText: `Which of the following is NOT associated with ${topic.title}?`,
      questionType: QuestionType.MULTIPLE_CHOICE,
      options: [
        "Code reusability",
        "Automated testing",
        "Manual deployment processes",
        "Continuous integration"
      ],
      correctAnswer: "Manual deployment processes",
      explanation: `${topic.title} promotes automation and efficiency, so manual deployment processes are generally not associated with it.`
    };
    questions.push(await this.createQuizQuestion(question3));
    const question4 = {
      quizId: createdQuiz.id,
      questionText: `${topic.title} requires specialized hardware to implement.`,
      questionType: QuestionType.TRUE_FALSE,
      options: ["True", "False"],
      correctAnswer: "False",
      explanation: `${topic.title} is a software/methodological approach that doesn't typically require specialized hardware.`
    };
    questions.push(await this.createQuizQuestion(question4));
    const question5 = {
      quizId: createdQuiz.id,
      questionText: `Which of these companies is known for pioneering ${topic.title}?`,
      questionType: QuestionType.MULTIPLE_CHOICE,
      options: [
        "Google",
        "Amazon",
        "Microsoft",
        "All of the above"
      ],
      correctAnswer: "All of the above",
      explanation: `Google, Amazon, and Microsoft have all made significant contributions to the development and adoption of ${topic.title}.`
    };
    questions.push(await this.createQuizQuestion(question5));
    return {
      quiz: createdQuiz,
      questions
    };
  }
  // Initialize with sample data
  initSampleData() {
    const user1 = {
      id: this.userId++,
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
      // In real app, this would be hashed
      age: 28,
      bio: "Passionate learner and tech enthusiast",
      profilePicUrl: "https://i.pravatar.cc/150?u=john",
      googleId: null,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.users.set(user1.id, user1);
    const user2 = {
      id: this.userId++,
      name: "Jane Smith",
      email: "jane@example.com",
      password: "password456",
      age: 24,
      bio: "Computer science student",
      profilePicUrl: "https://i.pravatar.cc/150?u=jane",
      googleId: null,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.users.set(user2.id, user2);
    const course1 = {
      id: this.courseId++,
      title: "Web Development Fundamentals",
      description: "Learn the basics of web development, including HTML, CSS, and JavaScript",
      imageUrl: "https://cdn.pixabay.com/photo/2016/11/19/14/00/code-1839406_1280.jpg",
      createdAt: /* @__PURE__ */ new Date()
    };
    this.courses.set(course1.id, course1);
    const course2 = {
      id: this.courseId++,
      title: "Data Structures and Algorithms",
      description: "Master the essential computer science concepts for technical interviews",
      imageUrl: "https://cdn.pixabay.com/photo/2016/11/19/22/52/coding-1841550_1280.jpg",
      createdAt: /* @__PURE__ */ new Date()
    };
    this.courses.set(course2.id, course2);
    const course3 = {
      id: this.courseId++,
      title: "Machine Learning Basics",
      description: "Introduction to machine learning concepts and algorithms",
      imageUrl: "https://cdn.pixabay.com/photo/2020/01/22/10/18/ai-4784917_1280.jpg",
      createdAt: /* @__PURE__ */ new Date()
    };
    this.courses.set(course3.id, course3);
    const course4 = {
      id: this.courseId++,
      title: "Mobile App Development",
      description: "Learn to build native and cross-platform mobile applications for iOS and Android",
      imageUrl: "https://cdn.pixabay.com/photo/2019/10/09/07/28/development-4536630_1280.png",
      createdAt: /* @__PURE__ */ new Date()
    };
    this.courses.set(course4.id, course4);
    const course5 = {
      id: this.courseId++,
      title: "Cybersecurity Essentials",
      description: "Understand fundamental concepts of network security, encryption, and threat analysis",
      imageUrl: "https://cdn.pixabay.com/photo/2017/05/10/22/28/cyber-security-2301976_1280.jpg",
      createdAt: /* @__PURE__ */ new Date()
    };
    this.courses.set(course5.id, course5);
    const course6 = {
      id: this.courseId++,
      title: "Cloud Computing and DevOps",
      description: "Learn about cloud services, CI/CD pipelines, and infrastructure as code",
      imageUrl: "https://cdn.pixabay.com/photo/2018/05/16/18/13/cloud-3406627_1280.jpg",
      createdAt: /* @__PURE__ */ new Date()
    };
    this.courses.set(course6.id, course6);
    const course7 = {
      id: this.courseId++,
      title: "Blockchain Technology",
      description: "Explore the fundamentals of blockchain, cryptocurrency, and smart contracts",
      imageUrl: "https://cdn.pixabay.com/photo/2018/01/18/07/31/bitcoin-3089728_1280.jpg",
      createdAt: /* @__PURE__ */ new Date()
    };
    this.courses.set(course7.id, course7);
    const course8 = {
      id: this.courseId++,
      title: "UI/UX Design Principles",
      description: "Master the art of creating intuitive and user-friendly digital experiences",
      imageUrl: "https://cdn.pixabay.com/photo/2017/10/10/21/47/laptop-2838921_1280.jpg",
      createdAt: /* @__PURE__ */ new Date()
    };
    this.courses.set(course8.id, course8);
    const course9 = {
      id: this.courseId++,
      title: "Game Development with Unity",
      description: "Create interactive 2D and 3D games using the Unity game engine",
      imageUrl: "https://cdn.pixabay.com/photo/2021/09/07/07/11/game-6603047_1280.jpg",
      createdAt: /* @__PURE__ */ new Date()
    };
    this.courses.set(course9.id, course9);
    const course10 = {
      id: this.courseId++,
      title: "Big Data and Analytics",
      description: "Learn to process, analyze, and derive insights from large datasets",
      imageUrl: "https://cdn.pixabay.com/photo/2017/02/20/14/18/data-2082627_1280.jpg",
      createdAt: /* @__PURE__ */ new Date()
    };
    this.courses.set(course10.id, course10);
    const topic1 = {
      id: this.topicId++,
      courseId: course1.id,
      title: "HTML Basics",
      description: "Learn the fundamentals of HTML, the markup language of the web",
      order: 1,
      prerequisites: [],
      createdAt: /* @__PURE__ */ new Date()
    };
    this.topics.set(topic1.id, topic1);
    const topic2 = {
      id: this.topicId++,
      courseId: course1.id,
      title: "CSS Styling",
      description: "Style your web pages with CSS",
      order: 2,
      prerequisites: [topic1.id],
      createdAt: /* @__PURE__ */ new Date()
    };
    this.topics.set(topic2.id, topic2);
    const topic3 = {
      id: this.topicId++,
      courseId: course1.id,
      title: "JavaScript Essentials",
      description: "Add interactivity to your web pages with JavaScript",
      order: 3,
      prerequisites: [topic1.id, topic2.id],
      createdAt: /* @__PURE__ */ new Date()
    };
    this.topics.set(topic3.id, topic3);
    const topic3_1 = {
      id: this.topicId++,
      courseId: course1.id,
      title: "Responsive Web Design",
      description: "Create websites that work on all devices using media queries and flexible layouts",
      order: 4,
      prerequisites: [topic2.id],
      createdAt: /* @__PURE__ */ new Date()
    };
    this.topics.set(topic3_1.id, topic3_1);
    const topic3_2 = {
      id: this.topicId++,
      courseId: course1.id,
      title: "Web APIs and AJAX",
      description: "Learn to use JavaScript to communicate with servers and external APIs",
      order: 5,
      prerequisites: [topic3.id],
      createdAt: /* @__PURE__ */ new Date()
    };
    this.topics.set(topic3_2.id, topic3_2);
    const topic3_3 = {
      id: this.topicId++,
      courseId: course1.id,
      title: "Modern Frontend Frameworks",
      description: "Introduction to React, Vue, and Angular for building complex web applications",
      order: 6,
      prerequisites: [topic3.id, topic3_2.id],
      createdAt: /* @__PURE__ */ new Date()
    };
    this.topics.set(topic3_3.id, topic3_3);
    const topic3_4 = {
      id: this.topicId++,
      courseId: course1.id,
      title: "Web Accessibility",
      description: "Make your websites usable by everyone, including people with disabilities",
      order: 7,
      prerequisites: [topic1.id, topic2.id],
      createdAt: /* @__PURE__ */ new Date()
    };
    this.topics.set(topic3_4.id, topic3_4);
    const topic3_5 = {
      id: this.topicId++,
      courseId: course1.id,
      title: "Backend Integration",
      description: "Connect your frontend to backend services and databases",
      order: 8,
      prerequisites: [topic3_2.id, topic3_3.id],
      createdAt: /* @__PURE__ */ new Date()
    };
    this.topics.set(topic3_5.id, topic3_5);
    const topic4 = {
      id: this.topicId++,
      courseId: course2.id,
      title: "Arrays and Strings",
      description: "Fundamentals of array and string manipulation",
      order: 1,
      prerequisites: [],
      createdAt: /* @__PURE__ */ new Date()
    };
    this.topics.set(topic4.id, topic4);
    const topic5 = {
      id: this.topicId++,
      courseId: course2.id,
      title: "Linked Lists",
      description: "Understanding linked list data structures",
      order: 2,
      prerequisites: [topic4.id],
      createdAt: /* @__PURE__ */ new Date()
    };
    this.topics.set(topic5.id, topic5);
    const topic5_1 = {
      id: this.topicId++,
      courseId: course2.id,
      title: "Stacks and Queues",
      description: "Learn about LIFO and FIFO data structures and their applications",
      order: 3,
      prerequisites: [topic5.id],
      createdAt: /* @__PURE__ */ new Date()
    };
    this.topics.set(topic5_1.id, topic5_1);
    const topic5_2 = {
      id: this.topicId++,
      courseId: course2.id,
      title: "Trees and Graphs",
      description: "Explore hierarchical and network data structures",
      order: 4,
      prerequisites: [topic5.id],
      createdAt: /* @__PURE__ */ new Date()
    };
    this.topics.set(topic5_2.id, topic5_2);
    const topic5_3 = {
      id: this.topicId++,
      courseId: course2.id,
      title: "Sorting Algorithms",
      description: "Master different methods for organizing data efficiently",
      order: 5,
      prerequisites: [topic4.id],
      createdAt: /* @__PURE__ */ new Date()
    };
    this.topics.set(topic5_3.id, topic5_3);
    const topic5_4 = {
      id: this.topicId++,
      courseId: course2.id,
      title: "Dynamic Programming",
      description: "Solve complex problems by breaking them down into simpler subproblems",
      order: 6,
      prerequisites: [topic5_3.id],
      createdAt: /* @__PURE__ */ new Date()
    };
    this.topics.set(topic5_4.id, topic5_4);
    const topic5_5 = {
      id: this.topicId++,
      courseId: course2.id,
      title: "Hash Tables",
      description: "Understand key-value storage for efficient data retrieval",
      order: 7,
      prerequisites: [topic4.id],
      createdAt: /* @__PURE__ */ new Date()
    };
    this.topics.set(topic5_5.id, topic5_5);
    const topic6 = {
      id: this.topicId++,
      courseId: course3.id,
      title: "Introduction to Machine Learning",
      description: "Understand the basic concepts, types, and applications of machine learning",
      order: 1,
      prerequisites: [],
      createdAt: /* @__PURE__ */ new Date()
    };
    this.topics.set(topic6.id, topic6);
    const topic7 = {
      id: this.topicId++,
      courseId: course3.id,
      title: "Data Preprocessing",
      description: "Learn techniques for cleaning, transforming, and preparing data for ML models",
      order: 2,
      prerequisites: [topic6.id],
      createdAt: /* @__PURE__ */ new Date()
    };
    this.topics.set(topic7.id, topic7);
    const topic8 = {
      id: this.topicId++,
      courseId: course3.id,
      title: "Supervised Learning",
      description: "Explore classification and regression algorithms with labeled data",
      order: 3,
      prerequisites: [topic7.id],
      createdAt: /* @__PURE__ */ new Date()
    };
    this.topics.set(topic8.id, topic8);
    const topic9 = {
      id: this.topicId++,
      courseId: course3.id,
      title: "Unsupervised Learning",
      description: "Discover patterns and structures in unlabeled data using clustering algorithms",
      order: 4,
      prerequisites: [topic7.id],
      createdAt: /* @__PURE__ */ new Date()
    };
    this.topics.set(topic9.id, topic9);
    const topic10 = {
      id: this.topicId++,
      courseId: course3.id,
      title: "Neural Networks Fundamentals",
      description: "Understand the building blocks of deep learning systems",
      order: 5,
      prerequisites: [topic8.id, topic9.id],
      createdAt: /* @__PURE__ */ new Date()
    };
    this.topics.set(topic10.id, topic10);
    const topic11 = {
      id: this.topicId++,
      courseId: course3.id,
      title: "Model Evaluation",
      description: "Learn methods to assess and improve the performance of ML models",
      order: 6,
      prerequisites: [topic8.id],
      createdAt: /* @__PURE__ */ new Date()
    };
    this.topics.set(topic11.id, topic11);
    const topic12 = {
      id: this.topicId++,
      courseId: course4.id,
      title: "Mobile Platform Fundamentals",
      description: "Understanding iOS and Android ecosystems and architecture",
      order: 1,
      prerequisites: [],
      createdAt: /* @__PURE__ */ new Date()
    };
    this.topics.set(topic12.id, topic12);
    const topic13 = {
      id: this.topicId++,
      courseId: course4.id,
      title: "Native App Development",
      description: "Building iOS apps with Swift and Android apps with Kotlin",
      order: 2,
      prerequisites: [topic12.id],
      createdAt: /* @__PURE__ */ new Date()
    };
    this.topics.set(topic13.id, topic13);
    const topic14 = {
      id: this.topicId++,
      courseId: course4.id,
      title: "Cross-Platform Development",
      description: "Creating mobile apps with React Native and Flutter",
      order: 3,
      prerequisites: [topic12.id],
      createdAt: /* @__PURE__ */ new Date()
    };
    this.topics.set(topic14.id, topic14);
    const topic15 = {
      id: this.topicId++,
      courseId: course4.id,
      title: "Mobile UI/UX Design",
      description: "Principles of creating intuitive and engaging mobile interfaces",
      order: 4,
      prerequisites: [topic12.id],
      createdAt: /* @__PURE__ */ new Date()
    };
    this.topics.set(topic15.id, topic15);
    const topic16 = {
      id: this.topicId++,
      courseId: course4.id,
      title: "Backend Services for Mobile",
      description: "Integrating APIs, databases, and cloud services with mobile apps",
      order: 5,
      prerequisites: [topic13.id, topic14.id],
      createdAt: /* @__PURE__ */ new Date()
    };
    this.topics.set(topic16.id, topic16);
    const topic17 = {
      id: this.topicId++,
      courseId: course5.id,
      title: "Security Fundamentals",
      description: "Core concepts of information security and cybersecurity",
      order: 1,
      prerequisites: [],
      createdAt: /* @__PURE__ */ new Date()
    };
    this.topics.set(topic17.id, topic17);
    const topic18 = {
      id: this.topicId++,
      courseId: course5.id,
      title: "Network Security",
      description: "Protecting network infrastructure from unauthorized access and attacks",
      order: 2,
      prerequisites: [topic17.id],
      createdAt: /* @__PURE__ */ new Date()
    };
    this.topics.set(topic18.id, topic18);
    const topic19 = {
      id: this.topicId++,
      courseId: course5.id,
      title: "Cryptography",
      description: "Understanding encryption, hashing, and secure communication protocols",
      order: 3,
      prerequisites: [topic17.id],
      createdAt: /* @__PURE__ */ new Date()
    };
    this.topics.set(topic19.id, topic19);
    const topic20 = {
      id: this.topicId++,
      courseId: course5.id,
      title: "Security Assessment",
      description: "Methods for identifying vulnerabilities and testing security measures",
      order: 4,
      prerequisites: [topic18.id, topic19.id],
      createdAt: /* @__PURE__ */ new Date()
    };
    this.topics.set(topic20.id, topic20);
    const resource1 = {
      id: this.resourceId++,
      topicId: topic1.id,
      title: "MDN HTML Guide",
      url: "https://developer.mozilla.org/en-US/docs/Web/HTML",
      type: "web",
      createdAt: /* @__PURE__ */ new Date()
    };
    this.resources.set(resource1.id, resource1);
    const resource2 = {
      id: this.resourceId++,
      topicId: topic1.id,
      title: "HTML Crash Course",
      url: "https://www.youtube.com/watch?v=UB1O30fR-EE",
      type: "video",
      createdAt: /* @__PURE__ */ new Date()
    };
    this.resources.set(resource2.id, resource2);
    const resource3 = {
      id: this.resourceId++,
      topicId: topic2.id,
      title: "MDN CSS Reference",
      url: "https://developer.mozilla.org/en-US/docs/Web/CSS",
      type: "web",
      createdAt: /* @__PURE__ */ new Date()
    };
    this.resources.set(resource3.id, resource3);
    const note1 = {
      id: this.noteId++,
      topicId: topic1.id,
      userId: user1.id,
      content: "Remember to always include doctype at the beginning of your HTML file! ```html\n<!DOCTYPE html>\n```",
      likes: 5,
      dislikes: 0,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.communityNotes.set(note1.id, note1);
    const note2 = {
      id: this.noteId++,
      topicId: topic2.id,
      userId: user2.id,
      content: "CSS Grid and Flexbox are two powerful layout systems. Here's a quick comparison:\n\n| Feature | Flexbox | Grid |\n| --- | --- | --- |\n| Dimension | 1D | 2D |\n| Item Alignment | Easy | Complex |\n| Use case | Components | Layouts |",
      likes: 3,
      dislikes: 1,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.communityNotes.set(note2.id, note2);
    const progress1 = {
      id: this.progressId++,
      userId: user1.id,
      topicId: topic1.id,
      isCompleted: true,
      completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3),
      // 7 days ago
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1e3)
    };
    this.userProgress.set(progress1.id, progress1);
    const progress2 = {
      id: this.progressId++,
      userId: user1.id,
      topicId: topic2.id,
      isCompleted: true,
      completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1e3),
      // 3 days ago
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1e3)
    };
    this.userProgress.set(progress2.id, progress2);
    const progress3 = {
      id: this.progressId++,
      userId: user1.id,
      topicId: topic3.id,
      isCompleted: false,
      completedAt: null,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1e3)
    };
    this.userProgress.set(progress3.id, progress3);
    const streak1 = {
      id: this.streakId++,
      userId: user1.id,
      currentStreak: 3,
      lastActive: /* @__PURE__ */ new Date(),
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1e3)
    };
    this.userStreaks.set(streak1.id, streak1);
    const task1 = {
      id: this.taskId++,
      userId: user1.id,
      title: "Complete HTML exercises",
      topicId: topic1.id,
      scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1e3),
      // tomorrow
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1e3),
      // 3 days from now
      importance: 2,
      isCompleted: false,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.tasks.set(task1.id, task1);
    const task2 = {
      id: this.taskId++,
      userId: user1.id,
      title: "Build a sample CSS page",
      topicId: topic2.id,
      scheduledDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1e3),
      // 4 days from now
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3),
      // 7 days from now
      importance: 3,
      isCompleted: false,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.tasks.set(task2.id, task2);
    const achievement1 = {
      id: this.achievementId++,
      title: "Streak Master",
      description: "Maintain a 7-day learning streak",
      type: AchievementType.STREAK,
      threshold: 7,
      points: 100,
      badgeUrl: "https://cdn-icons-png.flaticon.com/512/6941/6941697.png",
      createdAt: /* @__PURE__ */ new Date()
    };
    this.achievements.set(achievement1.id, achievement1);
    const achievement2 = {
      id: this.achievementId++,
      title: "Topic Explorer",
      description: "Complete 10 topics",
      type: AchievementType.TOPIC_COMPLETION,
      threshold: 10,
      points: 150,
      badgeUrl: "https://cdn-icons-png.flaticon.com/512/2910/2910824.png",
      createdAt: /* @__PURE__ */ new Date()
    };
    this.achievements.set(achievement2.id, achievement2);
    const achievement3 = {
      id: this.achievementId++,
      title: "Course Champion",
      description: "Complete an entire course",
      type: AchievementType.COURSE_COMPLETION,
      threshold: 1,
      points: 300,
      badgeUrl: "https://cdn-icons-png.flaticon.com/512/2583/2583344.png",
      createdAt: /* @__PURE__ */ new Date()
    };
    this.achievements.set(achievement3.id, achievement3);
    const achievement4 = {
      id: this.achievementId++,
      title: "Quiz Wizard",
      description: "Achieve perfect scores on 5 quizzes",
      type: AchievementType.PERFECT_SCORE,
      threshold: 5,
      points: 200,
      badgeUrl: "https://cdn-icons-png.flaticon.com/512/2228/2228087.png",
      createdAt: /* @__PURE__ */ new Date()
    };
    this.achievements.set(achievement4.id, achievement4);
    const achievement5 = {
      id: this.achievementId++,
      title: "Quiz Master",
      description: "Complete 10 quizzes",
      type: AchievementType.QUIZ_MASTERY,
      threshold: 10,
      points: 150,
      badgeUrl: "https://cdn-icons-png.flaticon.com/512/4207/4207253.png",
      createdAt: /* @__PURE__ */ new Date()
    };
    this.achievements.set(achievement5.id, achievement5);
    const htmlQuiz = {
      id: this.quizId++,
      topicId: topic1.id,
      title: "HTML Basics Quiz",
      description: "Test your knowledge of HTML fundamentals",
      difficulty: 1,
      pointsToEarn: 10,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.quizzes.set(htmlQuiz.id, htmlQuiz);
    const htmlQ1 = {
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
      createdAt: /* @__PURE__ */ new Date()
    };
    this.quizQuestions.set(htmlQ1.id, htmlQ1);
    const htmlQ2 = {
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
      createdAt: /* @__PURE__ */ new Date()
    };
    this.quizQuestions.set(htmlQ2.id, htmlQ2);
    const htmlQ3 = {
      id: this.questionId++,
      quizId: htmlQuiz.id,
      questionText: "HTML elements are nested within each other.",
      questionType: QuestionType.TRUE_FALSE,
      options: ["True", "False"],
      correctAnswer: "True",
      explanation: "HTML elements can contain other elements, creating a nested structure often referred to as the DOM (Document Object Model).",
      createdAt: /* @__PURE__ */ new Date()
    };
    this.quizQuestions.set(htmlQ3.id, htmlQ3);
    const jsQuiz = {
      id: this.quizId++,
      topicId: topic3.id,
      title: "JavaScript Fundamentals Quiz",
      description: "Test your knowledge of JavaScript basics",
      difficulty: 2,
      pointsToEarn: 15,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.quizzes.set(jsQuiz.id, jsQuiz);
    const jsQ1 = {
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
      createdAt: /* @__PURE__ */ new Date()
    };
    this.quizQuestions.set(jsQ1.id, jsQ1);
    const jsQ2 = {
      id: this.questionId++,
      quizId: jsQuiz.id,
      questionText: "JavaScript is a case-sensitive language.",
      questionType: QuestionType.TRUE_FALSE,
      options: ["True", "False"],
      correctAnswer: "True",
      explanation: "JavaScript is case-sensitive, meaning that 'myVariable' and 'myvariable' would be treated as different variables.",
      createdAt: /* @__PURE__ */ new Date()
    };
    this.quizQuestions.set(jsQ2.id, jsQ2);
    const userAchievement1 = {
      id: this.userAchievementId++,
      userId: user1.id,
      achievementId: achievement1.id,
      unlockedAt: new Date((/* @__PURE__ */ new Date()).setDate((/* @__PURE__ */ new Date()).getDate() - 5)),
      createdAt: new Date((/* @__PURE__ */ new Date()).setDate((/* @__PURE__ */ new Date()).getDate() - 5))
    };
    this.userAchievements.set(userAchievement1.id, userAchievement1);
    const userPoints1 = {
      id: this.userPointsId++,
      userId: user1.id,
      points: 250,
      level: 3,
      createdAt: new Date((/* @__PURE__ */ new Date()).setDate((/* @__PURE__ */ new Date()).getDate() - 14)),
      updatedAt: new Date((/* @__PURE__ */ new Date()).setDate((/* @__PURE__ */ new Date()).getDate() - 2))
    };
    this.userPoints.set(userPoints1.id, userPoints1);
    const userPoints22 = {
      id: this.userPointsId++,
      userId: user2.id,
      points: 100,
      level: 2,
      createdAt: new Date((/* @__PURE__ */ new Date()).setDate((/* @__PURE__ */ new Date()).getDate() - 7)),
      updatedAt: new Date((/* @__PURE__ */ new Date()).setDate((/* @__PURE__ */ new Date()).getDate() - 3))
    };
    this.userPoints.set(userPoints22.id, userPoints22);
  }
};
var storage = new MemStorage();

// server/routes.ts
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
async function registerRoutes(app2) {
  const httpServer = createServer(app2);
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      const user = await storage.createUser(userData);
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
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      const { password: _, ...userWithoutPassword } = user;
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: "Error during login" });
    }
  });
  app2.post("/api/auth/google", async (req, res) => {
    try {
      const { googleId, name, email, profilePicUrl } = req.body;
      if (!googleId || !email) {
        return res.status(400).json({ message: "Google ID and email are required" });
      }
      let user = await storage.getUserByGoogleId(googleId);
      if (!user) {
        user = await storage.getUserByEmail(email);
        if (user) {
          user = await storage.updateUser(user.id, { googleId });
        } else {
          user = await storage.createUser({
            name,
            email,
            googleId,
            profilePicUrl,
            password: null
            // No password for Google auth
          });
        }
      }
      const { password: _, ...userWithoutPassword } = user;
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: "Error during Google authentication" });
    }
  });
  app2.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching user" });
    }
  });
  app2.patch("/api/users/:id", async (req, res) => {
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
      const { password, ...userWithoutPassword } = updatedUser;
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: "Error updating user" });
    }
  });
  app2.get("/api/courses", async (req, res) => {
    try {
      const courses3 = await storage.getCourses();
      return res.status(200).json(courses3);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching courses" });
    }
  });
  app2.get("/api/courses/:id", async (req, res) => {
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
  app2.get("/api/courses/:courseId/topics", async (req, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      if (isNaN(courseId)) {
        return res.status(400).json({ message: "Invalid course ID" });
      }
      const topics3 = await storage.getTopics(courseId);
      return res.status(200).json(topics3);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching topics" });
    }
  });
  app2.get("/api/topics/:id", async (req, res) => {
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
  app2.get("/api/topics/:topicId/resources", async (req, res) => {
    try {
      const topicId = parseInt(req.params.topicId);
      if (isNaN(topicId)) {
        return res.status(400).json({ message: "Invalid topic ID" });
      }
      const resources3 = await storage.getResourcesByTopic(topicId);
      return res.status(200).json(resources3);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching resources" });
    }
  });
  app2.get("/api/topics/:topicId/notes", async (req, res) => {
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
  app2.post("/api/topics/:topicId/notes", async (req, res) => {
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
  app2.post("/api/notes/:noteId/vote", async (req, res) => {
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
  app2.get("/api/users/:userId/progress/:topicId", async (req, res) => {
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
  app2.post("/api/users/:userId/progress", async (req, res) => {
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
  app2.get("/api/users/:userId/completed-topics", async (req, res) => {
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
  app2.get("/api/users/:userId/in-progress-courses", async (req, res) => {
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
  app2.get("/api/users/:userId/streak", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const streak = await storage.getUserStreak(userId);
      if (!streak) {
        return res.status(200).json({ currentStreak: 0, lastActive: /* @__PURE__ */ new Date() });
      }
      return res.status(200).json(streak);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching streak" });
    }
  });
  app2.post("/api/users/:userId/pomodoro-sessions", async (req, res) => {
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
  app2.get("/api/users/:userId/pomodoro-sessions", async (req, res) => {
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
  app2.get("/api/users/:userId/tasks", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const tasks3 = await storage.getUserTasks(userId);
      return res.status(200).json(tasks3);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching tasks" });
    }
  });
  app2.post("/api/users/:userId/tasks", async (req, res) => {
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
  app2.patch("/api/tasks/:id", async (req, res) => {
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
  app2.delete("/api/tasks/:id", async (req, res) => {
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
  app2.get("/api/topics/:topicId/quizzes", async (req, res) => {
    try {
      const topicId = parseInt(req.params.topicId);
      const quizzes3 = await storage.getQuizzesByTopic(topicId);
      res.status(200).json(quizzes3);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quizzes" });
    }
  });
  app2.get("/api/quizzes/:id", async (req, res) => {
    try {
      const quizId = parseInt(req.params.id);
      const quiz = await storage.getQuiz(quizId);
      if (quiz) {
        const questions = await storage.getQuestionsByQuiz(quizId);
        res.status(200).json({ quiz, questions });
      } else {
        res.status(404).json({ error: "Quiz not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quiz" });
    }
  });
  app2.post("/api/topics/:topicId/generate-quiz", async (req, res) => {
    try {
      const topicId = parseInt(req.params.topicId);
      const result = await storage.generateQuizForTopic(topicId);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate quiz" });
    }
  });
  app2.post("/api/quizzes/:quizId/attempt", async (req, res) => {
    try {
      const { userId, score, maxScore, answers } = req.body;
      const quizId = parseInt(req.params.quizId);
      if (!userId || score === void 0 || !maxScore || !answers || !Array.isArray(answers)) {
        return res.status(400).json({ error: "Invalid request body" });
      }
      const attempt = await storage.createQuizAttempt({
        userId,
        quizId,
        score,
        maxScore,
        completedAt: /* @__PURE__ */ new Date()
      });
      const savedAnswers = [];
      for (const answer of answers) {
        savedAnswers.push(await storage.saveQuizAnswer({
          attemptId: attempt.id,
          questionId: answer.questionId,
          userAnswer: answer.userAnswer,
          isCorrect: answer.isCorrect
        }));
      }
      const quiz = await storage.getQuiz(quizId);
      if (quiz) {
        const scorePercentage = score / maxScore;
        const pointsToAward = Math.round(quiz.pointsToEarn * scorePercentage);
        if (pointsToAward > 0) {
          await storage.addUserPoints(userId, pointsToAward);
        }
        if (score === maxScore) {
          const attempts2 = await storage.getUserQuizAttempts(userId);
          const perfectScores = attempts2.filter((a) => a.score === a.maxScore);
          const achievements4 = await storage.getAchievements();
          const perfectScoreAchievement = achievements4.find(
            (a) => a.type === "perfect_score"
          );
          if (perfectScoreAchievement && perfectScores.length >= perfectScoreAchievement.threshold) {
            await storage.unlockAchievement(userId, perfectScoreAchievement.id);
          }
        }
        const attempts = await storage.getUserQuizAttempts(userId);
        const achievements3 = await storage.getAchievements();
        const quizMasteryAchievement = achievements3.find(
          (a) => a.type === "quiz_mastery"
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
  app2.get("/api/users/:userId/quiz-attempts", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const quizId = req.query.quizId ? parseInt(req.query.quizId) : void 0;
      const attempts = await storage.getUserQuizAttempts(userId, quizId);
      res.status(200).json(attempts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quiz attempts" });
    }
  });
  app2.get("/api/achievements", async (req, res) => {
    try {
      const achievements3 = await storage.getAchievements();
      res.status(200).json(achievements3);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch achievements" });
    }
  });
  app2.get("/api/users/:userId/achievements", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const achievements3 = await storage.getUserAchievements(userId);
      res.status(200).json(achievements3);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user achievements" });
    }
  });
  app2.get("/api/users/:userId/points", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const points = await storage.getUserPoints(userId);
      if (points) {
        res.status(200).json(points);
      } else {
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

// server/vite.ts
import express from "express";
import fs from "fs";
import path2, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname2, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "127.0.0.1",
    // reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
