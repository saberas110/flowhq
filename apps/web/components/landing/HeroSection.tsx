import { ArrowRight, CheckCircle, MessageSquare } from 'lucide-react';

interface HeroSectionProps {
  onStartTrial?: () => void;
  onWatchDemo?: () => void;
}

export default function HeroSection({ onStartTrial, onWatchDemo }: HeroSectionProps) {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Your AI-Powered
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
              Account Representative
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Never miss a customer again. RepAi handles all your inbound
            communications across web, social, email, and voice with
            human-like intelligence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={onStartTrial}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button 
              onClick={onWatchDemo}
              className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:border-gray-400 transition-colors"
            >
              Watch Demo
            </button>
          </div>
          <p className="text-sm text-gray-500">
            Free 10 conversations • No credit card required • Live in 30
            minutes
          </p>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 animate-pulse">
        <div className="bg-white rounded-lg shadow-lg p-4 border">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium">
              New message from Sarah
            </span>
          </div>
        </div>
      </div>
      <div className="absolute top-40 right-10 animate-pulse delay-1000">
        <div className="bg-white rounded-lg shadow-lg p-4 border">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium">Order #1234 updated</span>
          </div>
        </div>
      </div>
    </section>
  );
}


