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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, "data.json");
const JWT_SECRET = process.env.JWT_SECRET || "worldclass-secret-key";

// Email Transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Twilio Client
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

// In-memory OTP store (for demo purposes)
const otpStore: { [key: string]: string } = {};

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

  // Initial data if not exists
  try {
    await fs.access(DATA_FILE);
  } catch {
    const initialData = {
      settings: {
        siteName: "WorldClass Travel",
        primaryColor: "#1e40af",
        secondaryColor: "#fbbf24",
        fontFamily: "Inter",
        logo: "https://picsum.photos/seed/travel-logo/200/80",
        seo: {
          title: "WorldClass Travel - Explore the World",
          description: "Premium international travel agency platform."
        },
        payment: {
          upiId: "7387625315-2@ybl",
          qrCode: "",
          merchantName: "WorldClass Travel"
        }
      },
      content: {
        home: {
          heroTitle: "Discover Your Next Adventure",
          heroSubtitle: "Experience the world like never before with our curated luxury travel packages.",
          heroImage: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1920&q=80"
        },
        about: {
          title: "Our Story",
          content: "WorldClass Travel was founded with a simple mission: to make global exploration accessible and luxurious for everyone.",
          image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
        }
      },
      destinations: [
        { id: "1", name: "Santorini, Greece", description: "Beautiful white buildings and blue domes.", price: 1200, image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80", type: "Beach" },
        { id: "2", name: "Kyoto, Japan", description: "Historic temples and stunning gardens.", price: 1500, image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80", type: "Cultural" },
        { id: "3", name: "Swiss Alps, Switzerland", description: "Majestic mountains and luxury ski resorts.", price: 2000, image: "https://images.unsplash.com/photo-1531310197839-ccf54634509e?auto=format&fit=crop&w=800&q=80", type: "Adventure" }
      ],
      blogPosts: [
        { id: "1", title: "Top 10 Travel Tips for 2026", content: "Traveling in 2026 is all about sustainability and local experiences...", date: "2026-03-20", author: "Travel Expert", image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80" }
      ],
      services: [
        { id: "1", title: "Travel Planning", description: "Customized itineraries tailored to your preferences.", icon: "Map" },
        { id: "2", title: "Visa Assistance", description: "Hassle-free visa processing for all countries.", icon: "FileText" },
        { id: "3", title: "Hotel Booking", description: "Exclusive deals at the world's finest hotels.", icon: "Hotel" }
      ],
      users: [
        { id: "admin", email: "admin@worldclass.travel", password: await bcrypt.hash("admin123", 10), role: "admin", name: "Admin User" },
        { id: "user-admin", email: "chendagepramod@gmail.com", password: await bcrypt.hash("admin123", 10), role: "admin", name: "Pramod Admin" }
      ],
      bookings: [],
      inquiries: [],
      payments: []
    };
    await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2));
  }

  const getData = async () => {
    const data = JSON.parse(await fs.readFile(DATA_FILE, "utf-8"));
    if (!data.users) data.users = [];
    const admins = ["admin@worldclass.travel", "chendagepramod@gmail.com"];
    for (const email of admins) {
      if (!data.users.find((u: any) => u.email === email)) {
        data.users.push({ 
          id: email === "admin@worldclass.travel" ? "admin" : "user-admin", 
          email, 
          password: await bcrypt.hash("admin123", 10), 
          role: "admin", 
          name: email === "admin@worldclass.travel" ? "Admin User" : "Pramod Admin" 
        });
      }
    }
    if (!data.bookings) data.bookings = [];
    if (!data.inquiries) data.inquiries = [];
    if (!data.blogPosts) data.blogPosts = [];
    if (!data.destinations) data.destinations = [];
    if (!data.services) data.services = [];
    if (!data.settings) data.settings = {};
    if (!data.content) data.content = {};
    if (!data.payments) data.payments = [];
    return data;
  };
  const saveData = async (data: any) => await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // API Routes
  app.get("/api/data", async (req, res) => {
    const data = await getData();
    // Strip sensitive info
    const publicData = { ...data };
    delete publicData.users;
    res.json(publicData);
  });

  app.post("/api/data", authenticateToken, async (req, res) => {
    if ((req as any).user.role !== 'admin') return res.sendStatus(403);
    const data = await getData();
    const updatedData = { ...data, ...req.body, users: data.users }; // Preserve users
    await saveData(updatedData);
    res.json({ success: true });
  });

  // Auth Routes
  app.post("/api/register", async (req, res) => {
    const { email, password, name } = req.body;
    const data = await getData();
    if (data.users.find((u: any) => u.email === email)) {
      return res.status(400).json({ error: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: Date.now().toString(), email, password: hashedPassword, name, role: "user" };
    data.users.push(newUser);
    await saveData(data);
    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET);
    res.json({ token, user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role } });
  });

  app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    const data = await getData();
    const user = data.users.find((u: any) => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  });

  // Booking Routes
  app.post("/api/bookings", authenticateToken, async (req, res) => {
    const user = (req as any).user;
    if (user.role === 'admin') {
      return res.status(403).json({ error: "Administrators cannot make personal bookings." });
    }
    const data = await getData();
    const booking = { ...req.body, id: Date.now().toString(), userId: user.id, status: 'pending', createdAt: new Date().toISOString() };
    data.bookings.push(booking);
    await saveData(data);
    res.json(booking);
  });

  app.get("/api/my-bookings", authenticateToken, async (req, res) => {
    const data = await getData();
    const userBookings = data.bookings.filter((b: any) => b.userId === (req as any).user.id);
    res.json(userBookings);
  });

  app.get("/api/bookings/:id", authenticateToken, async (req, res) => {
    const data = await getData();
    const booking = data.bookings.find((b: any) => b.id === req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    
    // Allow if admin or if it's the user's own booking
    if ((req as any).user.role !== 'admin' && booking.userId !== (req as any).user.id) {
      return res.sendStatus(403);
    }

    // Include latest payment info
    const latestPayment = (data.payments || [])
      .filter((p: any) => p.bookingId === booking.id)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    
    res.json({ ...booking, latestPayment });
  });

  app.get("/api/bookings", authenticateToken, async (req, res) => {
    if ((req as any).user.role !== 'admin') return res.sendStatus(403);
    const data = await getData();
    res.json(data.bookings);
  });

  app.put("/api/bookings/:id", authenticateToken, async (req, res) => {
    if ((req as any).user.role !== 'admin') return res.sendStatus(403);
    const { status, guests, date, totalPrice, paymentStatus, paidAmount } = req.body;
    const data = await getData();
    const index = data.bookings.findIndex((b: any) => b.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Booking not found" });
    
    if (status) data.bookings[index].status = status;
    if (guests !== undefined) data.bookings[index].guests = guests;
    if (date) data.bookings[index].date = date;
    if (totalPrice !== undefined) data.bookings[index].totalPrice = totalPrice;
    if (paymentStatus) data.bookings[index].paymentStatus = paymentStatus;
    if (paidAmount !== undefined) data.bookings[index].paidAmount = paidAmount;
    
    await saveData(data);
    res.json(data.bookings[index]);
  });

  // Admin Management Routes
  app.get("/api/admin/users", authenticateToken, async (req, res) => {
    if ((req as any).user.role !== 'admin') return res.sendStatus(403);
    const data = await getData();
    res.json(data.users.map((u: any) => ({ id: u.id, email: u.email, name: u.name, role: u.role })));
  });

  app.post("/api/admin/users", authenticateToken, async (req, res) => {
    if ((req as any).user.role !== 'admin') return res.sendStatus(403);
    const { email, password, name, role } = req.body;
    const data = await getData();
    if (data.users.find((u: any) => u.email === email)) {
      return res.status(400).json({ error: "User already exists" });
    }
    const newUser = {
      id: Date.now().toString(),
      email,
      password: await bcrypt.hash(password, 10),
      name,
      role: role || 'admin'
    };
    data.users.push(newUser);
    await saveData(data);
    res.status(201).json({ id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role });
  });

  app.delete("/api/admin/users/:id", authenticateToken, async (req, res) => {
    if ((req as any).user.role !== 'admin') return res.sendStatus(403);
    const data = await getData();
    const index = data.users.findIndex((u: any) => u.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "User not found" });
    // Prevent deleting the last admin or yourself if possible, but for now just delete
    data.users.splice(index, 1);
    await saveData(data);
    res.sendStatus(204);
  });
  app.post("/api/inquiries", async (req, res) => {
    const data = await getData();
    const inquiry = { ...req.body, id: Date.now().toString(), status: 'new', createdAt: new Date().toISOString(), replies: [] };
    data.inquiries.push(inquiry);
    await saveData(data);
    res.json({ success: true });
  });

  app.post("/api/inquiries/:id/reply", authenticateToken, async (req, res) => {
    if ((req as any).user.role !== 'admin') return res.sendStatus(403);
    const { message } = req.body;
    const data = await getData();
    const index = data.inquiries.findIndex((i: any) => i.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Inquiry not found" });
    
    if (!data.inquiries[index].replies) data.inquiries[index].replies = [];
    data.inquiries[index].replies.push({
      message,
      createdAt: new Date().toISOString(),
      adminName: (req as any).user.name
    });
    data.inquiries[index].status = 'replied';
    
    await saveData(data);
    res.json(data.inquiries[index]);
  });

  app.get("/api/inquiries", authenticateToken, async (req, res) => {
    if ((req as any).user.role !== 'admin') return res.sendStatus(403);
    const data = await getData();
    res.json(data.inquiries);
  });

  // Payment processing
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

    const data = await getData();
    const booking = data.bookings.find((b: any) => b.id === bookingId);
    
    if (booking) {
      booking.status = isAdvance ? "Advance Paid" : "Confirmed";
      booking.paymentStatus = "Paid";
      booking.paidAmount = (booking.paidAmount || 0) + amount;

      if (!data.payments) data.payments = [];
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
      data.payments.push(payment);

      // Send Real Notifications
      const appUrl = process.env.APP_URL || "http://localhost:3000";
      const confirmationLink = `${appUrl}/booking-confirmation/${bookingId}`;
      
      const emailMessage = `Payment of $${amount} received for booking #${bookingId}. View your confirmation here: ${confirmationLink}`;
      const smsMessage = `Your payment of $${amount} for booking #${bookingId} is successful. View confirmation: ${confirmationLink}`;
      const adminEmailMessage = `CONFIRMATION: Payment of $${amount} from ${user.email} (Booking #${bookingId}) has been successfully settled in your World Elite Bank account (A/C ending in 8892). Transaction Ref: BNK-${Date.now()}. Details: ${confirmationLink}`;

      // 1. Send Email to User
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        try {
          await transporter.sendMail({
            from: `"WorldClass Travel" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: `Payment Confirmation - Booking #${bookingId}`,
            text: emailMessage,
          });
        } catch (err) {
          console.error("Failed to send user email", err);
        }

        // 2. Send Email to Admin
        try {
          await transporter.sendMail({
            from: `"WorldClass Travel" <${process.env.EMAIL_USER}>`,
            to: "admin@worldclass.travel",
            subject: `ADMIN: New Payment Received - Booking #${bookingId}`,
            text: adminEmailMessage,
          });
        } catch (err) {
          console.error("Failed to send admin email", err);
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
        { type: "Email", recipient: user.email, message: emailMessage },
        { type: "SMS", recipient: "User Phone", message: smsMessage },
        { type: "Admin Email", recipient: "admin@worldclass.travel", message: adminEmailMessage }
      ];
      
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
    } else {
      res.status(404).json({ message: "Booking not found" });
    }
  });

  app.get("/api/admin/payments", authenticateToken, async (req, res) => {
    if ((req as any).user.role !== 'admin') return res.sendStatus(403);
    const data = await getData();
    res.json(data.payments || []);
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
    const data = await getData();
    res.json(data.blogPosts);
  });

  app.post("/api/blog", authenticateToken, async (req, res) => {
    if ((req as any).user.role !== 'admin') return res.sendStatus(403);
    const data = await getData();
    const post = { ...req.body, id: Date.now().toString(), createdAt: new Date().toISOString() };
    data.blogPosts.push(post);
    await saveData(data);
    res.json(post);
  });

  app.put("/api/blog/:id", authenticateToken, async (req, res) => {
    if ((req as any).user.role !== 'admin') return res.sendStatus(403);
    const data = await getData();
    const index = data.blogPosts.findIndex((p: any) => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Post not found" });
    data.blogPosts[index] = { ...data.blogPosts[index], ...req.body };
    await saveData(data);
    res.json(data.blogPosts[index]);
  });

  app.delete("/api/blog/:id", authenticateToken, async (req, res) => {
    if ((req as any).user.role !== 'admin') return res.sendStatus(403);
    const data = await getData();
    data.blogPosts = data.blogPosts.filter((p: any) => p.id !== req.params.id);
    await saveData(data);
    res.json({ success: true });
  });

  app.get("/api/admin/stats", authenticateToken, async (req, res) => {
    if ((req as any).user.role !== 'admin') return res.sendStatus(403);
    const data = await getData();
    res.json({
      totalUsers: data.users.length,
      totalBookings: data.bookings.length,
      totalInquiries: data.inquiries.length,
      recentBookings: data.bookings.slice(-5).reverse()
    });
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
