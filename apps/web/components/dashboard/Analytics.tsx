import React from "react";
import {
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Users,
  Clock,
  CheckCircle,
  BarChart3,
  PieChart,
  Download,
  Calendar,
  Filter,
} from "lucide-react";

const Analytics: React.FC = () => {
  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
          <p className="text-gray-600">
            Detailed insights into your AI representative&apos;s performance
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Calendar className="h-4 w-4 mr-2" />
            Last 30 Days
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Conversations
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">8,247</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">
                  +12% from last month
                </span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Resolution Rate
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">94.2%</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">
                  +3% from last month
                </span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Avg Response Time
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">1.2s</p>
              <div className="flex items-center mt-2">
                <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">-0.3s faster</span>
              </div>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Customer Satisfaction
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">4.8/5</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">
                  +0.2 from last month
                </span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Conversation Volume Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Conversation Volume
            </h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                Interactive chart would display here
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Showing daily conversation trends
              </p>
            </div>
          </div>
        </div>

        {/* Channel Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Channel Distribution
            </h3>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                <span className="font-medium text-gray-700">Website Chat</span>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">3,467</p>
                <p className="text-sm text-gray-500">42%</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: "42%" }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                <span className="font-medium text-gray-700">WhatsApp</span>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">2,309</p>
                <p className="text-sm text-gray-500">28%</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: "28%" }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-purple-500 rounded-full mr-3"></div>
                <span className="font-medium text-gray-700">Email</span>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">1,649</p>
                <p className="text-sm text-gray-500">20%</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full"
                style={{ width: "20%" }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-orange-500 rounded-full mr-3"></div>
                <span className="font-medium text-gray-700">Social Media</span>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">822</p>
                <p className="text-sm text-gray-500">10%</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full"
                style={{ width: "10%" }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Response Time Analysis */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Response Time Breakdown
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Under 1 second
                </span>
                <span className="text-sm text-gray-900">68%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: "68%" }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  1-3 seconds
                </span>
                <span className="text-sm text-gray-900">24%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: "24%" }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  3-5 seconds
                </span>
                <span className="text-sm text-gray-900">6%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full"
                  style={{ width: "6%" }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Over 5 seconds
                </span>
                <span className="text-sm text-gray-900">2%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{ width: "2%" }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Escalation Analysis */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Escalation Analysis
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Total Escalations</p>
                <p className="text-sm text-gray-600">This month</p>
              </div>
              <span className="text-2xl font-bold text-gray-900">147</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Escalation Rate</p>
                <p className="text-sm text-gray-600">Of all conversations</p>
              </div>
              <span className="text-2xl font-bold text-orange-600">5.8%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Avg Resolution Time</p>
                <p className="text-sm text-gray-600">For escalated issues</p>
              </div>
              <span className="text-2xl font-bold text-blue-600">2.4h</span>
            </div>
          </div>
        </div>

        {/* Top Resolution Categories */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Top Resolution Categories
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Order Status
              </span>
              <div className="flex items-center">
                <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: "85%" }}
                  ></div>
                </div>
                <span className="text-sm text-gray-900">2,847</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Product Info
              </span>
              <div className="flex items-center">
                <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: "72%" }}
                  ></div>
                </div>
                <span className="text-sm text-gray-900">2,103</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Technical Support
              </span>
              <div className="flex items-center">
                <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: "58%" }}
                  ></div>
                </div>
                <span className="text-sm text-gray-900">1,642</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Billing</span>
              <div className="flex items-center">
                <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                  <div
                    className="bg-orange-500 h-2 rounded-full"
                    style={{ width: "45%" }}
                  ></div>
                </div>
                <span className="text-sm text-gray-900">1,234</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Appointments
              </span>
              <div className="flex items-center">
                <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                  <div
                    className="bg-pink-500 h-2 rounded-full"
                    style={{ width: "32%" }}
                  ></div>
                </div>
                <span className="text-sm text-gray-900">894</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Impact */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Revenue Impact Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">$127K</p>
            <p className="text-sm text-gray-600 mt-1">Revenue Attributed</p>
            <p className="text-xs text-gray-500">This month</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">347</p>
            <p className="text-sm text-gray-600 mt-1">Leads Generated</p>
            <p className="text-xs text-gray-500">Qualified prospects</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">892</p>
            <p className="text-sm text-gray-600 mt-1">Bookings Made</p>
            <p className="text-xs text-gray-500">Appointments scheduled</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-600">23%</p>
            <p className="text-sm text-gray-600 mt-1">Conversion Rate</p>
            <p className="text-xs text-gray-500">Inquiry to sale</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
