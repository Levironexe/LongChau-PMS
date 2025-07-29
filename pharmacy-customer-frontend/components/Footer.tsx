"use client";

import Link from "next/link";
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Youtube, Award } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-blue-900 to-blue-800 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">LC</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">Long Chau</h3>
                <p className="text-xs text-gray-400">Trusted Pharmacy</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4 text-sm">
              Leading trusted pharmacy chain, committed to bringing health and happiness to every family.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-blue-400" />
                <span className="text-sm">1800-6928 (toll-free)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-400" />
                <span className="text-sm">support@longchaupharmacy.com</span>
              </div>
            </div>
            
            {/* Social Media */}
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Product Categories */}
          <div>
            <h4 className="font-semibold mb-4 text-blue-400">Product Categories</h4>
            <div className="space-y-2">
              <Link href="/products?category=medicine" className="block text-gray-300 hover:text-white text-sm transition-colors">
                Prescription Medicines
              </Link>
              <Link href="/products?category=otc" className="block text-gray-300 hover:text-white text-sm transition-colors">
                Over-the-Counter
              </Link>
              <Link href="/products?category=supplement" className="block text-gray-300 hover:text-white text-sm transition-colors">
                Health Supplements
              </Link>
              <Link href="/products?category=device" className="block text-gray-300 hover:text-white text-sm transition-colors">
                Medical Devices
              </Link>
              <Link href="/products?category=cosmetic" className="block text-gray-300 hover:text-white text-sm transition-colors">
                Pharmaceutical Cosmetics
              </Link>
              <Link href="/products?category=mother-baby" className="block text-gray-300 hover:text-white text-sm transition-colors">
                Mother & Baby
              </Link>
            </div>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold mb-4 text-blue-400">Customer Support</h4>
            <div className="space-y-2">
              <Link href="/account" className="block text-gray-300 hover:text-white text-sm transition-colors">
                My Account
              </Link>
              <Link href="/orders" className="block text-gray-300 hover:text-white text-sm transition-colors">
                Track Orders
              </Link>
              <Link href="/prescription-upload" className="block text-gray-300 hover:text-white text-sm transition-colors">
                Upload Prescription
              </Link>
              <Link href="/health-check" className="block text-gray-300 hover:text-white text-sm transition-colors">
                Health Check
              </Link>
              <Link href="/store-locator" className="block text-gray-300 hover:text-white text-sm transition-colors">
                Store Locator
              </Link>
              <Link href="/loyalty-program" className="block text-gray-300 hover:text-white text-sm transition-colors">
                Loyalty Program
              </Link>
            </div>
          </div>

          {/* Company Info & Hours */}
          <div>
            <h4 className="font-semibold mb-4 text-blue-400">Company Information</h4>
            <div className="space-y-3">
              <div className="text-sm text-gray-300">
                <div className="flex items-start gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-blue-400 mt-0.5" />
                  <div>
                    <p className="font-medium">Headquarters:</p>
                    <p>379-381 Hai Ba Trung, Ward 8, District 3, HCMC</p>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-gray-300">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-blue-400" />
                  <span className="font-medium">Business Hours:</span>
                </div>
                <p className="ml-6">Mon-Fri: 8:00 AM - 10:00 PM</p>
                <p className="ml-6">Sat-Sun: 9:00 AM - 9:00 PM</p>
              </div>

              <div className="text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-blue-400" />
                  <span>GPP License: 12345/GP-SYT</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-blue-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © 2024 Long Chau Pharmacy. All rights reserved. | GPP: 12345/GP-SYT
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0 text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/returns" className="hover:text-white transition-colors">
                Return Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
