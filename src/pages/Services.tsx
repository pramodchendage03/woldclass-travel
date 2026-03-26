import { useState } from "react";
import { useContent } from "../context/ContentContext";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { 
  Map, FileText, Hotel, Plane, Shield, Compass, 
  Car, Ship, Briefcase, Home, Users, Coffee, Heart, ArrowRight
} from "lucide-react";

const iconMap: Record<string, any> = {
  Map, FileText, Hotel, Plane, Shield, Compass,
  Car, Ship, Briefcase, Home, Users, Coffee, Heart
};

export default function Services() {
  const { data } = useContent();
  if (!data) return null;

  const categories = ["All", ...new Set(data.services.map(s => s.category || "General"))];
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredServices = data.services.filter(s => 
    activeCategory === "All" || (s.category || "General") === activeCategory
  );

  return (
    <div className="pb-24 bg-paper">
      <div className="luxury-gradient text-white py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1436491865332-7a61a109c0f2?auto=format&fit=crop&w=1920&q=80" 
            alt="Background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-gold font-medium tracking-[0.3em] uppercase text-sm mb-6 block"
          >
            Excellence in Motion
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-serif mb-8 leading-tight"
          >
            Our Premium Services
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 max-w-2xl mx-auto text-lg font-light leading-relaxed"
          >
            We provide end-to-end solutions for your travel needs, ensuring every detail is handled with precision and grace.
          </motion.p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="bg-white rounded-2xl luxury-shadow luxury-border p-4 flex items-center justify-center space-x-3 overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-8 py-3 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all whitespace-nowrap ${
                activeCategory === cat
                  ? "gold-gradient text-white shadow-lg shadow-gold/20"
                  : "bg-paper text-ink/60 hover:bg-gold/5 hover:text-gold"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredServices.map((service, idx) => {
            const Icon = iconMap[service.icon] || Compass;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                viewport={{ once: true }}
              >
                <Link 
                  to={`/services/${service.id}`}
                  className="block bg-white p-10 rounded-[2rem] luxury-shadow luxury-border hover:border-gold transition-all group h-full"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gold/5 text-gold flex items-center justify-center mb-8 group-hover:gold-gradient group-hover:text-white transition-all duration-500">
                    <Icon className="h-8 w-8" />
                  </div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-serif text-ink group-hover:text-gold transition-colors">{service.title}</h3>
                  </div>
                  <p className="text-ink/50 text-sm leading-relaxed mb-8 font-light">{service.description}</p>
                  <div className="flex items-center text-gold font-semibold text-xs uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                    Explore Details <ArrowRight className="ml-2 w-4 h-4" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-40">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-gold font-medium tracking-[0.3em] uppercase text-xs mb-4 block">Tailored Experiences</span>
            <h2 className="text-5xl font-serif text-ink mb-8 leading-tight">Bespoke Travel Planning</h2>
            <p className="text-ink/60 mb-10 leading-relaxed font-light text-lg">
              Our expert planners work closely with you to understand your desires and craft an itinerary that exceeds your expectations. From private jet charters to exclusive villa rentals, we handle it all with absolute discretion.
            </p>
            <ul className="space-y-6">
              {["Personalized Itineraries", "VIP Airport Services", "Private Guided Tours", "Exclusive Access Events"].map((item, idx) => (
                <li key={idx} className="flex items-center space-x-4 text-ink/80 font-medium">
                  <div className="w-1.5 h-1.5 bg-gold rounded-full" />
                  <span className="tracking-wide">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-[3rem] overflow-hidden luxury-shadow">
              <img
                src="https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=800&q=80"
                alt="Service"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-10 -left-10 bg-white p-10 rounded-3xl luxury-shadow luxury-border">
              <p className="text-gold font-serif text-5xl mb-1">150+</p>
              <p className="text-ink/40 text-[10px] font-bold uppercase tracking-[0.2em]">Global Partners</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
