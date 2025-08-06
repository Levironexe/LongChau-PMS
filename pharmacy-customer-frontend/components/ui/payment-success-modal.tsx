"use client";

import React from 'react';
import { Check, X, ArrowRight, Download, Receipt } from 'lucide-react';
import { Button } from './button';

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  orderDetails?: {
    orderId: string;
    total: number;
    paymentMethod: string;
  };
}

export function PaymentSuccessModal({ 
  isOpen, 
  onClose, 
  onContinue,
  orderDetails 
}: PaymentSuccessModalProps) {
  if (!isOpen) return null;

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + '₫';
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
        {/* Modal */}
        <div 
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl modal-entrance"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Success Content */}
          <div className="text-center p-8">
            {/* Big Success Checkmark */}
            <div className="mx-auto mb-6 relative">
              {/* Outer Circle with Animation */}
              <div className="w-28 h-28 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto relative overflow-hidden shadow-lg">
                {/* Success Ring Animation */}
                <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-30"></div>
                <div className="absolute inset-1 bg-green-500 rounded-full animate-pulse opacity-40"></div>
                
                {/* Big Checkmark with custom animation */}
                <div className="relative z-10">
                  <Check className="h-14 w-14 text-white stroke-[4] animate-bounce" style={{
                    animationDelay: '0.5s',
                    animationDuration: '0.6s',
                    animationIterationCount: '2'
                  }} />
                </div>
              </div>
              
              {/* Success Sparkles */}
              <div className="absolute -top-3 -right-3 w-4 h-4 bg-yellow-400 rounded-full animate-bounce shadow-lg" style={{animationDelay: '0.8s'}}></div>
              <div className="absolute -bottom-2 -left-4 w-3 h-3 bg-blue-400 rounded-full animate-bounce delay-150 shadow-lg" style={{animationDelay: '1s'}}></div>
              <div className="absolute top-6 -left-5 w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-300 shadow-lg" style={{animationDelay: '1.2s'}}></div>
              <div className="absolute -top-1 left-8 w-2 h-2 bg-pink-400 rounded-full animate-bounce shadow-lg" style={{animationDelay: '1.4s'}}></div>
              
              {/* Additional celebration elements */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 w-1 h-6 bg-gradient-to-t from-yellow-400 to-transparent animate-pulse"></div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-4 w-1 h-6 bg-gradient-to-b from-yellow-400 to-transparent animate-pulse delay-200"></div>
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 h-1 w-6 bg-gradient-to-l from-yellow-400 to-transparent animate-pulse delay-100"></div>
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 h-1 w-6 bg-gradient-to-r from-yellow-400 to-transparent animate-pulse delay-300"></div>
              </div>
            </div>

            {/* Success Message */}
            <h2 className="text-3xl font-bold text-gray-900 mb-2 animate-fade-in-up">
              🎉 Payment Successful!
            </h2>
            <p className="text-lg text-gray-600 mb-6 animate-fade-in-up delay-200">
              Your order has been confirmed and is being processed.
            </p>
            
            {/* Celebration Message */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 mb-6 animate-fade-in-up delay-300">
              <p className="text-sm text-green-700 font-medium">
                ✨ Thank you for choosing Long Chau Pharmacy! ✨
              </p>
            </div>

            {/* Order Details */}
            {orderDetails && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <div className="flex items-center gap-2 mb-3">
                  <Receipt className="h-4 w-4 text-gray-600" />
                  <span className="font-medium text-gray-900">Order Summary</span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-medium text-gray-900">#{orderDetails.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium text-gray-900">{orderDetails.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium text-gray-900">Total Paid:</span>
                    <span className="font-bold text-green-600">{formatCurrency(orderDetails.total)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={onContinue}
                className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white py-3 text-lg"
                size="lg"
              >
                View Order Details
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 text-gray-600 hover:text-gray-800"
                >
                  Continue Shopping
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    // Trigger download receipt functionality
                    console.log('Download receipt for order:', orderDetails?.orderId);
                  }}
                  className="flex-1 text-blue-600 hover:text-blue-800 border-blue-200"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Receipt
                </Button>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                You will receive an email confirmation shortly with your order details and tracking information.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Animation Styles */}
      <style jsx>{`
        @keyframes checkmark {
          0% {
            stroke-dasharray: 0 50;
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dasharray: 50 50;
            stroke-dashoffset: -50;
          }
        }
        
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes modalScale {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .checkmark-animation {
          animation: checkmark 0.6s ease-in-out;
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        
        .delay-200 {
          animation-delay: 0.2s;
        }
        
        .delay-300 {
          animation-delay: 0.3s;
        }
        
        .modal-entrance {
          animation: modalScale 0.3s ease-out;
        }
      `}</style>
    </>
  );
}