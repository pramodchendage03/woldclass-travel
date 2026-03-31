import { motion } from "motion/react";
import { useContent } from "../context/ContentContext";
import { ArrowRight, Star, Shield, Clock, Globe, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  const { data } = useContent();
  if (!data) return null;

  const { home } = data.content;
  if (!home) return null;

  return (
    <div className="space-y-32 pb-32 bg-paper">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={home.heroImage}
            alt="Hero"
            className="w-full h-full object-cover scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/40 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="max-w-4xl"
          >
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-gold font-medium tracking-[0.4em] uppercase text-sm mb-8 block"
            >
              The Art of Exploration
            </motion.span>
            <h1 className="text-6xl md:text-8xl font-serif tracking-tight mb-8 leading-[1.1]">
              {home.heroTitle}
            </h1>
            <p className="text-xl md:text-2xl text-white/70 mb-12 max-w-2xl font-light leading-relaxed">
              {home.heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <Link
                to="/destinations"
                className="gold-gradient text-white px-10 py-5 rounded-xl font-bold uppercase tracking-widest text-xs luxury-shadow hover:scale-105 transition-all flex items-center justify-center"
              >
                Discover Destinations <ArrowRight className="ml-3 h-4 w-4" />
              </Link>
              <Link
                to="/contact"
                className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20 px-10 py-5 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center transition-all"
              >
                Bespoke Consultation
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 hidden md:block">
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-px h-20 bg-gradient-to-b from-white/0 via-gold to-white/0"
          />
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="max-w-2xl">
            <span className="text-gold font-medium tracking-[0.3em] uppercase text-xs mb-4 block">Curated Collections</span>
            <h2 className="text-5xl font-serif text-ink mb-6 leading-tight">Featured Destinations</h2>
            <p className="text-ink/50 font-light text-lg leading-relaxed">Handpicked locations for your next unforgettable journey, curated by our global network of travel experts.</p>
          </div>
          <Link to="/destinations" className="group flex items-center text-gold font-bold uppercase tracking-widest text-xs">
            Explore All <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {data.destinations.slice(0, 3).map((dest, idx) => (
            <motion.div
              key={dest.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.15 }}
              viewport={{ once: true }}
              className="group"
            >
              <Link to={`/book/${dest.id}`} className="block">
                <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden mb-8 luxury-shadow">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-bold text-gold uppercase tracking-[0.2em] luxury-border">
                    {dest.type}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8">
                    <p className="text-white font-serif text-2xl mb-2">{dest.name}</p>
                    <p className="text-white/60 text-xs uppercase tracking-widest">View Details</p>
                  </div>
                </div>
                <div className="px-2">
                  <div className="flex items-center text-gold/60 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">
                    <MapPin className="w-3 h-3 mr-2" /> {dest.type} Collection
                  </div>
                  <h3 className="text-2xl font-serif text-ink mb-3 group-hover:text-gold transition-colors">{dest.name}</h3>
                  <div className="flex justify-between items-center border-t border-gold/10 pt-4">
                    <p className="text-gold font-bold tracking-widest text-sm uppercase">From ${dest.price}</p>
                    <div className="w-8 h-8 rounded-full border border-gold/20 flex items-center justify-center group-hover:bg-gold group-hover:text-white transition-all">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-ink py-40 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white rounded-full" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-24">
            <span className="text-gold font-medium tracking-[0.4em] uppercase text-xs mb-6 block">The WorldClass Standard</span>
            <h2 className="text-5xl font-serif text-white mb-8">Why Choose Excellence?</h2>
            <p className="text-white/40 max-w-2xl mx-auto font-light text-lg leading-relaxed">We redefine luxury travel through personalized service, absolute discretion, and exclusive global access.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
            {[
              { icon: Star, title: "Premium Selection", desc: "Only the finest hotels and experiences make it to our list, vetted by our experts." },
              { icon: Shield, title: "Secure Booking", desc: "Your safety and security are our top priorities throughout your entire journey." },
              { icon: Clock, title: "24/7 Concierge", desc: "Our global team is always available to assist you, anywhere in the world, at any time." }
            ].map((item, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.2 }}
                viewport={{ once: true }}
                className="text-center space-y-8 group"
              >
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-white/5 text-gold mb-4 luxury-border group-hover:gold-gradient group-hover:text-white transition-all duration-500">
                  <item.icon className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-serif text-white">{item.title}</h3>
                <p className="text-white/40 leading-relaxed font-light">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-paper border border-gold/20 rounded-[4rem] p-16 md:p-32 text-ink relative overflow-hidden luxury-shadow">
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-12">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-6 h-6 text-gold fill-gold mx-1" />
              ))}
            </div>
            <h2 className="text-4xl md:text-5xl font-serif mb-12 leading-tight italic">
              "The most seamless travel experience I've ever had. WorldClass truly lives up to its name, providing access to places I never thought possible."
            </h2>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full border-2 border-gold p-1 mb-6">
                <img
                  src="https://i.pravatar.cc/150?u=sarah"
                  alt="Sarah"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div>
                <p className="font-bold uppercase tracking-[0.2em] text-sm mb-1">Sarah Jenkins</p>
                <p className="text-gold text-xs font-medium italic">Private Wealth Client</p>
              </div>
            </div>
          </div>
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
            <Globe className="w-full h-full scale-150" />
          </div>
        </div>
      </section>
    </div>
  );
}
