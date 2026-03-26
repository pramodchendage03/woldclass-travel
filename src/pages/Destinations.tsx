import { useState } from "react";
import { useContent } from "../context/ContentContext";
import { Search, Filter, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

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
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 italic serif">Explore Destinations</h1>
          <p className="text-gray-600 max-w-2xl">Discover your next dream location from our curated collection of global wonders.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search destinations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            <Filter className="h-5 w-5 text-gray-400 mr-2 shrink-0" />
            {types.map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  filter === type
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDestinations.map((dest, idx) => (
            <motion.div
              key={dest.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow group"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-blue-600">
                  ${dest.price}
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{dest.name}</h3>
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">{dest.type}</span>
                </div>
                <p className="text-gray-500 text-sm mb-6 line-clamp-2">{dest.description}</p>
                <button className="w-full bg-gray-900 text-white py-3 rounded-xl font-medium flex items-center justify-center hover:bg-blue-600 transition-colors">
                  View Details <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredDestinations.length === 0 && (
          <div className="text-center py-24">
            <p className="text-gray-400 text-lg">No destinations found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
