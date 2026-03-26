import { useContent } from "../context/ContentContext";
import { motion } from "motion/react";
import { Globe, Award, Users, Heart } from "lucide-react";

export default function About() {
  const { data } = useContent();
  if (!data) return null;

  const { about } = data.content;

  return (
    <div className="pb-32 bg-paper">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={about.image}
            alt="About"
            className="w-full h-full object-cover scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-ink/60 backdrop-blur-[2px]" />
        </div>
        <div className="relative z-10 text-center px-4">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-gold font-medium tracking-[0.4em] uppercase text-xs mb-6 block"
          >
            Our Heritage
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-serif text-white mb-8 leading-tight italic"
          >
            Our Story
          </motion.h1>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            <div>
              <span className="text-gold font-medium tracking-[0.3em] uppercase text-xs mb-4 block">The Vision</span>
              <h2 className="text-5xl font-serif text-ink mb-8 leading-tight">{about.title}</h2>
              <p className="text-ink/60 font-light text-lg leading-relaxed whitespace-pre-line">
                {about.content}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-gold/5 flex items-center justify-center luxury-border">
                  <Award className="w-6 h-6 text-gold" />
                </div>
                <h3 className="text-xl font-serif text-ink">Our Mission</h3>
                <p className="text-ink/40 font-light text-sm leading-relaxed">To inspire and enable global exploration through curated, high-end travel experiences that create lifelong memories.</p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-gold/5 flex items-center justify-center luxury-border">
                  <Globe className="w-6 h-6 text-gold" />
                </div>
                <h3 className="text-xl font-serif text-ink">Our Vision</h3>
                <p className="text-ink/40 font-light text-sm leading-relaxed">To be the world's most trusted partner for luxury travel, recognized for our commitment to excellence and sustainability.</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-[4rem] overflow-hidden luxury-shadow">
              <img 
                src="https://images.unsplash.com/photo-1522199755839-a2bacb67c546?auto=format&fit=crop&q=80" 
                alt="Luxury Office" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-12 -left-12 bg-white p-12 rounded-[3rem] luxury-shadow border border-gold/10 hidden md:block">
              <div className="flex items-center gap-6">
                <div className="text-5xl font-serif text-gold">15+</div>
                <div className="text-xs font-bold uppercase tracking-widest text-ink/40 leading-relaxed">
                  Years of <br /> Excellence
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats Section */}
        <div className="mt-48 grid grid-cols-2 md:grid-cols-4 gap-12 border-y border-gold/10 py-20">
          {[
            { label: "Destinations", value: "120+", icon: Globe },
            { label: "Happy Clients", value: "5k+", icon: Heart },
            { label: "Expert Guides", value: "80+", icon: Users },
            { label: "Awards Won", value: "25+", icon: Award }
          ].map((stat, idx) => (
            <div key={idx} className="text-center space-y-4">
              <stat.icon className="w-6 h-6 text-gold mx-auto opacity-40" />
              <div className="text-4xl font-serif text-ink">{stat.value}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-ink/40">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Team Section */}
        <div className="mt-48">
          <div className="text-center mb-24">
            <span className="text-gold font-medium tracking-[0.4em] uppercase text-xs mb-6 block">The Experts</span>
            <h2 className="text-5xl font-serif text-ink mb-8">Meet the Curators</h2>
            <p className="text-ink/40 max-w-2xl mx-auto font-light text-lg leading-relaxed">Our team of global experts brings decades of experience in high-end travel curation.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-16">
            {[
              { name: "Julian Vane", role: "Founder & CEO", img: "https://i.pravatar.cc/150?u=julian" },
              { name: "Elena Rossi", role: "Head of Destinations", img: "https://i.pravatar.cc/150?u=elena" },
              { name: "Marcus Thorne", role: "Lead Travel Planner", img: "https://i.pravatar.cc/150?u=marcus" }
            ].map((member, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="relative w-64 h-64 mx-auto mb-10 rounded-[3rem] overflow-hidden luxury-shadow luxury-border group-hover:scale-105 transition-all duration-700">
                  <img src={member.img} alt={member.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" />
                  <div className="absolute inset-0 bg-gold/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h4 className="text-2xl font-serif text-ink mb-2">{member.name}</h4>
                <p className="text-gold text-[10px] font-bold uppercase tracking-widest">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
