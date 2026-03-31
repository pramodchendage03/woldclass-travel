import React, { useEffect, useState } from 'react';
import { useContent } from '../context/ContentContext';
import { motion } from 'motion/react';
import { Calendar, Users, MapPin, Clock, ArrowRight, ShieldCheck, CreditCard, X, Download } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface Booking {
  id: string;
  destinationName: string;
  guests: number;
  date: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentStatus: 'Unpaid' | 'Advance Paid' | 'Fully Paid';
  paidAmount: number;
  createdAt: string;
}

const MyBookings: React.FC = () => {
  const { user, processPayment } = useContent();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingBooking, setPayingBooking] = useState<Booking | null>(null);
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    paymentMethod: "Card",
    bankName: ""
  });

  const banks = [
    "World Elite Bank",
    "Global Trust Bank",
    "Royal Swiss Bank",
    "Imperial Union Bank",
    "Sovereign Reserve"
  ];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = localStorage.getItem("token");

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/my-bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = (booking: Booking) => {
    const doc = new jsPDF() as any;
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(20, 20, 20);
    doc.text("INVOICE", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.text("WorldClass Travel Agency", 20, 40);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Luxury Experiences, Global Destinations", 20, 45);
    doc.text("Email: concierge@worldclass.travel", 20, 50);
    
    // Invoice Info
    doc.setTextColor(20, 20, 20);
    doc.text(`Invoice Date: ${new Date().toLocaleDateString()}`, 140, 40);
    doc.text(`Booking ID: #${booking.id}`, 140, 45);
    doc.text(`Status: ${booking.paymentStatus}`, 140, 50);

    // Customer Info
    doc.setFontSize(12);
    doc.text("Billed To:", 20, 70);
    doc.setFontSize(10);
    doc.text(user?.name || "Valued Customer", 20, 75);
    doc.text(user?.email || "", 20, 80);

    // Table
    const tableData = [
      ["Destination", booking.destinationName || "N/A"],
      ["Travel Date", booking.date ? new Date(booking.date).toLocaleDateString() : "N/A"],
      ["Guests", (booking.guests || 0).toString()],
      ["Rate per Guest", `$${((booking.totalPrice || 0) / (booking.guests || 1)).toLocaleString()}`],
      ["Total Amount", `$${(booking.totalPrice || 0).toLocaleString()}`],
      ["Amount Paid", `$${(booking.paidAmount || 0).toLocaleString()}`],
      ["Balance Due", `$${((booking.totalPrice || 0) - (booking.paidAmount || 0)).toLocaleString()}`]
    ];

    autoTable(doc, {
      startY: 90,
      head: [["Description", "Details"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [197, 165, 114] }, // Gold color
    });

    // Footer
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(10);
    doc.text("Thank you for choosing WorldClass Travel.", 105, finalY, { align: "center" });
    doc.text("Your luxury escape awaits.", 105, finalY + 5, { align: "center" });

    doc.save(`Invoice_${booking.id}.pdf`);
  };

  useEffect(() => {
    if (token) {
      fetchBookings();
    } else {
      setLoading(false);
    }
  }, [token]);

  const handlePayBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingBooking) return;

    setIsSubmitting(true);
    const remainingAmount = payingBooking.totalPrice - payingBooking.paidAmount;

    const paymentPayload = {
      bookingId: payingBooking.id,
      amount: remainingAmount,
      cardNumber: paymentData.cardNumber,
      expiry: paymentData.expiry,
      cvv: paymentData.cvv,
      isAdvance: false,
      paymentMethod: paymentData.paymentMethod,
      bankName: paymentData.bankName
    };

    const success = await processPayment(paymentPayload);

    if (success) {
      toast.success("Balance paid successfully!");
      navigate(`/completion/${payingBooking.id}`, {
        state: {
          paymentInfo: {
            amount: remainingAmount,
            type: "Full"
          }
        }
      });
    } else {
      toast.error("Payment failed. Please try again.");
    }
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-paper">
        <div className="w-12 h-12 border-2 border-gold/20 border-t-gold rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-40 pb-32 bg-paper">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-20 text-center"
        >
          <span className="text-gold font-medium tracking-[0.4em] uppercase text-xs mb-6 block">Your Journey</span>
          <h1 className="text-5xl font-serif text-ink mb-6">My Bookings</h1>
          <p className="text-ink/40 font-light text-lg">Manage your upcoming and past travel experiences.</p>
        </motion.div>

        {bookings.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[3rem] luxury-shadow border border-gold/10 p-24 text-center max-w-2xl mx-auto"
          >
            <div className="w-20 h-20 bg-gold/5 rounded-full flex items-center justify-center mx-auto mb-8 luxury-border">
              <Calendar className="h-8 w-8 text-gold/40" />
            </div>
            <h3 className="text-2xl font-serif text-ink mb-4">No Bookings Found</h3>
            <p className="text-ink/40 font-light mb-12">You haven't made any travel reservations yet. Start exploring our curated destinations to begin your journey.</p>
            <Link
              to="/destinations"
              className="gold-gradient text-white px-10 py-5 rounded-xl font-bold uppercase tracking-widest text-xs luxury-shadow hover:scale-105 transition-all inline-flex items-center"
            >
              Explore Destinations <ArrowRight className="ml-3 h-4 w-4" />
            </Link>
          </motion.div>
        ) : (
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            {bookings.map((booking, idx) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-[2.5rem] luxury-shadow overflow-hidden border border-gold/10 group hover:border-gold/30 transition-all"
              >
                <div className="p-10">
                  <div className="flex justify-between items-start mb-8">
                    <div className="space-y-1">
                      <div className="flex items-center text-gold text-[10px] font-bold uppercase tracking-[0.2em]">
                        <MapPin className="h-3 w-3 mr-2" /> Destination
                      </div>
                      <h3 className="text-2xl font-serif text-ink group-hover:text-gold transition-colors">{booking.destinationName}</h3>
                    </div>
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest ${
                      booking.status === 'confirmed' ? 'bg-green-50 text-green-600 border border-green-100' :
                      booking.status === 'cancelled' ? 'bg-red-50 text-red-600 border border-red-100' :
                      'bg-gold/5 text-gold border border-gold/10'
                    }`}>
                      {booking.status}
                    </span>
                  </div>

                  <div className="space-y-6 mb-10">
                    <div className="flex items-center text-ink/60 text-sm font-light">
                      <Calendar className="h-4 w-4 mr-4 text-gold/40" />
                      <span>{new Date(booking.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                    </div>
                    <div className="flex items-center text-ink/60 text-sm font-light">
                      <Users className="h-4 w-4 mr-4 text-gold/40" />
                      <span>{booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}</span>
                    </div>
                    <div className="flex items-center text-ink/60 text-sm font-light">
                      <Clock className="h-4 w-4 mr-4 text-gold/40" />
                      <span>Booked on {new Date(booking.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-gold/10 flex justify-between items-center">
                    <div>
                      <p className="text-ink/40 text-[10px] font-bold uppercase tracking-widest mb-1">Payment Status</p>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs font-bold uppercase tracking-widest ${
                          booking.paymentStatus === 'Fully Paid' ? 'text-green-600' :
                          booking.paymentStatus === 'Advance Paid' ? 'text-orange-600' :
                          'text-red-600'
                        }`}>
                          {booking.paymentStatus}
                        </span>
                        {booking.paymentStatus !== 'Fully Paid' && (
                          <button 
                            onClick={() => setPayingBooking(booking)}
                            className="text-gold hover:text-ink transition-colors"
                            title="Pay Balance"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <p className="text-ink/40 text-[10px] font-bold uppercase tracking-widest mb-1">Total Amount</p>
                      <p className="text-2xl font-serif text-ink mb-2">${(booking.totalPrice || 0).toLocaleString()}</p>
                      <button 
                        onClick={() => downloadInvoice(booking)}
                        className="flex items-center text-gold hover:text-ink transition-colors text-[8px] font-bold uppercase tracking-widest"
                      >
                        <Download className="w-3 h-3 mr-1" /> Invoice
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {payingBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2.5rem] luxury-shadow border border-gold/10 w-full max-w-lg overflow-hidden"
          >
            <div className="p-8 border-b border-gold/5 flex justify-between items-center bg-gold/[0.02]">
              <div>
                <h3 className="text-xl font-serif text-ink italic">Settle Balance</h3>
                <p className="text-[10px] text-gold font-bold uppercase tracking-widest mt-1">Booking #{payingBooking.id}</p>
              </div>
              <button onClick={() => setPayingBooking(null)} className="p-2 hover:bg-gold/5 rounded-full transition-colors">
                <X className="w-5 h-5 text-ink/40" />
              </button>
            </div>

            <form onSubmit={handlePayBalance} className="p-8 space-y-6">
              <div className="bg-paper p-6 rounded-2xl border border-gold/5 mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-ink/40 uppercase tracking-widest">Remaining Balance</span>
                  <span className="text-2xl font-serif text-gold">${((payingBooking.totalPrice || 0) - (payingBooking.paidAmount || 0)).toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-ink/40 italic">Secure payment processing via our luxury gateway.</p>
              </div>

              <div className="flex space-x-6 border-b border-gold/10 pb-4">
                <button
                  type="button"
                  onClick={() => setPaymentData({ ...paymentData, paymentMethod: "Card" })}
                  className={`text-[10px] font-bold uppercase tracking-widest pb-2 transition-all ${paymentData.paymentMethod === "Card" ? "text-gold border-b-2 border-gold" : "text-ink/40"}`}
                >
                  Credit/Debit Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentData({ ...paymentData, paymentMethod: "Net Banking" })}
                  className={`text-[10px] font-bold uppercase tracking-widest pb-2 transition-all ${paymentData.paymentMethod === "Net Banking" ? "text-gold border-b-2 border-gold" : "text-ink/40"}`}
                >
                  Net Banking
                </button>
              </div>

              {paymentData.paymentMethod === "Card" ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-widest mb-2 ml-1">Card Number</label>
                    <input
                      type="text"
                      required
                      placeholder="0000 0000 0000 0000"
                      className="w-full px-6 py-4 bg-paper border border-gold/10 rounded-xl focus:ring-2 focus:ring-gold/20 focus:border-gold outline-none transition-all text-sm"
                      value={paymentData.cardNumber}
                      onChange={(e) => setPaymentData({ ...paymentData, cardNumber: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-widest mb-2 ml-1">Expiry</label>
                      <input
                        type="text"
                        required
                        placeholder="MM/YY"
                        className="w-full px-6 py-4 bg-paper border border-gold/10 rounded-xl focus:ring-2 focus:ring-gold/20 focus:border-gold outline-none transition-all text-sm"
                        value={paymentData.expiry}
                        onChange={(e) => setPaymentData({ ...paymentData, expiry: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-widest mb-2 ml-1">CVV</label>
                      <input
                        type="text"
                        required
                        placeholder="000"
                        className="w-full px-6 py-4 bg-paper border border-gold/10 rounded-xl focus:ring-2 focus:ring-gold/20 focus:border-gold outline-none transition-all text-sm"
                        value={paymentData.cvv}
                        onChange={(e) => setPaymentData({ ...paymentData, cvv: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-widest mb-2 ml-1">Select Your Bank</label>
                    <select
                      required
                      value={paymentData.bankName}
                      onChange={(e) => setPaymentData({ ...paymentData, bankName: e.target.value })}
                      className="w-full px-6 py-4 bg-paper border border-gold/10 rounded-xl focus:ring-2 focus:ring-gold/20 focus:border-gold outline-none transition-all text-sm appearance-none"
                    >
                      <option value="">Choose a bank...</option>
                      {banks.map(bank => (
                        <option key={bank} value={bank}>{bank}</option>
                      ))}
                    </select>
                  </div>
                  <p className="text-[10px] text-ink/40 italic leading-relaxed">
                    You will be redirected to your bank's secure portal to complete the transaction.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full gold-gradient text-white py-5 rounded-xl font-bold uppercase tracking-widest text-[10px] luxury-shadow hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>Process Payment <ArrowRight className="ml-3 h-4 w-4" /></>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
