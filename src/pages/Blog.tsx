import { useContent } from "../context/ContentContext";
import { motion } from "motion/react";
import { Calendar, User, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Blog() {
  const { data } = useContent();
  if (!data) return null;

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      <div className="bg-white border-b border-gray-200 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 italic serif">Travel Insights</h1>
          <p className="text-gray-600 max-w-2xl">Expert advice, destination guides, and stories from the road.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {data.blogPosts.map((post, idx) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="relative h-80 overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-8">
                <div className="flex items-center space-x-4 text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                  <span className="flex items-center"><Calendar className="h-4 w-4 mr-1" /> {post.date}</span>
                  <span className="flex items-center"><User className="h-4 w-4 mr-1" /> {post.author}</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">{post.title}</h2>
                <p className="text-gray-600 mb-8 line-clamp-3 leading-relaxed">{post.content}</p>
                <Link to={`/blog/${post.id}`} className="inline-flex items-center text-blue-600 font-bold hover:underline">
                  Read Full Story <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
}
