import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle, Home, Calendar, ArrowRight, Download, MapPin, Phone, MessageSquare, ShieldCheck, Clock, User } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { toast } from 'sonner';

const Completion: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useContent();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const fetchBooking = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/bookings/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setBooking(data);
        } else {
          toast.error("Failed to load booking details");
        }
      } catch (err) {
        console.error("Error fetching booking:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchBooking();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin"></div>
          <p className="text-[10px] font-bold text-gold uppercase tracking-widest animate-pulse">Finalizing your journey...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white p-12 rounded-[3rem] luxury-shadow border border-gold/10">
          <h2 className="text-3xl font-serif text-ink mb-4 italic">Booking Not Found</h2>
          <p className="text-ink/60 mb-8 font-light">We couldn't retrieve your booking details. Please check your dashboard.</p>
          <Link to="/my-bookings" className="gold-gradient text-white px-10 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] luxury-shadow inline-block">
            Go to My Bookings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper pt-32 pb-20 flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full bg-white rounded-[3rem] luxury-shadow border border-gold/10 relative overflow-hidden"
      >
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-2 gold-gradient" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />

        <div className="relative z-10 p-8 md:p-16">
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
              className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 luxury-border border-green-100"
            >
              <CheckCircle className="w-12 h-12 text-green-500" />
            </motion.div>

            <h1 className="text-4xl md:text-6xl font-serif text-ink italic mb-4">Booking Complete!</h1>
            <p className="text-ink/60 font-light text-lg mb-2 max-w-xl mx-auto">
              Your luxury escape is officially secured.
            </p>
            <div className="flex items-center justify-center space-x-2 text-gold font-bold uppercase tracking-[0.3em] text-[10px]">
              <ShieldCheck className="w-3 h-3" />
              <span>Verified Transaction</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column: Details */}
            <div className="space-y-8">
              <div className="bg-paper/50 rounded-[2rem] p-8 border border-gold/5 space-y-6">
                <h3 className="text-xs font-bold text-ink uppercase tracking-widest border-b border-gold/10 pb-4 flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gold" />
                  Travel Itinerary
                </h3>
                
                <div className="grid grid-cols-1 gap-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-white rounded-xl luxury-shadow border border-gold/5">
                      <MapPin className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-ink/40 uppercase tracking-widest block mb-1">Pick-up Location</span>
                      <p className="text-ink font-medium">{booking.destinationName} Main Terminal / Hotel Lobby</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-white rounded-xl luxury-shadow border border-gold/5">
                      <Clock className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-ink/40 uppercase tracking-widest block mb-1">Pick-up Date & Time</span>
                      <p className="text-ink font-medium">
                        {new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        <span className="block text-xs text-ink/40 mt-1">Standard Pick-up: 09:00 AM</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-white rounded-xl luxury-shadow border border-gold/5">
                      <User className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-ink/40 uppercase tracking-widest block mb-1">Traveler Details</span>
                      <p className="text-ink font-medium">{booking.userName || user?.name}</p>
                      <p className="text-[10px] text-ink/40">{booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gold/5 rounded-[2rem] p-8 border border-gold/10 space-y-4">
                <h3 className="text-xs font-bold text-gold uppercase tracking-widest flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  24/7 Customer Care
                </h3>
                <p className="text-xs text-ink/60 leading-relaxed">
                  Our dedicated concierge team is available around the clock to assist with any special requests or changes to your booking.
                </p>
                <div className="flex flex-col space-y-3">
                  <a href="tel:+1800WORLDCLASS" className="flex items-center space-x-3 text-ink hover:text-gold transition-colors group">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center luxury-shadow border border-gold/5 group-hover:scale-110 transition-transform">
                      <Phone className="w-4 h-4 text-gold" />
                    </div>
                    <span className="text-sm font-bold">+1 (800) WORLD-CLASS</span>
                  </a>
                  <a href="mailto:support@worldclass.travel" className="flex items-center space-x-3 text-ink hover:text-gold transition-colors group">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center luxury-shadow border border-gold/5 group-hover:scale-110 transition-transform">
                      <MessageSquare className="w-4 h-4 text-gold" />
                    </div>
                    <span className="text-sm font-bold">support@worldclass.travel</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Summary & Actions */}
            <div className="space-y-8">
              <div className="bg-white rounded-[2rem] p-8 border border-gold/10 luxury-shadow space-y-6">
                <div className="flex items-center justify-between border-b border-gold/5 pb-4">
                  <span className="text-[10px] font-bold text-ink/40 uppercase tracking-widest">Booking Ref</span>
                  <span className="font-mono text-gold font-bold">#{id?.slice(-8).toUpperCase()}</span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-ink/40">Total Package</span>
                    <span className="text-ink font-medium">${booking.totalPrice?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-ink/40">Amount Paid</span>
                    <span className="text-green-600 font-bold">${booking.paidAmount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-4 border-t border-gold/5">
                    <span className="text-ink font-bold">Payment Status</span>
                    <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-widest rounded-full border border-green-100">
                      Confirmed
                    </span>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => {
                      const token = localStorage.getItem('token');
                      fetch(`/api/bookings/${id}/invoice`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                      })
                      .then(res => res.blob())
                      .then(blob => {
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `Invoice_${id}.pdf`;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                      })
                      .catch(err => console.error("Download failed", err));
                    }}
                    className="w-full flex items-center justify-center space-x-3 p-5 bg-paper text-ink rounded-2xl font-bold uppercase tracking-widest text-[10px] border border-gold/10 hover:bg-gold/5 transition-all group"
                  >
                    <Download className="w-4 h-4 text-gold group-hover:translate-y-0.5 transition-transform" />
                    <span>Download Invoice</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => navigate('/my-bookings')}
                  className="w-full flex items-center justify-center space-x-3 p-6 gold-gradient text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] luxury-shadow hover:scale-[1.02] transition-all group"
                >
                  <span>Go to My Dashboard</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full flex items-center justify-center space-x-3 p-6 bg-ink text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] luxury-shadow hover:bg-ink/90 transition-all"
                >
                  <Home className="w-4 h-4" />
                  <span>Return to Home</span>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-gold/5 text-center">
            <p className="text-[10px] font-bold text-ink/30 uppercase tracking-[0.4em]">
              WorldClass Travel &copy; 2026 • Premium Global Experiences
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Completion;
