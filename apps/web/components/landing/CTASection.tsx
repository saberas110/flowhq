import { ArrowRight } from 'lucide-react';

interface CTASectionProps {
  onStartTrial?: () => void;
}

export default function CTASection({ onStartTrial }: CTASectionProps) {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-bold text-white mb-6">
          Ready to transform your customer relationships?
        </h2>
        <p className="text-xl text-blue-100 mb-8">
          Join thousands of businesses using FlowHQ to never miss another
          customer.
        </p>
        <button
          onClick={onStartTrial}
          className="bg-white text-blue-600 mt-5 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center"
        >
          Start Your Free Trial
          <ArrowRight className="ml-2 h-5 w-5" />
        </button>
        <p className="text-sm text-blue-100 mt-4">
          No credit card required • Setup in minutes
        </p>
      </div>
    </section>
  );
}


