import { useParams, Link } from "react-router-dom";
import { useContent } from "../context/ContentContext";
import { Calendar, User, ArrowLeft, Share2, Bookmark, Twitter, Facebook, Linkedin, Link2, Clock } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

export default function BlogPost() {
  const { id } = useParams();
  const { data } = useContent();
  
  if (!data) return null;
  
  const post = data.blogPosts.find(p => p.id === id);
  const relatedPosts = data.blogPosts.filter(p => p.id !== id).slice(0, 3);
  
  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="text-center">
          <h1 className="text-4xl font-serif italic text-ink mb-4">Post Not Found</h1>
          <Link to="/blog" className="text-gold hover:underline flex items-center justify-center font-bold uppercase tracking-widest text-xs">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const shareUrl = window.location.href;
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
  };

  return (
    <div className="bg-paper min-h-screen pb-24">
      {/* Hero Section */}
      <div className="relative h-[70vh] min-h-[500px] w-full overflow-hidden">
        <motion.img 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          src={post.image} 
          alt={post.title} 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-4xl space-y-6"
            >
              <Link to="/blog" className="inline-flex items-center text-white/70 hover:text-white transition-colors text-xs font-bold uppercase tracking-[0.2em]">
                <ArrowLeft className="mr-2 h-3 w-3" /> Back to Stories
              </Link>
              <h1 className="text-4xl md:text-7xl font-serif italic text-white leading-[1.1]">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-white/80 text-[10px] font-bold uppercase tracking-widest">
                <span className="flex items-center bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                  <Calendar className="h-3 w-3 mr-2 text-gold" /> {post.date}
                </span>
                <span className="flex items-center bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                  <User className="h-3 w-3 mr-2 text-gold" /> {post.author}
                </span>
                <span className="flex items-center bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                  <Clock className="h-3 w-3 mr-2 text-gold" /> 8 min read
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Main Article Content */}
          <article className="lg:col-span-8">
            <div className="prose prose-lg max-w-none">
              <p className="text-2xl font-serif italic text-ink/70 leading-relaxed mb-12 border-l-4 border-gold pl-8">
                Experience the world like never before with our curated luxury travel packages. This post explores the hidden gems and expert insights for your next journey.
              </p>
              
              <div className="text-ink/80 leading-[1.8] space-y-8 text-lg font-light">
                {post.content.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="first-letter:text-5xl first-letter:font-serif first-letter:float-left first-letter:mr-3 first-letter:text-gold first-letter:leading-none">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Quote Block */}
              <blockquote className="my-16 p-12 bg-gold/5 rounded-[2rem] border border-gold/10 relative overflow-hidden group">
                <div className="absolute -top-4 -left-4 text-9xl text-gold/10 font-serif group-hover:text-gold/20 transition-colors">"</div>
                <p className="text-2xl font-serif italic text-ink relative z-10 leading-relaxed">
                  Travel is the only thing you buy that makes you richer. Our mission is to provide experiences that linger in your soul long after the journey ends.
                </p>
                <cite className="block mt-6 text-[10px] font-bold uppercase tracking-widest text-gold">— WorldClass Editorial Team</cite>
              </blockquote>

              <div className="text-ink/80 leading-[1.8] space-y-8 text-lg font-light">
                <p>
                  As we look towards the future of travel, the emphasis is shifting from mere sightseeing to deep, meaningful connection. Whether it's a private villa in the heart of Tuscany or a sustainable safari in the Serengeti, the modern traveler seeks authenticity above all else.
                </p>
                <p>
                  Luxury today is defined by time, space, and the exclusivity of experience. It's about having the world's most beautiful places all to yourself, guided by those who know their secrets best.
                </p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-20 pt-10 border-t border-gold/10 flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full gold-gradient flex items-center justify-center text-white font-serif italic text-xl">W</div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-ink">WorldClass Travel</p>
                  <p className="text-[10px] text-ink/40 uppercase tracking-widest">Luxury Travel Experts</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-6 py-3 bg-paper border border-gold/20 rounded-xl text-[10px] font-bold uppercase tracking-widest text-ink hover:bg-gold hover:text-white transition-all luxury-shadow">
                  Follow Author
                </button>
              </div>
            </div>
          </article>

          {/* Sticky Sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-32 space-y-12">
              
              {/* Social Share Card */}
              <div className="bg-white p-8 rounded-3xl luxury-shadow border border-gold/10">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-gold mb-6">Share this Story</h3>
                <div className="grid grid-cols-4 gap-4">
                  <button className="aspect-square rounded-2xl bg-paper border border-gold/5 flex items-center justify-center text-ink/60 hover:text-gold hover:border-gold transition-all group">
                    <Twitter className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  </button>
                  <button className="aspect-square rounded-2xl bg-paper border border-gold/5 flex items-center justify-center text-ink/60 hover:text-gold hover:border-gold transition-all group">
                    <Facebook className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  </button>
                  <button className="aspect-square rounded-2xl bg-paper border border-gold/5 flex items-center justify-center text-ink/60 hover:text-gold hover:border-gold transition-all group">
                    <Linkedin className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  </button>
                  <button 
                    onClick={copyToClipboard}
                    className="aspect-square rounded-2xl bg-paper border border-gold/5 flex items-center justify-center text-ink/60 hover:text-gold hover:border-gold transition-all group"
                  >
                    <Link2 className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
                <button className="w-full mt-6 py-4 bg-paper border border-gold/10 rounded-2xl flex items-center justify-center space-x-3 text-[10px] font-bold uppercase tracking-widest text-ink/40 hover:text-gold transition-colors">
                  <Bookmark className="h-4 w-4" />
                  <span>Save for Later</span>
                </button>
              </div>

              {/* Related Articles Card */}
              <div className="bg-white p-8 rounded-3xl luxury-shadow border border-gold/10">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-gold mb-8">Related Stories</h3>
                <div className="space-y-8">
                  {relatedPosts.map(related => (
                    <Link key={related.id} to={`/blog/${related.id}`} className="group flex gap-4">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0">
                        <img src={related.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-serif italic text-ink group-hover:text-gold transition-colors leading-tight">{related.title}</h4>
                        <p className="text-[8px] font-bold uppercase tracking-widest text-ink/30">{related.date}</p>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link to="/blog" className="block w-full mt-10 text-center py-4 text-[10px] font-bold uppercase tracking-widest text-gold hover:underline">
                  View All Stories
                </Link>
              </div>

              {/* Newsletter Card */}
              <div className="gold-gradient p-8 rounded-3xl luxury-shadow text-white">
                <h3 className="text-[10px] font-bold uppercase tracking-widest mb-4">Stay Inspired</h3>
                <p className="text-sm font-serif italic mb-6">Join our exclusive circle for luxury travel insights and early access to new destinations.</p>
                <div className="space-y-3">
                  <input 
                    type="email" 
                    placeholder="Your Email" 
                    className="w-full bg-white/20 border border-white/20 rounded-xl px-4 py-3 text-xs placeholder:text-white/60 focus:outline-none focus:bg-white/30 transition-all"
                  />
                  <button className="w-full bg-white text-gold py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-paper transition-colors">
                    Subscribe
                  </button>
                </div>
              </div>

            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
