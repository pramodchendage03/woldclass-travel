import { useState, useEffect, useMemo } from "react";
import { useContent, SiteData, Destination, BlogPost } from "../context/ContentContext";
import { LayoutDashboard, FileText, MapPin, Settings, Image as ImageIcon, Save, Plus, Trash2, LogOut, MessageSquare, Calendar as CalendarIcon, Users, UserPlus, CreditCard, TrendingUp, Briefcase, Globe, ShieldCheck, X, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, eachDayOfInterval, parseISO } from "date-fns";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { ImageUpload } from "../components/ImageUpload";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { motion } from "motion/react";

const stripePromise = loadStripe((import.meta as any).env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder");

export default function AdminDashboard() {
  return (
    <Elements stripe={stripePromise}>
      <AdminDashboardContent />
    </Elements>
  );
}

function AdminDashboardContent() {
  const { data, loading, updateData, logout, isAdmin, user } = useContent();
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("stats");
  const [localData, setLocalData] = useState<SiteData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [payments, setPayments] = useState<any[]>([]);
  const [gatewayStatus, setGatewayStatus] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [newAdmin, setNewAdmin] = useState({ email: "", password: "", name: "", role: "admin" });
  const [editingBooking, setEditingBooking] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [processingPayment, setProcessingPayment] = useState<any>(null);
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    amount: 0
  });

  const fetchGatewayStatus = async () => {
    const res = await fetch("/api/admin/gateway-status", {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    });
    if (res.ok) setGatewayStatus(await res.json());
  };

  const fetchPayments = async () => {
    const res = await fetch("/api/admin/payments", {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    });
    if (res.ok) setPayments(await res.json());
  };

  const fetchAllUsers = async () => {
    const res = await fetch("/api/admin/users", {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    });
    if (res.ok) setAllUsers(await res.json());
  };

  const fetchStats = async () => {
    const res = await fetch("/api/admin/stats", {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    });
    if (res.ok) setStats(await res.json());
  };

  const fetchBookings = async () => {
    const res = await fetch("/api/bookings", {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    });
    if (res.ok) setBookings(await res.json());
  };

  const fetchInquiries = async () => {
    const res = await fetch("/api/inquiries", {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    });
    if (res.ok) setInquiries(await res.json());
  };

  useEffect(() => {
    if (data && !localData) {
      setLocalData(data);
    }
  }, [data, localData]);

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
      fetchBookings();
      fetchInquiries();
      fetchAllUsers();
      fetchPayments();
      fetchGatewayStatus();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/login");
    }
  }, [loading, isAdmin, navigate]);

  const filteredBookings = useMemo(() => {
    if (!selectedDate) return bookings;
    return bookings.filter(b => isSameDay(parseISO(b.date), selectedDate));
  }, [bookings, selectedDate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-paper">
        <Loader2 className="h-12 w-12 text-gold animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-paper p-8 text-center">
        <ShieldCheck className="h-20 w-20 text-red-400 mb-8" />
        <h2 className="text-4xl font-serif text-ink mb-4 italic">Access Restricted</h2>
        <p className="text-ink/60 max-w-md font-light mb-12 leading-relaxed">You do not have the required administrative privileges to access this dashboard.</p>
        <Link to="/" className="gold-gradient text-white px-12 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] luxury-shadow">Return to Home</Link>
      </div>
    );
  }

  if (!localData) return null;

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingTo || !replyMessage) return;

    try {
      const res = await fetch(`/api/inquiries/${replyingTo.id}/reply`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ message: replyMessage })
      });
      if (res.ok) {
        toast.success("Reply sent successfully!");
        setReplyingTo(null);
        setReplyMessage("");
        fetchInquiries();
      }
    } catch (err) {
      toast.error("Failed to send reply");
    }
  };

  const updatePaymentSettings = (key: string, value: string) => {
    if (!localData) return;
    setLocalData({
      ...localData,
      settings: {
        ...localData.settings,
        payment: {
          ...localData.settings.payment,
          [key]: value
        }
      }
    });
  };

  const handleUpdateBookingStatus = async (id: string, status: string, additionalData: any = {}) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ status, ...additionalData })
      });
      if (res.ok) {
        toast.success(`Booking updated successfully!`);
        fetchBookings();
        fetchStats();
        setEditingBooking(null);
      }
    } catch (err) {
      toast.error("Failed to update booking");
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Email verification regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newAdmin.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(newAdmin)
      });
      if (res.ok) {
        toast.success("User added successfully!");
        setNewAdmin({ email: "", password: "", name: "", role: "admin" });
        fetchAllUsers();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to add user");
      }
    } catch (err) {
      toast.error("Failed to add user");
    }
  };

  const handleAdminProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!processingPayment || !stripe || !elements) return;

    setIsSaving(true);
    try {
      // 1. Create Payment Intent
      const intentRes = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          bookingId: processingPayment.id,
          amount: paymentDetails.amount,
          isAdvance: false
        })
      });

      if (!intentRes.ok) throw new Error("Failed to create payment intent");
      const { clientSecret } = await intentRes.json();

      // 2. Confirm Card Payment
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error("Card element not found");

      // Use createPaymentMethod to get card details like last4
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          email: processingPayment.userEmail,
          name: processingPayment.userName
        }
      });

      if (pmError) throw new Error(pmError.message);

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethod.id
      });

      if (error) throw new Error(error.message);

      // 3. Record Payment in our system
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          bookingId: processingPayment.id,
          amount: paymentDetails.amount,
          paymentMethod: "Card",
          transactionId: paymentIntent.id,
          last4: paymentMethod.card?.last4 || "4242",
          isAdvance: false
        })
      });

      if (res.ok) {
        toast.success("Payment processed successfully!");
        setProcessingPayment(null);
        setPaymentDetails({ cardNumber: "", expiry: "", cvv: "", amount: 0 });
        fetchBookings();
        fetchPayments();
        fetchStats();
      } else {
        const err = await res.json();
        toast.error(err.message || "Payment recording failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Payment failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    if (!confirm("Are you sure you want to remove this user?")) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        toast.success("User removed successfully!");
        fetchAllUsers();
      }
    } catch (err) {
      toast.error("Failed to remove user");
    }
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="bg-white p-8 rounded-[2.5rem] border border-gold/10 luxury-shadow">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gold/5 rounded-xl text-gold luxury-border">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-serif text-ink italic">{format(currentMonth, "MMMM yyyy")}</h3>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 hover:bg-gold/5 rounded-xl text-ink/40 hover:text-gold transition-all"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 hover:bg-gold/5 rounded-xl text-ink/40 hover:text-gold transition-all"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
            <div key={d} className="text-center text-[10px] font-bold text-ink/30 uppercase tracking-widest py-2">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, idx) => {
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, monthStart);
            const hasBookings = bookings.some(b => isSameDay(parseISO(b.date), day));

            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(isSelected ? null : day)}
                className={`
                  relative h-14 rounded-2xl flex flex-col items-center justify-center transition-all duration-300
                  ${!isCurrentMonth ? "text-ink/10" : "text-ink"}
                  ${isSelected ? "bg-gold text-white luxury-shadow scale-105 z-10" : "hover:bg-gold/5"}
                  ${hasBookings && !isSelected ? "border border-gold/20" : "border border-transparent"}
                `}
              >
                <span className="text-sm font-medium">{format(day, "d")}</span>
                {hasBookings && (
                  <div className={`w-1 h-1 rounded-full mt-1 ${isSelected ? "bg-white" : "bg-gold"}`}></div>
                )}
              </button>
            );
          })}
        </div>
        
        {selectedDate && (
          <div className="mt-6 flex justify-center">
            <button 
              onClick={() => setSelectedDate(null)}
              className="text-[10px] font-bold text-gold uppercase tracking-widest hover:underline"
            >
              Clear Filter: {format(selectedDate, "MMM d, yyyy")}
            </button>
          </div>
        )}
      </div>
    );
  };

  if (!isAdmin || !localData) return null;

  const handleSave = async () => {
    if (!localData) return;
    setIsSaving(true);
    try {
      const success = await updateData(localData);
      if (success) {
        toast.success("Changes saved successfully!");
      } else {
        toast.error("Failed to save changes. Please try again.");
      }
    } catch (err) {
      toast.error("An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const updateSettings = (key: string, value: any) => {
    if (!localData) return;
    setLocalData({
      ...localData,
      settings: { ...localData.settings, [key]: value }
    });
  };

  const updateHome = (key: string, value: any) => {
    if (!localData || !localData.content || !localData.content.home) return;
    setLocalData({
      ...localData,
      content: {
        ...localData.content,
        home: { ...localData.content.home, [key]: value }
      }
    });
  };

  const addDestination = async () => {
    if (!localData) return;
    const newDest: Destination = {
      id: Date.now().toString(),
      name: "New Destination",
      description: "Description here",
      price: 0,
      image: "https://picsum.photos/seed/new/800/600",
      images: [],
      content: "",
      type: "Adventure"
    };
    const updated = {
      ...localData,
      destinations: [...localData.destinations, newDest]
    };
    setLocalData(updated);
    try {
      await updateData(updated);
      toast.success("New destination added!");
      // Scroll to bottom after state update
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);
    } catch (err) {
      toast.error("Failed to save new destination");
    }
  };

  const removeDestination = async (id: string) => {
    if (!confirm("Are you sure you want to remove this destination?")) return;
    const updated = {
      ...localData!,
      destinations: localData!.destinations.filter(d => d.id !== id)
    };
    setLocalData(updated);
    try {
      await updateData(updated);
      toast.success("Destination removed!");
    } catch (err) {
      toast.error("Failed to remove destination");
    }
  };

  const updateDestination = (id: string, field: keyof Destination, value: any) => {
    setLocalData({
      ...localData,
      destinations: localData.destinations.map(d => d.id === id ? { ...d, [field]: value } : d)
    });
  };

  const addService = async () => {
    const newService = {
      id: Date.now().toString(),
      title: "New Service",
      description: "Description here",
      icon: "Compass",
      category: "General"
    };
    const updated = {
      ...localData!,
      services: [...localData!.services, newService]
    };
    setLocalData(updated);
    try {
      await updateData(updated);
      toast.success("New service added!");
      // Scroll to bottom after state update
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);
    } catch (err) {
      toast.error("Failed to save new service");
    }
  };

  const removeService = async (id: string) => {
    if (!confirm("Are you sure you want to remove this service?")) return;
    const updated = {
      ...localData!,
      services: localData!.services.filter(s => s.id !== id)
    };
    setLocalData(updated);
    try {
      await updateData(updated);
      toast.success("Service removed!");
    } catch (err) {
      toast.error("Failed to remove service");
    }
  };

  const updateService = (id: string, field: string, value: any) => {
    setLocalData({
      ...localData,
      services: localData.services.map(s => s.id === id ? { ...s, [field]: value } : s)
    });
  };

  const updateAbout = (field: string, value: any) => {
    setLocalData({
      ...localData,
      content: {
        ...localData.content,
        about: { ...localData.content.about, [field]: value }
      }
    });
  };

  const addBlogPost = async () => {
    const newPost: BlogPost = {
      id: Date.now().toString(),
      title: "New Blog Post",
      content: "Content here",
      date: new Date().toISOString().split('T')[0],
      author: user?.name || "Admin",
      image: "https://picsum.photos/seed/blog/800/600"
    };
    const updated = {
      ...localData!,
      blogPosts: [...localData!.blogPosts, newPost]
    };
    setLocalData(updated);
    try {
      await updateData(updated);
      toast.success("New blog post added!");
      // Scroll to bottom after state update
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);
    } catch (err) {
      toast.error("Failed to save new blog post");
    }
  };

  const removeBlogPost = (id: string) => {
    const updated = {
      ...localData,
      blogPosts: localData.blogPosts.filter(p => p.id !== id)
    };
    setLocalData(updated);
    updateData(updated);
    toast.success("Blog post removed!");
  };

  const updateBlogPost = (id: string, field: keyof BlogPost, value: any) => {
    setLocalData({
      ...localData,
      blogPosts: localData.blogPosts.map(p => p.id === id ? { ...p, [field]: value } : p)
    });
  };

  return (
    <div className="fixed inset-0 z-[60] bg-paper flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gold/10 flex flex-col h-full luxury-shadow z-20">
        <div className="p-10 border-b border-gold/5">
          <h1 className="text-2xl font-serif text-gold italic tracking-tight">WorldClass</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-ink/40 mt-2">Admin Console</p>
        </div>
        <nav className="flex-1 p-6 space-y-3 overflow-y-auto">
          <Link
            to="/"
            className="w-full flex items-center space-x-4 px-5 py-4 rounded-2xl text-sm font-medium text-gold hover:bg-gold/5 border border-gold/10 luxury-shadow mb-6 transition-all"
          >
            <Globe className="h-5 w-5 text-gold" />
            <span className="tracking-wide font-bold uppercase text-[10px]">Back to Website</span>
          </Link>
          {[
            { id: "stats", icon: LayoutDashboard, label: "Overview" },
            { id: "bookings", icon: CalendarIcon, label: "Bookings" },
            { id: "payments", icon: CreditCard, label: "Payments" },
            { id: "inquiries", icon: MessageSquare, label: "Inquiries" },
            { id: "users", icon: Users, label: "User Management" },
            { id: "destinations", icon: MapPin, label: "Destinations" },
            { id: "services", icon: Briefcase, label: "Services" },
            { id: "blog", icon: FileText, label: "Blog Posts" },
            { id: "content", icon: ImageIcon, label: "Page Content" },
            { id: "settings", icon: Settings, label: "Site Settings" },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl text-sm font-medium transition-all duration-300 ${
                activeTab === item.id 
                  ? "bg-gold/5 text-gold border border-gold/10 luxury-shadow" 
                  : "text-ink/60 hover:bg-gold/5 hover:text-gold border border-transparent"
              }`}
            >
              <item.icon className={`h-5 w-5 ${activeTab === item.id ? "text-gold" : "text-ink/30"}`} />
              <span className="tracking-wide">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-gold/5">
          <button onClick={logout} className="w-full flex items-center space-x-4 px-5 py-4 text-sm font-medium text-red-500 hover:bg-red-50 rounded-2xl transition-all">
            <LogOut className="h-5 w-5" />
            <span className="tracking-wide">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white/80 backdrop-blur-md border-b border-gold/10 px-12 py-6 flex justify-between items-center sticky top-0 z-40">
          <div className="flex items-center space-x-4">
            <div className="w-1 h-8 bg-gold rounded-full"></div>
            <h2 className="text-2xl font-serif text-ink capitalize tracking-tight">{activeTab} Management</h2>
          </div>
          {["content", "destinations", "blog", "settings", "services"].includes(activeTab) && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`gold-gradient text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] flex items-center luxury-shadow hover:scale-105 active:scale-95 transition-all ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSaving ? (
                <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          )}
        </header>

        <div className="p-6 md:p-12 w-full">
          {activeTab === "stats" && stats && (
            <div className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-[2rem] border border-gold/10 luxury-shadow group hover:border-gold/30 transition-all">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-4 bg-gold/5 rounded-2xl text-gold luxury-border">
                      <Users className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100 uppercase tracking-widest">+12%</span>
                  </div>
                  <h4 className="text-ink/40 text-[10px] font-bold uppercase tracking-[0.2em]">Total Users</h4>
                  <p className="text-4xl font-serif text-ink mt-2">{stats.totalUsers}</p>
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-gold/10 luxury-shadow group hover:border-gold/30 transition-all">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-4 bg-gold/5 rounded-2xl text-gold luxury-border">
                      <CalendarIcon className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100 uppercase tracking-widest">+5%</span>
                  </div>
                  <h4 className="text-ink/40 text-[10px] font-bold uppercase tracking-[0.2em]">Total Bookings</h4>
                  <p className="text-4xl font-serif text-ink mt-2">{stats.totalBookings}</p>
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-gold/10 luxury-shadow group hover:border-gold/30 transition-all">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-4 bg-gold/5 rounded-2xl text-gold luxury-border">
                      <MessageSquare className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-bold text-gold bg-gold/5 px-3 py-1 rounded-full border border-gold/10 uppercase tracking-widest">New</span>
                  </div>
                  <h4 className="text-ink/40 text-[10px] font-bold uppercase tracking-[0.2em]">Inquiries</h4>
                  <p className="text-4xl font-serif text-ink mt-2">{stats.totalInquiries}</p>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-gold/10 luxury-shadow overflow-hidden">
                <div className="p-8 border-b border-gold/5 flex justify-between items-center bg-gold/[0.02]">
                  <h3 className="text-xl font-serif text-ink">Recent Bookings</h3>
                  <button onClick={() => setActiveTab("bookings")} className="text-gold text-xs font-bold uppercase tracking-widest hover:underline">View All Archive</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gold/[0.02] text-[10px] font-bold text-ink/40 uppercase tracking-[0.2em]">
                      <tr>
                        <th className="px-8 py-6">Destination</th>
                        <th className="px-8 py-6">Guests</th>
                        <th className="px-8 py-6">Date</th>
                        <th className="px-8 py-6">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gold/5">
                      {stats.recentBookings.map((b: any) => (
                        <tr key={b.id} className="hover:bg-gold/[0.01] transition-colors">
                          <td className="px-8 py-6 font-serif text-lg text-ink">{b.destinationName}</td>
                          <td className="px-8 py-6 text-ink/60 font-light">{b.guests}</td>
                          <td className="px-8 py-6 text-sm text-ink/40 font-light">{new Date(b.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</td>
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-4">
                              <span className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest ${
                                b.status === 'confirmed' ? 'bg-green-50 text-green-600 border border-green-100' :
                                b.status === 'cancelled' ? 'bg-red-50 text-red-600 border border-red-100' :
                                'bg-gold/5 text-gold border border-gold/10'
                              }`}>
                                {b.status}
                              </span>
                              {b.status === 'pending' && (
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleUpdateBookingStatus(b.id, 'confirmed')}
                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                    title="Confirm"
                                  >
                                    <Plus className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleUpdateBookingStatus(b.id, 'cancelled')}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Cancel"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "bookings" && (
            <div className="space-y-8">
              {renderCalendar()}

              {processingPayment && (
                <div className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="bg-white w-full max-w-xl rounded-[2.5rem] luxury-shadow border border-gold/10 overflow-hidden"
                  >
                    <div className="p-8 border-b border-gold/5 flex items-center justify-between bg-gold/[0.02]">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gold/5 rounded-xl text-gold luxury-border">
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-xl font-serif text-ink italic">Process Secure Payment</h3>
                          <p className="text-[10px] text-ink/40 font-bold uppercase tracking-widest mt-1">Booking #{processingPayment.id.slice(-8).toUpperCase()}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setProcessingPayment(null)}
                        className="p-2 hover:bg-gold/5 rounded-full text-ink/40 hover:text-ink transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <form onSubmit={handleAdminProcessPayment} className="p-8 space-y-8">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="bg-gold/5 p-6 rounded-2xl border border-gold/10">
                          <p className="text-[10px] font-bold text-ink/40 uppercase tracking-widest mb-1">Customer</p>
                          <p className="font-serif text-ink">{processingPayment.userName}</p>
                          <p className="text-[10px] text-ink/60 mt-1">{processingPayment.userEmail}</p>
                        </div>
                        <div className="bg-gold/5 p-6 rounded-2xl border border-gold/10">
                          <p className="text-[10px] font-bold text-ink/40 uppercase tracking-widest mb-1">Total Amount</p>
                          <p className="text-2xl font-serif text-gold italic">${processingPayment.totalPrice.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-widest">Amount to Charge ($)</label>
                        <input
                          type="number"
                          required
                          value={paymentDetails.amount || ""}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, amount: parseInt(e.target.value) || 0 })}
                          className="w-full px-6 py-4 bg-paper border border-gold/5 rounded-2xl outline-none text-ink focus:ring-2 focus:ring-gold/20 transition-all"
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-widest">Card Details</label>
                        <div className="p-6 bg-paper border border-gold/5 rounded-2xl">
                          <CardElement 
                            options={{
                              style: {
                                base: {
                                  fontSize: '16px',
                                  color: '#141414',
                                  '::placeholder': {
                                    color: '#aab7c4',
                                  },
                                },
                                invalid: {
                                  color: '#dc2626',
                                },
                              },
                            }}
                          />
                        </div>
                        <div className="flex items-center space-x-2 text-[10px] text-ink/40">
                          <ShieldCheck className="h-3 w-3" />
                          <span>Payments are encrypted and processed securely via Stripe</span>
                        </div>
                      </div>

                      <div className="flex space-x-4 pt-4">
                        <button
                          type="submit"
                          disabled={isSaving || !stripe || !elements}
                          className="flex-1 gold-gradient text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] luxury-shadow hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center space-x-2"
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Processing...</span>
                            </>
                          ) : (
                            <>
                              <CreditCard className="h-4 w-4" />
                              <span>Confirm Payment</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setProcessingPayment(null)}
                          className="px-8 py-4 bg-paper text-ink/60 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-gold/5 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}

              {editingBooking && (
                <div className="bg-white p-8 rounded-[2.5rem] border border-gold/10 luxury-shadow space-y-6">
                  <h3 className="text-xl font-serif text-ink">Edit Booking #{editingBooking.id.slice(-8).toUpperCase()}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-widest">Guests</label>
                      <input
                        type="number"
                        value={editingBooking.guests || ""}
                        onChange={(e) => setEditingBooking({ ...editingBooking, guests: parseInt(e.target.value) || 0 })}
                        className="w-full px-6 py-4 bg-paper border border-gold/5 rounded-2xl outline-none text-ink"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-widest">Date</label>
                      <input
                        type="date"
                        value={editingBooking.date}
                        onChange={(e) => setEditingBooking({ ...editingBooking, date: e.target.value })}
                        className="w-full px-6 py-4 bg-paper border border-gold/5 rounded-2xl outline-none text-ink"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-widest">Total Price ($)</label>
                      <input
                        type="number"
                        value={editingBooking.totalPrice}
                        onChange={(e) => setEditingBooking({ ...editingBooking, totalPrice: Number(e.target.value) })}
                        className="w-full px-6 py-4 bg-paper border border-gold/5 rounded-2xl outline-none text-ink"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-widest">Payment Status</label>
                      <select
                        value={editingBooking.paymentStatus || "Unpaid"}
                        onChange={(e) => setEditingBooking({ ...editingBooking, paymentStatus: e.target.value })}
                        className="w-full px-6 py-4 bg-paper border border-gold/5 rounded-2xl outline-none text-ink"
                      >
                        <option value="Unpaid">Unpaid</option>
                        <option value="Paid">Paid</option>
                        <option value="Partial">Partial</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-widest">Paid Amount ($)</label>
                      <input
                        type="number"
                        value={editingBooking.paidAmount || ""}
                        onChange={(e) => setEditingBooking({ ...editingBooking, paidAmount: parseInt(e.target.value) || 0 })}
                        className="w-full px-6 py-4 bg-paper border border-gold/5 rounded-2xl outline-none text-ink"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-widest">Booking Status</label>
                      <select
                        value={editingBooking.status}
                        onChange={(e) => setEditingBooking({ ...editingBooking, status: e.target.value })}
                        className="w-full px-6 py-4 bg-paper border border-gold/5 rounded-2xl outline-none text-ink"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="Advance Paid">Advance Paid</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleUpdateBookingStatus(editingBooking.id, editingBooking.status, { 
                        guests: editingBooking.guests, 
                        date: editingBooking.date, 
                        totalPrice: editingBooking.totalPrice,
                        paymentStatus: editingBooking.paymentStatus,
                        paidAmount: editingBooking.paidAmount
                      })}
                      className="gold-gradient text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] luxury-shadow"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setEditingBooking(null)}
                      className="bg-paper text-ink/60 px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-[2.5rem] border border-gold/10 luxury-shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gold/[0.02] text-[10px] font-bold text-ink/40 uppercase tracking-[0.2em]">
                      <tr>
                        <th className="px-8 py-6">ID</th>
                        <th className="px-8 py-6">Destination</th>
                        <th className="px-8 py-6">Date</th>
                        <th className="px-8 py-6">Guests</th>
                        <th className="px-8 py-6">Status</th>
                        <th className="px-8 py-6">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gold/5">
                      {filteredBookings.map((b: any) => (
                        <tr key={b.id} className="hover:bg-gold/[0.01] transition-colors">
                          <td className="px-8 py-6 text-[10px] font-mono text-ink/30">#{b.id.slice(-8).toUpperCase()}</td>
                          <td className="px-8 py-6 font-serif text-lg text-ink">{b.destinationName}</td>
                          <td className="px-8 py-6 text-sm text-ink/60 font-light">{new Date(b.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</td>
                          <td className="px-8 py-6 text-ink/60 font-light">{b.guests}</td>
                          <td className="px-8 py-6">
                            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest ${
                              b.status === 'confirmed' ? 'bg-green-50 text-green-600 border border-green-100' :
                              b.status === 'cancelled' ? 'bg-red-50 text-red-600 border border-red-100' :
                              'bg-gold/5 text-gold border border-gold/10'
                            }`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-2">
                              {b.status !== 'cancelled' && (
                                <button
                                  onClick={() => handleUpdateBookingStatus(b.id, 'cancelled')}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Cancel Booking"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={() => setEditingBooking(b)}
                                className="p-2 text-gold hover:bg-gold/5 rounded-lg transition-colors"
                                title="Edit Booking"
                              >
                                <Settings className="h-4 w-4" />
                              </button>
                              {b.paymentStatus !== "Paid" && (
                                <button
                                  onClick={() => {
                                    setProcessingPayment(b);
                                    setPaymentDetails({ ...paymentDetails, amount: b.totalPrice });
                                  }}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Process Payment"
                                >
                                  <CreditCard className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-12">
              <div className="bg-white p-12 rounded-[2.5rem] border border-gold/10 luxury-shadow">
                <div className="flex items-center space-x-4 mb-10">
                  <div className="p-3 bg-gold/5 rounded-xl text-gold luxury-border">
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <h3 className="text-2xl font-serif text-ink italic">Add New Administrator</h3>
                </div>
                <form onSubmit={handleAddAdmin} className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-ink/40 uppercase tracking-widest">Full Name</label>
                    <input
                      required
                      type="text"
                      value={newAdmin.name}
                      onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                      className="w-full px-6 py-4 bg-paper border border-gold/5 rounded-2xl focus:ring-2 focus:ring-gold/20 outline-none text-ink transition-all"
                      placeholder="e.g. Alexander Pierce"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-ink/40 uppercase tracking-widest">Email Address</label>
                    <input
                      required
                      type="email"
                      value={newAdmin.email}
                      onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                      className="w-full px-6 py-4 bg-paper border border-gold/5 rounded-2xl focus:ring-2 focus:ring-gold/20 outline-none text-ink transition-all"
                      placeholder="admin@worldclass.com"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-ink/40 uppercase tracking-widest">Password</label>
                    <input
                      required
                      type="password"
                      value={newAdmin.password}
                      onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                      className="w-full px-6 py-4 bg-paper border border-gold/5 rounded-2xl focus:ring-2 focus:ring-gold/20 outline-none text-ink transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <button
                      type="submit"
                      className="gold-gradient text-white px-12 py-4 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] luxury-shadow hover:scale-[1.02] transition-all"
                    >
                      Create Admin Account
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-gold/10 luxury-shadow overflow-hidden">
                <div className="p-10 border-b border-gold/5 bg-gold/[0.02]">
                  <h3 className="text-xl font-serif text-ink">Active Administrators</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-paper/50">
                        <th className="px-10 py-6 text-left text-[10px] font-bold text-ink/40 uppercase tracking-widest">Administrator</th>
                        <th className="px-10 py-6 text-left text-[10px] font-bold text-ink/40 uppercase tracking-widest">Email</th>
                        <th className="px-10 py-6 text-left text-[10px] font-bold text-ink/40 uppercase tracking-widest">Role</th>
                        <th className="px-10 py-6 text-right text-[10px] font-bold text-ink/40 uppercase tracking-widest">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gold/5">
                      {allUsers.map((u: any) => (
                        <tr key={u.id} className="hover:bg-gold/[0.01] transition-colors">
                          <td className="px-10 py-8">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center text-gold font-serif italic luxury-border">
                                {u.name.charAt(0)}
                              </div>
                              <span className="font-medium text-ink">{u.name}</span>
                            </div>
                          </td>
                          <td className="px-10 py-8 text-ink/60 font-light">{u.email}</td>
                          <td className="px-10 py-8">
                            <span className="px-4 py-1.5 bg-gold/5 text-gold text-[10px] font-bold uppercase tracking-widest rounded-full border border-gold/10">
                              {u.role}
                            </span>
                          </td>
                          <td className="px-10 py-8 text-right">
                            <button
                              onClick={() => handleDeleteAdmin(u.id)}
                              className="p-3 text-red-400 hover:bg-red-50 rounded-xl transition-colors"
                              title="Remove Admin"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "inquiries" && (
            <div className="grid gap-8">
              {replyingTo && (
                <div className="bg-white p-10 rounded-[2.5rem] border border-gold/10 luxury-shadow mb-8">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-xl font-serif text-ink">Reply to {replyingTo.name}</h4>
                    <button onClick={() => setReplyingTo(null)} className="text-ink/40 hover:text-ink">Cancel</button>
                  </div>
                  <form onSubmit={handleReply} className="space-y-6">
                    <div className="p-6 bg-paper/50 rounded-2xl border border-gold/5 italic text-ink/60 text-sm">
                      "{replyingTo.message}"
                    </div>
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      className="w-full px-6 py-4 bg-paper border border-gold/5 rounded-2xl focus:ring-2 focus:ring-gold/20 outline-none text-ink font-light text-sm leading-relaxed transition-all"
                      rows={4}
                      placeholder="Type your reply here..."
                      required
                    />
                    <button type="submit" className="gold-gradient text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] luxury-shadow">
                      Send Reply
                    </button>
                  </form>
                </div>
              )}
              {inquiries.map((inq: any) => (
                <div key={inq.id} className="bg-white p-10 rounded-[2.5rem] border border-gold/10 luxury-shadow group hover:border-gold/30 transition-all">
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gold/5 rounded-full flex items-center justify-center luxury-border">
                        <Users className="w-5 h-5 text-gold" />
                      </div>
                      <div>
                        <h4 className="text-xl font-serif text-ink">{inq.name}</h4>
                        <p className="text-xs text-gold font-bold uppercase tracking-widest mt-1">{inq.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className="text-[10px] font-bold text-ink/30 uppercase tracking-widest">{new Date(inq.createdAt).toLocaleString()}</span>
                      <span className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest ${inq.status === 'replied' ? 'bg-green-50 text-green-600' : 'bg-gold/5 text-gold'}`}>
                        {inq.status}
                      </span>
                    </div>
                  </div>
                  <div className="relative mb-6">
                    <div className="absolute -left-4 top-0 w-1 h-full bg-gold/10 rounded-full"></div>
                    <p className="text-ink/60 text-lg font-light leading-relaxed italic pl-6">"{inq.message}"</p>
                  </div>
                  {inq.replies && inq.replies.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gold/5 space-y-4">
                      {inq.replies.map((reply: any, idx: number) => (
                        <div key={idx} className="bg-paper/30 p-6 rounded-2xl border border-gold/5">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-bold text-gold uppercase tracking-widest">Reply from {reply.adminName}</span>
                            <span className="text-[8px] text-ink/30">{new Date(reply.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="text-sm text-ink/60 font-light">{reply.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {inq.status !== 'replied' && !replyingTo && (
                    <button
                      onClick={() => setReplyingTo(inq)}
                      className="mt-6 text-gold text-[10px] font-bold uppercase tracking-widest hover:underline flex items-center"
                    >
                      <MessageSquare className="w-3 h-3 mr-2" /> Reply to Inquiry
                    </button>
                  )}
                </div>
              ))}
              {inquiries.length === 0 && (
                <div className="text-center py-32 bg-white rounded-[2.5rem] border border-gold/10 luxury-shadow">
                  <MessageSquare className="w-12 h-12 text-gold/20 mx-auto mb-6" />
                  <p className="text-ink/40 font-light text-lg italic">No inquiries received yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "payments" && (
            <div className="bg-white rounded-[2.5rem] border border-gold/10 luxury-shadow overflow-hidden">
              <div className="p-10 border-b border-gold/5 bg-gold/[0.02] flex justify-between items-center">
                <h3 className="text-xl font-serif text-ink">Transaction History</h3>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-xs font-bold text-green-600 uppercase tracking-widest">
                    Total Revenue: ${payments.reduce((acc, p) => acc + p.amount, 0).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-paper/50">
                      <th className="px-10 py-6 text-left text-[10px] font-bold text-ink/40 uppercase tracking-widest">Transaction ID</th>
                      <th className="px-10 py-6 text-left text-[10px] font-bold text-ink/40 uppercase tracking-widest">Customer</th>
                      <th className="px-10 py-6 text-left text-[10px] font-bold text-ink/40 uppercase tracking-widest">Method</th>
                      <th className="px-10 py-6 text-left text-[10px] font-bold text-ink/40 uppercase tracking-widest">Amount</th>
                      <th className="px-10 py-6 text-left text-[10px] font-bold text-ink/40 uppercase tracking-widest">Type</th>
                      <th className="px-10 py-6 text-left text-[10px] font-bold text-ink/40 uppercase tracking-widest">Date</th>
                      <th className="px-10 py-6 text-right text-[10px] font-bold text-ink/40 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold/5">
                    {payments.map((p: any) => (
                      <tr key={p.id} className="hover:bg-gold/[0.01] transition-colors">
                        <td className="px-10 py-8">
                          <span className="font-mono text-xs text-ink/40">#{p.id}</span>
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex flex-col">
                            <span className="font-medium text-ink">{p.userEmail}</span>
                            <span className="text-[10px] text-ink/40 uppercase tracking-widest">
                              {p.method === "Card" ? `Card ending in ${p.last4}` : 
                               p.method === "UPI" ? `UPI: ${p.upiId}` : 
                               `Net Banking: ${p.bankName}`}
                            </span>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <span className="text-[10px] font-bold text-ink/60 uppercase tracking-widest">{p.method}</span>
                        </td>
                        <td className="px-10 py-8 text-lg font-serif text-ink">${p.amount.toLocaleString()}</td>
                        <td className="px-10 py-8">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${p.type === "Full" ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"}`}>
                            {p.type}
                          </span>
                        </td>
                        <td className="px-10 py-8 text-sm text-ink/60">{new Date(p.createdAt).toLocaleDateString()}</td>
                        <td className="px-10 py-8 text-right">
                          <span className="px-4 py-1.5 bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-widest rounded-full border border-green-100">
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {payments.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-10 py-20 text-center">
                          <CreditCard className="w-12 h-12 text-gold/20 mx-auto mb-6" />
                          <p className="text-ink/40 font-light text-lg italic">No transactions recorded yet.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Gateway Configuration Section */}
              <div className="p-10 bg-paper/30 border-t border-gold/5">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gold/5 rounded-xl text-gold luxury-border">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-serif text-ink">Payment Gateway Integration</h3>
                      <p className="text-xs text-ink/40 font-light mt-1">Configure your secure payment processing settings</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${gatewayStatus?.stripeConfigured ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"}`}></div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-ink/60">
                      {gatewayStatus?.stripeConfigured ? "Stripe Connected" : "Stripe Disconnected"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-8 bg-white rounded-3xl border border-gold/10 luxury-shadow space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <CreditCard className="h-5 w-5 text-gold" />
                        <h4 className="font-serif text-ink">Stripe Integration</h4>
                      </div>
                      <span className="text-[10px] font-bold text-gold uppercase tracking-widest">Active Gateway</span>
                    </div>
                    <p className="text-xs text-ink/60 font-light leading-relaxed">
                      Stripe is currently the primary gateway for processing international credit and debit card payments.
                    </p>
                    <div className="space-y-4 pt-4 border-t border-gold/5">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-ink/40 uppercase tracking-widest">Publishable Key</span>
                        <span className="font-mono text-ink/60">{gatewayStatus?.publishableKey ? `${gatewayStatus.publishableKey.slice(0, 12)}...` : "Not Found"}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-ink/40 uppercase tracking-widest">Secret Key</span>
                        <span className="font-mono text-ink/60">{gatewayStatus?.stripeConfigured ? "••••••••••••••••" : "Not Found"}</span>
                      </div>
                    </div>
                    {!gatewayStatus?.stripeConfigured && (
                      <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-start space-x-3">
                        <div className="p-1.5 bg-red-100 rounded-lg text-red-600">
                          <ShieldCheck className="h-3 w-3" />
                        </div>
                        <p className="text-[10px] text-red-600 font-medium leading-relaxed">
                          Action Required: Please configure STRIPE_SECRET_KEY and VITE_STRIPE_PUBLISHABLE_KEY in your environment variables to enable real payments.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="p-8 bg-paper/50 rounded-3xl border border-dashed border-gold/20 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="p-4 bg-gold/5 rounded-full text-gold/40">
                      <Plus className="h-8 w-8" />
                    </div>
                    <div>
                      <h4 className="font-serif text-ink/60">Add New Gateway</h4>
                      <p className="text-xs text-ink/30 font-light mt-1">PayPal and Razorpay integrations coming soon</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "content" && (
            <div className="space-y-12">
              <section className="bg-white p-12 rounded-[2.5rem] border border-gold/10 luxury-shadow space-y-10">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-gold/5 rounded-xl text-gold luxury-border">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <h3 className="text-2xl font-serif text-ink">Home Page Hero</h3>
                </div>
                <div className="grid grid-cols-1 gap-10">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-[0.2em]">Hero Title</label>
                    <input
                      type="text"
                      value={localData.content.home.heroTitle}
                      onChange={(e) => updateHome("heroTitle", e.target.value)}
                      className="w-full px-6 py-4 bg-paper border border-gold/5 rounded-2xl focus:ring-2 focus:ring-gold/20 outline-none text-ink font-serif text-xl transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-[0.2em]">Hero Subtitle</label>
                    <textarea
                      value={localData.content.home.heroSubtitle}
                      onChange={(e) => updateHome("heroSubtitle", e.target.value)}
                      rows={4}
                      className="w-full px-6 py-4 bg-paper border border-gold/5 rounded-2xl focus:ring-2 focus:ring-gold/20 outline-none text-ink font-light leading-relaxed transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-[0.2em]">Hero Image URL</label>
                    <input
                      type="text"
                      value={localData.content.home.heroImage}
                      onChange={(e) => updateHome("heroImage", e.target.value)}
                      className="w-full px-6 py-4 bg-paper border border-gold/5 rounded-2xl focus:ring-2 focus:ring-gold/20 outline-none text-ink text-sm font-mono transition-all"
                    />
                  </div>
                </div>
              </section>

              <section className="bg-white p-12 rounded-[2.5rem] border border-gold/10 luxury-shadow space-y-10">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-gold/5 rounded-xl text-gold luxury-border">
                    <FileText className="h-5 w-5" />
                  </div>
                  <h3 className="text-2xl font-serif text-ink">About Page Content</h3>
                </div>
                <div className="grid grid-cols-1 gap-10">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-[0.2em]">About Title</label>
                    <input
                      type="text"
                      value={localData.content.about.title}
                      onChange={(e) => updateAbout("title", e.target.value)}
                      className="w-full px-6 py-4 bg-paper border border-gold/5 rounded-2xl focus:ring-2 focus:ring-gold/20 outline-none text-ink font-serif text-xl transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-[0.2em]">About Content</label>
                    <textarea
                      value={localData.content.about.content}
                      onChange={(e) => updateAbout("content", e.target.value)}
                      rows={8}
                      className="w-full px-6 py-4 bg-paper border border-gold/5 rounded-2xl focus:ring-2 focus:ring-gold/20 outline-none text-ink font-light leading-relaxed transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <ImageUpload
                      label="About Section Image"
                      currentImage={localData.content.about.image}
                      onUpload={(base64) => updateAbout("image", base64)}
                    />
                    <input
                      type="text"
                      value={localData.content.about.image}
                      onChange={(e) => updateAbout("image", e.target.value)}
                      className="w-full px-6 py-4 bg-paper border border-gold/5 rounded-2xl focus:ring-2 focus:ring-gold/20 outline-none text-ink text-sm font-mono transition-all"
                      placeholder="Or enter image URL"
                    />
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === "services" && (
            <div className="space-y-10">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-serif text-ink">Manage Services</h3>
                <button onClick={addService} className="gold-gradient text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] flex items-center luxury-shadow hover:scale-105 transition-all">
                  <Plus className="h-4 w-4 mr-3" /> Add Service
                </button>
              </div>
              <div className="grid grid-cols-1 gap-8">
                {localData.services.map(service => (
                  <div key={service.id} className="bg-white p-10 rounded-[2.5rem] border border-gold/10 luxury-shadow flex gap-10 group hover:border-gold/30 transition-all">
                    <div className="flex-1 grid grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-widest">Service Title</label>
                        <input
                          value={service.title}
                          onChange={(e) => updateService(service.id, "title", e.target.value)}
                          className="w-full px-6 py-4 bg-paper border border-gold/5 rounded-2xl focus:ring-2 focus:ring-gold/20 outline-none text-ink font-serif text-lg transition-all"
                          placeholder="Service Title"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-widest">Category</label>
                        <input
                          value={service.category}
                          onChange={(e) => updateService(service.id, "category", e.target.value)}
                          className="w-full px-6 py-4 bg-paper border border-gold/5 rounded-2xl focus:ring-2 focus:ring-gold/20 outline-none text-ink text-sm transition-all"
                          placeholder="Category"
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-widest">Icon Name</label>
                        <input
                          value={service.icon}
                          onChange={(e) => updateService(service.id, "icon", e.target.value)}
                          className="w-full px-6 py-4 bg-paper border border-gold/5 rounded-2xl focus:ring-2 focus:ring-gold/20 outline-none text-ink text-sm font-mono transition-all"
                          placeholder="Icon Name (e.g. Map, Hotel)"
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-widest">Description</label>
                        <textarea
                          value={service.description}
                          onChange={(e) => updateService(service.id, "description", e.target.value)}
                          className="w-full px-6 py-4 bg-paper border border-gold/5 rounded-2xl focus:ring-2 focus:ring-gold/20 outline-none text-ink font-light text-sm leading-relaxed transition-all"
                          rows={3}
                          placeholder="Description"
                        />
                      </div>
                    </div>
                    <button onClick={() => removeService(service.id)} className="text-red-400 hover:bg-red-50 p-4 rounded-2xl self-start transition-colors">
                      <Trash2 className="h-6 w-6" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "destinations" && (
            <div className="space-y-10">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-serif text-ink">All Destinations</h3>
                <button onClick={addDestination} className="gold-gradient text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] flex items-center luxury-shadow hover:scale-105 transition-all">
                  <Plus className="h-4 w-4 mr-3" /> Add New
                </button>
              </div>
              <div className="grid grid-cols-1 gap-8">
                {localData.destinations.map(dest => (
                  <div key={dest.id} className="bg-white p-10 rounded-[2.5rem] border border-gold/10 luxury-shadow flex gap-10 group hover:border-gold/30 transition-all">
                    <div className="relative w-48 h-48 rounded-[2rem] overflow-hidden luxury-border flex flex-col items-center justify-center bg-paper group">
                      <img src={dest.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ImageUpload
                          onUpload={(base64) => updateDestination(dest.id, "image", base64)}
                          className="!space-y-0"
                        />
                      </div>
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-widest">Name</label>
                        <input
                          value={dest.name}
                          onChange={(e) => updateDestination(dest.id, "name", e.target.value)}
                          className="w-full px-6 py-4 bg-paper border border-gold/5 rounded-2xl focus:ring-2 focus:ring-gold/20 outline-none text-ink font-serif text-lg transition-all"
                          placeholder="Name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-widest">Price ($)</label>
                        <input
                          type="number"
                          value={dest.price}
                          onChange={(e) => updateDestination(dest.id, "price", Number(e.target.value))}
                          className="w-full px-6 py-4 bg-paper border border-gold/5 rounded-2xl focus:ring-2 focus:ring-gold/20 outline-none text-ink text-sm transition-all"
                          placeholder="Price"
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-widest">Type / Category</label>
                        <input
                          value={dest.type}
                          onChange={(e) => updateDestination(dest.id, "type", e.target.value)}
                          className="w-full px-6 py-4 bg-paper border border-gold/5 rounded-2xl focus:ring-2 focus:ring-gold/20 outline-none text-ink text-sm transition-all"
                          placeholder="Type (e.g. Beach, Cultural)"
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-widest">Description</label>
                        <textarea
                          value={dest.description}
                          onChange={(e) => updateDestination(dest.id, "description", e.target.value)}
                          className="w-full px-6 py-4 bg-paper border border-gold/5 rounded-2xl focus:ring-2 focus:ring-gold/20 outline-none text-ink font-light text-sm leading-relaxed transition-all"
                          rows={2}
                          placeholder="Short Description"
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-widest">Detailed Content</label>
                        <textarea
                          value={dest.content || ""}
                          onChange={(e) => updateDestination(dest.id, "content", e.target.value)}
                          className="w-full px-6 py-4 bg-paper border border-gold/5 rounded-2xl focus:ring-2 focus:ring-gold/20 outline-none text-ink font-light text-sm leading-relaxed transition-all"
                          rows={4}
                          placeholder="Detailed itinerary or content"
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-widest">Main Image URL</label>
                        <input
                          value={dest.image}
                          onChange={(e) => updateDestination(dest.id, "image", e.target.value)}
                          className="w-full px-6 py-4 bg-paper border border-gold/5 rounded-2xl focus:ring-2 focus:ring-gold/20 outline-none text-ink text-sm font-mono transition-all"
                          placeholder="Main Image URL"
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-widest">Additional Images</label>
                        <div className="flex flex-wrap gap-4 mb-4">
                          {(dest.images || []).map((img, idx) => (
                            <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gold/10 luxury-shadow group/img">
                              <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              <button
                                onClick={() => {
                                  const newImages = [...(dest.images || [])];
                                  newImages.splice(idx, 1);
                                  updateDestination(dest.id, "images", newImages);
                                }}
                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                          <ImageUpload
                            onUpload={(base64) => {
                              const newImages = [...(dest.images || []), base64];
                              updateDestination(dest.id, "images", newImages);
                            }}
                            className="!space-y-0"
                          />
                        </div>
                        <textarea
                          value={dest.images?.join("\n") || ""}
                          onChange={(e) => updateDestination(dest.id, "images", e.target.value.split("\n").filter(url => url.trim()))}
                          className="w-full px-6 py-4 bg-paper border border-gold/5 rounded-2xl focus:ring-2 focus:ring-gold/20 outline-none text-ink text-sm font-mono transition-all"
                          rows={2}
                          placeholder="Or enter additional image URLs, one per line"
                        />
                      </div>
                    </div>
                    <button onClick={() => removeDestination(dest.id)} className="text-red-400 hover:bg-red-50 p-4 rounded-2xl self-start transition-colors">
                      <Trash2 className="h-6 w-6" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "blog" && (
            <div className="space-y-10">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-serif text-ink">Blog Posts</h3>
                <button onClick={addBlogPost} className="gold-gradient text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] flex items-center luxury-shadow hover:scale-105 transition-all">
                  <Plus className="h-4 w-4 mr-3" /> New Post
                </button>
              </div>
              <div className="grid grid-cols-1 gap-10">
                {localData.blogPosts.map(post => (
                  <div key={post.id} className="bg-white p-12 rounded-[2.5rem] border border-gold/10 luxury-shadow space-y-10 group hover:border-gold/30 transition-all">
                    <div className="flex gap-10">
                      <div className="relative w-32 h-32 rounded-3xl overflow-hidden luxury-border group">
                        <img src={post.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ImageUpload
                            onUpload={(base64) => updateBlogPost(post.id, "image", base64)}
                            className="!space-y-0"
                          />
                        </div>
                      </div>
                      <div className="flex-1 space-y-8">
                        <div className="space-y-2">
                          <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-widest">Post Title</label>
                          <input
                            value={post.title}
                            onChange={(e) => updateBlogPost(post.id, "title", e.target.value)}
                            className="w-full px-6 py-4 bg-paper border border-gold/5 rounded-2xl focus:ring-2 focus:ring-gold/20 outline-none text-ink font-serif text-xl transition-all"
                            placeholder="Post Title"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                          <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-widest">Author</label>
                            <input
                              value={post.author}
                              onChange={(e) => updateBlogPost(post.id, "author", e.target.value)}
                              className="w-full px-6 py-4 bg-paper border border-gold/5 rounded-2xl focus:ring-2 focus:ring-gold/20 outline-none text-ink text-sm transition-all"
                              placeholder="Author"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-widest">Publish Date</label>
                            <input
                              type="date"
                              value={post.date}
                              onChange={(e) => updateBlogPost(post.id, "date", e.target.value)}
                              className="w-full px-6 py-4 bg-paper border border-gold/5 rounded-2xl focus:ring-2 focus:ring-gold/20 outline-none text-ink text-sm transition-all"
                            />
                          </div>
                        </div>
                      </div>
                      <button onClick={() => removeBlogPost(post.id)} className="text-red-400 hover:bg-red-50 p-4 rounded-2xl self-start transition-colors">
                        <Trash2 className="h-6 w-6" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-widest">Post Content</label>
                      <textarea
                        value={post.content}
                        onChange={(e) => updateBlogPost(post.id, "content", e.target.value)}
                        className="w-full px-6 py-4 bg-paper border border-gold/5 rounded-2xl focus:ring-2 focus:ring-gold/20 outline-none text-ink font-light text-sm leading-relaxed transition-all"
                        rows={6}
                        placeholder="Post Content"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="bg-white p-12 rounded-[2.5rem] border border-gold/10 luxury-shadow space-y-12">
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-[0.2em]">Site Name</label>
                  <input
                    type="text"
                    value={localData.settings.siteName}
                    onChange={(e) => updateSettings("siteName", e.target.value)}
                    className="w-full px-6 py-4 bg-paper border border-gold/5 rounded-2xl focus:ring-2 focus:ring-gold/20 outline-none text-ink font-serif text-lg transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-[0.2em]">Primary Brand Color</label>
                  <div className="flex gap-4">
                    <input
                      type="color"
                      value={localData.settings.primaryColor}
                      onChange={(e) => updateSettings("primaryColor", e.target.value)}
                      className="h-14 w-14 rounded-2xl border-none cursor-pointer luxury-shadow"
                    />
                    <input
                      type="text"
                      value={localData.settings.primaryColor}
                      onChange={(e) => updateSettings("primaryColor", e.target.value)}
                      className="flex-1 px-6 py-4 bg-paper border border-gold/5 rounded-2xl text-sm font-mono transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-12 border-t border-gold/5">
                <div className="flex items-center space-x-4 mb-8">
                  <CreditCard className="w-5 h-5 text-gold" />
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-ink/40">Payment Gateway Settings</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-medium text-ink/40 uppercase tracking-widest">UPI ID</label>
                    <input
                      type="text"
                      value={localData.settings.payment?.upiId || ""}
                      onChange={(e) => updatePaymentSettings("upiId", e.target.value)}
                      className="w-full px-6 py-4 bg-paper border border-gold/5 rounded-2xl text-sm font-mono transition-all"
                      placeholder="your-upi-id@bank"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-medium text-ink/40 uppercase tracking-widest">Merchant Name</label>
                    <input
                      type="text"
                      value={localData.settings.payment?.merchantName || ""}
                      onChange={(e) => updatePaymentSettings("merchantName", e.target.value)}
                      className="w-full px-6 py-4 bg-paper border border-gold/5 rounded-2xl text-sm font-light transition-all"
                      placeholder="WorldClass Travel"
                    />
                  </div>
                  <div className="space-y-3 md:col-span-2">
                    <ImageUpload
                      label="Payment QR Code"
                      currentImage={localData.settings.payment?.qrCode}
                      onUpload={(base64) => updatePaymentSettings("qrCode", base64)}
                    />
                    <input
                      type="text"
                      value={localData.settings.payment?.qrCode || ""}
                      onChange={(e) => updatePaymentSettings("qrCode", e.target.value)}
                      className="w-full px-6 py-4 bg-paper border border-gold/5 rounded-2xl text-sm font-mono transition-all"
                      placeholder="Or enter QR code URL"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-12 border-t border-gold/5">
                <div className="flex items-center space-x-4 mb-8">
                  <TrendingUp className="w-5 h-5 text-gold" />
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-ink/40">SEO & Metadata Optimization</h4>
                </div>
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-medium text-ink/40 uppercase tracking-widest">Meta Title Template</label>
                    <input
                      type="text"
                      value={localData.settings.seo.title}
                      onChange={(e) => setLocalData({...localData, settings: {...localData.settings, seo: {...localData.settings.seo, title: e.target.value}}})}
                      className="w-full px-6 py-4 bg-paper border border-gold/5 rounded-2xl text-sm font-light transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-medium text-ink/40 uppercase tracking-widest">Global Meta Description</label>
                    <textarea
                      value={localData.settings.seo.description}
                      onChange={(e) => setLocalData({...localData, settings: {...localData.settings, seo: {...localData.settings.seo, description: e.target.value}}})}
                      rows={4}
                      className="w-full px-6 py-4 bg-paper border border-gold/5 rounded-2xl text-sm font-light leading-relaxed transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
