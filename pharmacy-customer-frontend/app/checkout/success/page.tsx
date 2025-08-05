"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';
import { 
  CheckCircle, 
  Package, 
  Truck, 
  Clock, 
  Receipt, 
  Download, 
  ArrowRight,
  Phone,
  MapPin,
  CreditCard,
  Calendar
} from 'lucide-react';

interface OrderDetails {
  orderId: string;
  orderDate: string;
  paymentMethod: string;
  deliveryAddress: string;
  deliveryPhone: string;
  subtotal: number;
  shippingFee: number;
  discount: number;
  vipDiscount: number;
  tax: number;
  total: number;
  estimatedDelivery: string;
  items: Array<{
    id: number;
    name: string;
    price: number;
    quantity: number;
    manufacturer: string;
    requires_prescription: boolean;
  }>;
}

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const { user } = useAuth();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get order details from localStorage or URL params
    const storedOrder = localStorage.getItem('lastOrder');
    const orderId = searchParams.get('orderId');
    
    if (storedOrder) {
      const order = JSON.parse(storedOrder);
      setOrderDetails(order);
      
      // Clear cart after successful order
      clearCart();
      
      // Clean up stored order
      localStorage.removeItem('lastOrder');
    } else if (orderId) {
      // If no stored order but orderId exists, create mock order
      generateMockOrder(orderId);
    } else {
      // No order data, redirect to home
      router.push('/');
      return;
    }
    
    setIsLoading(false);
  }, [searchParams, router, clearCart]);

  const generateMockOrder = (orderId: string) => {
    const mockOrder: OrderDetails = {
      orderId,
      orderDate: new Date().toISOString(),
      paymentMethod: 'Credit Card',
      deliveryAddress: '123 Main Street, District 1, Ho Chi Minh City',
      deliveryPhone: '+84 901 234 567',
      subtotal: 285000,
      shippingFee: 25000,
      discount: 0,
      vipDiscount: user?.customer_type === 'vip' ? 14250 : 0, // 5% VIP discount
      tax: 28500, // 10% tax
      total: 324250,
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
      items: [
        {
          id: 1,
          name: 'Paracetamol 500mg',
          price: 25000,
          quantity: 2,
          manufacturer: 'Teva',
          requires_prescription: false,
        },
        {
          id: 6,
          name: 'Vitamin C 1000mg',
          price: 180000,
          quantity: 1,
          manufacturer: 'Blackmores',
          requires_prescription: false,
        },
        {
          id: 11,
          name: 'Omron Blood Pressure Monitor',
          price: 1200000,
          quantity: 1,
          manufacturer: 'Omron',
          requires_prescription: false,
        }
      ]
    };
    setOrderDetails(mockOrder);
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + '₫';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDeliveryStatus = () => {
    return [
      { status: 'Order Confirmed', completed: true, icon: CheckCircle },
      { status: 'Processing', completed: false, icon: Package },
      { status: 'Shipped', completed: false, icon: Truck },
      { status: 'Delivered', completed: false, icon: CheckCircle },
    ];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
          <Button asChild>
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-lg text-gray-600">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
          <div className="mt-4">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Order #{orderDetails.orderId}
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderDetails.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-600">{item.manufacturer}</p>
                        {item.requires_prescription && (
                          <Badge variant="destructive" className="text-xs mt-1">
                            Prescription Required
                          </Badge>
                        )}
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Delivery Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Delivery Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getDeliveryStatus().map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <div key={index} className="flex items-center gap-4">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          step.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${
                            step.completed ? 'text-green-600' : 'text-gray-400'
                          }`}>
                            {step.status}
                          </p>
                        </div>
                        {step.completed && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    );
                  })}
                  
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-700 mb-2">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">Estimated Delivery</span>
                    </div>
                    <p className="text-blue-600">{formatDate(orderDetails.estimatedDelivery)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Information */}
            <Card>
              <CardHeader>
                <CardTitle>Order Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Calendar className="h-4 w-4" />
                    Order Date
                  </div>
                  <p className="font-medium">{formatDate(orderDetails.orderDate)}</p>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <CreditCard className="h-4 w-4" />
                    Payment Method
                  </div>
                  <p className="font-medium">{orderDetails.paymentMethod}</p>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <MapPin className="h-4 w-4" />
                    Delivery Address
                  </div>
                  <p className="font-medium text-sm">{orderDetails.deliveryAddress}</p>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Phone className="h-4 w-4" />
                    Contact Phone
                  </div>
                  <p className="font-medium">{orderDetails.deliveryPhone}</p>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatCurrency(orderDetails.subtotal)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping Fee</span>
                  <span>{formatCurrency(orderDetails.shippingFee)}</span>
                </div>
                
                {orderDetails.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(orderDetails.discount)}</span>
                  </div>
                )}
                
                {orderDetails.vipDiscount > 0 && (
                  <div className="flex justify-between text-purple-600">
                    <span>VIP Discount (5%)</span>
                    <span>-{formatCurrency(orderDetails.vipDiscount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span>{formatCurrency(orderDetails.tax)}</span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-blue-600">{formatCurrency(orderDetails.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              <Button className="w-full" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Receipt
              </Button>
              
              <Button className="w-full" asChild>
                <Link href="/orders">
                  View Order History
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              
              <Button className="w-full" variant="outline" asChild>
                <Link href="/">
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-3">What happens next?</h3>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div className="text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <h4 className="font-medium mb-1">Order Processing</h4>
                <p className="text-gray-600">We'll prepare your order and verify prescription items if applicable.</p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <Truck className="h-5 w-5 text-blue-600" />
                </div>
                <h4 className="font-medium mb-1">Shipping</h4>
                <p className="text-gray-600">Your order will be dispatched within 24 hours and delivered in 2-4 hours.</p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <Phone className="h-5 w-5 text-blue-600" />
                </div>
                <h4 className="font-medium mb-1">Support</h4>
                <p className="text-gray-600">Contact our 24/7 support team if you have any questions about your order.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}