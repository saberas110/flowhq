"use client";
import React, { useState } from "react";
import {
  Zap,
  Plus,
  Settings,
  CheckCircle,
  ExternalLink,
  Search,
  Grid,
  List,
  Star,
  Users,
  ShoppingCart,
  MessageSquare,
  Calendar,
  Shield,
  Globe,
} from "lucide-react";
import { ConnectEmailDialog } from "./ConnectEmailDialog";

const Integrations: React.FC = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState("all");
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);

  const integrations = [
    {
      id: "email-imap",
      name: "Email (IMAP/SMTP)",
      description:
        "Connect any email account using IMAP/SMTP with app password authentication",
      category: "communication",
      status: "available",
      icon: "📧",
      color: "bg-indigo-100 text-indigo-800",
      users: 5230,
      rating: 4.7,
      features: ["Multi-provider support", "App password auth", "Real-time sync"],
      connectType: "imap",
    },
    {
      id: "shopify",
      name: "Shopify",
      description:
        "E-commerce platform integration for order management and customer data",
      category: "ecommerce",
      status: "connected",
      icon: "🛍️",
      color: "bg-green-100 text-green-800",
      users: 15420,
      rating: 4.8,
      features: ["Order tracking", "Customer profiles", "Product catalog sync"],
    },
    {
      id: "hubspot",
      name: "HubSpot",
      description:
        "CRM integration for lead management and customer relationship tracking",
      category: "crm",
      status: "connected",
      icon: "🎯",
      color: "bg-orange-100 text-orange-800",
      users: 12350,
      rating: 4.9,
      features: ["Contact sync", "Deal tracking", "Activity logging"],
    },
    {
      id: "whatsapp",
      name: "WhatsApp Business",
      description: "Direct messaging integration for customer communication",
      category: "communication",
      status: "connected",
      icon: "💬",
      color: "bg-green-100 text-green-800",
      users: 25670,
      rating: 4.7,
      features: ["Message sync", "Media support", "Group messaging"],
    },
    {
      id: "gmail-oauth",
      name: "Gmail (OAuth)",
      description:
        "Email integration via Google OAuth for seamless Gmail access",
      category: "communication",
      status: "available",
      icon: "✉️",
      color: "bg-blue-100 text-blue-800",
      users: 8940,
      rating: 4.6,
      features: ["Email sync", "Thread tracking", "Auto-categorization"],
      connectType: "oauth",
    },
    {
      id: "salesforce",
      name: "Salesforce",
      description:
        "Enterprise CRM integration for advanced customer relationship management",
      category: "crm",
      status: "available",
      icon: "☁️",
      color: "bg-blue-100 text-blue-800",
      users: 18750,
      rating: 4.8,
      features: ["Lead scoring", "Opportunity tracking", "Custom fields"],
    },
    {
      id: "calendly",
      name: "Calendly",
      description: "Appointment scheduling integration for booking management",
      category: "scheduling",
      status: "available",
      icon: "📅",
      color: "bg-purple-100 text-purple-800",
      users: 6780,
      rating: 4.5,
      features: ["Auto-booking", "Calendar sync", "Availability checks"],
    },
    {
      id: "slack",
      name: "Slack",
      description: "Team communication integration for internal notifications",
      category: "communication",
      status: "available",
      icon: "📢",
      color: "bg-purple-100 text-purple-800",
      users: 4560,
      rating: 4.7,
      features: ["Alert notifications", "Channel routing", "Bot commands"],
    },
    {
      id: "woocommerce",
      name: "WooCommerce",
      description:
        "WordPress e-commerce integration for online store management",
      category: "ecommerce",
      status: "available",
      icon: "🏪",
      color: "bg-purple-100 text-purple-800",
      users: 11200,
      rating: 4.4,
      features: ["Product sync", "Order management", "Customer data"],
    },
    {
      id: "stripe",
      name: "Stripe",
      description: "Payment processing integration for transaction management",
      category: "payments",
      status: "available",
      icon: "💳",
      color: "bg-indigo-100 text-indigo-800",
      users: 9870,
      rating: 4.9,
      features: [
        "Payment tracking",
        "Refund handling",
        "Subscription management",
      ],
    },
  ];

  const handleConnect = (integration: typeof integrations[0]) => {
    if (integration.id === "email-imap") {
      setEmailDialogOpen(true);
    } else if (integration.id === "gmail-oauth") {
      // Redirect to Gmail OAuth
      window.location.href = process.env.NEXT_PUBLIC_GMAIL_AUTH_INTEGRATION!;
    }
    // Other integrations can be handled here
  };

  const categories = [
    { id: "all", name: "All", icon: Grid },
    { id: "crm", name: "CRM", icon: Users },
    { id: "ecommerce", name: "E-commerce", icon: ShoppingCart },
    { id: "communication", name: "Communication", icon: MessageSquare },
    { id: "scheduling", name: "Scheduling", icon: Calendar },
    { id: "payments", name: "Payments", icon: Shield },
  ];

  const filteredIntegrations =
    filter === "all"
      ? integrations
      : integrations.filter((int) => int.category === filter);

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Integrations
          </h1>
          <p className="text-gray-600">
            Connect your favorite tools and platforms with FlowHQ
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-white border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 ${viewMode === "grid" ? "bg-gray-100 text-gray-900" : "text-gray-500"}`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 ${viewMode === "list" ? "bg-gray-100 text-gray-900" : "text-gray-500"}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Custom Integration
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search integrations..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center space-x-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setFilter(category.id)}
              className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === category.id
                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <category.icon className="h-4 w-4 mr-2" />
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Connected Integrations Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">
                Active Integrations
              </p>
              <p className="text-3xl font-bold text-green-900 mt-2">3</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">
                Available Integrations
              </p>
              <p className="text-3xl font-bold text-blue-900 mt-2">50+</p>
            </div>
            <Zap className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-800">
                Custom Connectors
              </p>
              <p className="text-3xl font-bold text-purple-900 mt-2">1</p>
            </div>
            <Settings className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Integrations Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIntegrations.map((integration) => (
            <div
              key={integration.name}
              className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="text-3xl mr-3">{integration.icon}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {integration.name}
                      </h3>
                      <div className="flex items-center mt-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                        <span className="text-xs text-gray-600">
                          {integration.rating}
                        </span>
                        <span className="text-xs text-gray-400 ml-2">
                          ({integration.users.toLocaleString()} users)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {integration.status === "connected" ? (
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                        <span className="text-xs text-green-600 font-medium">
                          Connected
                        </span>
                      </div>
                    ) : (





                      <button 
                        onClick={() => handleConnect(integration)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-blue-700"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {integration.description}
                </p>
                <div className="space-y-2">
                  {integration.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center text-xs text-gray-600"
                    >
                      <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                      {feature}
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${integration.color}`}
                    >
                      {integration.category}
                    </span>
                    {integration.status === "connected" && (
                      <button className="text-gray-400 hover:text-gray-600">
                        <Settings className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Integration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredIntegrations.map((integration) => (
                  <tr key={integration.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-2xl mr-4">{integration.icon}</div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {integration.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {integration.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${integration.color}`}
                      >
                        {integration.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                        <span className="text-sm text-gray-900">
                          {integration.rating}
                        </span>
                        <span className="text-sm text-gray-500 ml-2">
                          ({integration.users.toLocaleString()})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {integration.status === "connected" ? (
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          <span className="text-sm text-green-600 font-medium">
                            Connected
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Available</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {integration.status === "connected" ? (
                        <button className="text-gray-600 hover:text-gray-900 mr-4">
                          <Settings className="h-4 w-4" />
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleConnect(integration)}
                          className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"
                        >
                          Connect
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Custom Integration CTA */}
      <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-100">
        <div className="text-center">
          <Globe className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Need a Custom Integration?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Can&apos;t find the integration you need? Our team can build custom
            connectors for your specific business tools and workflows.
          </p>
          <button className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
            Request Custom Integration
            <ExternalLink className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Connect Email Dialog */}
      <ConnectEmailDialog
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
      />
    </div>
  );
};

export default Integrations;
