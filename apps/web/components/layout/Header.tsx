import Link from 'next/link';
import React from 'react';
import Logo from './Logo';

export default function Header() {
  return (
    <header className="relative bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center">
            <Logo />
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-gray-900 px-3 py-2">
              Features
            </button>
            <button className="text-gray-600 hover:text-gray-900 px-3 py-2">
              Pricing
            </button>
            <button className="text-gray-600 hover:text-gray-900 px-3 py-2">
              Contact
            </button>
            <Link href="/dashboard">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Sign In
              </button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
