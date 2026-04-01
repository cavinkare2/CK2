import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(), // brand_manager, researcher, leadership, agency
  avatar: text("avatar"),
});

// Research Projects
export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  category: text("category").notNull(),
  region: text("region").notNull(),
  methodology: text("methodology").notNull(), // FGD, IDI, Ethnography, Shop-along
  objective: text("objective").notNull(),
  status: text("status").notNull().default("draft"), // draft, active, analysis, complete, archived
  createdBy: integer("created_by").notNull(),
  createdAt: text("created_at").notNull(),
  respondentCount: integer("respondent_count").default(0),
});

// Discussion Guides
export const discussionGuides = sqliteTable("discussion_guides", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id"),
  name: text("name").notNull(),
  methodology: text("methodology").notNull(),
  version: text("version").notNull().default("1.0"),
  sections: text("sections").notNull(), // JSON array of sections/questions
  createdAt: text("created_at").notNull(),
});

// Recordings / Uploads
export const recordings = sqliteTable("recordings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").notNull(),
  type: text("type").notNull(), // audio, video, text_note, file_upload
  fileName: text("file_name"),
  duration: integer("duration"), // seconds
  location: text("location"),
  respondentProfile: text("respondent_profile"), // JSON
  status: text("status").notNull().default("pending"), // pending, transcribing, transcribed, analyzed
  createdAt: text("created_at").notNull(),
  createdBy: integer("created_by").notNull(),
});

// Transcripts
export const transcripts = sqliteTable("transcripts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  recordingId: integer("recording_id").notNull(),
  projectId: integer("project_id").notNull(),
  language: text("language").notNull(),
  content: text("content").notNull(), // Full transcript text
  speakers: text("speakers"), // JSON array of speaker segments
  sentiment: text("sentiment"), // JSON: { positive, negative, neutral, mixed }
  themes: text("themes"), // JSON array of extracted themes
  verbatims: text("verbatims"), // JSON array of key quotes
  wordFrequency: text("word_frequency"), // JSON object of word counts
  createdAt: text("created_at").notNull(),
});

// Themes (aggregated across transcripts)
export const themes = sqliteTable("themes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(), // pain_point, unmet_need, delight, behavior, perception
  frequency: integer("frequency").notNull().default(1),
  sentiment: text("sentiment").notNull(), // positive, negative, neutral, mixed
  verbatims: text("verbatims"), // JSON array of supporting quotes
  brand: text("brand"),
  region: text("region"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true });
export const insertDiscussionGuideSchema = createInsertSchema(discussionGuides).omit({ id: true });
export const insertRecordingSchema = createInsertSchema(recordings).omit({ id: true });
export const insertTranscriptSchema = createInsertSchema(transcripts).omit({ id: true });
export const insertThemeSchema = createInsertSchema(themes).omit({ id: true });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertDiscussionGuide = z.infer<typeof insertDiscussionGuideSchema>;
export type DiscussionGuide = typeof discussionGuides.$inferSelect;
export type InsertRecording = z.infer<typeof insertRecordingSchema>;
export type Recording = typeof recordings.$inferSelect;
export type InsertTranscript = z.infer<typeof insertTranscriptSchema>;
export type Transcript = typeof transcripts.$inferSelect;
export type InsertTheme = z.infer<typeof insertThemeSchema>;
export type Theme = typeof themes.$inferSelect;
