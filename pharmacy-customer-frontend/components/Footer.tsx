"use client"

import Link from "next/link"
import { Phone, Mail, MapPin, Clock } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Long Chau Pharmacy</h3>
            <p className="text-gray-300 mb-4">
              Your trusted healthcare partner for quality medicines and health products.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span className="text-sm">1800-6928</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="text-sm">info@longchau.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2">
              <Link href="/products" className="block text-gray-300 hover:text-white text-sm">
                Browse Products
              </Link>
              <Link href="/prescription-upload" className="block text-gray-300 hover:text-white text-sm">
                Upload Prescription
              </Link>
              <Link href="/account" className="block text-gray-300 hover:text-white text-sm">
                My Account
              </Link>
              <Link href="/cart" className="block text-gray-300 hover:text-white text-sm">
                Shopping Cart
              </Link>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4">Our Services</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <p>• Prescription Medicines</p>
              <p>• Health Supplements</p>
              <p>• Medical Devices</p>
              <p>• Health Consultation</p>
              <p>• Home Delivery</p>
            </div>
          </div>

          {/* Store Hours */}
          <div>
            <h4 className="font-semibold mb-4">Store Hours</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Mon - Fri: 8:00 AM - 10:00 PM</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Sat - Sun: 9:00 AM - 9:00 PM</span>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <MapPin className="h-4 w-4" />
                <span>Multiple locations nationwide</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">© 2024 Long Chau Pharmacy. All rights reserved. | Licensed Pharmacy</p>
        </div>
      </div>
    </footer>
  )
}
