"use client";
import React from "react";
import {
  TrendingUp,
  Users,
  MessageSquare,
  Clock,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  MoreVertical,
} from "lucide-react";

const Dashboard: React.FC = () => {
  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back! Here&apos;s what&apos;s happening with your AI representative.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">
                  Total Conversations
                </p>
                <p className="text-2xl font-bold text-gray-900">2,847</p>
              </div>
            </div>
            <div className="flex items-center text-green-600">
              <ArrowUp className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">12%</span>
            </div>
          </div>
          <div className="text-xs text-gray-500">vs last month</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">
                  Resolution Rate
                </p>
                <p className="text-2xl font-bold text-gray-900">94.2%</p>
              </div>
            </div>
            <div className="flex items-center text-green-600">
              <ArrowUp className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">3%</span>
            </div>
          </div>
          <div className="text-xs text-gray-500">automated resolutions</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">
                  Avg Response Time
                </p>
                <p className="text-2xl font-bold text-gray-900">1.2s</p>
              </div>
            </div>
            <div className="flex items-center text-red-600">
              <ArrowDown className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">0.3s</span>
            </div>
          </div>
          <div className="text-xs text-gray-500">faster than last month</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">
                  Revenue Impact
                </p>
                <p className="text-2xl font-bold text-gray-900">$42.5k</p>
              </div>
            </div>
            <div className="flex items-center text-green-600">
              <ArrowUp className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">18%</span>
            </div>
          </div>
          <div className="text-xs text-gray-500">attributed this month</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Conversations
                </h2>
                <button className="text-sm text-blue-600 hover:text-blue-700">
                  View All
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900">
                        Sarah Johnson
                      </h3>
                      <span className="text-xs text-gray-500">2 min ago</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Asked about order #1234 status - Automatically resolved
                    </p>
                    <div className="flex items-center mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Resolved
                      </span>
                      <span className="ml-2 text-xs text-gray-500">
                        via WhatsApp
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900">
                        Mike Chen
                      </h3>
                      <span className="text-xs text-gray-500">15 min ago</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Refund request for product - Escalated to you
                    </p>
                    <div className="flex items-center mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        Escalated
                      </span>
                      <span className="ml-2 text-xs text-gray-500">
                        via Email
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900">
                        Emma Wilson
                      </h3>
                      <span className="text-xs text-gray-500">1 hr ago</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Product inquiry and booking consultation - Meeting
                      scheduled
                    </p>
                    <div className="flex items-center mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Scheduled
                      </span>
                      <span className="ml-2 text-xs text-gray-500">
                        via Website Chat
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900">
                        David Brown
                      </h3>
                      <span className="text-xs text-gray-500">2 hr ago</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Technical support question - Resolved with documentation
                    </p>
                    <div className="flex items-center mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Resolved
                      </span>
                      <span className="ml-2 text-xs text-gray-500">
                        via Email
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats & Actions */}
        <div className="space-y-6">
          {/* Channel Performance */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Channel Performance
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-sm font-medium text-gray-700">
                      Website Chat
                    </span>
                  </div>
                  <span className="text-sm text-gray-900">847 (42%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm font-medium text-gray-700">
                      WhatsApp
                    </span>
                  </div>
                  <span className="text-sm text-gray-900">562 (28%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                    <span className="text-sm font-medium text-gray-700">
                      Email
                    </span>
                  </div>
                  <span className="text-sm text-gray-900">398 (20%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                    <span className="text-sm font-medium text-gray-700">
                      Social Media
                    </span>
                  </div>
                  <span className="text-sm text-gray-900">201 (10%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Quick Actions
              </h2>
            </div>
            <div className="p-6 space-y-3">
              <button className="w-full flex items-center justify-between p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <span className="text-sm font-medium text-gray-900">
                  Review Escalations
                </span>
                <div className="flex items-center">
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full mr-2">
                    3
                  </span>
                  <MoreVertical className="h-4 w-4 text-gray-400" />
                </div>
              </button>
              <button className="w-full flex items-center justify-between p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <span className="text-sm font-medium text-gray-900">
                  Update Knowledge Base
                </span>
                <MoreVertical className="h-4 w-4 text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <span className="text-sm font-medium text-gray-900">
                  Configure Workflows
                </span>
                <MoreVertical className="h-4 w-4 text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <span className="text-sm font-medium text-gray-900">
                  Export Reports
                </span>
                <MoreVertical className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* AI Health */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                AI Performance
              </h2>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-700">
                  Overall Health
                </span>
                <span className="text-sm font-semibold text-green-600">
                  Excellent
                </span>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Accuracy</span>
                    <span>96%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: "96%" }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Speed</span>
                    <span>98%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: "98%" }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Satisfaction</span>
                    <span>94%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: "94%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
