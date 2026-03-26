import { useContent } from "../context/ContentContext";
import { motion } from "motion/react";

export default function About() {
  const { data } = useContent();
  if (!data) return null;

  const { about } = data.content;

  return (
    <div className="pb-24">
      <div className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <img
          src={about.image}
          alt="About"
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/50" />
        <h1 className="relative z-10 text-5xl md:text-6xl font-bold text-white italic serif">Our Story</h1>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="prose prose-lg max-w-none"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8">{about.title}</h2>
          <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">
            {about.content}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-20">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">Our Mission</h3>
              <p className="text-gray-600">To inspire and enable global exploration through curated, high-end travel experiences that create lifelong memories.</p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">Our Vision</h3>
              <p className="text-gray-600">To be the world's most trusted partner for luxury travel, recognized for our commitment to excellence and sustainability.</p>
            </div>
          </div>
        </motion.div>

        {/* Team Section */}
        <div className="mt-32">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Meet the Experts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[
              { name: "Julian Vane", role: "Founder & CEO", img: "https://i.pravatar.cc/150?u=julian" },
              { name: "Elena Rossi", role: "Head of Destinations", img: "https://i.pravatar.cc/150?u=elena" },
              { name: "Marcus Thorne", role: "Lead Travel Planner", img: "https://i.pravatar.cc/150?u=marcus" }
            ].map((member, idx) => (
              <div key={idx} className="text-center group">
                <div className="relative w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-500">
                  <img src={member.img} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <h4 className="text-lg font-bold text-gray-900">{member.name}</h4>
                <p className="text-gray-500 text-sm">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
