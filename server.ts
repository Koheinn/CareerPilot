import express from "express";
import "dotenv/config";
import { createServer as createViteServer } from "vite";
import path from "path";
import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import multer from "multer";
import { PDFParse } from "pdf-parse";

const prisma = new PrismaClient();

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || "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",
  baseURL: "https://api.groq.com/openai/v1",
});

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // Auth Middleware
  const requireAuth = (req: any, res: any, next: any) => {
    let token = req.cookies.token;
    if (!token && req.headers.authorization) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret");
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/server-version", (req, res) => res.json({ version: "v2" }));

  // --- AUTH ROUTES ---
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) return res.status(400).json({ error: "Email exists" });
      
      if (!password || password.length < 8) {
          return res.status(400).json({ error: "Password must be at least 8 characters long" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { name, email, password: hashedPassword }
      });
      
      await prisma.notification.create({
          data: {
              userId: user.id,
              message: "Welcome to AI Resume Coach! Your account has been created."
          }
      });

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "default_secret", { expiresIn: "7d" });
      res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });
      res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return res.status(400).json({ error: "Invalid credentials" });
      
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });
      
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "default_secret", { expiresIn: "7d" });
      res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });
      res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/auth/change-password", requireAuth, async (req: any, res: any) => {
      try {
          const { currentPassword, newPassword } = req.body;
          if (!newPassword || newPassword.length < 8) {
              return res.status(400).json({ error: "New password must be at least 8 characters long" });
          }

          const user = await prisma.user.findUnique({ where: { id: req.user.id } });
          if (!user) return res.status(404).json({ error: "User not found" });

          const isMatch = await bcrypt.compare(currentPassword, user.password);
          if (!isMatch) return res.status(400).json({ error: "Incorrect current password" });

          const hashedPassword = await bcrypt.hash(newPassword, 10);
          await prisma.user.update({
              where: { id: req.user.id },
              data: { password: hashedPassword }
          });

          await prisma.notification.create({
              data: {
                  userId: req.user.id,
                  message: "Your password was changed successfully."
              }
          });

          res.json({ success: true, message: "Password updated successfully" });
      } catch (err: any) {
          res.status(500).json({ error: err.message });
      }
  });

  app.get("/api/auth/me", requireAuth, async (req: any, res: any) => {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { id: true, name: true, email: true } });
      res.json({ user });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ success: true });
  });

  // --- DASHBOARD API ---
  app.get("/api/dashboard/stats", requireAuth, async (req: any, res: any) => {
    try {
        const resumes = await prisma.resume.findMany({ 
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
            take: 10
        });
        const interviews = await prisma.interview.findMany({ 
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
            take: 10
        });
        res.json({ resumes, interviews });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
  });

  // --- NOTIFICATIONS API ---
  app.get("/api/notifications", requireAuth, async (req: any, res: any) => {
      try {
          const notifications = await prisma.notification.findMany({
              where: { userId: req.user.id },
              orderBy: { createdAt: 'desc' },
              take: 20
          });
          res.json({ notifications });
      } catch (err: any) {
          res.status(500).json({ error: err.message });
      }
  });

  app.post("/api/notifications/read", requireAuth, async (req: any, res: any) => {
      try {
          await prisma.notification.updateMany({
              where: { userId: req.user.id, isRead: false },
              data: { isRead: true }
          });
          res.json({ success: true });
      } catch (err: any) {
          res.status(500).json({ error: err.message });
      }
  });

  // --- DASHBOARD HISTORY DELETION API ---
  app.delete("/api/history/:type/:id", requireAuth, async (req: any, res: any) => {
      try {
          const { type, id } = req.params;
          if (type === "resume") {
              await prisma.resume.delete({
                  where: { id: id, userId: req.user.id }
              });
              await prisma.notification.create({
                  data: { userId: req.user.id, message: "A resume analysis record was deleted." }
              });
          } else if (type === "interview") {
              await prisma.interview.delete({
                  where: { id: id, userId: req.user.id }
              });
              await prisma.notification.create({
                  data: { userId: req.user.id, message: "A mock interview record was deleted." }
              });
          } else {
              return res.status(400).json({ error: "Invalid type" });
          }
          res.json({ success: true });
      } catch (err: any) {
          res.status(500).json({ error: err.message });
      }
  });

  // --- RESUME API ---
  app.post("/api/resume/analyze", requireAuth, upload.single("resume"), async (req: any, res: any) => {
    try {
      let content = req.body.content;
      let title = "Pasted Resume";

      if (req.file && req.file.mimetype === "application/pdf") {
          const parser = new PDFParse({ data: req.file.buffer });
          const pdfData = await parser.getText();
          await parser.destroy();
          content = pdfData.text;
          title = req.file.originalname;
      }

      if (!content || content.trim().length === 0) {
          return res.status(400).json({ error: "Missing resume content" });
      }

      // Groq AI Analysis
      const analysisPrompt = `Analyze this resume and provide a concise, professional 3-sentence review highlighting missing skills and areas for improvement: \n\n${content.substring(0, 1500)}`;
      
      let feedback = "Good resume, but could use more quantitative metrics.";
      let score = 75;

      try {
          const feedbackResponse = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [{ role: "user", content: analysisPrompt }],
            max_tokens: 150
          });
          feedback = feedbackResponse.choices[0].message?.content || feedback;

          const scoreResponse = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [{ role: "user", content: `Rate this resume out of 100 based on standard ATS parameters. Respond ONLY with a number between 0 and 100:\n\n${content.substring(0, 1000)}` }],
            max_tokens: 10
          });
          
          const parsedScore = parseInt((scoreResponse.choices[0].message?.content || "").replace(/\D/g, ''));
          if (!isNaN(parsedScore) && parsedScore <= 100 && parsedScore >= 0) {
              score = parsedScore;
          }
      } catch (err) {
          console.error("Groq API Error:", err);
      }

      const savedResume = await prisma.resume.create({
          data: {
              userId: req.user.id,
              title: title,
              content: content,
              score: score,
              feedback: feedback,
          }
      });
      
      await prisma.notification.create({
          data: {
              userId: req.user.id,
              message: `You analyzed a resume: "${title}". Score: ${score}/100.`
          }
      });

      res.json({ score, feedback, id: savedResume.id });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/resume/match", requireAuth, async (req: any, res: any) => {
    try {
      const { resumeContent, jobDescription } = req.body;
      if (!resumeContent || !jobDescription) {
          return res.status(400).json({ error: "Missing content" });
      }

      let feedback = "Strong fit, but missing a few key technologies mentioned in the JD.";
      let matchPercentage = 80;

      try {
          const percentageResponse = await groq.chat.completions.create({
              model: "llama-3.1-8b-instant",
              messages: [{ role: "user", content: `Compare this Resume to this Job Description. Give a match percentage (0-100) between the Resume and JD. Respond ONLY with a number.\n\nResume: ${resumeContent.substring(0, 600)}\n\nJD: ${jobDescription.substring(0, 600)}` }],
              max_tokens: 10
          });
          const parsedMatch = parseInt((percentageResponse.choices[0].message?.content || "").replace(/\D/g, ''));
          if (!isNaN(parsedMatch) && parsedMatch <= 100) matchPercentage = parsedMatch;

          const response = await groq.chat.completions.create({
              model: "llama-3.1-8b-instant",
              messages: [{ role: "user", content: `Compare this Resume to this Job Description. Give a concise analysis of the fit.\n\nResume: ${resumeContent.substring(0, 600)}\n\nJD: ${jobDescription.substring(0, 600)}` }],
              max_tokens: 150
          });
          feedback = response.choices[0].message?.content || feedback;

      } catch (err) {
          console.error("Match Error", err);
      }

      await prisma.notification.create({
          data: {
              userId: req.user.id,
              message: `You matched a resume with a JD. Match score: ${matchPercentage}%.`
          }
      });

      res.json({ matchPercentage, feedback });

    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
  });

  // --- INTERVIEW API ---
  app.post("/api/interview/chat", requireAuth, async (req: any, res: any) => {
    try {
        const { message, history, role } = req.body;
        
        // Format history for the prompt
        let conversation = `You are an expert technical interviewer for a ${role || "Software Engineer"} position. Conduct a professional interview. Ask one question at a time. Evaluate the candidate's last answer briefly before asking the next question.\n\n`;
        if (history && Array.isArray(history)) {
            history.forEach(msg => {
                conversation += `${msg.role === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.content}\n`;
            });
        }
        conversation += `Candidate: ${message}\nInterviewer:`;

        let reply = "Could you tell me more about your recent project?";
        try {
            const hfRes = await groq.chat.completions.create({
                model: "llama-3.1-8b-instant",
                messages: [{ role: "user", content: conversation.substring(conversation.length - 3000) }], // keep context window reasonable
                max_tokens: 200
            });
            reply = hfRes.choices[0].message?.content || reply;
        } catch (err) {
            console.error("Groq Chat Error", err);
        }

        res.json({ reply });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/interview/save", requireAuth, async (req: any, res: any) => {
      // Logic to save the completed interview session
      try {
          const { title, score, feedback } = req.body;
          const interview = await prisma.interview.create({
              data: {
                  userId: req.user.id,
                  title: title || "Mock Interview",
                  score: score || 0,
                  feedback: feedback || ""
              }
          });
          
          await prisma.notification.create({
              data: {
                  userId: req.user.id,
                  message: `You completed a Mock Interview: "${title || "Software Engineer"}". Score: ${score || 0}/100.`
              }
          });

          res.json({ success: true, interview });
      } catch (err: any) {
          res.status(500).json({ error: err.message });
      }
  });


  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
