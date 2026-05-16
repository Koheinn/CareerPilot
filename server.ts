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
import { Resend } from "resend";
//import * as admin from "firebase-admin";
import { createRequire } from "module";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const require = createRequire(import.meta.url);

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "{}");

// ── Init Firebase Admin ────────────────────────────────────────
if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const prisma = new PrismaClient();

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const resend = new Resend(process.env.RESEND_API_KEY);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

const JWT_SECRET = process.env.JWT_SECRET || "change_me_in_production";
const IS_PROD = process.env.NODE_ENV === "production";

// ── OTP helpers ────────────────────────────────────────────────
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || "3000", 10);

  app.use(express.json({ limit: "2mb" }));
  app.use(cookieParser());

  // Security headers
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    next();
  });

  // ── Auth Middleware ──────────────────────────────────────────
  const requireAuth = (req: any, res: any, next: any) => {
    let token = req.cookies?.token;
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
      req.user = jwt.verify(token, JWT_SECRET);
      next();
    } catch {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  // ── Health ───────────────────────────────────────────────────
  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

  // ── AUTH ROUTES ──────────────────────────────────────────────
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, password } = req.body;
      if (!name?.trim() || !email?.trim() || !password)
        return res.status(400).json({ error: "All fields are required" });
      if (password.length < 8)
        return res.status(400).json({ error: "Password must be at least 8 characters" });

      const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
      if (existing) return res.status(400).json({ error: "Email already registered" });

      const hashed = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({
        data: { name: name.trim(), email: email.toLowerCase(), password: hashed },
      });

      await prisma.notification.create({
        data: { userId: user.id, message: "Welcome to CareerPilot AI! Your account has been created." },
      });

      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
      res.cookie("token", token, { httpOnly: true, secure: IS_PROD, sameSite: IS_PROD ? "none" : "lax" });
      res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (err: any) {
      console.error("Register error:", err);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email?.trim() || !password)
        return res.status(400).json({ error: "Email and password are required" });

      const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
      if (!user || !user.password)
        return res.status(400).json({ error: "Invalid credentials" });

      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(400).json({ error: "Invalid credentials" });

      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
      res.cookie("token", token, { httpOnly: true, secure: IS_PROD, sameSite: IS_PROD ? "none" : "lax" });
      res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (err: any) {
      console.error("Login error:", err);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // ── Google OAuth (Firebase ID token verify) ──────────────────
  app.post("/api/auth/google", async (req, res) => {
    try {
      const { idToken } = req.body;
      if (!idToken) return res.status(400).json({ error: "Missing ID token" });

      const decoded = await getAuth().verifyIdToken(idToken);
      const { uid, email, name, picture } = decoded;

      if (!email) return res.status(400).json({ error: "No email in Google account" });

      let user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: email.toLowerCase(),
            name: name || email.split("@")[0],
            password: await bcrypt.hash(uid + JWT_SECRET, 12), // non-usable password
            googleId: uid,
          },
        });
        await prisma.notification.create({
          data: { userId: user.id, message: "Welcome to CareerPilot AI! Signed in with Google." },
        });
      } else if (!user.googleId) {
        await prisma.user.update({ where: { id: user.id }, data: { googleId: uid } });
      }

      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
      res.cookie("token", token, { httpOnly: true, secure: IS_PROD, sameSite: IS_PROD ? "none" : "lax" });
      res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (err: any) {
      console.error("Google auth error:", err);
      res.status(401).json({ error: "Google authentication failed" });
    }
  });

  // ── Forgot Password — Send OTP ───────────────────────────────
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email?.trim()) return res.status(400).json({ error: "Email is required" });

      const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
      // Always return success to prevent email enumeration
      if (!user) return res.json({ success: true });

      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await prisma.user.update({
        where: { id: user.id },
        data: { otpCode: otp, otpExpiresAt: expiresAt },
      });

      await resend.emails.send({
        from: "CareerPilot AI <onboarding@resend.dev>",
        to: user.email,
        subject: "Your CareerPilot Password Reset Code",
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#0a0a0a;color:#e0e0e0;padding:32px;border-radius:16px;border:1px solid rgba(255,255,255,0.1)">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px">
              <div style="width:36px;height:36px;border-radius:8px;background:linear-gradient(135deg,#6366f1,#22d3ee);display:flex;align-items:center;justify-content:center">
                <div style="width:16px;height:16px;border:2px solid white;border-radius:50%"></div>
              </div>
              <span style="font-size:18px;font-weight:700;color:white">CareerPilot AI</span>
            </div>
            <h2 style="color:white;margin:0 0 8px">Password Reset</h2>
            <p style="color:#94a3b8;margin:0 0 24px">Use the code below to reset your password. It expires in <strong style="color:#e0e0e0">10 minutes</strong>.</p>
            <div style="background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.3);border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
              <span style="font-size:40px;font-weight:900;letter-spacing:12px;color:white">${otp}</span>
            </div>
            <p style="color:#64748b;font-size:13px;margin:0">If you didn't request this, you can safely ignore this email.</p>
          </div>
        `,
      });

      res.json({ success: true });
    } catch (err: any) {
      console.error("Forgot password error:", err);
      res.status(500).json({ error: "Failed to send reset email" });
    }
  });

  // ── Forgot Password — Verify OTP & Reset ────────────────────
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { email, otp, newPassword } = req.body;
      if (!email?.trim() || !otp?.trim() || !newPassword)
        return res.status(400).json({ error: "All fields are required" });
      if (newPassword.length < 8)
        return res.status(400).json({ error: "Password must be at least 8 characters" });

      const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
      if (!user || !user.otpCode || !user.otpExpiresAt)
        return res.status(400).json({ error: "Invalid or expired code" });

      if (user.otpCode !== otp.trim())
        return res.status(400).json({ error: "Incorrect code" });

      if (new Date() > user.otpExpiresAt)
        return res.status(400).json({ error: "Code has expired. Please request a new one." });

      const hashed = await bcrypt.hash(newPassword, 12);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashed, otpCode: null, otpExpiresAt: null },
      });

      res.json({ success: true });
    } catch (err: any) {
      console.error("Reset password error:", err);
      res.status(500).json({ error: "Password reset failed" });
    }
  });

  app.post("/api/auth/change-password", requireAuth, async (req: any, res: any) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!newPassword || newPassword.length < 8)
        return res.status(400).json({ error: "New password must be at least 8 characters" });

      const user = await prisma.user.findUnique({ where: { id: req.user.id } });
      if (!user) return res.status(404).json({ error: "User not found" });

      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) return res.status(400).json({ error: "Incorrect current password" });

      const hashed = await bcrypt.hash(newPassword, 12);
      await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });

      await prisma.notification.create({
        data: { userId: req.user.id, message: "Your password was changed successfully." },
      });

      res.json({ success: true });
    } catch (err: any) {
      console.error("Change password error:", err);
      res.status(500).json({ error: "Failed to change password" });
    }
  });

  app.get("/api/auth/me", requireAuth, async (req: any, res: any) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { id: true, name: true, email: true },
      });
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json({ user });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.post("/api/auth/logout", (_req, res) => {
    res.clearCookie("token");
    res.json({ success: true });
  });

  // ── DASHBOARD ────────────────────────────────────────────────
  app.get("/api/dashboard/stats", requireAuth, async (req: any, res: any) => {
    try {
      const [resumes, interviews] = await Promise.all([
        prisma.resume.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: "desc" }, take: 10 }),
        prisma.interview.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: "desc" }, take: 10 }),
      ]);
      res.json({ resumes, interviews });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // ── NOTIFICATIONS ────────────────────────────────────────────
  app.get("/api/notifications", requireAuth, async (req: any, res: any) => {
    try {
      const notifications = await prisma.notification.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      });
      res.json({ notifications });
    } catch {
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.post("/api/notifications/read", requireAuth, async (req: any, res: any) => {
    try {
      await prisma.notification.updateMany({
        where: { userId: req.user.id, isRead: false },
        data: { isRead: true },
      });
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: "Failed to mark notifications" });
    }
  });

  // ── HISTORY DELETION ─────────────────────────────────────────
  app.delete("/api/history/:type/:id", requireAuth, async (req: any, res: any) => {
    try {
      const { type, id } = req.params;
      if (type === "resume") {
        await prisma.resume.delete({ where: { id, userId: req.user.id } });
        await prisma.notification.create({ data: { userId: req.user.id, message: "A resume analysis record was deleted." } });
      } else if (type === "interview") {
        await prisma.interview.delete({ where: { id, userId: req.user.id } });
        await prisma.notification.create({ data: { userId: req.user.id, message: "A mock interview record was deleted." } });
      } else {
        return res.status(400).json({ error: "Invalid type" });
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to delete record" });
    }
  });

  // ── RESUME ANALYZE ───────────────────────────────────────────
  app.post("/api/resume/analyze", requireAuth, upload.single("resume"), async (req: any, res: any) => {
    try {
      let content = req.body.content as string;
      let title = "Pasted Resume";

      if (req.file?.mimetype === "application/pdf") {
        const parser = new PDFParse({ data: req.file.buffer });
        const pdfData = await parser.getText();
        await parser.destroy();
        content = pdfData.text;
        title = req.file.originalname;
      }

      if (!content?.trim()) return res.status(400).json({ error: "Missing resume content" });

      let feedback = "Good resume, but could use more quantitative metrics.";
      let score = 75;

      try {
        const [feedbackRes, scoreRes] = await Promise.all([
          groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [{ role: "user", content: `Analyze this resume and provide a concise, professional 3-sentence review highlighting missing skills and areas for improvement:\n\n${content.substring(0, 1500)}` }],
            max_tokens: 200,
          }),
          groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [{ role: "user", content: `Rate this resume out of 100 based on standard ATS parameters. Respond ONLY with a number between 0 and 100:\n\n${content.substring(0, 1000)}` }],
            max_tokens: 10,
          }),
        ]);

        feedback = feedbackRes.choices[0].message?.content || feedback;
        const parsed = parseInt((scoreRes.choices[0].message?.content || "").replace(/\D/g, ""));
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) score = parsed;
      } catch (err) {
        console.error("Groq resume error:", err);
      }

      const saved = await prisma.resume.create({
        data: { userId: req.user.id, title, content, score, feedback },
      });

      await prisma.notification.create({
        data: { userId: req.user.id, message: `Resume analyzed: "${title}". Score: ${score}/100.` },
      });

      res.json({ score, feedback, id: saved.id });
    } catch (err: any) {
      console.error("Resume analyze error:", err);
      res.status(500).json({ error: "Analysis failed" });
    }
  });

  // ── RESUME MATCH ─────────────────────────────────────────────
  app.post("/api/resume/match", requireAuth, async (req: any, res: any) => {
    try {
      const { resumeContent, jobDescription } = req.body;
      if (!resumeContent?.trim() || !jobDescription?.trim())
        return res.status(400).json({ error: "Both resume and job description are required" });

      let feedback = "Strong fit, but missing a few key technologies mentioned in the JD.";
      let matchPercentage = 80;

      try {
        const [pctRes, fbRes] = await Promise.all([
          groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [{ role: "user", content: `Compare this Resume to this Job Description. Give a match percentage (0-100). Respond ONLY with a number.\n\nResume: ${resumeContent.substring(0, 600)}\n\nJD: ${jobDescription.substring(0, 600)}` }],
            max_tokens: 10,
          }),
          groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [{ role: "user", content: `Compare this Resume to this Job Description. Give a concise 3-sentence analysis of the fit.\n\nResume: ${resumeContent.substring(0, 600)}\n\nJD: ${jobDescription.substring(0, 600)}` }],
            max_tokens: 200,
          }),
        ]);

        const parsed = parseInt((pctRes.choices[0].message?.content || "").replace(/\D/g, ""));
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) matchPercentage = parsed;
        feedback = fbRes.choices[0].message?.content || feedback;
      } catch (err) {
        console.error("Match error:", err);
      }

      await prisma.notification.create({
        data: { userId: req.user.id, message: `Resume matched with JD. Match score: ${matchPercentage}%.` },
      });

      res.json({ matchPercentage, feedback });
    } catch (err: any) {
      res.status(500).json({ error: "Match analysis failed" });
    }
  });

  // ── INTERVIEW CHAT ───────────────────────────────────────────
  app.post("/api/interview/chat", requireAuth, async (req: any, res: any) => {
    try {
      const { message, history, role } = req.body;
      if (!message?.trim()) return res.status(400).json({ error: "Message is required" });

      let conversation = `You are an expert technical interviewer for a ${role || "Software Engineer"} position. Conduct a professional interview. Ask one focused question at a time. Briefly acknowledge the candidate's last answer before asking the next question.\n\n`;
      if (Array.isArray(history)) {
        history.slice(-10).forEach((msg: any) => {
          conversation += `${msg.role === "user" ? "Candidate" : "Interviewer"}: ${msg.content}\n`;
        });
      }
      conversation += `Candidate: ${message}\nInterviewer:`;

      let reply = "Could you tell me more about your recent project?";
      try {
        const res2 = await groq.chat.completions.create({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: conversation.slice(-3000) }],
          max_tokens: 200,
        });
        reply = res2.choices[0].message?.content || reply;
      } catch (err) {
        console.error("Interview chat error:", err);
      }

      res.json({ reply });
    } catch (err: any) {
      res.status(500).json({ error: "Chat failed" });
    }
  });

  // ── INTERVIEW GRADE ──────────────────────────────────────────
  app.post("/api/interview/grade", requireAuth, async (req: any, res: any) => {
    try {
      const { history, role } = req.body;
      if (!Array.isArray(history) || history.length < 2)
        return res.json({ score: 0, feedback: "Not enough conversation to grade." });

      const transcript = history.map((m: any) =>
        `${m.role === "user" ? "Candidate" : "Interviewer"}: ${m.content}`
      ).join("\n").substring(0, 2000);

      let score = 0;
      let feedback = "Interview completed.";

      try {
        const [scoreRes, fbRes] = await Promise.all([
          groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [{ role: "user", content: `Rate the candidate's overall performance in this ${role} interview out of 100. Consider communication, technical depth, and relevance. Respond ONLY with a number between 0 and 100.\n\n${transcript}` }],
            max_tokens: 10,
          }),
          groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [{ role: "user", content: `Give a concise 2-sentence performance summary for the candidate in this ${role} interview.\n\n${transcript}` }],
            max_tokens: 120,
          }),
        ]);

        const parsed = parseInt((scoreRes.choices[0].message?.content || "").replace(/\D/g, ""));
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) score = parsed;
        feedback = fbRes.choices[0].message?.content || feedback;
      } catch (err) {
        console.error("Grade error:", err);
      }

      res.json({ score, feedback });
    } catch (err: any) {
      res.status(500).json({ error: "Grading failed" });
    }
  });

  // ── INTERVIEW SAVE ───────────────────────────────────────────
  app.post("/api/interview/save", requireAuth, async (req: any, res: any) => {
    try {
      const { title, score, feedback } = req.body;
      const interview = await prisma.interview.create({
        data: {
          userId: req.user.id,
          title: title || "Mock Interview",
          score: typeof score === "number" ? score : 0,
          feedback: feedback || "",
        },
      });

      await prisma.notification.create({
        data: { userId: req.user.id, message: `Mock Interview completed: "${title || "Software Engineer"}". Score: ${score ?? 0}/100.` },
      });

      res.json({ success: true, interview });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to save interview" });
    }
  });

  // ── CAREER CONSULT ───────────────────────────────────────────
  app.post("/api/career/consult", requireAuth, async (req: any, res: any) => {
    try {
      const { message, history } = req.body;
      if (!message?.trim()) return res.status(400).json({ error: "Message is required" });

      const systemPrompt = `You are an expert career advisor with 20+ years of experience in recruitment, career coaching, and professional development. You give concise, actionable, and personalized career advice. Always respond in complete sentences. Keep responses to 3-5 sentences maximum. Never cut off mid-sentence.`;

      const chatHistory = (Array.isArray(history) ? history : []).slice(-10).map((m: any) => ({
        role: m.role === "user" ? "user" as const : "assistant" as const,
        content: m.content,
      }));

      let reply = "I'm here to help with your career questions!";
      try {
        const response = await groq.chat.completions.create({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: systemPrompt },
            ...chatHistory,
            { role: "user", content: message },
          ],
          max_tokens: 300,
          temperature: 0.7,
        });
        reply = response.choices[0].message?.content || reply;
      } catch (err) {
        console.error("Career consult error:", err);
      }

      res.json({ reply });
    } catch (err: any) {
      res.status(500).json({ error: "Consult failed" });
    }
  });

  // ── VITE / STATIC ────────────────────────────────────────────
  if (!IS_PROD) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use((req, res, next) => {
      if (req.path.startsWith("/api")) return next();
      vite.middlewares(req, res, next);
    });
  } else {
    const distPath = path.join(path.dirname(new URL(import.meta.url).pathname), "dist");
    app.use(express.static(distPath, { maxAge: "1y", etag: true }));
    app.get("*", (req, res) => {
      if (req.path.startsWith("/api")) return res.status(404).json({ error: "Not found" });
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CareerPilot server running on http://0.0.0.0:${PORT} [${IS_PROD ? "production" : "development"}]`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
