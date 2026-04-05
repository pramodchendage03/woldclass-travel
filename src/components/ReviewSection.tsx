import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Send, User } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewSectionProps {
  targetType: 'destination' | 'service';
  targetId: string;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ targetType, targetId }) => {
  const { user } = useContent();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(3);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews/${targetType}/${targetId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error("Failed to fetch reviews", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [targetType, targetId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to submit a review");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          targetType,
          targetId,
          rating,
          comment
        })
      });

      if (res.ok) {
        toast.success("Review submitted successfully!");
        setComment('');
        setRating(5);
        fetchReviews();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to submit review");
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="mt-20 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gold/10 pb-8">
        <div>
          <h2 className="text-3xl font-serif italic mb-2">Guest Reviews</h2>
          <p className="text-ink/50 text-sm">Experience shared by our discerning travelers.</p>
        </div>
        {averageRating && (
          <div className="flex items-center gap-4 bg-gold/5 px-6 py-3 rounded-2xl border border-gold/10">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star 
                  key={s} 
                  className={`w-4 h-4 ${Number(averageRating) >= s ? 'text-gold fill-gold' : 'text-gold/20'}`} 
                />
              ))}
            </div>
            <span className="text-2xl font-serif text-gold italic">{averageRating}</span>
            <span className="text-ink/40 text-xs font-bold uppercase tracking-widest">/ 5.0</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Review Form */}
        <div className="lg:col-span-1">
          {user ? (
            <div className="bg-white p-8 rounded-3xl luxury-shadow border border-gold/10 sticky top-32">
              <h3 className="text-xl font-serif italic mb-6">Write a Review</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-widest mb-3">Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRating(s)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star 
                          className={`w-8 h-8 ${rating >= s ? 'text-gold fill-gold' : 'text-gold/20'}`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-widest mb-3">Your Experience</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="w-full p-4 bg-paper border border-gold/10 rounded-2xl focus:ring-2 focus:ring-gold/20 outline-none text-ink min-h-[120px] transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full gold-gradient text-white py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] luxury-shadow hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Submitting...' : (
                    <>
                      Submit Review <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-gold/5 p-8 rounded-3xl border border-gold/20 text-center">
              <User className="w-12 h-12 text-gold/40 mx-auto mb-4" />
              <h3 className="text-lg font-serif italic mb-2">Share Your Story</h3>
              <p className="text-ink/60 text-sm mb-6">Please login to share your experience with other travelers.</p>
              <button className="text-gold font-bold uppercase tracking-widest text-[10px] hover:underline">
                Login to Review
              </button>
            </div>
          )}
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
            </div>
          ) : reviews.length > 0 ? (
            <>
              <AnimatePresence mode="popLayout">
                {reviews.slice(0, visibleCount).map((review, idx) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white p-8 rounded-[2rem] luxury-shadow border border-gold/5 group hover:border-gold/20 transition-all mb-8 last:mb-0"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center border border-gold/20">
                          <User className="w-6 h-6 text-gold" />
                        </div>
                        <div>
                          <h4 className="font-serif text-lg text-ink italic">{review.userName}</h4>
                          <p className="text-[10px] font-bold text-ink/30 uppercase tracking-widest">
                            {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star 
                            key={s} 
                            className={`w-3 h-3 ${review.rating >= s ? 'text-gold fill-gold' : 'text-gold/10'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-ink/70 leading-relaxed italic">"{review.comment}"</p>
                  </motion.div>
                ))}
              </AnimatePresence>

              {visibleCount < reviews.length && (
                <div className="flex justify-center pt-8">
                  <button
                    onClick={() => setVisibleCount(prev => prev + 3)}
                    className="px-8 py-3 border border-gold/20 rounded-xl text-[10px] font-bold uppercase tracking-widest text-gold hover:bg-gold/5 transition-all luxury-shadow"
                  >
                    Load More Reviews
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 bg-paper/50 rounded-[3rem] border border-dashed border-gold/20">
              <MessageSquare className="w-12 h-12 text-gold/20 mx-auto mb-4" />
              <h3 className="text-xl font-serif italic text-ink/40">No reviews yet</h3>
              <p className="text-ink/30 text-sm">Be the first to share your experience!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewSection;
