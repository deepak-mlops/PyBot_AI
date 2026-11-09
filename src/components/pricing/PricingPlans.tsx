import React, { useState, useEffect } from 'react';
import { Check, Sparkles, Shield, Zap, CreditCard, ChevronDown } from 'lucide-react';
import { SubscriptionPlan, User } from '../../types/index.js';
import { api } from '../../services/api.js';
import { CheckoutModal } from './CheckoutModal.js';

interface PricingPlansProps {
  user: User | null;
  onUpdateUser: (u: User) => void;
  onOpenAuth: () => void;
}

export function PricingPlans({ user, onUpdateUser, onOpenAuth }: PricingPlansProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<SubscriptionPlan | null>(null);

  useEffect(() => {
    api.getSubscriptionPlans().then((res) => setPlans(res.plans));
  }, []);

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (!user) {
      onOpenAuth();
      return;
    }
    if (user.plan === plan.id) return;
    setSelectedPlanForCheckout(plan);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-6 space-y-8 overflow-y-auto bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3 pt-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">
          Transparent SaaS Pricing
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Scale your Python Mastery with PyBot AI
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Choose the plan designed for your coding volume. Free forever tier for students, with high-capacity
          Pro and Enterprise options for active developers.
        </p>

        {/* Currency Switcher */}
        <div className="inline-flex items-center gap-1 rounded-xl bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 shadow-xs mt-2">
          <button
            onClick={() => setCurrency('USD')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              currency === 'USD'
                ? 'bg-slate-900 dark:bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            USD ($) Global
          </button>
          <button
            onClick={() => setCurrency('INR')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              currency === 'INR'
                ? 'bg-slate-900 dark:bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            INR (₹) India (UPI / Cards)
          </button>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto w-full">
        {plans.map((plan) => {
          const isCurrent = user?.plan === plan.id;
          const price = currency === 'INR' ? `₹${plan.priceMonthlyINR}` : `\$${plan.priceMonthlyUSD}`;

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between rounded-2xl p-6 transition shadow-xs ${
                plan.popular
                  ? 'border-2 border-amber-500 bg-white dark:bg-slate-900 shadow-lg'
                  : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-xs">
                  Most Popular for Developers
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{plan.name}</h3>
                  {isCurrent && (
                    <span className="rounded-md bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wide">
                      Active Plan
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 min-h-[32px] leading-relaxed">
                  {plan.tagline}
                </p>

                {/* Price */}
                <div className="my-6">
                  <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                    {price}
                  </span>
                  <span className="text-xs text-slate-400 ml-1.5 font-medium">/ month</span>
                </div>

                {/* Features list */}
                <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 pt-5">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-4">
                <button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={isCurrent}
                  className={`w-full py-2.5 rounded-xl text-xs font-semibold transition active:scale-98 ${
                    isCurrent
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default'
                      : plan.popular
                      ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md'
                      : 'bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white'
                  }`}
                >
                  {isCurrent ? 'Current Plan' : plan.id === 'free' ? 'Get Started Free' : `Upgrade to ${plan.name}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison Table */}
      <div className="max-w-4xl mx-auto w-full pt-8">
        <h2 className="text-base font-bold text-center text-slate-900 dark:text-slate-100 mb-4">
          Detailed Feature Comparison Matrix
        </h2>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3">Feature</th>
                <th className="px-4 py-3 text-center">Free Starter</th>
                <th className="px-4 py-3 text-center">Pro Developer</th>
                <th className="px-4 py-3 text-center">Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              <tr>
                <td className="px-6 py-3 font-medium">Daily Question Quota</td>
                <td className="px-4 py-3 text-center font-mono tabular-nums">15</td>
                <td className="px-4 py-3 text-center font-mono font-bold text-amber-500 tabular-nums">150</td>
                <td className="px-4 py-3 text-center font-mono font-bold text-emerald-500">Unlimited</td>
              </tr>
              <tr>
                <td className="px-6 py-3 font-medium">Browser Python 3 Sandbox</td>
                <td className="px-4 py-3 text-center">Standard</td>
                <td className="px-4 py-3 text-center font-semibold text-amber-500">High-Priority</td>
                <td className="px-4 py-3 text-center font-semibold text-emerald-500">Dedicated</td>
              </tr>
              <tr>
                <td className="px-6 py-3 font-medium">ML Model Switching</td>
                <td className="px-4 py-3 text-center">Baseline Only</td>
                <td className="px-4 py-3 text-center font-semibold text-amber-500">All 4 ML Models</td>
                <td className="px-4 py-3 text-center font-semibold text-emerald-500">Custom Retrain API</td>
              </tr>
              <tr>
                <td className="px-6 py-3 font-medium">Chat Export (Markdown & JSON)</td>
                <td className="px-4 py-3 text-center text-slate-400">—</td>
                <td className="px-4 py-3 text-center text-emerald-500">Included</td>
                <td className="px-4 py-3 text-center text-emerald-500">Included</td>
              </tr>
              <tr>
                <td className="px-6 py-3 font-medium">Payment Verification Architecture</td>
                <td className="px-4 py-3 text-center text-slate-400">—</td>
                <td className="px-4 py-3 text-center">Razorpay / UPI</td>
                <td className="px-4 py-3 text-center">Invoicing + PO</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Checkout Modal */}
      {selectedPlanForCheckout && (
        <CheckoutModal
          plan={selectedPlanForCheckout}
          currency={currency}
          onClose={() => setSelectedPlanForCheckout(null)}
          onSuccess={(u) => {
            onUpdateUser(u);
            setSelectedPlanForCheckout(null);
          }}
        />
      )}
    </div>
  );
}
