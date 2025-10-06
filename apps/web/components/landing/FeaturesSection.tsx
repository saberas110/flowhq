import { CheckCircle, MessageSquare, Bot, Zap, BarChart3, Clock, Shield } from 'lucide-react';

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything you need in one platform
          </h2>
          <p className="text-xl text-gray-600 w-full flex items-center justify-center ">
            From first contact to ongoing account management, RepAi handles it
            all
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 hover:shadow-lg transition-shadow">
            <MessageSquare className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Omnichannel Communication
            </h3>
            <p className="text-gray-600 mb-4">
              Handle chat, email, WhatsApp, social media, and voice calls from
              one unified inbox.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Website chat widget
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                WhatsApp Business integration
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Social media messaging
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 hover:shadow-lg transition-shadow">
            <Bot className="h-12 w-12 text-purple-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              AI-Powered Intelligence
            </h3>
            <p className="text-gray-600 mb-4">
              Human-like conversations that understand context and pull from
              your business data.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Natural language processing
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Customer history awareness
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Multi-language support
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 hover:shadow-lg transition-shadow">
            <Zap className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Smart Integrations
            </h3>
            <p className="text-gray-600 mb-4">
              Connect to your CRM, e-commerce platform, and business tools for
              real-time data.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Shopify, WooCommerce
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                HubSpot, Salesforce
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Custom API connections
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-8 hover:shadow-lg transition-shadow">
            <BarChart3 className="h-12 w-12 text-orange-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Advanced Analytics
            </h3>
            <p className="text-gray-600 mb-4">
              Track performance, response times, and customer satisfaction
              with detailed insights.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Real-time dashboards
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Performance metrics
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Revenue attribution
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-8 hover:shadow-lg transition-shadow">
            <Clock className="h-12 w-12 text-indigo-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Smart Escalation
            </h3>
            <p className="text-gray-600 mb-4">
              AI knows when to handle requests and when to alert you for human
              intervention.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Intelligent routing
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Context summaries
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Multi-channel alerts
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-8 hover:shadow-lg transition-shadow">
            <Shield className="h-12 w-12 text-pink-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Enterprise Security
            </h3>
            <p className="text-gray-600 mb-4">
              GDPR compliant with SOC 2 ready processes and enterprise-grade
              security.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                GDPR & CCPA compliant
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                SOC 2 Type II ready
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Role-based access
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}


