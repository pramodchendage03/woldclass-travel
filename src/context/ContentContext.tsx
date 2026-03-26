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
}

interface ContentContextType {
  data: SiteData | null;
  loading: boolean;
  updateData: (newData: SiteData) => Promise<void>;
  isAdmin: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchData();
    const token = localStorage.getItem("admin_token");
    if (token) setIsAdmin(true);
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
      const res = await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      });
      if (res.ok) {
        setData(newData);
      }
    } catch (err) {
      console.error("Failed to update data", err);
    }
  };

  const login = async (password: string) => {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await res.json();
      if (json.success) {
        localStorage.setItem("admin_token", json.token);
        setIsAdmin(true);
        return true;
      }
    } catch (err) {
      console.error("Login failed", err);
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    setIsAdmin(false);
  };

  return (
    <ContentContext.Provider value={{ data, loading, updateData, isAdmin, login, logout }}>
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
