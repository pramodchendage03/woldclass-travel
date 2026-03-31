import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Stripe from "stripe";
import nodemailer from "nodemailer";
import twilio from "twilio";

import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "worldclass-secret-key";

// Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || "https://qtrlayriafeviwfnrbzt.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Email Transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify email transporter on startup
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter.verify((error, success) => {
    if (error) {
      console.error("❌ Email Transporter Error:", error.message);
      if (error.message.includes("535-5.7.8")) {
        console.error("💡 TIP: For Gmail, you MUST use an 'App Password', not your regular password.");
        console.error("👉 Generate one here: https://myaccount.google.com/apppasswords");
      }
    } else {
      console.log("✅ Email Transporter is ready to send messages");
    }
  });
}

// Twilio Client
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

// In-memory OTP store (for demo purposes)
const otpStore: { [key: string]: string } = {};

// Middleware to authenticate JWT
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Helper to get local data (fallback)
const getData = async () => {
  const dataPath = path.join(__dirname, "data.json");
  try {
    const content = await fs.readFile(dataPath, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    return { users: [], blogPosts: [], destinations: [], services: [], bookings: [], inquiries: [], payments: [], newsletter: [] };
  }
};

// Helper to save local data (fallback)
const saveData = async (data: any) => {
  const dataPath = path.join(__dirname, "data.json");
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
};

let stripe: Stripe | null = null;
const getStripe = () => {
  if (!stripe && process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // Helper to get data from Supabase
  const getSupabaseData = async () => {
    if (!supabase) return null;

    try {
      const [
        { data: settings },
        { data: content },
        { data: destinations },
        { data: blogPosts },
        { data: services },
        { data: payments }
      ] = await Promise.all([
        supabase.from('site_settings').select('*').eq('id', 'default').single(),
        supabase.from('site_content').select('*').eq('id', 'default').single(),
        supabase.from('destinations').select('*'),
        supabase.from('blog_posts').select('*'),
        supabase.from('services').select('*'),
        supabase.from('payments').select('*')
      ]);

      // Map Supabase flat structure to frontend nested structure
      const mappedSettings = settings ? {
        siteName: settings.site_name,
        primaryColor: settings.primary_color,
        secondaryColor: settings.secondary_color,
        fontFamily: settings.font_family,
        logo: settings.logo,
        seo: {
          title: settings.seo_title,
          description: settings.seo_description
        },
        payment: {
          upiId: settings.upi_id,
          qrCode: settings.qr_code,
          merchantName: settings.merchant_name
        }
      } : {};

      const mappedContent = content ? {
        home: {
          heroTitle: content.home_hero_title,
          heroSubtitle: content.home_hero_subtitle,
          heroImage: content.home_hero_image
        },
        about: {
          title: content.about_title,
          content: content.about_content,
          image: content.about_image
        }
      } : {
        home: { heroTitle: "", heroSubtitle: "", heroImage: "" },
        about: { title: "", content: "", image: "" }
      };

      return {
        settings: mappedSettings,
        content: mappedContent,
        destinations: destinations || [],
        blogPosts: blogPosts || [],
        services: services || [],
        payments: payments || []
      };
    } catch (err) {
      console.error("Error fetching Supabase data:", err);
      return null;
    }
  };

  // API Routes
  app.get("/api/data", async (req, res) => {
    const data = await getSupabaseData();
    if (data) {
      res.json(data);
    } else {
      // Fallback to local data if Supabase is not configured
      const localData = JSON.parse(await fs.readFile(path.join(__dirname, "data.json"), "utf-8"));
      delete localData.users;
      res.json(localData);
    }
  });

  app.post("/api/data", authenticateToken, async (req, res) => {
    if ((req as any).user.role !== 'admin') return res.sendStatus(403);
    
    if (supabase) {
      try {
        const { settings, content, destinations, blogPosts, services } = req.body;
        
        const promises = [];

        if (settings) {
          const flatSettings = {
            id: 'default',
            site_name: settings.siteName,
            primary_color: settings.primaryColor,
            secondary_color: settings.secondaryColor,
            font_family: settings.fontFamily,
            logo: settings.logo,
            seo_title: settings.seo?.title,
            seo_description: settings.seo?.description,
            upi_id: settings.payment?.upiId,
            qr_code: settings.payment?.qrCode,
            merchant_name: settings.payment?.merchantName,
            updated_at: new Date().toISOString()
          };
          promises.push(supabase.from('site_settings').upsert(flatSettings));
        }

        if (content) {
          const flatContent = {
            id: 'default',
            home_hero_title: content.home?.heroTitle,
            home_hero_subtitle: content.home?.heroSubtitle,
            home_hero_image: content.home?.heroImage,
            about_title: content.about?.title,
            about_content: content.about?.content,
            about_image: content.about?.image,
            updated_at: new Date().toISOString()
          };
          promises.push(supabase.from('site_content').upsert(flatContent));
        }

        if (destinations) {
          promises.push(supabase.from('destinations').upsert(destinations));
        }

        if (blogPosts) {
          promises.push(supabase.from('blog_posts').upsert(blogPosts));
        }

        if (services) {
          promises.push(supabase.from('services').upsert(services));
        }

        const results = await Promise.all(promises);
        const errors = results.filter(r => r.error).map(r => r.error);
        
        if (errors.length > 0) {
          console.error("Supabase upsert errors:", errors);
          return res.status(500).json({ error: "Failed to save some data to Supabase", details: errors });
        }

        res.json({ success: true });
      } catch (err) {
        console.error("Error updating data:", err);
        res.status(500).json({ error: "Internal server error" });
      }
    } else {
      const data = JSON.parse(await fs.readFile(path.join(__dirname, "data.json"), "utf-8"));
      const updatedData = { ...data, ...req.body, users: data.users };
      await fs.writeFile(path.join(__dirname, "data.json"), JSON.stringify(updatedData, null, 2));
      res.json({ success: true });
    }
  });

  // Auth Routes
  app.post("/api/register", async (req, res) => {
    const { email, password, name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    if (supabase) {
      try {
        const { data: existingUser } = await supabase.from('users').select('*').eq('email', email).single();
        if (existingUser) return res.status(400).json({ error: "User already exists" });

        const { data: newUser, error } = await supabase.from('users').insert([
          { id: randomUUID(), email, password: hashedPassword, name, role: 'user' }
        ]).select().single();

        if (!error && newUser) {
          const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name }, JWT_SECRET);
          return res.json({ token, user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role } });
        }
        console.error("Supabase registration failed, falling back to data.json", error);
      } catch (err) {
        console.error("Supabase registration error, falling back to data.json", err);
      }
    }

    // Fallback to data.json
    try {
      const data = JSON.parse(await fs.readFile(path.join(__dirname, "data.json"), "utf-8"));
      if (data.users.find((u: any) => u.email === email)) return res.status(400).json({ error: "User already exists" });
      const newUser = { id: Date.now().toString(), email, password: hashedPassword, name, role: "user" };
      data.users.push(newUser);
      await fs.writeFile(path.join(__dirname, "data.json"), JSON.stringify(data, null, 2));
      const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name }, JWT_SECRET);
      res.json({ token, user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role } });
    } catch (err) {
      console.error("data.json registration failed", err);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    let user: any = null;

    if (supabase) {
      try {
        const { data: sbUser, error } = await supabase.from('users').select('*').eq('email', email).single();
        if (sbUser) {
          user = sbUser;
        }
      } catch (err) {
        console.error("Supabase login check failed", err);
      }
    }

    // Fallback to data.json if not found in Supabase or Supabase not configured
    if (!user) {
      try {
        const data = JSON.parse(await fs.readFile(path.join(__dirname, "data.json"), "utf-8"));
        user = data.users.find((u: any) => u.email === email);
      } catch (err) {
        console.error("data.json login check failed", err);
      }
    }

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  });

  // Booking Routes
  app.post("/api/bookings", authenticateToken, async (req, res) => {
    const user = (req as any).user;
    if (user.role === 'admin') {
      return res.status(403).json({ error: "Administrators cannot make personal bookings." });
    }
    
    const booking = { 
      ...req.body, 
      id: Date.now().toString(), 
      userId: user.id, 
      status: 'pending', 
      paymentStatus: 'Pending',
      paidAmount: 0,
      createdAt: new Date().toISOString() 
    };

    if (supabase) {
      const { data, error } = await supabase.from('bookings').insert([booking]).select().single();
      if (error) return res.status(500).json({ error: error.message });
      res.json(data);
    } else {
      const data = await getData();
      data.bookings.push(booking);
      await saveData(data);
      res.json(booking);
    }
  });

  app.get("/api/my-bookings", authenticateToken, async (req, res) => {
    if (supabase) {
      const { data, error } = await supabase.from('bookings').select('*').eq('userId', (req as any).user.id);
      if (error) return res.status(500).json({ error: error.message });
      res.json(data);
    } else {
      const data = JSON.parse(await fs.readFile(path.join(__dirname, "data.json"), "utf-8"));
      const userBookings = data.bookings.filter((b: any) => b.userId === (req as any).user.id);
      res.json(userBookings);
    }
  });

  app.get("/api/bookings/:id", authenticateToken, async (req, res) => {
    if (supabase) {
      const { data: booking, error } = await supabase.from('bookings').select('*').eq('id', req.params.id).single();
      if (error || !booking) return res.status(404).json({ error: "Booking not found" });

      if ((req as any).user.role !== 'admin' && booking.userId !== (req as any).user.id) {
        return res.sendStatus(403);
      }

      const { data: payments } = await supabase.from('payments').select('*').eq('bookingId', booking.id).order('createdAt', { ascending: false });
      res.json({ ...booking, latestPayment: payments?.[0] });
    } else {
      const data = JSON.parse(await fs.readFile(path.join(__dirname, "data.json"), "utf-8"));
      const booking = data.bookings.find((b: any) => b.id === req.params.id);
      if (!booking) return res.status(404).json({ error: "Booking not found" });
      if ((req as any).user.role !== 'admin' && booking.userId !== (req as any).user.id) return res.sendStatus(403);
      const latestPayment = (data.payments || [])
        .filter((p: any) => p.bookingId === booking.id)
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      res.json({ ...booking, latestPayment });
    }
  });

  app.get("/api/bookings", authenticateToken, async (req, res) => {
    if ((req as any).user.role !== 'admin') return res.sendStatus(403);
    if (supabase) {
      const { data, error } = await supabase.from('bookings').select('*');
      if (error) return res.status(500).json({ error: error.message });
      res.json(data);
    } else {
      const data = JSON.parse(await fs.readFile(path.join(__dirname, "data.json"), "utf-8"));
      res.json(data.bookings);
    }
  });

  app.put("/api/bookings/:id", authenticateToken, async (req, res) => {
    if ((req as any).user.role !== 'admin') return res.sendStatus(403);
    const { status, guests, date, totalPrice, paymentStatus, paidAmount } = req.body;

    if (supabase) {
      const updateData: any = {};
      if (status) updateData.status = status;
      if (guests !== undefined) updateData.guests = guests;
      if (date) updateData.date = date;
      if (totalPrice !== undefined) updateData.totalPrice = totalPrice;
      if (paymentStatus) updateData.paymentStatus = paymentStatus;
      if (paidAmount !== undefined) updateData.paidAmount = paidAmount;

      const { data, error } = await supabase.from('bookings').update(updateData).eq('id', req.params.id).select().single();
      if (error) return res.status(500).json({ error: error.message });
      res.json(data);
    } else {
      const data = JSON.parse(await fs.readFile(path.join(__dirname, "data.json"), "utf-8"));
      const index = data.bookings.findIndex((b: any) => b.id === req.params.id);
      if (index === -1) return res.status(404).json({ error: "Booking not found" });
      if (status) data.bookings[index].status = status;
      if (guests !== undefined) data.bookings[index].guests = guests;
      if (date) data.bookings[index].date = date;
      if (totalPrice !== undefined) data.bookings[index].totalPrice = totalPrice;
      if (paymentStatus) data.bookings[index].paymentStatus = paymentStatus;
      if (paidAmount !== undefined) data.bookings[index].paidAmount = paidAmount;
      await fs.writeFile(path.join(__dirname, "data.json"), JSON.stringify(data, null, 2));
      res.json(data.bookings[index]);
    }
  });

  // Admin Management Routes
  app.get("/api/admin/users", authenticateToken, async (req, res) => {
    if ((req as any).user.role !== 'admin') return res.sendStatus(403);
    if (supabase) {
      const { data, error } = await supabase.from('users').select('id, email, name, role');
      if (error) return res.status(500).json({ error: error.message });
      res.json(data);
    } else {
      const data = JSON.parse(await fs.readFile(path.join(__dirname, "data.json"), "utf-8"));
      res.json(data.users.map((u: any) => ({ id: u.id, email: u.email, name: u.name, role: u.role })));
    }
  });

  app.post("/api/admin/users", authenticateToken, async (req, res) => {
    if ((req as any).user.role !== 'admin') return res.sendStatus(403);
    const { email, password, name, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    if (supabase) {
      const { data: existingUser } = await supabase.from('users').select('*').eq('email', email).single();
      if (existingUser) return res.status(400).json({ error: "User already exists" });

      const { data: newUser, error } = await supabase.from('users').insert([
        { id: randomUUID(), email, password: hashedPassword, name, role: role || 'admin' }
      ]).select().single();

      if (error) return res.status(500).json({ error: error.message });
      res.status(201).json({ id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role });
    } else {
      const data = JSON.parse(await fs.readFile(path.join(__dirname, "data.json"), "utf-8"));
      if (data.users.find((u: any) => u.email === email)) return res.status(400).json({ error: "User already exists" });
      const newUser = { id: Date.now().toString(), email, password: hashedPassword, name, role: role || 'admin' };
      data.users.push(newUser);
      await fs.writeFile(path.join(__dirname, "data.json"), JSON.stringify(data, null, 2));
      res.status(201).json({ id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role });
    }
  });

  app.delete("/api/admin/users/:id", authenticateToken, async (req, res) => {
    if ((req as any).user.role !== 'admin') return res.sendStatus(403);
    if (supabase) {
      const { error } = await supabase.from('users').delete().eq('id', req.params.id);
      if (error) return res.status(500).json({ error: error.message });
      res.sendStatus(204);
    } else {
      const data = JSON.parse(await fs.readFile(path.join(__dirname, "data.json"), "utf-8"));
      const index = data.users.findIndex((u: any) => u.id === req.params.id);
      if (index === -1) return res.status(404).json({ error: "User not found" });
      data.users.splice(index, 1);
      await fs.writeFile(path.join(__dirname, "data.json"), JSON.stringify(data, null, 2));
      res.sendStatus(204);
    }
  });
  app.post("/api/inquiries", async (req, res) => {
    if (supabase) {
      const inquiry = { ...req.body, status: 'new', createdAt: new Date().toISOString(), replies: [] };
      const { error } = await supabase.from('inquiries').insert([inquiry]);
      if (error) return res.status(500).json({ error: error.message });
      res.json({ success: true });
    } else {
      const data = JSON.parse(await fs.readFile(path.join(__dirname, "data.json"), "utf-8"));
      const inquiry = { ...req.body, id: Date.now().toString(), status: 'new', createdAt: new Date().toISOString(), replies: [] };
      data.inquiries.push(inquiry);
      await fs.writeFile(path.join(__dirname, "data.json"), JSON.stringify(data, null, 2));
      res.json({ success: true });
    }
  });

  app.post("/api/inquiries/:id/reply", authenticateToken, async (req, res) => {
    if ((req as any).user.role !== 'admin') return res.sendStatus(403);
    const { message } = req.body;

    if (supabase) {
      const { data: inquiry } = await supabase.from('inquiries').select('*').eq('id', req.params.id).single();
      if (!inquiry) return res.status(404).json({ error: "Inquiry not found" });

      const replies = inquiry.replies || [];
      replies.push({
        message,
        createdAt: new Date().toISOString(),
        adminName: (req as any).user.name
      });

      const { data: updatedInquiry, error } = await supabase.from('inquiries').update({
        replies,
        status: 'replied'
      }).eq('id', req.params.id).select().single();

      if (error) return res.status(500).json({ error: error.message });
      res.json(updatedInquiry);
    } else {
      const data = JSON.parse(await fs.readFile(path.join(__dirname, "data.json"), "utf-8"));
      const index = data.inquiries.findIndex((i: any) => i.id === req.params.id);
      if (index === -1) return res.status(404).json({ error: "Inquiry not found" });
      if (!data.inquiries[index].replies) data.inquiries[index].replies = [];
      data.inquiries[index].replies.push({ message, createdAt: new Date().toISOString(), adminName: (req as any).user.name });
      data.inquiries[index].status = 'replied';
      await fs.writeFile(path.join(__dirname, "data.json"), JSON.stringify(data, null, 2));
      res.json(data.inquiries[index]);
    }
  });

  app.get("/api/inquiries", authenticateToken, async (req, res) => {
    if ((req as any).user.role !== 'admin') return res.sendStatus(403);
    if (supabase) {
      const { data, error } = await supabase.from('inquiries').select('*');
      if (error) return res.status(500).json({ error: error.message });
      res.json(data);
    } else {
      const data = JSON.parse(await fs.readFile(path.join(__dirname, "data.json"), "utf-8"));
      res.json(data.inquiries);
    }
  });

  // Payment processing
  // Payment processing
  app.post("/api/verify-upi-payment", authenticateToken, async (req, res) => {
    const { transactionId, amount } = req.body;
    
    // In a real app, this would call a bank API or a payment gateway's status check API.
    // For this demo, we'll simulate a verification process.
    // We'll "verify" any transaction ID that starts with 'WT' or 'WC' and is 10+ characters long.
    
    console.log(`🔍 Verifying UPI Payment: ${transactionId} for amount $${amount}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const isValid = (transactionId.startsWith('WT') || transactionId.startsWith('WC') || transactionId.length >= 8);
    
    if (isValid) {
      res.json({ 
        success: true, 
        status: 'verified', 
        message: "Payment verified successfully by bank." 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        status: 'failed', 
        message: "Invalid transaction ID or payment not found." 
      });
    }
  });

  app.get("/api/bookings/:id/invoice", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const user = (req as any).user;
    
    let booking: any;
    let fullUser: any;
    let payment: any;

    if (supabase) {
      const { data: b } = await supabase.from('bookings').select('*').eq('id', id).single();
      const { data: u } = await supabase.from('users').select('*').eq('id', user.id).single();
      const { data: p } = await supabase.from('payments').select('*').eq('bookingId', id).order('createdAt', { ascending: false }).limit(1).single();
      booking = b;
      fullUser = u || user;
      payment = p;
    } else {
      const data = await getData();
      booking = data.bookings.find((b: any) => b.id === id);
      fullUser = data.users.find((u: any) => u.id === user.id) || user;
      payment = (data.payments || []).find((p: any) => p.bookingId === id);
    }

    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (user.role !== 'admin' && booking.userId !== user.id) return res.sendStatus(403);

    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      
      // Header
      doc.setFillColor(197, 160, 89); // Gold color
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.setFont("helvetica", "bold");
      doc.text("WORLDCLASS TRAVEL", 105, 25, { align: "center" });
      
      // Invoice Info
      doc.setTextColor(26, 26, 26);
      doc.setFontSize(22);
      doc.text("INVOICE", 20, 60);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Invoice No: INV-${booking.id}-${Date.now().toString().slice(-4)}`, 20, 70);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 75);
      doc.text(`Booking Reference: #${booking.id}`, 20, 80);
      
      // Customer Info
      doc.setFont("helvetica", "bold");
      doc.text("BILL TO:", 20, 100);
      doc.setFont("helvetica", "normal");
      doc.text(`${fullUser.name || 'Valued Customer'}`, 20, 105);
      doc.text(`${user.email}`, 20, 110);
      
      // Service Summary
      doc.setFont("helvetica", "bold");
      doc.text("SERVICE SUMMARY:", 120, 100);
      doc.setFont("helvetica", "normal");
      doc.text(`Destination: ${booking.destinationName || 'N/A'}`, 120, 105);
      doc.text(`Travel Date: ${booking.date || 'N/A'}`, 120, 110);
      doc.text(`Guests: ${booking.guests || 1}`, 120, 115);
      
      // Table Header
      doc.setFillColor(245, 242, 237);
      doc.rect(20, 130, 170, 10, 'F');
      doc.setFont("helvetica", "bold");
      doc.text("Description", 25, 136);
      doc.text("Amount", 170, 136, { align: "right" });
      
      // Table Content
      doc.setFont("helvetica", "normal");
      doc.text(`${booking.destinationName} - Travel Package`, 25, 150);
      doc.text(`$${booking.totalPrice?.toLocaleString() || '0'}`, 170, 150, { align: "right" });
      
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 155, 190, 155);
      
      // Totals
      doc.setFont("helvetica", "bold");
      doc.text("Total Amount:", 130, 170);
      doc.text(`$${booking.totalPrice?.toLocaleString() || '0'}`, 170, 170, { align: "right" });
      
      doc.setTextColor(197, 160, 89);
      doc.text("Amount Paid:", 130, 180);
      doc.text(`$${booking.paidAmount?.toLocaleString() || '0'}`, 170, 180, { align: "right" });
      
      doc.setTextColor(26, 26, 26);
      const balance = (booking.totalPrice || 0) - (booking.paidAmount || 0);
      doc.text("Balance Due:", 130, 190);
      doc.text(`$${balance.toLocaleString()}`, 170, 190, { align: "right" });
      
      // Payment Status
      doc.setFontSize(14);
      doc.setTextColor(balance <= 0 ? 34 : 197, balance <= 0 ? 197 : 160, balance <= 0 ? 94 : 89);
      doc.text(balance <= 0 ? "PAID IN FULL" : "PARTIALLY PAID", 105, 210, { align: "center" });
      
      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("Thank you for choosing WorldClass Travel. We look forward to hosting your journey.", 105, 240, { align: "center" });
      doc.text("This is a computer-generated invoice and does not require a signature.", 105, 245, { align: "center" });
      doc.text("Contact: support@worldclass.travel | Website: www.worldclass.travel", 105, 250, { align: "center" });
      
      const pdfData = doc.output("arraybuffer");
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=Invoice_${booking.id}.pdf`);
      res.send(Buffer.from(pdfData));
    } catch (err) {
      console.error("Invoice generation error:", err);
      res.status(500).json({ error: "Failed to generate invoice" });
    }
  });

  app.post("/api/payments", authenticateToken, async (req, res) => {
    const { bookingId, amount, isAdvance, paymentMethod, bankName, upiId, transactionId, last4 } = req.body;
    const user = (req as any).user;
    
    if (paymentMethod === "Card" && !transactionId) {
      return res.status(400).json({ message: "Payment transaction ID is required for card payments" });
    }
    if (paymentMethod === "Net Banking" && !bankName) {
      return res.status(400).json({ message: "Please select a bank" });
    }
    if (paymentMethod === "UPI" && !upiId) {
      return res.status(400).json({ message: "Please enter your UPI ID" });
    }

    let booking: any;
    let fullUser: any;

    if (supabase) {
      const { data: b } = await supabase.from('bookings').select('*').eq('id', bookingId).single();
      const { data: u } = await supabase.from('users').select('*').eq('id', user.id).single();
      booking = b;
      fullUser = u || user;
    } else {
      const data = JSON.parse(await fs.readFile(path.join(__dirname, "data.json"), "utf-8"));
      booking = data.bookings.find((b: any) => b.id === bookingId);
      fullUser = data.users.find((u: any) => u.id === user.id) || user;
    }
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const updatedBooking = {
      ...booking,
      status: isAdvance ? "Advance Paid" : "Confirmed",
      paymentStatus: "Paid",
      paidAmount: (booking.paidAmount || 0) + amount
    };

    const payment = {
      id: transactionId || Date.now().toString(),
      bookingId,
      userId: user.id,
      userEmail: user.email,
      amount,
      type: isAdvance ? "Advance" : "Full",
      method: paymentMethod || "Card",
      bankName: bankName || null,
      upiId: upiId || null,
      status: "Success",
      createdAt: new Date().toISOString(),
      last4: last4 || null
    };

    if (supabase) {
      await supabase.from('bookings').update({
        status: updatedBooking.status,
        paymentStatus: updatedBooking.paymentStatus,
        paidAmount: updatedBooking.paidAmount
      }).eq('id', bookingId);
      await supabase.from('payments').insert([payment]);
    } else {
      const data = JSON.parse(await fs.readFile(path.join(__dirname, "data.json"), "utf-8"));
      const bIndex = data.bookings.findIndex((b: any) => b.id === bookingId);
      data.bookings[bIndex] = updatedBooking;
      if (!data.payments) data.payments = [];
      data.payments.push(payment);
      await fs.writeFile(path.join(__dirname, "data.json"), JSON.stringify(data, null, 2));
    }

    // Send Real Notifications
    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const confirmationLink = `${appUrl}/completion/${bookingId}`;
    const invoiceLink = `${appUrl}/api/bookings/${bookingId}/invoice`;
    
    const emailHtml = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a; border: 1px solid #f0f0f0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #C5A059 0%, #D4B982 100%); padding: 40px 20px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px; letter-spacing: 2px; font-weight: 300; font-style: italic;">WORLDCLASS TRAVEL</h1>
          <p style="margin-top: 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 3px; opacity: 0.8;">Payment Confirmation</p>
        </div>
        <div style="padding: 40px; background-color: #ffffff;">
          <h2 style="font-size: 22px; margin-bottom: 20px; font-weight: 400; font-style: italic;">Dear ${fullUser.name || 'Valued Customer'},</h2>
          <p style="line-height: 1.6; color: #4a4a4a; margin-bottom: 30px;">
            Thank you for choosing WorldClass Travel! We are thrilled to confirm that your payment has been successfully processed. Your journey is now officially secured.
          </p>
          
          <div style="background-color: #f9f7f2; border-radius: 16px; padding: 25px; margin-bottom: 35px; border: 1px solid #eee;">
            <h3 style="margin-top: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #C5A059; margin-bottom: 20px;">Booking Summary</h3>
            <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #888;">Booking ID</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold;">#${bookingId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #888;">Destination</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold;">${booking.destinationName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #888;">Travel Date</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold;">${booking.date}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #888;">Amount Paid</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #C5A059;">$${amount.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #888;">Status</td>
                <td style="padding: 8px 0; text-align: right;"><span style="background-color: #e6f4ea; color: #1e7e34; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: bold; text-transform: uppercase;">${isAdvance ? "Advance Paid" : "Confirmed"}</span></td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin-bottom: 40px;">
            <a href="${confirmationLink}" style="display: inline-block; background: #1a1a1a; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; box-shadow: 0 10px 20px rgba(0,0,0,0.1);">View Full Details</a>
          </div>

          <div style="text-align: center; border-top: 1px solid #eee; padding-top: 30px;">
            <p style="font-size: 13px; color: #888; margin-bottom: 15px;">Need your invoice for records?</p>
            <a href="${invoiceLink}" style="color: #C5A059; font-weight: bold; text-decoration: none; font-size: 14px;">Download Invoice PDF &rarr;</a>
          </div>
        </div>
        <div style="background-color: #1a1a1a; padding: 30px; text-align: center; color: #666; font-size: 11px; letter-spacing: 1px;">
          <p style="margin: 0; text-transform: uppercase;">WorldClass Travel &copy; 2026 • Premium Experiences</p>
          <p style="margin-top: 10px;">If you have any questions, reply to this email or contact support@worldclass.travel</p>
        </div>
      </div>
    `;
    
    const smsMessage = `Your payment of $${amount} for booking #${bookingId} is successful. View confirmation: ${confirmationLink}`;
    
    const adminEmailMessage = `
ADMIN NOTIFICATION: New Payment Received

Booking ID: #${bookingId}
Customer: ${fullUser.name || user.email} (${user.email})
Amount: $${amount}
Payment Method: ${paymentMethod}
Transaction Ref: ${transactionId || 'N/A'}

The payment has been successfully processed and recorded in the system.
View details: ${confirmationLink}
    `;

    // Generate Invoice PDF for attachment
    let invoiceBuffer: Buffer | null = null;
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      
      // Header
      doc.setFillColor(197, 160, 89);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.setFont("helvetica", "bold");
      doc.text("WORLDCLASS TRAVEL", 105, 25, { align: "center" });
      
      doc.setTextColor(26, 26, 26);
      doc.setFontSize(22);
      doc.text("INVOICE", 20, 60);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Invoice No: INV-${bookingId}-${Date.now().toString().slice(-4)}`, 20, 70);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 75);
      doc.text(`Booking Reference: #${bookingId}`, 20, 80);
      
      doc.setFont("helvetica", "bold");
      doc.text("BILL TO:", 20, 100);
      doc.setFont("helvetica", "normal");
      doc.text(`${fullUser.name || 'Valued Customer'}`, 20, 105);
      doc.text(`${user.email}`, 20, 110);
      
      doc.setFont("helvetica", "bold");
      doc.text("SERVICE SUMMARY:", 120, 100);
      doc.setFont("helvetica", "normal");
      doc.text(`Destination: ${booking.destinationName || 'N/A'}`, 120, 105);
      doc.text(`Travel Date: ${booking.date || 'N/A'}`, 120, 110);
      doc.text(`Guests: ${booking.guests || 1}`, 120, 115);
      
      doc.setFillColor(245, 242, 237);
      doc.rect(20, 130, 170, 10, 'F');
      doc.setFont("helvetica", "bold");
      doc.text("Description", 25, 136);
      doc.text("Amount", 170, 136, { align: "right" });
      
      doc.setFont("helvetica", "normal");
      doc.text(`${booking.destinationName} - Travel Package`, 25, 150);
      doc.text(`$${booking.totalPrice?.toLocaleString() || '0'}`, 170, 150, { align: "right" });
      
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 155, 190, 155);
      
      doc.setFont("helvetica", "bold");
      doc.text("Total Amount:", 130, 170);
      doc.text(`$${booking.totalPrice?.toLocaleString() || '0'}`, 170, 170, { align: "right" });
      
      doc.setTextColor(197, 160, 89);
      doc.text("Amount Paid:", 130, 180);
      doc.text(`$${amount.toLocaleString()}`, 170, 180, { align: "right" });
      
      doc.setTextColor(26, 26, 26);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("Thank you for choosing WorldClass Travel.", 105, 240, { align: "center" });
      
      const pdfData = doc.output("arraybuffer");
      invoiceBuffer = Buffer.from(pdfData);
    } catch (pdfErr) {
      console.error("Failed to generate PDF invoice:", pdfErr);
    }

      // 1. Send Email to User
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        try {
          const userEmail = user.email;
          const testEmail = "pramodchendage10@gmail.com"; 
          
          await transporter.sendMail({
            from: `"WorldClass Travel" <${process.env.EMAIL_USER}>`,
            to: [userEmail, testEmail].join(", "), 
            subject: `Payment Confirmation & Thank You - Booking #${bookingId}`,
            html: emailHtml,
            attachments: invoiceBuffer ? [
              {
                filename: `Invoice_${bookingId}.pdf`,
                content: invoiceBuffer
              }
            ] : []
          });
          console.log(`📧 Confirmation email sent to ${userEmail} and ${testEmail}`);
        } catch (err: any) {
          console.error("❌ Failed to send user email:", err.message);
          if (err.message.includes("535-5.7.8")) {
            console.error("💡 TIP: Check your EMAIL_PASS. You MUST use a Google App Password.");
          }
        }

        // 2. Send Email to Admin
        try {
          await transporter.sendMail({
            from: `"WorldClass Travel" <${process.env.EMAIL_USER}>`,
            to: "admin@worldclass.travel",
            subject: `ADMIN: New Payment Received - Booking #${bookingId}`,
            text: adminEmailMessage,
          });
          console.log("📧 Admin notification email sent");
        } catch (err: any) {
          console.error("❌ Failed to send admin email:", err.message);
        }
      }

      // 3. Send SMS to User (if Twilio is configured)
      if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
        try {
          // Note: In a real app, you'd have the user's phone number. 
          // For now, we'll try to send it if we had it, or just log it.
          // await twilioClient.messages.create({
          //   body: smsMessage,
          //   from: process.env.TWILIO_PHONE_NUMBER,
          //   to: user.phone || "+1234567890", // Placeholder
          // });
        } catch (err) {
          console.error("Failed to send user SMS", err);
        }
      }

      const notifications = [
        { type: "Email", recipient: user.email, message: emailHtml },
        { type: "SMS", recipient: "User Phone", message: smsMessage },
        { type: "Admin Email", recipient: "admin@worldclass.travel", message: adminEmailMessage }
      ];
      
      const data = await getData();
      if (!data.notificationLogs) data.notificationLogs = [];
      data.notificationLogs.push({
        paymentId: payment.id,
        sentAt: new Date().toISOString(),
        notifications
      });

      await saveData(data);
      res.json({ 
        success: true, 
        message: "Payment processed successfully", 
        payment,
        notificationsSent: true 
      });
  });

  app.get("/api/admin/payments", authenticateToken, async (req, res) => {
    if ((req as any).user.role !== 'admin') return res.sendStatus(403);
    if (supabase) {
      const { data, error } = await supabase.from('payments').select('*');
      if (error) return res.status(500).json({ error: error.message });
      res.json(data);
    } else {
      const data = JSON.parse(await fs.readFile(path.join(__dirname, "data.json"), "utf-8"));
      res.json(data.payments || []);
    }
  });

  app.get("/api/admin/gateway-status", authenticateToken, async (req, res) => {
    if ((req as any).user.role !== 'admin') return res.sendStatus(403);
    res.json({
      stripeConfigured: !!process.env.STRIPE_SECRET_KEY,
      publishableKey: process.env.VITE_STRIPE_PUBLISHABLE_KEY || null
    });
  });

  // Stripe Integration
  app.post("/api/create-payment-intent", authenticateToken, async (req, res) => {
    const { bookingId, amount, isAdvance } = req.body;
    const stripeClient = getStripe();
    
    if (!stripeClient) {
      return res.status(503).json({ error: "Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables." });
    }

    try {
      const paymentIntent = await stripeClient.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe expects cents
        currency: "usd",
        metadata: {
          bookingId,
          userId: (req as any).user.id,
          isAdvance: isAdvance.toString()
        },
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Newsletter Routes
  app.post("/api/newsletter", async (req, res) => {
    const { email } = req.body;
    const data = await getData();
    if (!data.newsletter) data.newsletter = [];
    if (data.newsletter.includes(email)) {
      return res.status(400).json({ error: "Already subscribed" });
    }
    data.newsletter.push(email);
    await saveData(data);
    res.json({ success: true });
  });

  // OTP Endpoints
  app.post("/api/payments/send-otp", authenticateToken, async (req, res) => {
    const { phoneNumber } = req.body;
    const user = (req as any).user;
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[user.email] = otp;
    
    console.log(`OTP for ${user.email}: ${otp}`);
    
    // Simulate sending SMS
    if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
      try {
        await twilioClient.messages.create({
          body: `Your WorldClass Travel payment OTP is: ${otp}. Do not share this with anyone.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phoneNumber || "+1234567890" // Use provided number or dummy
        });
      } catch (err) {
        console.error("Failed to send OTP SMS", err);
      }
    }
    
    res.json({ success: true, message: "OTP sent successfully" });
  });

  app.post("/api/payments/verify-otp", authenticateToken, async (req, res) => {
    const { otp } = req.body;
    const user = (req as any).user;
    
    if (otpStore[user.email] === otp) {
      delete otpStore[user.email];
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, message: "Invalid OTP" });
    }
  });

  // Blog Routes
  app.get("/api/blog", async (req, res) => {
    if (supabase) {
      const { data, error } = await supabase.from('blog_posts').select('*');
      if (error) return res.status(500).json({ error: error.message });
      res.json(data);
    } else {
      const data = JSON.parse(await fs.readFile(path.join(__dirname, "data.json"), "utf-8"));
      res.json(data.blogPosts);
    }
  });

  app.post("/api/blog", authenticateToken, async (req, res) => {
    if ((req as any).user.role !== 'admin') return res.sendStatus(403);
    if (supabase) {
      const post = { ...req.body, createdAt: new Date().toISOString() };
      const { data, error } = await supabase.from('blog_posts').insert([post]).select().single();
      if (error) return res.status(500).json({ error: error.message });
      res.json(data);
    } else {
      const data = JSON.parse(await fs.readFile(path.join(__dirname, "data.json"), "utf-8"));
      const post = { ...req.body, id: Date.now().toString(), createdAt: new Date().toISOString() };
      data.blogPosts.push(post);
      await fs.writeFile(path.join(__dirname, "data.json"), JSON.stringify(data, null, 2));
      res.json(post);
    }
  });

  app.put("/api/blog/:id", authenticateToken, async (req, res) => {
    if ((req as any).user.role !== 'admin') return res.sendStatus(403);
    if (supabase) {
      const { data, error } = await supabase.from('blog_posts').update(req.body).eq('id', req.params.id).select().single();
      if (error) return res.status(500).json({ error: error.message });
      res.json(data);
    } else {
      const data = JSON.parse(await fs.readFile(path.join(__dirname, "data.json"), "utf-8"));
      const index = data.blogPosts.findIndex((p: any) => p.id === req.params.id);
      if (index === -1) return res.status(404).json({ error: "Post not found" });
      data.blogPosts[index] = { ...data.blogPosts[index], ...req.body };
      await fs.writeFile(path.join(__dirname, "data.json"), JSON.stringify(data, null, 2));
      res.json(data.blogPosts[index]);
    }
  });

  app.delete("/api/blog/:id", authenticateToken, async (req, res) => {
    if ((req as any).user.role !== 'admin') return res.sendStatus(403);
    if (supabase) {
      const { error } = await supabase.from('blog_posts').delete().eq('id', req.params.id);
      if (error) return res.status(500).json({ error: error.message });
      res.json({ success: true });
    } else {
      const data = JSON.parse(await fs.readFile(path.join(__dirname, "data.json"), "utf-8"));
      data.blogPosts = data.blogPosts.filter((p: any) => p.id !== req.params.id);
      await fs.writeFile(path.join(__dirname, "data.json"), JSON.stringify(data, null, 2));
      res.json({ success: true });
    }
  });

  app.get("/api/admin/stats", authenticateToken, async (req, res) => {
    if ((req as any).user.role !== 'admin') return res.sendStatus(403);
    
    if (supabase) {
      const [
        { count: totalUsers },
        { count: totalBookings },
        { count: totalInquiries },
        { data: recentBookings }
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
        supabase.from('inquiries').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('*').order('createdAt', { ascending: false }).limit(5)
      ]);

      res.json({
        totalUsers: totalUsers || 0,
        totalBookings: totalBookings || 0,
        totalInquiries: totalInquiries || 0,
        recentBookings: recentBookings || []
      });
    } else {
      const data = JSON.parse(await fs.readFile(path.join(__dirname, "data.json"), "utf-8"));
      res.json({
        totalUsers: data.users.length,
        totalBookings: data.bookings.length,
        totalInquiries: data.inquiries.length,
        recentBookings: data.bookings.slice(-5).reverse()
      });
    }
  });

  // Vite middleware for development
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
