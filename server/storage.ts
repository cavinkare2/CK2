import {
  type User, type InsertUser, users,
  type Project, type InsertProject, projects,
  type DiscussionGuide, type InsertDiscussionGuide, discussionGuides,
  type Recording, type InsertRecording, recordings,
  type Transcript, type InsertTranscript, transcripts,
  type Theme, type InsertTheme, themes,
} from "@shared/schema";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, desc, sql } from "drizzle-orm";

const sqlite = new Database("data.db");
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite);

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Projects
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProjectStatus(id: number, status: string): Promise<Project | undefined>;

  // Discussion Guides
  getDiscussionGuides(): Promise<DiscussionGuide[]>;
  getDiscussionGuidesByProject(projectId: number): Promise<DiscussionGuide[]>;
  createDiscussionGuide(guide: InsertDiscussionGuide): Promise<DiscussionGuide>;

  // Recordings
  getRecordings(): Promise<Recording[]>;
  getRecordingsByProject(projectId: number): Promise<Recording[]>;
  createRecording(recording: InsertRecording): Promise<Recording>;
  updateRecordingStatus(id: number, status: string): Promise<Recording | undefined>;

  // Transcripts
  getTranscripts(): Promise<Transcript[]>;
  getTranscriptsByProject(projectId: number): Promise<Transcript[]>;
  getTranscriptByRecording(recordingId: number): Promise<Transcript | undefined>;
  createTranscript(transcript: InsertTranscript): Promise<Transcript>;

  // Themes
  getThemes(): Promise<Theme[]>;
  getThemesByProject(projectId: number): Promise<Theme[]>;
  createTheme(theme: InsertTheme): Promise<Theme>;

  // Stats
  getStats(): Promise<{
    totalProjects: number;
    activeStudies: number;
    totalTranscripts: number;
    totalHours: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number) {
    return db.select().from(users).where(eq(users.id, id)).get();
  }
  async getUserByUsername(username: string) {
    return db.select().from(users).where(eq(users.username, username)).get();
  }
  async createUser(insertUser: InsertUser) {
    return db.insert(users).values(insertUser).returning().get();
  }

  // Projects
  async getProjects() {
    return db.select().from(projects).orderBy(desc(projects.id)).all();
  }
  async getProject(id: number) {
    return db.select().from(projects).where(eq(projects.id, id)).get();
  }
  async createProject(project: InsertProject) {
    return db.insert(projects).values(project).returning().get();
  }
  async updateProjectStatus(id: number, status: string) {
    return db.update(projects).set({ status }).where(eq(projects.id, id)).returning().get();
  }

  // Discussion Guides
  async getDiscussionGuides() {
    return db.select().from(discussionGuides).orderBy(desc(discussionGuides.id)).all();
  }
  async getDiscussionGuidesByProject(projectId: number) {
    return db.select().from(discussionGuides).where(eq(discussionGuides.projectId, projectId)).all();
  }
  async createDiscussionGuide(guide: InsertDiscussionGuide) {
    return db.insert(discussionGuides).values(guide).returning().get();
  }

  // Recordings
  async getRecordings() {
    return db.select().from(recordings).orderBy(desc(recordings.id)).all();
  }
  async getRecordingsByProject(projectId: number) {
    return db.select().from(recordings).where(eq(recordings.projectId, projectId)).all();
  }
  async createRecording(recording: InsertRecording) {
    return db.insert(recordings).values(recording).returning().get();
  }
  async updateRecordingStatus(id: number, status: string) {
    return db.update(recordings).set({ status }).where(eq(recordings.id, id)).returning().get();
  }

  // Transcripts
  async getTranscripts() {
    return db.select().from(transcripts).orderBy(desc(transcripts.id)).all();
  }
  async getTranscriptsByProject(projectId: number) {
    return db.select().from(transcripts).where(eq(transcripts.projectId, projectId)).all();
  }
  async getTranscriptByRecording(recordingId: number) {
    return db.select().from(transcripts).where(eq(transcripts.recordingId, recordingId)).get();
  }
  async createTranscript(transcript: InsertTranscript) {
    return db.insert(transcripts).values(transcript).returning().get();
  }

  // Themes
  async getThemes() {
    return db.select().from(themes).orderBy(desc(themes.frequency)).all();
  }
  async getThemesByProject(projectId: number) {
    return db.select().from(themes).where(eq(themes.projectId, projectId)).all();
  }
  async createTheme(theme: InsertTheme) {
    return db.insert(themes).values(theme).returning().get();
  }

  // Stats
  async getStats() {
    const totalProjects = db.select({ count: sql<number>`count(*)` }).from(projects).get()?.count ?? 0;
    const activeStudies = db.select({ count: sql<number>`count(*)` }).from(projects).where(eq(projects.status, "active")).get()?.count ?? 0;
    const totalTranscripts = db.select({ count: sql<number>`count(*)` }).from(transcripts).get()?.count ?? 0;
    const totalDuration = db.select({ total: sql<number>`coalesce(sum(duration), 0)` }).from(recordings).get()?.total ?? 0;
    return {
      totalProjects,
      activeStudies,
      totalTranscripts,
      totalHours: Math.round(totalDuration / 3600 * 10) / 10,
    };
  }
}

export const storage = new DatabaseStorage();
