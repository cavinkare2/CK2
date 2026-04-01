import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProjectSchema, insertDiscussionGuideSchema, insertRecordingSchema, insertTranscriptSchema, insertThemeSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Stats
  app.get("/api/stats", async (_req, res) => {
    const stats = await storage.getStats();
    res.json(stats);
  });

  // Projects
  app.get("/api/projects", async (_req, res) => {
    const all = await storage.getProjects();
    res.json(all);
  });

  app.get("/api/projects/:id", async (req, res) => {
    const project = await storage.getProject(parseInt(req.params.id));
    if (!project) return res.status(404).json({ error: "Not found" });
    res.json(project);
  });

  app.post("/api/projects", async (req, res) => {
    const parsed = insertProjectSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const project = await storage.createProject(parsed.data);
    res.status(201).json(project);
  });

  app.patch("/api/projects/:id/status", async (req, res) => {
    const { status } = req.body;
    const project = await storage.updateProjectStatus(parseInt(req.params.id), status);
    if (!project) return res.status(404).json({ error: "Not found" });
    res.json(project);
  });

  // Discussion Guides
  app.get("/api/discussion-guides", async (_req, res) => {
    const all = await storage.getDiscussionGuides();
    res.json(all);
  });

  app.get("/api/projects/:projectId/discussion-guides", async (req, res) => {
    const guides = await storage.getDiscussionGuidesByProject(parseInt(req.params.projectId));
    res.json(guides);
  });

  app.post("/api/discussion-guides", async (req, res) => {
    const parsed = insertDiscussionGuideSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const guide = await storage.createDiscussionGuide(parsed.data);
    res.status(201).json(guide);
  });

  // Recordings
  app.get("/api/recordings", async (_req, res) => {
    const all = await storage.getRecordings();
    res.json(all);
  });

  app.get("/api/projects/:projectId/recordings", async (req, res) => {
    const recs = await storage.getRecordingsByProject(parseInt(req.params.projectId));
    res.json(recs);
  });

  app.post("/api/recordings", async (req, res) => {
    const parsed = insertRecordingSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const recording = await storage.createRecording(parsed.data);
    res.status(201).json(recording);
  });

  app.patch("/api/recordings/:id/status", async (req, res) => {
    const { status } = req.body;
    const recording = await storage.updateRecordingStatus(parseInt(req.params.id), status);
    if (!recording) return res.status(404).json({ error: "Not found" });
    res.json(recording);
  });

  // Transcripts
  app.get("/api/transcripts", async (_req, res) => {
    const all = await storage.getTranscripts();
    res.json(all);
  });

  app.get("/api/projects/:projectId/transcripts", async (req, res) => {
    const trans = await storage.getTranscriptsByProject(parseInt(req.params.projectId));
    res.json(trans);
  });

  app.post("/api/transcripts", async (req, res) => {
    const parsed = insertTranscriptSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const transcript = await storage.createTranscript(parsed.data);
    res.status(201).json(transcript);
  });

  // Themes
  app.get("/api/themes", async (_req, res) => {
    const all = await storage.getThemes();
    res.json(all);
  });

  app.get("/api/projects/:projectId/themes", async (req, res) => {
    const all = await storage.getThemesByProject(parseInt(req.params.projectId));
    res.json(all);
  });

  app.post("/api/themes", async (req, res) => {
    const parsed = insertThemeSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const theme = await storage.createTheme(parsed.data);
    res.status(201).json(theme);
  });

  // Seed demo data
  app.post("/api/seed", async (_req, res) => {
    try {
      // Create demo projects
      const demoBrands = ["Meera", "Chik", "KESH KING", "Spinz", "Nyle", "Garden"];
      const methodologies = ["FGD", "IDI", "Ethnography", "Shop-along"];
      const statuses = ["active", "analysis", "complete", "active", "draft", "active"];
      const regions = ["Tamil Nadu", "Karnataka", "Andhra Pradesh", "Maharashtra", "West Bengal", "Kerala"];
      const categories = ["Hair Care", "Hair Care", "Hair Care", "Personal Care", "Hair Care", "Food"];

      for (let i = 0; i < 6; i++) {
        await storage.createProject({
          name: `${demoBrands[i]} Consumer Immersion Q1 2026`,
          brand: demoBrands[i],
          category: categories[i],
          region: regions[i],
          methodology: methodologies[i % 4],
          objective: `Understand consumer behavior and preferences for ${demoBrands[i]} products in ${regions[i]}`,
          status: statuses[i],
          createdBy: 1,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          respondentCount: Math.floor(Math.random() * 30) + 8,
        });
      }

      // Create recordings
      const types = ["audio", "video", "text_note", "audio"];
      for (let i = 1; i <= 6; i++) {
        for (let j = 0; j < 3; j++) {
          await storage.createRecording({
            projectId: i,
            type: types[j % 4],
            fileName: types[j % 4] === "text_note" ? null : `recording_${i}_${j + 1}.${types[j % 4] === "audio" ? "mp3" : "mp4"}`,
            duration: Math.floor(Math.random() * 3600) + 600,
            location: regions[i - 1],
            respondentProfile: JSON.stringify({
              sec: ["A1", "A2", "B1", "B2"][Math.floor(Math.random() * 4)],
              age: Math.floor(Math.random() * 30) + 20,
              gender: Math.random() > 0.5 ? "Female" : "Male",
            }),
            status: "transcribed",
            createdAt: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000).toISOString(),
            createdBy: 1,
          });
        }
      }

      // Create transcripts with themes and sentiment
      const sampleThemes = [
        ["Fragrance longevity", "Hair smoothness", "Price sensitivity", "Packaging convenience", "Natural ingredients"],
        ["Dandruff control", "Scalp health", "Affordable pricing", "Competitor comparison", "Daily use suitability"],
        ["Hair fall reduction", "Ayurvedic trust", "Visible results timeline", "Family recommendation", "Oil vs shampoo preference"],
        ["Skin glow", "UV protection", "Affordable luxury", "Social media influence", "Seasonal usage"],
        ["Herbal positioning", "Hair strength", "Chemical-free perception", "Traditional remedy trust", "Modern lifestyle fit"],
        ["Taste preference", "Health consciousness", "Cooking convenience", "Brand loyalty", "Price comparison"],
      ];

      const sentiments = [
        { positive: 45, negative: 15, neutral: 30, mixed: 10 },
        { positive: 35, negative: 25, neutral: 25, mixed: 15 },
        { positive: 50, negative: 10, neutral: 30, mixed: 10 },
        { positive: 40, negative: 20, neutral: 25, mixed: 15 },
        { positive: 55, negative: 10, neutral: 25, mixed: 10 },
        { positive: 30, negative: 20, neutral: 35, mixed: 15 },
      ];

      for (let i = 1; i <= 6; i++) {
        for (let j = 1; j <= 3; j++) {
          const recId = (i - 1) * 3 + j;
          await storage.createTranscript({
            recordingId: recId,
            projectId: i,
            language: ["English", "Tamil", "Hindi", "Telugu", "Kannada", "Malayalam"][i - 1],
            content: `This is a sample transcript for project ${i}, recording ${j}. The consumer shared detailed insights about their experience with the product, including usage patterns, preferences, and suggestions for improvement.`,
            speakers: JSON.stringify([
              { name: "Moderator", segments: 15 },
              { name: `Respondent ${j}`, segments: 25 },
            ]),
            sentiment: JSON.stringify(sentiments[i - 1]),
            themes: JSON.stringify(sampleThemes[i - 1].slice(0, 3)),
            verbatims: JSON.stringify([
              `"I really love the fragrance, it stays for a long time"`,
              `"The price is a bit high compared to what I used before"`,
              `"I switched from the competitor because my friend recommended it"`,
            ]),
            wordFrequency: JSON.stringify({
              fragrance: 18, quality: 15, price: 12, smooth: 10, natural: 9,
              recommend: 8, daily: 7, family: 6, trust: 5, result: 5,
            }),
            createdAt: new Date().toISOString(),
          });
        }
      }

      // Create themes
      const themeCategories = ["pain_point", "unmet_need", "delight", "behavior", "perception"];
      const themeSentiments = ["negative", "neutral", "positive", "neutral", "positive"];
      for (let i = 1; i <= 6; i++) {
        for (let j = 0; j < sampleThemes[i - 1].length; j++) {
          await storage.createTheme({
            projectId: i,
            name: sampleThemes[i - 1][j],
            category: themeCategories[j % 5],
            frequency: Math.floor(Math.random() * 20) + 5,
            sentiment: themeSentiments[j % 5],
            verbatims: JSON.stringify([`"Sample verbatim for ${sampleThemes[i - 1][j]}"`]),
            brand: demoBrands[i - 1],
            region: regions[i - 1],
          });
        }
      }

      // Create discussion guides
      const guideNames = ["FGD Discussion Guide", "IDI Semi-structured Guide", "Ethnography Observation Checklist", "Shop-along Protocol"];
      for (let i = 0; i < 4; i++) {
        await storage.createDiscussionGuide({
          projectId: i + 1,
          name: guideNames[i],
          methodology: methodologies[i],
          version: "1.0",
          sections: JSON.stringify([
            { title: "Introduction & Warm-up", questions: ["Introduce yourself", "What brands do you use daily?"] },
            { title: "Usage & Habits", questions: ["Walk me through your morning routine", "How do you choose products?"] },
            { title: "Brand Perception", questions: ["What comes to mind when you think of this brand?", "How does it compare to others?"] },
            { title: "Pain Points & Needs", questions: ["What frustrates you about current products?", "What would your ideal product look like?"] },
            { title: "Wrap-up", questions: ["Any final thoughts?", "Would you recommend this to friends?"] },
          ]),
          createdAt: new Date().toISOString(),
        });
      }

      res.json({ success: true, message: "Demo data seeded" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  return httpServer;
}
