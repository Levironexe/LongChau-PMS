"use client";

import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingPopupProps {
  isOpen: boolean;
  title?: string;
  message?: string;
}

export function LoadingPopup({ 
  isOpen, 
  title = 'Processing...', 
  message = 'Please wait while we process your request.' 
}: LoadingPopupProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        {/* Modal */}
        <div className="relative w-full max-w-sm bg-white rounded-lg shadow-lg">
          {/* Content */}
          <div className="p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-600">{message}</p>
          </div>
        </div>
      </div>
    </>
  );
}