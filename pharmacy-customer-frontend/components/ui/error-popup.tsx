"use client";

import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { Button } from './button';

interface ErrorField {
  message: string;
  field?: string;
}

interface ErrorPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  errors: string[] | ErrorField[];
  type?: 'error' | 'warning';
  onFieldFocus?: (fieldName: string) => void;
}

export function ErrorPopup({ 
  isOpen, 
  onClose, 
  title = 'Please fix the following errors:', 
  errors, 
  type = 'error',
  onFieldFocus 
}: ErrorPopupProps) {
  if (!isOpen || errors.length === 0) return null;

  const bgColor = type === 'error' ? 'bg-red-50' : 'bg-yellow-50';
  const borderColor = type === 'error' ? 'border-red-200' : 'border-yellow-200';
  const iconColor = type === 'error' ? 'text-red-600' : 'text-yellow-600';
  const textColor = type === 'error' ? 'text-red-800' : 'text-yellow-800';

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div 
          className={`relative w-full max-w-md ${bgColor} border ${borderColor} rounded-lg shadow-lg`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <AlertCircle className={`h-5 w-5 ${iconColor}`} />
              <h3 className={`font-semibold ${textColor}`}>
                {type === 'error' ? 'Validation Error' : 'Warning'}
              </h3>
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
            <p className={`text-sm ${textColor} mb-3`}>{title}</p>
            <ul className="space-y-2">
              {errors.map((error, index) => {
                const errorMessage = typeof error === 'string' ? error : error.message;
                const errorField = typeof error === 'object' ? error.field : undefined;
                
                return (
                  <li key={index} className={`flex items-start gap-2 text-sm ${textColor}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${iconColor.replace('text-', 'bg-')} mt-2 flex-shrink-0`} />
                    <span 
                      className={errorField && onFieldFocus ? 'cursor-pointer hover:underline' : ''}
                      onClick={() => {
                        if (errorField && onFieldFocus) {
                          onFieldFocus(errorField);
                          onClose();
                        }
                      }}
                    >
                      {errorMessage}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800"
            >
              Got it
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}