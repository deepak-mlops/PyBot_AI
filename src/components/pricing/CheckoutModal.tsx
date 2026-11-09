import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Check, ShieldCheck, CreditCard, Loader2, Sparkles, X } from 'lucide-react';
import { SubscriptionPlan, User } from '../../types/index.js';
import { api } from '../../services/api.js';

interface CheckoutModalProps {
  plan: SubscriptionPlan;
  currency: 'USD' | 'INR';
  onClose: () => void;
  onSuccess: (updatedUser: User) => void;
}

export function CheckoutModal({ plan, currency, onClose, onSuccess }: CheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'card' | 'upi'>('razorpay');
  const [upiId, setUpiId] = useState('user@okaxis');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 9921');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const priceFormatted = currency === 'INR' ? `₹${plan.priceMonthlyINR}` : `\$${plan.priceMonthlyUSD}`;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Simulate realistic payment gateway processing latency
      await new Promise((r) => setTimeout(r, 1200));

      const paymentMethodLabel =
        paymentMethod === 'razorpay'
          ? 'Razorpay Smart Gateway'
          : paymentMethod === 'upi'
          ? `UPI (${upiId})`
          : `Credit Card (${cardNumber.slice(-4)})`;

      const result = await api.checkoutSubscription(plan.id, paymentMethodLabel, currency);

      setIsProcessing(false);
      setIsComplete(true);

      // Trigger celebratory confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      setTimeout(() => {
        onSuccess(result.user);
        onClose();
      }, 1800);
    } catch (err: any) {
      setIsProcessing(false);
      alert(err.message || 'Payment verification failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-5 text-slate-900 dark:text-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">
            Secure SaaS Checkout
          </span>
          <h2 className="text-lg font-bold">Upgrade to {plan.name}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Instant activation with server-side signature verification.
          </p>
        </div>

        {/* Plan summary badge */}
        <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200/80 dark:border-slate-700/60">
          <div>
            <div className="text-sm font-bold">{plan.name}</div>
            <div className="text-xs text-slate-500">{plan.questionLimitDaily} questions / day</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold font-mono tabular-nums">{priceFormatted}</div>
            <div className="text-[11px] text-slate-400">per month</div>
          </div>
        </div>

        {/* Payment Provider Selection */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Select Payment Method (Razorpay Gateway)
          </label>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setPaymentMethod('razorpay')}
              className={`p-2.5 rounded-lg border text-center transition flex flex-col items-center justify-center gap-1 ${
                paymentMethod === 'razorpay'
                  ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Razorpay</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('upi')}
              className={`p-2.5 rounded-lg border text-center transition flex flex-col items-center justify-center gap-1 ${
                paymentMethod === 'upi'
                  ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>UPI / QR</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`p-2.5 rounded-lg border text-center transition flex flex-col items-center justify-center gap-1 ${
                paymentMethod === 'card'
                  ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <CreditCard className="h-4 w-4" />
              <span>Cards</span>
            </button>
          </div>

          {/* Conditional details input */}
          {paymentMethod === 'upi' && (
            <div className="pt-2 text-xs space-y-1">
              <label className="block text-slate-500 font-medium">UPI VPA Address</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="yourname@okhdfcbank"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs"
              />
            </div>
          )}

          {paymentMethod === 'card' && (
            <div className="pt-2 text-xs space-y-2">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-mono"
                />
              </div>
            </div>
          )}
        </div>

        {/* Security Trust Note */}
        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
          <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
          <span>256-bit TLS encrypted transaction · 14-day money-back guarantee</span>
        </div>

        {/* Submit */}
        <button
          onClick={handlePay}
          disabled={isProcessing || isComplete}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-600 shadow-md transition active:scale-98 disabled:opacity-50 text-xs"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Verifying Razorpay Signature...</span>
            </>
          ) : isComplete ? (
            <>
              <Check className="h-4 w-4 text-emerald-300" />
              <span>Payment Verified! Upgraded!</span>
            </>
          ) : (
            <>
              <span>Pay {priceFormatted} and Upgrade</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
