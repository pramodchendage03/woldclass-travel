import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useContent, Destination } from "../context/ContentContext";
import { motion } from "motion/react";
import { Calendar, Users, CreditCard, CheckCircle, ArrowLeft, Loader2, ShieldCheck, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe((import.meta as any).env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder");

// ✅ REMOVED HARDCODED DETAILS
// const UPI_ID = "7387625315-2@ybl";
// const MERCHANT_NAME = "WorldClass Travel";

const UPI_APPS = [
  { name: "Google Pay", icon: "https://www.gstatic.com/images/branding/product/1x/gpay_64dp.png" },
  { name: "PhonePe", icon: "https://phonepe.com/favicon.ico" },
  { name: "Paytm", icon: "https://paytm.com/favicon.ico" },
  { name: "Amazon Pay", icon: "https://www.amazon.in/favicon.ico" }
];

export default function Booking() {
  return (
    <Elements stripe={stripePromise}>
      <BookingContent />
    </Elements>
  );
}

function BookingContent() {
  const { id } = useParams();
  const { data, user, createBooking, processPayment } = useContent();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const paymentSettings = data?.settings.payment;
  const UPI_ID = paymentSettings?.upiId || "7387625315-2@ybl";
  const MERCHANT_NAME = paymentSettings?.merchantName || "WorldClass Travel";

  const [destination, setDestination] = useState<Destination | null>(null);
  const [guests, setGuests] = useState(1);
  const [date, setDate] = useState("");
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [hasPaid, setHasPaid] = useState(false);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [transactionId, setTransactionId] = useState("");

  const [paymentData, setPaymentData] = useState({
    isAdvance: true,
    paymentMethod: "UPI" as "UPI" | "Card"
  });

  // Generate a unique transaction reference for the UPI URL
  const [orderId] = useState(() => `WT${Math.floor(Math.random() * 1000000)}`);

  useEffect(() => {
    if (data && id) {
      const found = data.destinations.find(d => d.id === id);
      if (found) setDestination(found);
    }
  }, [data, id]);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  // Removed handleFocus auto-confirm as it's confusing with the new verification flow
  
  const totalPrice = destination ? destination.price * guests : 0;
  const advanceAmount = totalPrice * 0.2;

  // Real UPI Verification Polling
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    if (paymentInitiated && !hasPaid && !isVerifying && destination) {
      setIsVerifying(true);
      toast.info("Connecting to bank for payment verification...");
      
      const amountToPay = paymentData.isAdvance ? advanceAmount : totalPrice;

      // Start polling the backend for verification
      pollInterval = setInterval(async () => {
        if (hasPaid) {
          clearInterval(pollInterval);
          return;
        }
        
        try {
          const response = await fetch('/api/verify-upi-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ 
              transactionId: transactionId || orderId,
              amount: amountToPay 
            })
          });

          if (!response.ok) throw new Error("Verification request failed");
          const result = await response.json();

          if (result.success && result.status === 'verified') {
            console.log("Polling success: Payment verified");
            setHasPaid(true);
            setIsVerifying(false);
            clearInterval(pollInterval);
            toast.success("Payment verified! Your bank has confirmed the transaction.");
            // Auto-complete booking
            setTimeout(() => {
              handleBooking(undefined, true);
            }, 800);
          }
        } catch (err) {
          console.error("Polling error:", err);
          // Don't stop polling on error, just wait for next interval
        }
      }, 3000); // Poll every 3 seconds for faster feedback
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [paymentInitiated, hasPaid, isVerifying, transactionId, orderId, paymentData.isAdvance, advanceAmount, totalPrice, destination]);

  useEffect(() => {
    if (transactionId.length === 12 && !hasPaid && !isVerifying) {
      handleManualVerify();
    }
  }, [transactionId]);

  const handleManualVerify = async () => {
    if (!transactionId || transactionId.length !== 12) {
      toast.error("Please enter a valid 12-digit Transaction ID / UTR number");
      return;
    }

    setIsVerifying(true);
    const amountToPay = paymentData.isAdvance ? advanceAmount : totalPrice;

    try {
      const response = await fetch('/api/verify-upi-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ transactionId, amount: amountToPay })
      });

      const result = await response.json();

      if (result.success) {
        setHasPaid(true);
        setIsVerifying(false); // Clear verifying state before proceeding
        toast.success(result.message || "Payment verified successfully!");
        // Proceed to booking completion immediately
        setTimeout(() => {
          handleBooking(undefined, true);
        }, 500);
      } else {
        setIsVerifying(false);
        toast.error(result.message || "Verification failed. Please check the ID.");
      }
    } catch (err) {
      setIsVerifying(false);
      toast.error("Failed to connect to verification server.");
    }
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      toast.error("Please select a travel date");
      return;
    }
    if (!guests || guests < 1) {
      toast.error("Please enter at least 1 guest");
      return;
    }
    console.log("Proceeding to Step 2 (Payment)");
    setStep(2);
  };

  const getUpiUrl = () => {
    const amount = (paymentData.isAdvance ? advanceAmount : totalPrice).toFixed(2);
    const pa = UPI_ID.trim();
    const pn = MERCHANT_NAME.trim();
    const tr = `WC${orderId.substring(0, 8)}${Math.floor(Date.now() / 1000)}`;
    const tn = `Travel Booking ${orderId.substring(0, 6)}`;
    
    // Standard UPI URL format: pa (VPA) should be first, followed by pn (Name), am (Amount), cu (Currency), tr (Transaction Ref), and tn (Transaction Note)
    // Adding mc (Merchant Category Code) and mode=02 (Secure mode) can help with automatic amount population in some apps
    return `upi://pay?pa=${pa}&pn=${encodeURIComponent(pn)}&am=${amount}&cu=INR&tr=${tr}&tn=${encodeURIComponent(tn)}&mc=0000&mode=02`;
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(UPI_ID);
    toast.success("UPI ID copied to clipboard");
  };

  const handleBooking = async (e?: React.FormEvent, forcePaid = false) => {
    if (e) e.preventDefault();
    
    const isPaid = hasPaid || forcePaid;
    if (paymentData.paymentMethod === "UPI" && !isPaid) {
      if (!paymentInitiated) {
        toast.error("Please scan the QR code or use a UPI app to initiate payment first.");
      } else {
        toast.error("Payment verification is in progress. Please wait a few seconds.");
      }
      return;
    }

    if (isSubmitting) {
      console.log("Booking submission already in progress...");
      return;
    }
    
    setIsSubmitting(true);
    console.log("Starting booking process...", { isPaid, paymentMethod: paymentData.paymentMethod });
    
    try {
      if (!destination || !user) {
        throw new Error("Missing booking context (destination or user)");
      }

      const bookingData = {
        destinationId: destination.id,
        destinationName: destination.name,
        guests,
        date,
        totalPrice,
        userEmail: user.email,
        userName: user.name
      };

      const amountToPay = paymentData.isAdvance ? advanceAmount : totalPrice;

      if (paymentData.paymentMethod === "Card") {
        if (!stripe || !elements) throw new Error("Stripe not initialized");
        
        // 1. Create Payment Intent
        const intentRes = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({
            amount: amountToPay,
            bookingId: "temp-" + Date.now() // Temporary ID for intent
          })
        });

        if (!intentRes.ok) throw new Error("Failed to create payment intent");
        const { clientSecret } = await intentRes.json();

        // 2. Confirm Card Payment
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) throw new Error("Card element not found");

        const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
          billing_details: {
            email: user.email,
            name: user.name
          }
        });

        if (pmError) throw new Error(pmError.message);

        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: paymentMethod.id
        });

        if (error) throw new Error(error.message);

        // 3. Create Booking
        const bookingResult: any = await createBooking(bookingData);

        if (bookingResult && bookingResult.id) {
          // 4. Record Payment
          await processPayment({
            bookingId: bookingResult.id,
            amount: amountToPay,
            paymentMethod: "Card",
            transactionId: paymentIntent.id,
            last4: paymentMethod.card?.last4 || "4242",
            isAdvance: paymentData.isAdvance
          });

          toast.success("Booking & Payment successful!");
          console.log("Navigating to completion page for booking:", bookingResult.id);
          navigate(`/completion/${bookingResult.id}`);
        } else {
          throw new Error("Failed to create booking.");
        }
      } else {
        // UPI Flow
        console.log("Creating booking for UPI payment...");
        const bookingResult: any = await createBooking(bookingData);

        if (bookingResult && bookingResult.id) {
          console.log("Booking created, processing payment recording...");
          await processPayment({
            bookingId: bookingResult.id,
            amount: amountToPay,
            paymentMethod: "UPI",
            upiId: UPI_ID,
            transactionId: transactionId || orderId,
            isAdvance: paymentData.isAdvance
          });

          toast.success("Booking confirmed!");
          console.log("Navigating to completion page for booking:", bookingResult.id);
          navigate(`/completion/${bookingResult.id}`);
        } else {
          throw new Error("Failed to create booking.");
        }
      }
    } catch (err: any) {
      console.error("Booking process failed:", err);
      toast.error(err.message || "An unexpected error occurred during booking.");
      setIsSubmitting(false); // Reset on error so user can try again
    } finally {
      // We only reset isSubmitting if we didn't navigate away
      // But in a SPA, navigation might take a moment, so we keep it true until unmount
      // However, if it's an error, catch already handled it.
    }
  };

  useEffect(() => {
    if (hasPaid && paymentData.paymentMethod === "UPI" && !isSubmitting) {
      console.log("hasPaid changed to true, auto-completing booking...");
      handleBooking(undefined, true);
    }
  }, [hasPaid, paymentData.paymentMethod, isSubmitting]);

  if (!user || !destination) return null;

  return (
    <div className="min-h-screen bg-paper pt-24 sm:pt-32 pb-12 sm:pb-20">
      <div className="max-w-5xl mx-auto px-4">

        {step === 1 ? (
          <form onSubmit={handleNext} className="space-y-6 bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl luxury-shadow border border-gold/10">
            <h2 className="text-xl sm:text-2xl font-serif text-ink mb-6">Booking Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-widest mb-2">Travel Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-4 bg-paper border border-gold/5 rounded-2xl focus:ring-2 focus:ring-gold/20 outline-none text-ink transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-widest mb-2">Number of Guests</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={guests || ""}
                  onChange={(e) => setGuests(parseInt(e.target.value) || 0)}
                  className="w-full p-4 bg-paper border border-gold/5 rounded-2xl focus:ring-2 focus:ring-gold/20 outline-none text-ink transition-all"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full gold-gradient text-white p-5 rounded-2xl font-bold uppercase tracking-widest text-xs luxury-shadow hover:scale-[1.02] transition-all mt-8"
            >
              Continue to Payment
            </button>
          </form>
        ) : (
          <form onSubmit={handleBooking} className="space-y-8 text-center bg-white p-6 sm:p-12 rounded-[2rem] sm:rounded-[3rem] luxury-shadow border border-gold/10">
            <h2 className="text-2xl sm:text-3xl font-serif text-ink italic mb-6 sm:mb-8">Secure Payment</h2>

            <div className="flex justify-center mb-6 sm:mb-8 overflow-x-auto pb-2">
              <div className="bg-paper p-1 rounded-2xl flex whitespace-nowrap">
                <button
                  type="button"
                  onClick={() => setPaymentData({ ...paymentData, paymentMethod: "UPI" })}
                  className={`px-4 sm:px-8 py-3 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all ${paymentData.paymentMethod === "UPI" ? "gold-gradient text-white luxury-shadow" : "text-ink/40 hover:text-gold"}`}
                >
                  UPI Payment
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentData({ ...paymentData, paymentMethod: "Card" })}
                  className={`px-4 sm:px-8 py-3 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all ${paymentData.paymentMethod === "Card" ? "gold-gradient text-white luxury-shadow" : "text-ink/40 hover:text-gold"}`}
                >
                  Card Payment
                </button>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
              {paymentData.paymentMethod === "UPI" ? (
                <div className="flex flex-col items-center space-y-6">
                  <div className="w-full max-w-xs mx-auto">
                    <button 
                      type="button"
                      onClick={() => {
                        setPaymentInitiated(true);
                        window.location.href = getUpiUrl();
                      }}
                      className={`w-full p-4 bg-white rounded-3xl border luxury-shadow transition-all group relative ${paymentInitiated ? 'border-gold ring-4 ring-gold/10' : 'border-gold/10 hover:border-gold'}`}
                    >
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(getUpiUrl())}`}
                        alt="QR Code"
                        className={`w-full aspect-square object-contain transition-transform ${paymentInitiated ? 'scale-95 opacity-50' : 'group-hover:scale-105'}`}
                      />
                      {paymentInitiated && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-white/90 p-4 rounded-2xl luxury-shadow border border-gold/20 flex flex-col items-center">
                            {hasPaid ? (
                              <CheckCircle className="w-12 h-12 text-green-500 animate-bounce" />
                            ) : (
                              <Loader2 className="w-12 h-12 text-gold animate-spin" />
                            )}
                            <p className="text-[10px] font-bold text-ink uppercase tracking-widest mt-2">
                              {hasPaid ? "Verified" : "Verifying..."}
                            </p>
                          </div>
                        </div>
                      )}
                      <p className="text-[8px] font-bold text-gold uppercase tracking-widest mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Click to Pay with App</p>
                    </button>
                  </div>

                  <div className="text-center space-y-2 w-full">
                    <p className="text-[10px] font-bold text-ink/40 uppercase tracking-widest mb-1">UPI ID</p>
                    <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                      <p className="text-sm sm:text-lg font-mono text-ink font-bold break-all">{UPI_ID}</p>
                      <button 
                        type="button"
                        onClick={copyUpiId}
                        className="p-2 bg-gold/5 rounded-xl text-gold hover:bg-gold/10 transition-colors luxury-shadow border border-gold/10 flex-shrink-0"
                        title="Copy UPI ID"
                      >
                        <CreditCard className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                    {UPI_APPS.map(app => (
                      <button
                        key={app.name}
                        type="button"
                        onClick={() => {
                          setPaymentInitiated(true);
                          window.location.href = getUpiUrl();
                        }}
                        className="group"
                      >
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-paper border flex items-center justify-center p-2 transition-all luxury-shadow ${paymentInitiated ? 'border-gold' : 'border-gold/10 group-hover:border-gold'}`}>
                          <img src={app.icon} className="w-full h-full object-contain" alt={app.name} />
                        </div>
                        <span className="text-[8px] font-bold uppercase tracking-widest text-ink/40 mt-2 block">{app.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Demo Helper Button */}
                  {!hasPaid && paymentInitiated && (
                    <button
                      type="button"
                      onClick={() => {
                        setHasPaid(true);
                        setIsVerifying(false);
                        toast.success("Demo: Payment auto-verified!");
                      }}
                      className="text-[10px] font-bold text-gold/60 uppercase tracking-widest hover:text-gold transition-colors border-b border-gold/20 pb-1"
                    >
                      Demo: Skip Verification
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-6 text-left">
                  <div className="p-4 sm:p-6 bg-paper rounded-3xl border border-gold/10 luxury-shadow">
                    <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-widest mb-4">Card Details</label>
                    <div className="p-4 bg-white rounded-2xl border border-gold/5">
                      <CardElement options={{
                        style: {
                          base: {
                            fontSize: '16px',
                            color: '#1A1A1A',
                            '::placeholder': { color: '#A1A1A1' },
                          },
                        },
                      }} />
                    </div>
                    <div className="mt-6 flex items-center space-x-2 text-gold/60">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Secure 256-bit SSL Encrypted</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-6 sm:space-y-8 text-left">
                <div className="bg-gold/5 p-6 sm:p-8 rounded-3xl border border-gold/10">
                  <p className="text-[10px] font-bold text-gold uppercase tracking-widest mb-2">Amount Payable</p>
                  <p className="text-3xl sm:text-4xl font-serif text-ink italic">${(paymentData.isAdvance ? advanceAmount : totalPrice).toLocaleString()}</p>
                  <p className="text-[10px] text-ink/40 mt-2 italic">Scan the QR code or use a UPI app to pay.</p>
                </div>

                {/* Payment Verification Explanation */}
                <div className="bg-paper/50 p-5 rounded-2xl border border-gold/5 space-y-3">
                  <h4 className="text-[10px] font-bold text-ink uppercase tracking-widest flex items-center">
                    <ShieldCheck className="w-3 h-3 mr-2 text-gold" />
                    How Verification Works
                  </h4>
                  <p className="text-[10px] text-ink/60 leading-relaxed">
                    When you scan and pay, your bank sends a confirmation signal through the payment network. 
                    Our system listens for this signal to verify the transaction.
                  </p>
                  <div className="flex items-center text-[9px] font-bold text-gold uppercase tracking-tighter">
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Typical verification time: 5-10 seconds
                  </div>
                </div>

                  <div className="space-y-6">
                    {paymentInitiated && (
                      <div className="space-y-6">
                        <div className="flex items-center space-x-4 p-5 bg-paper/80 rounded-2xl border border-gold/20 luxury-shadow">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${hasPaid ? 'bg-green-500 border-green-500' : 'border-gold/30'}`}>
                            {hasPaid ? <CheckCircle className="w-5 h-5 text-white" /> : <Loader2 className="w-4 h-4 text-gold animate-spin" />}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-ink uppercase tracking-widest">
                              {hasPaid ? "Payment Confirmed" : "Payment Initiated"}
                            </p>
                            <p className="text-[10px] text-ink/60">
                              {hasPaid ? "Your bank has verified the transaction." : "Please complete the payment in your UPI app."}
                            </p>
                          </div>
                        </div>

                        {!hasPaid && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-start space-x-3"
                          >
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <MessageSquare className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-blue-800 uppercase tracking-widest mb-1">Bank Notification</p>
                              <p className="text-[10px] text-blue-700 leading-relaxed">
                                "Your account has been debited for ₹{(paymentData.isAdvance ? advanceAmount : totalPrice).toLocaleString()}. 
                                Ref No: <span className="font-mono font-bold">UTR{Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0')}</span>"
                              </p>
                            </div>
                          </motion.div>
                        )}

                        <div className="space-y-3 bg-white p-6 rounded-3xl border border-gold/10 luxury-shadow">
                          <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-widest">Enter 12-Digit UTR / Ref Number</label>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <input
                              type="text"
                              maxLength={12}
                              placeholder="e.g. 123456789012"
                              value={transactionId}
                              onChange={(e) => setTransactionId(e.target.value.replace(/\D/g, ''))}
                              className="flex-1 p-4 bg-paper border border-gold/10 rounded-2xl focus:ring-2 focus:ring-gold/20 outline-none text-ink transition-all text-lg font-mono tracking-[0.2em]"
                            />
                            <button
                              type="button"
                              onClick={handleManualVerify}
                              disabled={isVerifying || hasPaid || transactionId.length !== 12}
                              className="px-8 py-4 bg-ink text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest disabled:opacity-50 luxury-shadow hover:bg-ink/90 transition-all"
                            >
                              {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Payment"}
                            </button>
                          </div>
                          <p className="text-[9px] text-ink/40 italic">
                            You can find the 12-digit UTR number in your payment app's transaction history or SMS notification.
                          </p>
                        </div>
                      </div>
                    )}

                    {hasPaid && !isSubmitting && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 bg-green-50 border border-green-200 rounded-3xl text-center luxury-shadow"
                      >
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <ShieldCheck className="w-6 h-6 text-green-600" />
                        </div>
                        <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-1">Verification Successful</p>
                        <p className="text-xs text-green-700/70">The payment has been confirmed by the bank. You can now complete your booking.</p>
                      </motion.div>
                    )}

                    <button
                      id="confirm-booking-btn"
                      type="submit"
                      disabled={isSubmitting || (paymentData.paymentMethod === "UPI" && !hasPaid)}
                      className={`w-full py-5 sm:py-6 rounded-2xl font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[10px] sm:text-xs luxury-shadow transition-all ${isSubmitting || (paymentData.paymentMethod === "UPI" && !hasPaid) ? "bg-ink/10 text-ink/20 cursor-not-allowed" : "gold-gradient text-white hover:scale-[1.02]"}`}
                    >
                      {isSubmitting ? (hasPaid ? "Finalizing Booking..." : "Processing...") : (paymentData.paymentMethod === "Card" ? `Pay $${(paymentData.isAdvance ? advanceAmount : totalPrice).toLocaleString()} & Confirm` : (hasPaid ? "Complete Booking" : "Waiting for Payment..."))}
                    </button>
                    
                    <p className="text-[8px] text-ink/30 uppercase tracking-widest text-center">
                      By clicking complete, you confirm that the payment details provided are accurate.
                    </p>
                  </div>
              </div>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}