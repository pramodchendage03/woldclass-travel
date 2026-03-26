import { useParams, Link } from "react-router-dom";
import { useContent } from "../context/ContentContext";
import { Calendar, User, ArrowLeft, Share2, Bookmark } from "lucide-react";
import { motion } from "motion/react";

export default function BlogPost() {
  const { id } = useParams();
  const { data } = useContent();
  
  if (!data) return null;
  
  const post = data.blogPosts.find(p => p.id === id);
  
  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
          <Link to="/blog" className="text-blue-600 hover:underline flex items-center justify-center">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-24">
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[400px] w-full">
        <img 
          src={post.image} 
          alt={post.title} 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/40 flex items-end">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Link to="/blog" className="inline-flex items-center text-white/80 hover:text-white transition-colors text-sm font-medium">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
              </Link>
              <h1 className="text-4xl md:text-6xl font-bold text-white italic serif leading-tight">
                {post.title}
              </h1>
              <div className="flex items-center space-x-6 text-white/90 text-sm font-medium">
                <span className="flex items-center"><Calendar className="h-4 w-4 mr-2" /> {post.date}</span>
                <span className="flex items-center"><User className="h-4 w-4 mr-2" /> {post.author}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar Actions */}
          <div className="lg:col-span-1 hidden lg:block sticky top-32 h-fit space-y-6">
            <button className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-600 transition-all">
              <Share2 className="h-5 w-5" />
            </button>
            <button className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-600 transition-all">
              <Bookmark className="h-5 w-5" />
            </button>
          </div>

          {/* Main Article */}
          <div className="lg:col-span-11 prose prose-lg prose-blue max-w-none">
            <p className="text-xl text-gray-600 leading-relaxed font-medium mb-8 italic">
              Experience the world like never before with our curated luxury travel packages. This post explores the hidden gems and expert insights for your next journey.
            </p>
            
            <div className="text-gray-800 leading-loose space-y-6 whitespace-pre-wrap">
              {post.content}
            </div>

            <div className="mt-16 pt-12 border-t border-gray-100">
              <h3 className="text-2xl font-bold mb-8 italic serif">Related Stories</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {data.blogPosts.filter(p => p.id !== post.id).slice(0, 2).map(related => (
                  <Link key={related.id} to={`/blog/${related.id}`} className="group">
                    <div className="aspect-video rounded-2xl overflow-hidden mb-4">
                      <img src={related.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{related.title}</h4>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
