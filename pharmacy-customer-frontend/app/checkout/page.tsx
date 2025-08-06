"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ErrorPopup } from '@/components/ui/error-popup';
import { LoadingPopup } from '@/components/ui/loading-popup';
import { PaymentSuccessModal } from '@/components/ui/payment-success-modal';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';
import { 
  CreditCard, 
  Truck, 
  Shield, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  User,
  Wallet,
  Building,
  Check,
  AlertCircle,
  Crown
} from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

interface PricingBreakdown {
  subtotal: number;
  shippingFee: number;
  discount: number;
  vipDiscount: number;
  tax: number;
  total: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, clearCart, getCartTotal } = useCart();
  const { user, isAuthenticated } = useAuth();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
  });
  
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: user?.name || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [pricing, setPricing] = useState<PricingBreakdown>({
    subtotal: 0,
    shippingFee: 0,
    discount: 0,
    vipDiscount: 0,
    tax: 0,
    total: 0,
  });

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'credit-card',
      name: 'Credit/Debit Card',
      icon: <CreditCard className="h-5 w-5" />,
      description: 'Visa, Mastercard, JCB',
    },
    {
      id: 'momo',
      name: 'MoMo Wallet',
      icon: <Wallet className="h-5 w-5" />,
      description: 'Pay with MoMo e-wallet',
    },
    {
      id: 'banking',
      name: 'Internet Banking',
      icon: <Building className="h-5 w-5" />,
      description: 'Online bank transfer',
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      icon: <Truck className="h-5 w-5" />,
      description: 'Pay when you receive',
    },
  ];

  // Calculate pricing breakdown
  useEffect(() => {
    const subtotal = getCartTotal();
    const shippingFee = subtotal >= 500000 ? 0 : 25000; // Free shipping over 500k VND
    const discount = 0; // Could add coupon logic here
    const vipDiscount = user?.customer_type === 'vip' ? subtotal * 0.05 : 0; // 5% VIP discount
    const taxableAmount = subtotal + shippingFee - discount - vipDiscount;
    const tax = taxableAmount * 0.1; // 10% tax
    const total = taxableAmount + tax;

    setPricing({
      subtotal,
      shippingFee,
      discount,
      vipDiscount,
      tax,
      total,
    });
  }, [cartItems, user, getCartTotal]);

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      router.push('/cart');
    }
  }, [cartItems, router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!customerInfo.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!customerInfo.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
      newErrors.email = 'Valid email is required';
    }
    if (!customerInfo.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (!customerInfo.address.trim()) {
      newErrors.address = 'Delivery address is required';
    }

    // Payment validation for credit card
    if (paymentMethod === 'credit-card') {
      if (!paymentDetails.cardNumber.replace(/\s/g, '')) {
        newErrors.cardNumber = 'Card number is required';
      } else if (paymentDetails.cardNumber.replace(/\s/g, '').length < 16) {
        newErrors.cardNumber = 'Card number must be 16 digits';
      }
      if (!paymentDetails.expiryDate) {
        newErrors.expiryDate = 'Expiry date is required';
      }
      if (!paymentDetails.cvv) {
        newErrors.cvv = 'CVV is required';
      } else if (paymentDetails.cvv.length < 3) {
        newErrors.cvv = 'CVV must be 3-4 digits';
      }
      if (!paymentDetails.cardholderName.trim()) {
        newErrors.cardholderName = 'Cardholder name is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + '₫';
  };

  const getErrorMessages = () => {
    return Object.values(errors).filter(error => error && error !== '' && error !== 'submit');
  };

  const handleSuccessModalContinue = () => {
    if (orderData) {
      // Store order for success page
      localStorage.setItem('lastOrder', JSON.stringify(orderData));
      
      // Clear cart and redirect
      clearCart();
      router.push(`/checkout/success?orderId=${orderData.orderId}`);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    // Optionally redirect to home or keep on checkout page
    router.push('/');
  };

  const simulatePaymentProcessing = async () => {
    // Simulate different payment processing times
    const processingTime = paymentMethod === 'credit-card' ? 3000 : 2000;
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate 95% success rate
        if (Math.random() > 0.05) {
          resolve({ success: true, transactionId: 'TXN' + Date.now() });
        } else {
          reject(new Error('Payment failed. Please try again.'));
        }
      }, processingTime);
    });
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      setShowErrorPopup(true);
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      const paymentResult = await simulatePaymentProcessing();
      
      // Create order object
      const newOrderData = {
        orderId: 'LC' + Date.now(),
        orderDate: new Date().toISOString(),
        paymentMethod: paymentMethods.find(pm => pm.id === paymentMethod)?.name || 'Credit Card',
        deliveryAddress: customerInfo.address,
        deliveryPhone: customerInfo.phone,
        ...pricing,
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        items: cartItems.map(item => ({
          id: item.product.id,
          name: item.product.name,
          price: parseFloat(item.product.price),
          quantity: item.quantity,
          manufacturer: item.product.manufacturer,
          requires_prescription: item.product.requires_prescription,
        })),
      };

      // Store order data and show success modal
      setOrderData(newOrderData);
      setShowSuccessModal(true);
      
    } catch (error) {
      setErrors({ 
        submit: error instanceof Error ? error.message : 'Payment failed. Please try again.' 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Error Popup */}
      <ErrorPopup
        isOpen={showErrorPopup}
        onClose={() => setShowErrorPopup(false)}
        title="Please correct the following errors before placing your order:"
        errors={getErrorMessages()}
        type="error"
      />

      {/* Loading Popup */}
      <LoadingPopup
        isOpen={isProcessing}
        title="Processing Payment..."
        message={`Processing your payment via ${paymentMethods.find(pm => pm.id === paymentMethod)?.name || 'selected method'}. Please do not close this window.`}
      />

      {/* Payment Success Modal */}
      <PaymentSuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        onContinue={handleSuccessModalContinue}
        orderDetails={orderData ? {
          orderId: orderData.orderId,
          total: orderData.total,
          paymentMethod: orderData.paymentMethod
        } : undefined}
      />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your order</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        className={`pl-10 ${errors.name ? 'border-red-500' : ''}`}
                        value={customerInfo.name}
                        onChange={(e) => {
                          setCustomerInfo({ ...customerInfo, name: e.target.value });
                          if (errors.name) setErrors({ ...errors, name: '' });
                        }}
                        placeholder="Enter your full name"
                      />
                    </div>
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="email"
                        className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                        value={customerInfo.email}
                        onChange={(e) => {
                          setCustomerInfo({ ...customerInfo, email: e.target.value });
                          if (errors.email) setErrors({ ...errors, email: '' });
                        }}
                        placeholder="Enter your email"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                        value={customerInfo.phone}
                        onChange={(e) => {
                          setCustomerInfo({ ...customerInfo, phone: e.target.value });
                          if (errors.phone) setErrors({ ...errors, phone: '' });
                        }}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Address *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        className={`pl-10 ${errors.address ? 'border-red-500' : ''}`}
                        value={customerInfo.address}
                        onChange={(e) => {
                          setCustomerInfo({ ...customerInfo, address: e.target.value });
                          if (errors.address) setErrors({ ...errors, address: '' });
                        }}
                        placeholder="Enter delivery address"
                      />
                    </div>
                    {errors.address && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.address}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`relative cursor-pointer rounded-lg border p-4 hover:bg-gray-50 ${
                        paymentMethod === method.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200'
                      }`}
                      onClick={() => setPaymentMethod(method.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`rounded-full p-2 ${
                          paymentMethod === method.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {method.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{method.name}</h3>
                          <p className="text-sm text-gray-600">{method.description}</p>
                        </div>
                        {paymentMethod === method.id && (
                          <Check className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Credit Card Details */}
                {paymentMethod === 'credit-card' && (
                  <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                    <h4 className="font-medium text-gray-900 mb-4">Card Details</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Card Number *
                        </label>
                        <Input
                          className={errors.cardNumber ? 'border-red-500' : ''}
                          value={paymentDetails.cardNumber}
                          onChange={(e) => {
                            const formatted = formatCardNumber(e.target.value);
                            setPaymentDetails({ ...paymentDetails, cardNumber: formatted });
                            if (errors.cardNumber) setErrors({ ...errors, cardNumber: '' });
                          }}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                        />
                        {errors.cardNumber && (
                          <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Expiry Date *
                          </label>
                          <Input
                            className={errors.expiryDate ? 'border-red-500' : ''}
                            value={paymentDetails.expiryDate}
                            onChange={(e) => {
                              let value = e.target.value.replace(/\D/g, '');
                              if (value.length >= 2) {
                                value = value.substring(0, 2) + '/' + value.substring(2, 4);
                              }
                              setPaymentDetails({ ...paymentDetails, expiryDate: value });
                              if (errors.expiryDate) setErrors({ ...errors, expiryDate: '' });
                            }}
                            placeholder="MM/YY"
                            maxLength={5}
                          />
                          {errors.expiryDate && (
                            <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            CVV *
                          </label>
                          <Input
                            className={errors.cvv ? 'border-red-500' : ''}
                            value={paymentDetails.cvv}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              setPaymentDetails({ ...paymentDetails, cvv: value });
                              if (errors.cvv) setErrors({ ...errors, cvv: '' });
                            }}
                            placeholder="123"
                            maxLength={4}
                          />
                          {errors.cvv && (
                            <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cardholder Name *
                        </label>
                        <Input
                          className={errors.cardholderName ? 'border-red-500' : ''}
                          value={paymentDetails.cardholderName}
                          onChange={(e) => {
                            setPaymentDetails({ ...paymentDetails, cardholderName: e.target.value });
                            if (errors.cardholderName) setErrors({ ...errors, cardholderName: '' });
                          }}
                          placeholder="Name on card"
                        />
                        {errors.cardholderName && (
                          <p className="text-red-500 text-sm mt-1">{errors.cardholderName}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="flex gap-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.product.name}</h4>
                      <p className="text-xs text-gray-600">{item.product.manufacturer}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-600">Qty: {item.quantity}</span>
                        {item.product.requires_prescription && (
                          <Badge variant="destructive" className="text-xs">
                            Rx
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">
                        {formatCurrency(parseFloat(item.product.price) * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Pricing Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatCurrency(pricing.subtotal)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Shipping {pricing.shippingFee === 0 && '(Free)'}
                  </span>
                  <span>{formatCurrency(pricing.shippingFee)}</span>
                </div>
                
                {pricing.vipDiscount > 0 && (
                  <div className="flex justify-between text-sm text-purple-600">
                    <span className="flex items-center gap-1">
                      <Crown className="h-3 w-3" />
                      VIP Discount (5%)
                    </span>
                    <span>-{formatCurrency(pricing.vipDiscount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span>{formatCurrency(pricing.tax)}</span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-blue-600">{formatCurrency(pricing.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security & Delivery Info */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-green-600">
                    <Shield className="h-4 w-4" />
                    <span>Secure 256-bit SSL encryption</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600">
                    <Truck className="h-4 w-4" />
                    <span>2-4 hour delivery in city center</span>
                  </div>
                  <div className="flex items-center gap-2 text-purple-600">
                    <Clock className="h-4 w-4" />
                    <span>24/7 customer support</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Place Order Button */}
            <div className="space-y-3">
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {errors.submit}
                  </p>
                </div>
              )}
              
              <Button
                className="w-full py-3 text-lg"
                size="lg"
                onClick={handlePlaceOrder}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Processing Payment...
                  </div>
                ) : (
                  `Place Order - ${formatCurrency(pricing.total)}`
                )}
              </Button>
              
              <p className="text-xs text-gray-500 text-center">
                By placing this order, you agree to our{' '}
                <a href="/terms" className="text-blue-600 hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}