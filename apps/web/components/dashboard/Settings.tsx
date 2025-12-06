"use client";
import React, { useState } from "react";
import {
  Settings as SettingsIcon,
  User,
  Bot,
  Shield,
  Bell,
  Globe,
  CreditCard,
  Key,
  Mail,
  Phone,
  MessageSquare,
  Save,
  Camera,
  Trash2,
  Plus,
  ExternalLink,
    LogOut
} from "lucide-react";
import {logOutUser} from "@/http/auth/userApi";
import {useRouter} from "next/navigation";
import {error} from "next/dist/build/output/log";

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const router = useRouter()

  const tabs = [
    { id: "profile", name: "Profile", icon: User },
    { id: "ai", name: "AI Settings", icon: Bot },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "channels", name: "Channels", icon: MessageSquare },
    { id: "security", name: "Security", icon: Shield },
    { id: "billing", name: "Billing", icon: CreditCard },


  ];

  const handleLogOut = async ()=>{
    await logOutUser().then(res=>{
      console.log('its logout res:', res)
      router.push("/login")
    }).catch(error=>{
      console.log('error while logout user', error())
    })
  }
  
  

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">
          Manage your FlowHQ configuration and preferences
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="bg-white rounded-lg shadow-sm border p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center cursor-pointer px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <tab.icon className="h-5 w-5 mr-3" />
                {tab.name}
              </button>
            ))}

            <button
              onClick={handleLogOut}
              className="w-full flex items-center cursor-pointer px-3 py-3 text-sm font-medium rounded-lg transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-50"

            >
              <LogOut className="h-5 w-5 mr-3" />
              LogOut

            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {activeTab === "profile" && (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Profile Settings
                </h2>
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-6 mb-8">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-xl">
                        AB
                      </span>
                    </div>
                    <button className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md border">
                      <Camera className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Ahmad Baghereslami
                    </h3>
                    <p className="text-sm text-gray-500">Product Manager</p>
                    <button className="mt-2 text-sm text-blue-600 hover:text-blue-700">
                      Change photo
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      defaultValue="Ahmad"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      defaultValue="Baghereslami"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      defaultValue="ahmad@company.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      defaultValue="+1 (555) 123-4567"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      defaultValue="FlowHQ Technologies"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Zone
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option>Pacific Standard Time (PST)</option>
                      <option>Eastern Standard Time (EST)</option>
                      <option>Central Standard Time (CST)</option>
                      <option>Mountain Standard Time (MST)</option>
                    </select>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "ai" && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    AI Personality
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        AI Name
                      </label>
                      <input
                        type="text"
                        defaultValue="FlowHQ Assistant"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Communication Style
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option>Professional</option>
                        <option>Friendly</option>
                        <option>Casual</option>
                        <option>Formal</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Response Length
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option>Concise</option>
                        <option>Moderate</option>
                        <option>Detailed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default Language
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option>English</option>
                        <option>Spanish</option>
                        <option>French</option>
                        <option>German</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Knowledge Base
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Product Documentation
                        </h3>
                        <p className="text-sm text-gray-600">
                          Uploaded 2 days ago
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-green-600">Active</span>
                        <button className="text-gray-400 hover:text-gray-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          FAQ Database
                        </h3>
                        <p className="text-sm text-gray-600">
                          Uploaded 1 week ago
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-green-600">Active</span>
                        <button className="text-gray-400 hover:text-gray-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <button className="w-full flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700">
                      <Plus className="h-5 w-5 mr-2" />
                      Upload Knowledge Base Files
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Notification Preferences
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-4">
                      Escalation Notifications
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Mail className="h-5 w-5 text-gray-400 mr-3" />
                          <span className="text-sm">Email notifications</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            defaultChecked
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <MessageSquare className="h-5 w-5 text-gray-400 mr-3" />
                          <span className="text-sm">SMS notifications</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            defaultChecked
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Bell className="h-5 w-5 text-gray-400 mr-3" />
                          <span className="text-sm">Push notifications</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-4">
                      Performance Alerts
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">
                          High conversation volume
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            defaultChecked
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Low resolution rate</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            defaultChecked
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">System downtime</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            defaultChecked
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "channels" && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Connected Channels
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center">
                        <MessageSquare className="h-6 w-6 text-green-600 mr-3" />
                        <div>
                          <h3 className="font-medium text-gray-900">
                            WhatsApp Business
                          </h3>
                          <p className="text-sm text-gray-600">
                            Connected to +1 (555) 123-4567
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-green-600">Active</span>
                        <button className="text-gray-400 hover:text-gray-600">
                          <SettingsIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center">
                        <Globe className="h-6 w-6 text-blue-600 mr-3" />
                        <div>
                          <h3 className="font-medium text-gray-900">
                            Website Chat
                          </h3>
                          <p className="text-sm text-gray-600">
                            Embedded on yoursite.com
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-blue-600">Active</span>
                        <button className="text-gray-400 hover:text-gray-600">
                          <SettingsIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center">
                        <Mail className="h-6 w-6 text-purple-600 mr-3" />
                        <div>
                          <h3 className="font-medium text-gray-900">Email</h3>
                          <p className="text-sm text-gray-600">
                            support@yourcompany.com
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-purple-600">Active</span>
                        <button className="text-gray-400 hover:text-gray-600">
                          <SettingsIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center">
                        <Phone className="h-6 w-6 text-gray-400 mr-3" />
                        <div>
                          <h3 className="font-medium text-gray-900">Voice</h3>
                          <p className="text-sm text-gray-600">Not connected</p>
                        </div>
                      </div>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                        Connect
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Password & Authentication
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                      Update Password
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    API Keys
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Production API Key
                        </h3>
                        <p className="text-sm text-gray-600">
                          sk_prod_••••••••••••1234
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="text-gray-600 hover:text-gray-800 text-sm">
                          Copy
                        </button>
                        <button className="text-red-600 hover:text-red-800 text-sm">
                          Revoke
                        </button>
                      </div>
                    </div>
                    <button className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium">
                      <Key className="h-4 w-4 mr-2" />
                      Generate New API Key
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "billing" && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Current Plan
                  </h2>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Professional Plan
                      </h3>
                      <p className="text-sm text-gray-600">
                        $99/month • Billed monthly
                      </p>
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                      Change Plan
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">1,247</p>
                      <p className="text-sm text-gray-600">
                        Conversations this month
                      </p>
                      <p className="text-xs text-gray-500">of 5,000 included</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">8</p>
                      <p className="text-sm text-gray-600">
                        Active integrations
                      </p>
                      <p className="text-xs text-gray-500">of 10 included</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        Unlimited
                      </p>
                      <p className="text-sm text-gray-600">Workflows</p>
                      <p className="text-xs text-gray-500">included in plan</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Payment Method
                  </h2>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <CreditCard className="h-6 w-6 text-gray-400 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">
                          •••• •••• •••• 1234
                        </p>
                        <p className="text-sm text-gray-600">Expires 12/2025</p>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Update
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Recent Invoices
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">
                          January 2025
                        </p>
                        <p className="text-sm text-gray-600">
                          Professional Plan
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="font-medium text-gray-900">
                          $99.00
                        </span>
                        <button className="text-blue-600 hover:text-blue-700 text-sm">
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">
                          December 2024
                        </p>
                        <p className="text-sm text-gray-600">
                          Professional Plan
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="font-medium text-gray-900">
                          $99.00
                        </span>
                        <button className="text-blue-600 hover:text-blue-700 text-sm">
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
