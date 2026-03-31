import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle, Home, Calendar, ArrowRight, Download } from 'lucide-react';
import { useContent } from '../context/ContentContext';

const Completion: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data } = useContent();

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-paper pt-32 pb-20 flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full bg-white rounded-[3rem] luxury-shadow border border-gold/10 p-12 text-center relative overflow-hidden"
      >
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-2 gold-gradient opacity-50" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />

        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
            className="w-24 h-24 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-8 luxury-border"
          >
            <CheckCircle className="w-12 h-12 text-gold" />
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-serif text-ink italic mb-4">Payment Successful!</h1>
          <p className="text-ink/60 font-light text-lg mb-10 max-w-md mx-auto">
            Thank you for joining us! Your journey with WorldClass Travel has officially begun. 
            We've sent a confirmation email with your invoice to your registered address.
          </p>

          <div className="bg-paper/50 rounded-3xl p-8 border border-gold/5 mb-10 text-left">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gold/5">
              <span className="text-[10px] font-bold text-ink/40 uppercase tracking-widest">Booking Reference</span>
              <span className="font-mono text-gold font-bold">#{id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-ink/40 uppercase tracking-widest">Status</span>
              <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-widest rounded-full border border-green-100">
                Confirmed
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              className="flex items-center justify-center space-x-3 p-5 bg-gold text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] luxury-shadow hover:bg-gold/90 transition-all group"
            >
              <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Download Invoice</span>
            </button>
            <button
              onClick={() => navigate('/my-bookings')}
              className="flex items-center justify-center space-x-3 p-5 bg-ink text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] luxury-shadow hover:bg-ink/90 transition-all group"
            >
              <Calendar className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>View My Bookings</span>
            </button>
          </div>

          <div className="mt-12 pt-8 border-t border-gold/5">
            <p className="text-[10px] font-bold text-ink/30 uppercase tracking-[0.3em]">
              WorldClass Travel &copy; 2026 • Premium Experiences
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Completion;
