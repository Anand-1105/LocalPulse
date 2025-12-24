import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Page } from '../App';

interface PaymentViewProps {
  onNavigate: (page: Page) => void;
  selectedPlan?: {
    name: string;
    price: string;
    description: string;
    features: string[];
  };
}

const PaymentView: React.FC<PaymentViewProps> = ({ onNavigate, selectedPlan }) => {
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: '',
    city: '',
    postalCode: '',
    country: 'India'
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLDivElement>(null);

  // Default plan if none selected
  const plan = selectedPlan || {
    name: 'Professional',
    price: '$49',
    description: 'The standard for growth-focused local businesses.',
    features: ['Everything in Essential', 'Featured Placement', 'Analytics Dashboard', 'Rich Media Gallery', 'Verified Badge']
  };

  useEffect(() => {
    if (formRef.current) {
      gsap.fromTo(formRef.current, 
        { y: 40, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1.2, ease: "power4.out", delay: 0.2 }
      );
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Format card number with spaces
    if (name === 'cardNumber') {
      const formatted = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      if (formatted.length <= 19) { // 16 digits + 3 spaces
        setFormData(prev => ({ ...prev, [name]: formatted }));
      }
      return;
    }
    
    // Format expiry date
    if (name === 'expiryDate') {
      const formatted = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
      if (formatted.length <= 5) {
        setFormData(prev => ({ ...prev, [name]: formatted }));
      }
      return;
    }
    
    // Limit CVV to 3 digits
    if (name === 'cvv') {
      const formatted = value.replace(/\D/g, '');
      if (formatted.length <= 3) {
        setFormData(prev => ({ ...prev, [name]: formatted }));
      }
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.cardNumber.replace(/\s/g, '') || formData.cardNumber.replace(/\s/g, '').length !== 16) {
      newErrors.cardNumber = 'Please enter a valid 16-digit card number';
    }
    
    if (!formData.expiryDate || formData.expiryDate.length !== 5) {
      newErrors.expiryDate = 'Please enter expiry date (MM/YY)';
    }
    
    if (!formData.cvv || formData.cvv.length !== 3) {
      newErrors.cvv = 'Please enter 3-digit CVV';
    }
    
    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }
    
    if (!formData.billingAddress.trim()) {
      newErrors.billingAddress = 'Billing address is required';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      onNavigate('payment-success' as Page);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#fafafb] py-20 px-8">
      <div ref={formRef} className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-[800] text-slate-900 mb-4 tracking-tight">
            Complete Your Purchase
          </h1>
          <p className="text-slate-500 font-medium">
            Secure payment powered by industry-standard encryption
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Payment Form */}
          <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">Payment Details</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-3">
                  Card Number
                </label>
                <input
                  type="text"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  className={`w-full px-6 py-4 rounded-2xl border transition-all duration-300 font-mono text-lg ${
                    errors.cardNumber 
                      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200' 
                      : 'border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-200'
                  } focus:outline-none focus:ring-4`}
                  placeholder="1234 5678 9012 3456"
                />
                {errors.cardNumber && (
                  <p className="text-red-500 text-sm font-medium mt-2">{errors.cardNumber}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-3">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 font-mono ${
                      errors.expiryDate 
                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200' 
                        : 'border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-200'
                    } focus:outline-none focus:ring-4`}
                    placeholder="MM/YY"
                  />
                  {errors.expiryDate && (
                    <p className="text-red-500 text-xs font-medium mt-1">{errors.expiryDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-3">
                    CVV
                  </label>
                  <input
                    type="text"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 font-mono ${
                      errors.cvv 
                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200' 
                        : 'border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-200'
                    } focus:outline-none focus:ring-4`}
                    placeholder="123"
                  />
                  {errors.cvv && (
                    <p className="text-red-500 text-xs font-medium mt-1">{errors.cvv}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-3">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  name="cardholderName"
                  value={formData.cardholderName}
                  onChange={handleInputChange}
                  className={`w-full px-6 py-4 rounded-2xl border transition-all duration-300 font-medium ${
                    errors.cardholderName 
                      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200' 
                      : 'border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-200'
                  } focus:outline-none focus:ring-4`}
                  placeholder="John Doe"
                />
                {errors.cardholderName && (
                  <p className="text-red-500 text-sm font-medium mt-2">{errors.cardholderName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-3">
                  Billing Address
                </label>
                <input
                  type="text"
                  name="billingAddress"
                  value={formData.billingAddress}
                  onChange={handleInputChange}
                  className={`w-full px-6 py-4 rounded-2xl border transition-all duration-300 font-medium ${
                    errors.billingAddress 
                      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200' 
                      : 'border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-200'
                  } focus:outline-none focus:ring-4`}
                  placeholder="123 Main Street"
                />
                {errors.billingAddress && (
                  <p className="text-red-500 text-sm font-medium mt-2">{errors.billingAddress}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-3">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 font-medium ${
                      errors.city 
                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200' 
                        : 'border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-200'
                    } focus:outline-none focus:ring-4`}
                    placeholder="Phagwara"
                  />
                  {errors.city && (
                    <p className="text-red-500 text-xs font-medium mt-1">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-3">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 font-medium ${
                      errors.postalCode 
                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200' 
                        : 'border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-200'
                    } focus:outline-none focus:ring-4`}
                    placeholder="144411"
                  />
                  {errors.postalCode && (
                    <p className="text-red-500 text-xs font-medium mt-1">{errors.postalCode}</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold transition-all duration-300 hover:bg-slate-800 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-8"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing Payment...
                  </div>
                ) : (
                  `Pay ${plan.price}/month`
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">Order Summary</h2>
            
            <div className="space-y-6">
              <div className="p-6 bg-slate-50 rounded-2xl">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                    <p className="text-slate-500 text-sm font-medium mt-1">{plan.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-900">{plan.price}</div>
                    <div className="text-sm text-slate-500 font-medium">per month</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm font-medium text-slate-600">
                      <div className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-100">
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Subtotal</span>
                  <span>{plan.price}</span>
                </div>
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Tax (18% GST)</span>
                  <span>₹{Math.round(parseInt(plan.price.replace('$', '')) * 0.18 * 83)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-slate-900 pt-4 border-t border-slate-200">
                  <span>Total</span>
                  <span>₹{Math.round(parseInt(plan.price.replace('$', '')) * 1.18 * 83)}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <h4 className="font-bold text-slate-900">Test Payment</h4>
                </div>
                <p className="text-sm text-slate-600 font-medium mb-3">
                  This is a demo payment form. Use these test card details:
                </p>
                <div className="text-xs font-mono bg-white p-3 rounded-lg border">
                  <div>Card: 4242 4242 4242 4242</div>
                  <div>Expiry: 12/25 • CVV: 123</div>
                  <div>Name: Any name works</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <button 
            onClick={() => onNavigate('pricing')}
            className="text-slate-400 font-medium hover:text-slate-600 transition-colors"
          >
            ← Back to pricing
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentView;