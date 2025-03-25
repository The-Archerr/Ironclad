import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Quiz question type enum
export const QuestionType = {
  MULTIPLE_CHOICE: 'multiple_choice',
  TRUE_FALSE: 'true_false'
} as const;

export type QuestionType = typeof QuestionType[keyof typeof QuestionType];

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password"),
  age: integer("age"),
  bio: text("bio"),
  profilePicUrl: text("profile_pic_url"),
  googleId: text("google_id").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Course model
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
});

// Topic model
export const topics = pgTable("topics", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  order: integer("order").notNull(),
  prerequisites: json("prerequisites").$type<number[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTopicSchema = createInsertSchema(topics).omit({
  id: true,
  createdAt: true,
});

// Resources for topics
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  topicId: integer("topic_id").notNull(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  type: text("type").notNull(), // "web" or "video"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertResourceSchema = createInsertSchema(resources).omit({
  id: true,
  createdAt: true,
});

// Community notes
export const communityNotes = pgTable("community_notes", {
  id: serial("id").primaryKey(),
  topicId: integer("topic_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  likes: integer("likes").default(0).notNull(),
  dislikes: integer("dislikes").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCommunityNoteSchema = createInsertSchema(communityNotes).omit({
  id: true,
  likes: true,
  dislikes: true,
  createdAt: true,
});

// Note votes
export const noteVotes = pgTable("note_votes", {
  id: serial("id").primaryKey(),
  noteId: integer("note_id").notNull(),
  userId: integer("user_id").notNull(),
  vote: integer("vote").notNull(), // 1 for like, -1 for dislike
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNoteVoteSchema = createInsertSchema(noteVotes).omit({
  id: true,
  createdAt: true,
});

// User progress
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  topicId: integer("topic_id").notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  completedAt: true,
  createdAt: true,
});

// User streak
export const userStreaks = pgTable("user_streaks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  currentStreak: integer("current_streak").default(0).notNull(),
  lastActive: timestamp("last_active").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserStreakSchema = createInsertSchema(userStreaks).omit({
  id: true,
  createdAt: true,
});

// Pomodoro sessions
export const pomodoroSessions = pgTable("pomodoro_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  workMinutes: integer("work_minutes").notNull(),
  breakMinutes: integer("break_minutes").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPomodoroSessionSchema = createInsertSchema(pomodoroSessions).omit({
  id: true,
  createdAt: true,
});

// Tasks
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  topicId: integer("topic_id"),
  scheduledDate: timestamp("scheduled_date"),
  dueDate: timestamp("due_date"),
  importance: integer("importance").default(1).notNull(), // 1-3 for low, medium, high
  isCompleted: boolean("is_completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;

export type Topic = typeof topics.$inferSelect;
export type InsertTopic = z.infer<typeof insertTopicSchema>;

export type Resource = typeof resources.$inferSelect;
export type InsertResource = z.infer<typeof insertResourceSchema>;

export type CommunityNote = typeof communityNotes.$inferSelect;
export type InsertCommunityNote = z.infer<typeof insertCommunityNoteSchema>;

export type NoteVote = typeof noteVotes.$inferSelect;
export type InsertNoteVote = z.infer<typeof insertNoteVoteSchema>;

export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;

export type UserStreak = typeof userStreaks.$inferSelect;
export type InsertUserStreak = z.infer<typeof insertUserStreakSchema>;

export type PomodoroSession = typeof pomodoroSessions.$inferSelect;
export type InsertPomodoroSession = z.infer<typeof insertPomodoroSessionSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

// Quiz model
export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  topicId: integer("topic_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficulty: integer("difficulty").default(1).notNull(), // 1=easy, 2=medium, 3=hard
  pointsToEarn: integer("points_to_earn").default(10).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertQuizSchema = createInsertSchema(quizzes).omit({
  id: true,
  createdAt: true,
});

// Quiz questions
export const quizQuestions = pgTable("quiz_questions", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").notNull(),
  questionText: text("question_text").notNull(),
  questionType: text("question_type").notNull(), // "multiple_choice" or "true_false"
  options: json("options").$type<string[]>().notNull(), // Array of possible answers
  correctAnswer: text("correct_answer").notNull(), // For multiple choice, this is one of the options; for true/false, "true" or "false"
  explanation: text("explanation").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertQuizQuestionSchema = createInsertSchema(quizQuestions).omit({
  id: true,
  createdAt: true,
});

// User quiz attempts
export const userQuizAttempts = pgTable("user_quiz_attempts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  quizId: integer("quiz_id").notNull(),
  score: integer("score").notNull(),
  maxScore: integer("max_score").notNull(),
  completedAt: timestamp("completed_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserQuizAttemptSchema = createInsertSchema(userQuizAttempts).omit({
  id: true,
  createdAt: true,
});

// User answers to quiz questions
export const userQuizAnswers = pgTable("user_quiz_answers", {
  id: serial("id").primaryKey(),
  attemptId: integer("attempt_id").notNull(),
  questionId: integer("question_id").notNull(),
  userAnswer: text("user_answer").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserQuizAnswerSchema = createInsertSchema(userQuizAnswers).omit({
  id: true,
  createdAt: true,
});

// Achievement Types
export const AchievementType = {
  STREAK: 'streak',
  TOPIC_COMPLETION: 'topic_completion',
  COURSE_COMPLETION: 'course_completion',
  QUIZ_MASTERY: 'quiz_mastery',
  PERFECT_SCORE: 'perfect_score'
} as const;

export type AchievementType = typeof AchievementType[keyof typeof AchievementType];

// Achievements
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(),
  threshold: integer("threshold").notNull(), // e.g., 7 for a 7-day streak, 10 for completing 10 topics
  points: integer("points").notNull(),
  badgeUrl: text("badge_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  createdAt: true,
});

// User Achievements
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  achievementId: integer("achievement_id").notNull(),
  unlockedAt: timestamp("unlocked_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  createdAt: true,
});

// User Points/XP
export const userPoints = pgTable("user_points", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  points: integer("points").default(0).notNull(),
  level: integer("level").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserPointsSchema = createInsertSchema(userPoints).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type exports for new models
export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;

export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type InsertQuizQuestion = z.infer<typeof insertQuizQuestionSchema>;

export type UserQuizAttempt = typeof userQuizAttempts.$inferSelect;
export type InsertUserQuizAttempt = z.infer<typeof insertUserQuizAttemptSchema>;

export type UserQuizAnswer = typeof userQuizAnswers.$inferSelect;
export type InsertUserQuizAnswer = z.infer<typeof insertUserQuizAnswerSchema>;

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;

export type UserPoints = typeof userPoints.$inferSelect;
export type InsertUserPoints = z.infer<typeof insertUserPointsSchema>;
