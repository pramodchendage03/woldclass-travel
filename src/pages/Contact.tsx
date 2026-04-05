import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContent } from "../context/ContentContext";
import { Mail, Phone, MapPin, Send, Globe, Clock, CheckCircle } from "lucide-react";
import { motion } from "motion/react";

export default function Contact() {
  const { data } = useContent();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "General Inquiry",
    message: ""
  });

  if (!data) return null;

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.message.trim()) newErrors.message = "Message is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setSubmitted(true);
        setFormData({ name: "", email: "", subject: "General Inquiry", message: "" });
      }
    } catch (error) {
      console.error("Error submitting inquiry:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-32 bg-paper">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1436491865332-7a61a109c0f3?auto=format&fit=crop&q=80"
            alt="Contact Hero"
            className="w-full h-full object-cover scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-ink/70 backdrop-blur-[2px]" />
        </div>
        <div className="relative z-10 text-center px-4">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-gold font-medium tracking-[0.4em] uppercase text-xs mb-6 block"
          >
            Connect With Us
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-serif text-white mb-8 leading-tight italic"
          >
            Get in Touch
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 max-w-2xl mx-auto font-light text-lg leading-relaxed"
          >
            Our global team of travel curators is ready to assist you in crafting 
            your next extraordinary journey.
          </motion.p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-12">
            <div className="bg-white p-12 rounded-[3rem] luxury-shadow border border-gold/10 space-y-12">
              <div className="flex items-start space-x-6 group">
                <div className="w-14 h-14 rounded-2xl bg-gold/5 text-gold flex items-center justify-center shrink-0 luxury-border group-hover:gold-gradient group-hover:text-white transition-all duration-500">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-serif text-ink mb-2">Email Us</h3>
                  <p className="text-ink/40 text-sm font-light">hello@worldclass.travel</p>
                  <p className="text-ink/40 text-sm font-light">concierge@worldclass.travel</p>
                </div>
              </div>

              <div className="flex items-start space-x-6 group">
                <div className="w-14 h-14 rounded-2xl bg-gold/5 text-gold flex items-center justify-center shrink-0 luxury-border group-hover:gold-gradient group-hover:text-white transition-all duration-500">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-serif text-ink mb-2">Call Us</h3>
                  <p className="text-ink/40 text-sm font-light">+1 (555) 123-4567</p>
                  <p className="text-ink/40 text-sm font-light">Available 24/7 for Members</p>
                </div>
              </div>

              <div className="flex items-start space-x-6 group">
                <div className="w-14 h-14 rounded-2xl bg-gold/5 text-gold flex items-center justify-center shrink-0 luxury-border group-hover:gold-gradient group-hover:text-white transition-all duration-500">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-serif text-ink mb-2">Visit Us</h3>
                  <p className="text-ink/40 text-sm font-light">123 Travel Plaza, Suite 456</p>
                  <p className="text-ink/40 text-sm font-light">Global City, GC 78910</p>
                </div>
              </div>
            </div>

            <div className="bg-ink rounded-[3rem] p-12 text-white relative overflow-hidden luxury-shadow">
              <div className="relative z-10">
                <h3 className="text-2xl font-serif mb-6 italic">Global Presence</h3>
                <p className="text-white/40 text-sm font-light mb-8 leading-relaxed">With offices in London, Tokyo, and New York, we're always close by to handle your requests.</p>
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-12 h-12 rounded-full border-2 border-ink overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?u=${i}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <div className="w-12 h-12 rounded-full bg-gold border-2 border-ink flex items-center justify-center text-[10px] font-bold">+12</div>
                </div>
              </div>
              <Globe className="absolute -bottom-10 -right-10 h-48 w-48 text-white/5" />
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-12 md:p-20 rounded-[4rem] luxury-shadow border border-gold/10">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20"
                >
                  <div className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 luxury-border border-green-100">
                    <CheckCircle className="h-10 w-10" />
                  </div>
                  <h2 className="text-4xl font-serif text-ink mb-6">Message Sent Successfully</h2>
                  <p className="text-ink/40 font-light text-lg max-w-md mx-auto">
                    Thank you for reaching out. Your message has been received, and one of our travel curators will contact you within 24 hours.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12">
                    <button
                      onClick={() => navigate("/")}
                      className="px-8 py-4 gold-gradient text-white font-bold uppercase tracking-widest text-[10px] rounded-xl luxury-shadow hover:scale-105 transition-all"
                    >
                      Return to Home
                    </button>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="text-gold font-bold uppercase tracking-widest text-[10px] hover:underline"
                    >
                      Send another message
                    </button>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-gold uppercase tracking-[0.2em]">Full Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          if (errors.name) setErrors({ ...errors, name: "" });
                        }}
                        placeholder="John Doe"
                        className={`w-full px-0 py-4 bg-transparent border-b ${errors.name ? 'border-red-500' : 'border-gold/20'} focus:border-gold outline-none text-ink font-light transition-all placeholder:text-ink/20`}
                      />
                      {errors.name && <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider">{errors.name}</p>}
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-gold uppercase tracking-[0.2em]">Email Address</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          if (errors.email) setErrors({ ...errors, email: "" });
                        }}
                        placeholder="john@example.com"
                        className={`w-full px-0 py-4 bg-transparent border-b ${errors.email ? 'border-red-500' : 'border-gold/20'} focus:border-gold outline-none text-ink font-light transition-all placeholder:text-ink/20`}
                      />
                      {errors.email && <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-gold uppercase tracking-[0.2em]">Subject</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-0 py-4 bg-transparent border-b border-gold/20 focus:border-gold outline-none text-ink font-light transition-all appearance-none cursor-pointer"
                    >
                      <option>General Inquiry</option>
                      <option>Booking Request</option>
                      <option>Partnership Opportunity</option>
                      <option>Feedback</option>
                    </select>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-gold uppercase tracking-[0.2em]">Your Message</label>
                    <textarea
                      rows={6}
                      value={formData.message}
                      onChange={(e) => {
                        setFormData({ ...formData, message: e.target.value });
                        if (errors.message) setErrors({ ...errors, message: "" });
                      }}
                      placeholder="Tell us about your dream trip..."
                      className={`w-full px-0 py-4 bg-transparent border-b ${errors.message ? 'border-red-500' : 'border-gold/20'} focus:border-gold outline-none text-ink font-light transition-all resize-none placeholder:text-ink/20`}
                    />
                    {errors.message && <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider">{errors.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full gold-gradient text-white font-bold uppercase tracking-widest text-xs py-6 rounded-2xl luxury-shadow hover:scale-[1.02] transition-all disabled:opacity-50"
                  >
                    {loading ? "Sending..." : "Send Message"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-48">
        <div className="h-[500px] bg-ink rounded-[4rem] overflow-hidden relative luxury-shadow">
          <img
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1920&q=80"
            alt="Map"
            className="w-full h-full object-cover opacity-20 grayscale"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] luxury-shadow border border-gold/10 flex items-center space-x-6">
              <div className="w-16 h-16 gold-gradient rounded-2xl flex items-center justify-center text-white luxury-shadow">
                <MapPin className="h-8 w-8" />
              </div>
              <div>
                <p className="text-xl font-serif text-ink mb-1">WorldClass HQ</p>
                <p className="text-ink/40 text-xs font-light tracking-widest">Global City, GC 78910</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
