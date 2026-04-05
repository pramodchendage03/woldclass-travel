import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContent, Service } from '../context/ContentContext';
import { motion } from 'motion/react';
import { 
  Map, FileText, Hotel, Plane, Car, Ship, Compass, Shield, 
  Briefcase, Home, Users, Coffee, Heart, ArrowLeft, CheckCircle, Star 
} from 'lucide-react';
import { toast } from 'sonner';
import ReviewSection from '../components/ReviewSection';

const iconMap: { [key: string]: any } = {
  Map, FileText, Hotel, Plane, Car, Ship, Compass, Shield, 
  Briefcase, Home, Users, Coffee, Heart
};

const ServiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data, user } = useContent();
  const services = data?.services || [];
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/reviews/service/${id}`);
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
  const [inquiryData, setInquiryData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    message: ''
  });

  useEffect(() => {
    if (user) {
      setInquiryData(prev => ({ ...prev, name: user.name, email: user.email }));
    }
  }, [user]);

  useEffect(() => {
    if (services.length > 0) {
      const found = services.find(s => s.id === id);
      if (found) {
        setService(found);
      }
    }
  }, [id, services]);

  const handleInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to inquire about this service.");
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          serviceId: service?.id,
          serviceName: service?.title,
          userName: inquiryData.name,
          userEmail: inquiryData.email,
          message: inquiryData.message || `Inquiry about ${service?.title} service.`
        })
      });

      if (response.ok) {
        toast.success("Inquiry sent successfully! Our experts will contact you soon.");
        setInquiryData(prev => ({ ...prev, message: '' }));
      } else {
        toast.error("Failed to send inquiry. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  const IconComponent = iconMap[service.icon] || Map;

  return (
    <div className="min-h-screen pt-24 pb-12 bg-paper">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gold hover:text-gold-dark transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Services
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-20 h-20 bg-gold/10 rounded-2xl flex items-center justify-center mb-6 luxury-border">
              <IconComponent className="w-10 h-10 text-gold" />
            </div>
            <span className="text-gold font-medium tracking-widest uppercase text-sm mb-4 block">
              {service.category || 'Premium Service'}
            </span>
            <h1 className="text-5xl font-serif mb-4 leading-tight">
              {service.title}
            </h1>
            <div className="flex items-center space-x-4 mb-8">
              <div className="flex items-center text-gold">
                <Star className="w-4 h-4 mr-1 fill-gold" />
                <span className="font-bold">{averageRating}</span>
              </div>
              <span className="text-ink/40 text-sm">
                ({reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'})
              </span>
            </div>
            <p className="text-xl text-ink/70 mb-8 leading-relaxed">
              {service.description}
            </p>

            <div className="space-y-6 mb-12">
              <h3 className="text-xl font-serif border-b border-gold/20 pb-2">What's Included</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Personalized Consultation",
                  "24/7 Premium Support",
                  "Expert Local Knowledge",
                  "Bespoke Itinerary",
                  "Priority Bookings",
                  "Luxury Accommodations"
                ].map((item, index) => (
                  <li key={index} className="flex items-center text-ink/80">
                    <CheckCircle className="w-5 h-5 text-gold mr-3 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <ReviewSection targetType="service" targetId={service.id} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white p-8 rounded-3xl luxury-shadow luxury-border sticky top-32"
          >
            <h2 className="text-3xl font-serif mb-6">Inquire About This Service</h2>
            <p className="text-ink/60 mb-8">
              Interested in {service.title}? Fill out the form below and one of our travel specialists will get back to you within 24 hours.
            </p>

            <form onSubmit={handleInquiry} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-ink/70 mb-2 uppercase tracking-wider">Full Name</label>
                <input 
                  type="text" 
                  value={inquiryData.name}
                  onChange={(e) => setInquiryData({ ...inquiryData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gold/20 focus:outline-none focus:ring-2 focus:ring-gold/50 bg-paper/50"
                  placeholder="Your Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink/70 mb-2 uppercase tracking-wider">Email Address</label>
                <input 
                  type="email" 
                  value={inquiryData.email}
                  onChange={(e) => setInquiryData({ ...inquiryData, email: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gold/20 focus:outline-none focus:ring-2 focus:ring-gold/50 bg-paper/50"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink/70 mb-2 uppercase tracking-wider">Additional Requirements</label>
                <textarea 
                  rows={4}
                  value={inquiryData.message}
                  onChange={(e) => setInquiryData({ ...inquiryData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gold/20 focus:outline-none focus:ring-2 focus:ring-gold/50 bg-paper/50"
                  placeholder="Tell us more about your needs..."
                ></textarea>
              </div>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full gold-gradient text-white py-4 rounded-xl font-medium tracking-widest uppercase hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : 'Send Inquiry'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
