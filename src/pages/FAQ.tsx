import React from 'react';
import { motion } from 'motion/react';
import { HelpCircle, ChevronDown, ChevronUp, Search, MessageCircle, Phone, Mail } from 'lucide-react';

const faqs = [
  {
    category: "Booking",
    questions: [
      {
        q: "How do I book a destination?",
        a: "Simply browse our destinations, select your preferred one, choose your travel date and number of guests, and click 'Book Now'. You'll be guided through our secure payment process."
      },
      {
        q: "Can I book for a large group?",
        a: "Yes! Our system allows you to specify the number of guests. For groups larger than 10, we recommend contacting our concierge service for personalized arrangements."
      },
      {
        q: "How do I know my booking is confirmed?",
        a: "Once your payment is successful, you'll be redirected to a confirmation page with your unique Booking Reference ID. You'll also receive a confirmation email."
      }
    ]
  },
  {
    category: "Payment",
    questions: [
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit/debit cards via Stripe and UPI payments (Google Pay, PhonePe, Paytm, etc.)."
      },
      {
        q: "Is it safe to pay on your website?",
        a: "Absolutely. We use industry-standard 256-bit SSL encryption and process all card payments through Stripe, a world-leading secure payment gateway."
      },
      {
        q: "Do I need to pay the full amount upfront?",
        a: "We offer both full payment and advance payment options (typically 20% of the total cost) to secure your booking."
      }
    ]
  },
  {
    category: "Cancellations",
    questions: [
      {
        q: "What is your cancellation policy?",
        a: "Cancellations made 7 days or more before the travel date are eligible for a full refund. Cancellations within 7 days may incur a fee depending on the destination."
      },
      {
        q: "How do I cancel my booking?",
        a: "You can cancel your booking through your 'My Bookings' page or by contacting our support team with your Booking Reference ID."
      },
      {
        q: "When will I receive my refund?",
        a: "Refunds are typically processed within 5-7 business days to your original payment method."
      }
    ]
  },
  {
    category: "Travel Requirements",
    questions: [
      {
        q: "Do I need a visa for my trip?",
        a: "Visa requirements vary by destination and your nationality. We provide general guidance, but we recommend checking with the official embassy for the most up-to-date information."
      },
      {
        q: "Are travel insurance and health checks required?",
        a: "While not always mandatory, we strongly recommend travel insurance for all trips. Some destinations may require specific health certifications or vaccinations."
      },
      {
        q: "What should I pack for my trip?",
        a: "Each destination page includes a 'What to Bring' section. Generally, we recommend comfortable clothing, necessary travel documents, and a spirit of adventure!"
      }
    ]
  }
];

const FAQ: React.FC = () => {
  const [activeCategory, setActiveCategory] = React.useState(faqs[0].category);
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredFaqs = faqs.map(cat => ({
    ...cat,
    questions: cat.questions.filter(q => 
      q.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
      q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.questions.length > 0);

  return (
    <div className="min-h-screen bg-paper pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-serif mb-6 italic">Common Queries</h1>
          <p className="text-ink/60 max-w-2xl mx-auto">
            Everything you need to know about your luxury travel experience. 
            Can't find what you're looking for? Our team is here to help.
          </p>
        </motion.div>

        {/* Search Bar */}
        <div className="relative mb-12">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gold w-5 h-5" />
          <input 
            type="text"
            placeholder="Search for questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-16 pr-6 py-5 bg-white rounded-2xl luxury-shadow border border-gold/10 focus:outline-none focus:ring-2 focus:ring-gold/20 text-ink"
          />
        </div>

        {/* Categories */}
        {!searchQuery && (
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {faqs.map(cat => (
              <button
                key={cat.category}
                onClick={() => {
                  setActiveCategory(cat.category);
                  setOpenIndex(null);
                }}
                className={`px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                  activeCategory === cat.category 
                    ? "gold-gradient text-white luxury-shadow" 
                    : "bg-white text-ink/40 hover:text-gold border border-gold/10"
                }`}
              >
                {cat.category}
              </button>
            ))}
          </div>
        )}

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFaqs.map((cat, catIndex) => (
            (searchQuery || cat.category === activeCategory) && (
              <div key={catIndex} className="space-y-4">
                {searchQuery && (
                  <h2 className="text-[10px] font-bold text-gold uppercase tracking-[0.3em] mb-4 mt-8">
                    {cat.category}
                  </h2>
                )}
                {cat.questions.map((item, qIndex) => {
                  const isOpen = openIndex === (catIndex * 100 + qIndex);
                  return (
                    <motion.div 
                      key={qIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl border border-gold/10 overflow-hidden luxury-shadow"
                    >
                      <button
                        onClick={() => setOpenIndex(isOpen ? null : catIndex * 100 + qIndex)}
                        className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-gold/5 transition-colors"
                      >
                        <span className="font-serif text-lg text-ink italic">{item.q}</span>
                        {isOpen ? <ChevronUp className="w-5 h-5 text-gold" /> : <ChevronDown className="w-5 h-5 text-gold" />}
                      </button>
                      {isOpen && (
                        <div className="px-8 pb-6 text-ink/70 leading-relaxed">
                          <div className="w-full h-px bg-gold/10 mb-6" />
                          {item.a}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-20 p-12 bg-ink text-white rounded-[3rem] text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
          <div className="relative z-10">
            <h2 className="text-3xl font-serif italic mb-4">Still have questions?</h2>
            <p className="text-white/60 mb-8 max-w-md mx-auto">
              Our travel specialists are available 24/7 to assist you with any inquiries.
            </p>
            <div className="flex flex-wrap justify-center gap-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-gold" />
                </div>
                <span className="text-sm font-bold tracking-widest">+1 (888) WORLD-CLASS</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-gold" />
                </div>
                <span className="text-sm font-bold tracking-widest">concierge@worldclass.com</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FAQ;
