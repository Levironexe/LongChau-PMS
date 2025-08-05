"use client";

import React from 'react';
import { CheckCircle, X } from 'lucide-react';
import { Button } from './button';

interface SuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SuccessPopup({ 
  isOpen, 
  onClose, 
  title = 'Success!', 
  message, 
  actionLabel,
  onAction 
}: SuccessPopupProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div 
          className="relative w-full max-w-md bg-green-50 border border-green-200 rounded-lg shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-green-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-green-800">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            <p className="text-sm text-green-800">{message}</p>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 p-4 border-t border-green-200">
            {actionLabel && onAction && (
              <Button
                size="sm"
                onClick={() => {
                  onAction();
                  onClose();
                }}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {actionLabel}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-green-600 hover:text-green-800 border-green-300"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}