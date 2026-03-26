import { useState } from "react";
import { useContent } from "../context/ContentContext";
import { Search, Filter, ArrowRight, MapPin } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";

export default function Destinations() {
  const { data } = useContent();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  if (!data) return null;

  const types = ["All", ...new Set(data.destinations.map(d => d.type))];

  const filteredDestinations = data.destinations.filter(dest => {
    const matchesFilter = filter === "All" || dest.type === filter;
    const matchesSearch = dest.name.toLowerCase().includes(search.toLowerCase()) ||
                         dest.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-paper pb-32">
      {/* Header */}
      <div className="relative pt-40 pb-24 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold via-transparent to-transparent" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-gold font-medium tracking-[0.4em] uppercase text-xs mb-6 block"
          >
            Curated Collections
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-serif text-ink mb-8 leading-tight"
          >
            Explore Destinations
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-ink/50 max-w-2xl mx-auto font-light text-lg leading-relaxed"
          >
            Discover your next dream location from our curated collection of global wonders, 
            handpicked for the discerning traveler.
          </motion.p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] luxury-shadow border border-gold/10 p-8 flex flex-col lg:flex-row gap-8 items-center justify-between">
          <div className="relative w-full lg:w-1/3 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-gold/40 group-focus-within:text-gold transition-colors" />
            <input
              type="text"
              placeholder="Search destinations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-paper/50 border border-gold/5 rounded-2xl focus:ring-1 focus:ring-gold/30 focus:border-gold/30 outline-none text-sm font-light transition-all"
            />
          </div>

          <div className="flex items-center space-x-3 overflow-x-auto w-full lg:w-auto pb-4 lg:pb-0 scrollbar-hide">
            <div className="flex items-center text-gold/40 mr-4 shrink-0">
              <Filter className="h-4 w-4 mr-2" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Filter By</span>
            </div>
            {types.map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap border ${
                  filter === type
                    ? "gold-gradient text-white border-transparent luxury-shadow"
                    : "bg-paper text-ink/40 border-gold/5 hover:border-gold/20"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {filteredDestinations.map((dest, idx) => (
            <motion.div
              key={dest.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              viewport={{ once: true }}
              className="group"
            >
              <Link to={`/destinations/${dest.id}`} className="block">
                <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden mb-8 luxury-shadow">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-bold text-gold uppercase tracking-[0.2em] luxury-border">
                    {dest.type}
                  </div>
                  <div className="absolute bottom-6 right-6 bg-ink/80 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-bold text-white uppercase tracking-[0.2em]">
                    From ${dest.price}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8">
                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Exclusive Collection</p>
                    <p className="text-white font-serif text-3xl mb-4 leading-tight">{dest.name}</p>
                    <div className="flex items-center text-gold font-bold uppercase tracking-widest text-[10px]">
                      View Details <ArrowRight className="ml-2 h-3 w-3" />
                    </div>
                  </div>
                </div>
                <div className="px-2">
                  <div className="flex items-center text-gold/60 text-[10px] font-bold uppercase tracking-[0.2em] mb-3">
                    <MapPin className="w-3 h-3 mr-2" /> Global Destinations
                  </div>
                  <h3 className="text-2xl font-serif text-ink mb-4 group-hover:text-gold transition-colors">{dest.name}</h3>
                  <p className="text-ink/40 font-light text-sm leading-relaxed line-clamp-2 mb-6">{dest.description}</p>
                  <div className="h-px bg-gold/10 w-full" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {filteredDestinations.length === 0 && (
          <div className="text-center py-40">
            <div className="w-20 h-20 rounded-full bg-gold/5 flex items-center justify-center mx-auto mb-8 luxury-border">
              <Search className="w-8 h-8 text-gold/20" />
            </div>
            <h3 className="text-2xl font-serif text-ink mb-4">No Destinations Found</h3>
            <p className="text-ink/40 font-light">We couldn't find any destinations matching your current criteria.</p>
            <button 
              onClick={() => {setFilter("All"); setSearch("");}}
              className="mt-8 text-gold font-bold uppercase tracking-widest text-xs hover:underline"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
