import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useContent, Destination } from "../context/ContentContext";
import { motion } from "motion/react";
import { MapPin, Calendar, Users, ArrowLeft, ArrowRight, Star, ShieldCheck, CheckCircle2, Globe, Clock, Info, Map as MapIcon } from "lucide-react";
import ReviewSection from "../components/ReviewSection";

export default function DestinationDetail() {
  const { id } = useParams();
  const { data } = useContent();
  const navigate = useNavigate();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/reviews/destination/${id}`);
        if (res.ok) {
          const data = await res.json();
          setReviews(data);
        }
      } catch (err) {
        console.error("Failed to fetch reviews", err);
      }
    };
    if (id) fetchReviews();
  }, [id]);

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "5.0";

  useEffect(() => {
    if (data && id) {
      const found = data.destinations.find(d => d.id === id);
      if (found) {
        setDestination(found);
      }
    }
  }, [data, id]);

  if (!destination) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin"></div>
      </div>
    );
  }

  const allImages = [destination.image, ...(destination.images || [])].filter(Boolean);

  return (
    <div className="min-h-screen bg-paper pb-32">
      {/* Hero Section */}
      <div className="relative h-[70vh] overflow-hidden">
        <motion.img
          key={allImages[activeImage]}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5 }}
          src={allImages[activeImage]}
          alt={destination.name}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-paper via-paper/20 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-end pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <div className="flex items-center space-x-4 mb-6">
                <span className="px-4 py-1.5 bg-gold text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-full luxury-shadow">
                  {destination.type}
                </span>
                <div className="flex items-center text-white/80 text-[10px] font-bold uppercase tracking-[0.2em]">
                  <Star className="w-3 h-3 text-gold mr-2 fill-gold" /> {averageRating} ({reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'})
                </div>
              </div>
              <h1 className="text-6xl md:text-8xl font-serif text-ink mb-6 leading-tight">
                {destination.name}
              </h1>
              <div className="flex items-center text-ink/60 text-lg font-light">
                <MapPin className="w-5 h-5 mr-3 text-gold" /> Global Wonders Collection
              </div>
            </motion.div>
          </div>
        </div>

        {/* Image Gallery Thumbnails */}
        {allImages.length > 1 && (
          <div className="absolute bottom-10 right-10 flex space-x-4 z-20">
            {allImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all luxury-shadow ${
                  activeImage === idx ? "border-gold scale-110" : "border-white/50 hover:border-white"
                }`}
              >
                <img src={img} className="w-full h-full object-cover" alt={`Gallery ${idx}`} referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-16">
            <section>
              <h2 className="text-3xl font-serif text-ink italic mb-8 border-b border-gold/10 pb-4">About this Journey</h2>
              <p className="text-ink/60 text-lg font-light leading-relaxed mb-8">
                {destination.description}
              </p>
              {destination.content && (
                <div className="prose prose-gold max-w-none text-ink/70 font-light leading-loose whitespace-pre-wrap">
                  {destination.content}
                </div>
              )}
            </section>

            <section className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="p-8 bg-white rounded-[2rem] luxury-shadow border border-gold/5 text-center group hover:border-gold/20 transition-all">
                <Clock className="w-8 h-8 text-gold mx-auto mb-4" />
                <h4 className="text-[10px] font-bold text-ink/40 uppercase tracking-widest mb-1">Duration</h4>
                <p className="text-ink font-medium">8 Days</p>
              </div>
              <div className="p-8 bg-white rounded-[2rem] luxury-shadow border border-gold/5 text-center group hover:border-gold/20 transition-all">
                <Users className="w-8 h-8 text-gold mx-auto mb-4" />
                <h4 className="text-[10px] font-bold text-ink/40 uppercase tracking-widest mb-1">Group Size</h4>
                <p className="text-ink font-medium">Max 12</p>
              </div>
              <div className="p-8 bg-white rounded-[2rem] luxury-shadow border border-gold/5 text-center group hover:border-gold/20 transition-all">
                <Globe className="w-8 h-8 text-gold mx-auto mb-4" />
                <h4 className="text-[10px] font-bold text-ink/40 uppercase tracking-widest mb-1">Language</h4>
                <p className="text-ink font-medium">English</p>
              </div>
              <div className="p-8 bg-white rounded-[2rem] luxury-shadow border border-gold/5 text-center group hover:border-gold/20 transition-all">
                <ShieldCheck className="w-8 h-8 text-gold mx-auto mb-4" />
                <h4 className="text-[10px] font-bold text-ink/40 uppercase tracking-widest mb-1">Safety</h4>
                <p className="text-ink font-medium">Certified</p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-serif text-ink italic mb-8 border-b border-gold/10 pb-4">What's Included</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  "Luxury Accommodation",
                  "Private Transportation",
                  "Gourmet Dining Experiences",
                  "Professional Local Guides",
                  "Exclusive Access to Landmarks",
                  "24/7 Concierge Support"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-4 p-4 bg-white rounded-2xl border border-gold/5">
                    <CheckCircle2 className="w-5 h-5 text-gold" />
                    <span className="text-ink/70 font-light">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-serif text-ink italic mb-8 border-b border-gold/10 pb-4">Location</h2>
              <div className="w-full h-[400px] rounded-[2.5rem] overflow-hidden luxury-shadow border border-gold/10 relative group">
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}&q=${encodeURIComponent(destination.name)}`}
                  allowFullScreen
                  title="Destination Location"
                ></iframe>
                {!import.meta.env.VITE_GOOGLE_MAPS_API_KEY && (
                  <div className="absolute inset-0 bg-ink/5 flex flex-col items-center justify-center text-center p-10">
                    <MapIcon className="w-12 h-12 text-gold/40 mb-4" />
                    <p className="text-ink/60 font-light italic">Map view for {destination.name}</p>
                    <p className="text-[10px] text-ink/30 uppercase tracking-widest mt-2">API Key Required for Live Map</p>
                  </div>
                )}
              </div>
            </section>

            <section className="bg-gold/5 p-10 rounded-[3rem] border border-gold/10 text-center">
              <h3 className="text-3xl font-serif italic text-ink mb-4">Ready for an Unforgettable Escape?</h3>
              <p className="text-ink/60 font-light mb-8 max-w-xl mx-auto">
                Join us for a journey beyond the ordinary. Secure your reservation today and let our concierge handle every detail of your luxury experience.
              </p>
              <Link
                to={`/book/${destination.id}`}
                className="inline-flex items-center gold-gradient text-white px-12 py-5 rounded-2xl font-bold uppercase tracking-[0.3em] text-[10px] luxury-shadow hover:scale-105 active:scale-95 transition-all group"
              >
                Book This Journey Now <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </section>

            <ReviewSection targetType="destination" targetId={destination.id} />
          </div>

          {/* Sidebar / Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-8">
              <div className="bg-white rounded-[3rem] luxury-shadow border border-gold/10 p-10 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                
                <div className="relative z-10">
                  <span className="text-gold font-bold uppercase tracking-[0.4em] text-[10px] mb-4 block">Exclusive Rate</span>
                  <div className="flex items-baseline space-x-2 mb-8">
                    <span className="text-5xl font-serif text-ink">${(destination.price || 0).toLocaleString()}</span>
                    <span className="text-ink/40 text-sm font-light">/ per person</span>
                  </div>

                  <div className="space-y-6 mb-10">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-ink/40 font-light">Service Fee</span>
                      <span className="text-ink font-medium">$0</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-ink/40 font-light">Taxes & Charges</span>
                      <span className="text-ink font-medium">Included</span>
                    </div>
                    <div className="h-px bg-gold/10 w-full" />
                    <div className="flex items-center justify-between">
                      <span className="text-ink font-serif italic text-lg">Total Price</span>
                      <span className="text-2xl font-serif text-gold">${(destination.price || 0).toLocaleString()}</span>
                    </div>
                  </div>

                  <Link
                    to={`/book/${destination.id}`}
                    className="w-full gold-gradient text-white py-6 rounded-2xl font-bold uppercase tracking-[0.3em] text-[10px] luxury-shadow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center group"
                  >
                    Reserve Your Spot <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <p className="text-center text-[10px] text-ink/40 mt-6 italic">
                    No payment required to hold your reservation for 24 hours.
                  </p>
                </div>
              </div>

              <div className="bg-ink text-white rounded-[2.5rem] p-10 luxury-shadow relative overflow-hidden group">
                <div className="absolute inset-0 bg-gold/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="p-3 bg-white/10 rounded-xl">
                      <Info className="w-6 h-6 text-gold" />
                    </div>
                    <h4 className="font-serif text-xl italic">Need Assistance?</h4>
                  </div>
                  <p className="text-white/60 text-sm font-light leading-relaxed mb-8">
                    Our luxury travel experts are available 24/7 to help you customize your perfect escape.
                  </p>
                  <Link to="/contact" className="text-gold font-bold uppercase tracking-widest text-[10px] hover:underline flex items-center">
                    Contact Concierge <ArrowRight className="ml-2 h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
