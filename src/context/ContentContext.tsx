import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface SiteData {
  settings: {
    siteName: string;
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    logo: string;
    seo: {
      title: string;
      description: string;
    };
    payment: {
      upiId: string;
      qrCode: string;
      merchantName: string;
    };
  };
  content: {
    home: {
      heroTitle: string;
      heroSubtitle: string;
      heroImage: string;
    };
    about: {
      title: string;
      content: string;
      image: string;
    };
  };
  destinations: Destination[];
  blogPosts: BlogPost[];
  services: Service[];
}

export interface Destination {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  images?: string[];
  content?: string;
  type: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  image: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  category?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

interface ContentContextType {
  data: SiteData | null;
  loading: boolean;
  updateData: (newData: SiteData) => Promise<void>;
  user: User | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  createBooking: (bookingData: any) => Promise<boolean>;
  updateBooking: (id: string, updateData: any) => Promise<boolean>;
  getAdminUsers: () => Promise<any[]>;
  addAdmin: (adminData: any) => Promise<{ success: boolean; error?: string }>;
  deleteAdmin: (id: string) => Promise<boolean>;
  processPayment: (paymentData: any) => Promise<{ success: boolean; data?: any; error?: string }>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchData();
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/data");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  const updateData = async (newData: SiteData) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/data", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newData),
      });
      if (res.ok) {
        setData(newData);
      }
    } catch (err) {
      console.error("Failed to update data", err);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (json.token) {
        localStorage.setItem("token", json.token);
        localStorage.setItem("user", JSON.stringify(json.user));
        setUser(json.user);
        return { success: true };
      }
      return { success: false, error: json.error || "Login failed" };
    } catch (err) {
      console.error("Login failed", err);
      return { success: false, error: "Network error" };
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      const json = await res.json();
      if (json.token) {
        localStorage.setItem("token", json.token);
        localStorage.setItem("user", JSON.stringify(json.user));
        setUser(json.user);
        return { success: true };
      }
      return { success: false, error: json.error || "Signup failed" };
    } catch (err) {
      console.error("Signup failed", err);
      return { success: false, error: "Network error" };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const createBooking = async (bookingData: any) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(bookingData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Booking failed");
      }
      return await res.json();
    } catch (err: any) {
      console.error("Booking failed", err);
      return null;
    }
  };

  const updateBooking = async (id: string, updateData: any) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(updateData),
      });
      return res.ok;
    } catch (err) {
      console.error("Update booking failed", err);
      return false;
    }
  };

  const getAdminUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/users", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      return await res.json();
    } catch (err) {
      console.error("Failed to fetch admin users", err);
      return [];
    }
  };

  const addAdmin = async (adminData: any) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(adminData),
      });
      const json = await res.json();
      if (res.ok) return { success: true };
      return { success: false, error: json.error || "Failed to add admin" };
    } catch (err) {
      console.error("Add admin failed", err);
      return { success: false, error: "Network error" };
    }
  };

  const deleteAdmin = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      return res.ok;
    } catch (err) {
      console.error("Delete admin failed", err);
      return false;
    }
  };

  const processPayment = async (paymentData: any) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(paymentData),
      });
      const json = await res.json();
      return { success: res.ok, data: json };
    } catch (err: any) {
      console.error("Payment processing failed", err);
      return { success: false, error: err.message };
    }
  };

  return (
    <ContentContext.Provider value={{ 
      data, 
      loading, 
      updateData, 
      user, 
      isAdmin: user?.role === 'admin', 
      login, 
      signup, 
      logout,
      createBooking,
      updateBooking,
      getAdminUsers,
      addAdmin,
      deleteAdmin,
      processPayment
    }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error("useContent must be used within a ContentProvider");
  }
  return context;
}
