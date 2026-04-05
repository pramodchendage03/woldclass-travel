import { useState } from "react";
import { useContent } from "../context/ContentContext";
import { motion } from "motion/react";
import { User, Mail, Shield, Calendar, ArrowRight, LogOut, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Profile() {
  const { user, logout, isAdmin } = useContent();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/");
    toast.success("Logged out successfully");
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      const updatedUser = await response.json();
      // Update local storage and context
      const token = localStorage.getItem("token");
      if (token) {
        localStorage.setItem("user", JSON.stringify(updatedUser));
        // We might need a way to refresh the context user, but for now, let's just toast and reload or suggest logout
        toast.success("Profile updated successfully. Please log in again to see changes.");
        setIsEditing(false);
        setTimeout(() => {
          logout();
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      toast.error("Error updating profile");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper pt-40 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[3rem] luxury-shadow border border-gold/10 overflow-hidden"
        >
          {/* Profile Header */}
          <div className="bg-gold/5 p-12 border-b border-gold/10 flex flex-col md:flex-row items-center gap-8">
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-4xl font-serif text-gold luxury-border luxury-shadow">
              {user.name.charAt(0)}
            </div>
            <div className="text-center md:text-left space-y-2">
              <h1 className="text-4xl font-serif text-ink">{user.name}</h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <span className="px-4 py-1.5 bg-white rounded-full text-[10px] font-bold uppercase tracking-widest text-ink/40 border border-gold/10 flex items-center">
                  <Mail className="w-3 h-3 mr-2 text-gold" /> {user.email}
                </span>
                <span className="px-4 py-1.5 bg-white rounded-full text-[10px] font-bold uppercase tracking-widest text-ink/40 border border-gold/10 flex items-center">
                  <Shield className="w-3 h-3 mr-2 text-gold" /> {user.role}
                </span>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-12 grid md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <h3 className="text-xl font-serif text-ink italic">Account Overview</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-6 bg-paper/50 rounded-2xl border border-gold/5">
                  <div className="flex items-center space-x-4">
                    <Calendar className="w-5 h-5 text-gold" />
                    <div>
                      <p className="text-[10px] font-bold text-ink/40 uppercase tracking-widest">Member Since</p>
                      <p className="text-sm text-ink font-medium">March 2024</p>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => navigate("/my-bookings")}
                  className="w-full flex items-center justify-between p-6 bg-paper/50 rounded-2xl border border-gold/5 hover:border-gold/30 transition-all group"
                >
                  <div className="flex items-center space-x-4">
                    <Calendar className="w-5 h-5 text-gold" />
                    <div>
                      <p className="text-[10px] font-bold text-ink/40 uppercase tracking-widest">My Bookings</p>
                      <p className="text-sm text-ink font-medium">View your travel history</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gold group-hover:translate-x-1 transition-transform" />
                </button>

                {isAdmin && (
                  <button 
                    onClick={() => navigate("/admin")}
                    className="w-full flex items-center justify-between p-6 bg-gold/5 rounded-2xl border border-gold/10 hover:border-gold/30 transition-all group"
                  >
                    <div className="flex items-center space-x-4">
                      <Settings className="w-5 h-5 text-gold" />
                      <div>
                        <p className="text-[10px] font-bold text-gold uppercase tracking-widest">Admin Panel</p>
                        <p className="text-sm text-ink font-medium">Manage site content</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gold group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-8">
              <h3 className="text-xl font-serif text-ink italic">Account Actions</h3>
              <div className="space-y-4">
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="w-full p-6 bg-white border border-gold/10 rounded-2xl text-ink font-bold uppercase tracking-widest text-[10px] hover:bg-gold/5 transition-all"
                >
                  {isEditing ? "Cancel Editing" : "Edit Profile Details"}
                </button>
                
                <button 
                  onClick={handleLogout}
                  className="w-full p-6 bg-red-50 border border-red-100 rounded-2xl text-red-600 font-bold uppercase tracking-widest text-[10px] hover:bg-red-100 transition-all flex items-center justify-center"
                >
                  <LogOut className="w-4 h-4 mr-3" /> Sign Out of Account
                </button>
              </div>

              {isEditing && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-6 bg-paper rounded-2xl border border-gold/10"
                >
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-ink/40 uppercase tracking-widest">Full Name</label>
                      <input 
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full p-4 bg-white border border-gold/10 rounded-xl text-sm focus:outline-none focus:border-gold"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-ink/40 uppercase tracking-widest">Email Address</label>
                      <input 
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full p-4 bg-white border border-gold/10 rounded-xl text-sm focus:outline-none focus:border-gold"
                        required
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full p-4 bg-gold text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gold/90 transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? "Updating..." : "Save Changes"}
                    </button>
                  </form>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
