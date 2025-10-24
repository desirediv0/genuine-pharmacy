"use client";

import Link from "next/link";
import {
  Instagram,
  MapPin,
  Truck,
  Shield,
  CreditCard,
  CheckCircle,
  Mail,
} from "lucide-react";
import Image from "next/image";

export function Footer() {
  return (
    <footer>
      {/* Top Feature Section */}
      <div className="bg-[#EEEEEE] py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Truck className="text-[#1C4E80]" />,
                title: "Free Shipping",
                description: "On orders above ₹999",
              },
              {
                icon: <Shield className="text-[#1C4E80]" />,
                title: "Secure Payment",
                description: "100% secure transaction",
              },
              {
                icon: <CreditCard className="text-[#1C4E80]" />,
                title: "Multiple Payment Options",
                description: "Credit cards, UPI & more",
              },
              {
                icon: <CheckCircle className="text-[#1C4E80]" />,
                title: "Quality Products",
                description: "100% genuine supplements",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all flex items-start space-x-4"
              >
                <div className="text-[#1C4E80] mt-1">{feature.icon}</div>
                <div>
                  <h3 className="font-semibold text-lg text-[#333333] mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="bg-[#0f2b47] py-12 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
            {/* Column 1 - About */}
            <div className="md:col-span-1">
              <div className="mb-6">
                <Link href="/" className="flex items-center">
                  <Image
                    src="/logo-white.png"
                    alt="Logo"
                    width={150}
                    height={150}
                    className="w-36 md:w-[150px] h-auto lg:p-0"
                  />
                </Link>
              </div>
              <p className="text-white/80 mb-6 text-xs md:text-sm">
                Premium quality fitness supplements to enhance your workout
                results and overall wellness.
              </p>

              {/* Social media icons */}
              <div className="flex space-x-3">
                {[
                  { icon: <Instagram size={18} />, href: "https://www.instagram.com/GenuinePharmacy.official" },

                ].map((social, idx) => (
                  <Link
                    key={idx}
                    href={social.href}
                    className="bg-white/10 hover:bg-[#F47C20] p-2 rounded-md text-white transition-colors duration-300"
                  >
                    {social.icon}
                  </Link>
                ))}
              </div>
            </div>

            {/* Column 2 - Shop */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-4">Shop</h3>
              <ul className="space-y-2">
                {[
                  { label: "All Products", href: "/products" },
                  { label: "Protein", href: "/category/protein" },
                  { label: "Pre-Workout", href: "/category/pre-workout" },
                  { label: "Weight Gainers", href: "/category/weight-gainers" },
                  { label: "Vitamins", href: "/category/vitamins" },
                ].map((link, idx) => (
                  <li key={idx}>
                    <Link
                      href={link.href}
                      className="text-white/80 hover:text-[#F47C20] transition-colors duration-300 block text-xs md:text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3 - Help */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-4">Help</h3>
              <ul className="space-y-2">
                {[
                  { label: "Contact Us", href: "/contact" },
                  { label: "FAQ", href: "/faqs" },
                  { label: "Partner with us", href: "/partner-with-us" },
                  { label: "Shipping Policy", href: "/shipping-policy" },
                  { label: "Cancellation & Refund", href: "/refund-policy" },
                  { label: "Terms & Conditions", href: "/terms-conditions" },
                  { label: "Privacy Policy", href: "/privacy-policy" },
                ].map((link, idx) => (
                  <li key={idx}>
                    <Link
                      href={link.href}
                      className="text-white/80 hover:text-[#F47C20] transition-colors duration-300 block text-xs md:text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4 - Contact Info */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-4 ">
                Contact Us
              </h3>
              <div className="space-y-3 text-white/80 text-xs md:text-sm">
                <div className="flex items-start">
                  <MapPin
                    size={18}
                    className="text-[#F47C20] mr-2 mt-0.5 flex-shrink-0"
                  />
                  <span>89/2 Sector 39, Gurugram, Haryana</span>
                </div>

                <div className="flex items-center">
                  <Mail
                    size={18}
                    className="text-[#F47C20] mr-2 flex-shrink-0"
                  />
                  <span>connect@genuinenutrition.com</span>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-[#15395F] py-4 pb-20 md:pb-4">
        <div className="container mx-auto px-4">
          <p className="text-white/70 text-center text-sm">
            © {new Date().getFullYear()} GenuinePharmacy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
