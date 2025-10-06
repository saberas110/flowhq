"use client";
import React, { useState } from "react";
import {
  Workflow,
  Plus,
  Play,
  Pause,
  Edit,
  Copy,
  Trash2,
  Settings,
  MessageSquare,
  Bot,
  ArrowRight,
  Filter,
  CheckCircle,
  Clock,
  Zap,
  Target,
  GitBranch,
  Save,
} from "lucide-react";

const WorkflowBuilder: React.FC = () => {
  const [isBuilding, setIsBuilding] = useState(false);

  const workflows = [
    {
      id: 1,
      name: "Lead Qualification",
      description:
        "Automatically qualify incoming leads and route them appropriately",
      status: "active",
      triggers: 2,
      actions: 5,
      lastModified: "2 hours ago",
      executions: 247,
      successRate: 96,
      category: "sales",
    },
    {
      id: 2,
      name: "Order Status Inquiry",
      description: "Handle customer inquiries about order status and tracking",
      status: "active",
      triggers: 3,
      actions: 4,
      lastModified: "1 day ago",
      executions: 892,
      successRate: 98,
      category: "support",
    },
    {
      id: 3,
      name: "Appointment Booking",
      description: "Schedule appointments and send confirmation emails",
      status: "paused",
      triggers: 1,
      actions: 6,
      lastModified: "3 days ago",
      executions: 156,
      successRate: 94,
      category: "scheduling",
    },
    {
      id: 4,
      name: "Product Recommendation",
      description: "Recommend products based on customer preferences",
      status: "draft",
      triggers: 2,
      actions: 3,
      lastModified: "1 week ago",
      executions: 0,
      successRate: 0,
      category: "sales",
    },
  ];

  const workflowNodes = [
    { id: 1, type: "trigger", title: "Customer Message", x: 100, y: 100 },
    { id: 2, type: "condition", title: 'Contains "order"?', x: 300, y: 100 },
    { id: 3, type: "action", title: "Fetch Order Data", x: 500, y: 50 },
    { id: 4, type: "action", title: "Send Order Status", x: 700, y: 50 },
    { id: 5, type: "action", title: "Route to Support", x: 500, y: 150 },
    { id: 6, type: "end", title: "End Workflow", x: 900, y: 100 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "sales":
        return "bg-blue-100 text-blue-800";
      case "support":
        return "bg-green-100 text-green-800";
      case "scheduling":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case "trigger":
        return "bg-green-100 border-green-300 text-green-800";
      case "condition":
        return "bg-yellow-100 border-yellow-300 text-yellow-800";
      case "action":
        return "bg-blue-100 border-blue-300 text-blue-800";
      case "end":
        return "bg-red-100 border-red-300 text-red-800";
      default:
        return "bg-gray-100 border-gray-300 text-gray-800";
    }
  };

  if (isBuilding) {
    return (
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Builder Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => setIsBuilding(false)}
              className="mr-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              ←
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Workflow Builder
              </h1>
              <p className="text-gray-600">Order Status Inquiry Workflow</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Play className="h-4 w-4 mr-2" />
              Test Workflow
            </button>
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div
          className="bg-white rounded-lg shadow-sm border"
          style={{ height: "600px" }}
        >
          <div className="flex h-full">
            {/* Node Palette */}
            <div className="w-64 border-r border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Components</h3>
              <div className="space-y-3">
                <div className="p-3 border border-green-300 rounded-lg bg-green-50 cursor-pointer hover:bg-green-100">
                  <div className="flex items-center">
                    <Zap className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-800">
                      Trigger
                    </span>
                  </div>
                  <p className="text-xs text-green-700 mt-1">Start workflow</p>
                </div>
                <div className="p-3 border border-yellow-300 rounded-lg bg-yellow-50 cursor-pointer hover:bg-yellow-100">
                  <div className="flex items-center">
                    <GitBranch className="h-4 w-4 text-yellow-600 mr-2" />
                    <span className="text-sm font-medium text-yellow-800">
                      Condition
                    </span>
                  </div>
                  <p className="text-xs text-yellow-700 mt-1">Decision point</p>
                </div>
                <div className="p-3 border border-blue-300 rounded-lg bg-blue-50 cursor-pointer hover:bg-blue-100">
                  <div className="flex items-center">
                    <Target className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-800">
                      Action
                    </span>
                  </div>
                  <p className="text-xs text-blue-700 mt-1">Perform task</p>
                </div>
                <div className="p-3 border border-purple-300 rounded-lg bg-purple-50 cursor-pointer hover:bg-purple-100">
                  <div className="flex items-center">
                    <Bot className="h-4 w-4 text-purple-600 mr-2" />
                    <span className="text-sm font-medium text-purple-800">
                      AI Response
                    </span>
                  </div>
                  <p className="text-xs text-purple-700 mt-1">Generate reply</p>
                </div>
                <div className="p-3 border border-red-300 rounded-lg bg-red-50 cursor-pointer hover:bg-red-100">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-red-600 mr-2" />
                    <span className="text-sm font-medium text-red-800">
                      End
                    </span>
                  </div>
                  <p className="text-xs text-red-700 mt-1">Complete workflow</p>
                </div>
              </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 relative bg-gray-50 overflow-hidden">
              <div className="absolute inset-0 p-8">
                {/* Grid Pattern */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `
                      radial-gradient(circle, #cbd5e1 1px, transparent 1px)
                    `,
                    backgroundSize: "20px 20px",
                  }}
                />

                {/* Workflow Nodes */}
                {workflowNodes.map((node) => (
                  <div
                    key={node.id}
                    className={`absolute p-4 rounded-lg border-2 cursor-pointer hover:shadow-md transition-shadow ${getNodeColor(node.type)}`}
                    style={{ left: node.x, top: node.y, width: "180px" }}
                  >
                    <div className="text-sm font-medium">{node.title}</div>
                    <div className="text-xs mt-1 capitalize">{node.type}</div>
                  </div>
                ))}

                {/* Connection Lines */}
                <svg className="absolute inset-0 pointer-events-none">
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
                    </marker>
                  </defs>

                  <line
                    x1="280"
                    y1="130"
                    x2="300"
                    y2="130"
                    stroke="#6b7280"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                  <line
                    x1="400"
                    y1="110"
                    x2="500"
                    y2="80"
                    stroke="#6b7280"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                  <line
                    x1="400"
                    y1="130"
                    x2="500"
                    y2="180"
                    stroke="#6b7280"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                  <line
                    x1="680"
                    y1="80"
                    x2="900"
                    y2="120"
                    stroke="#6b7280"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                  <line
                    x1="680"
                    y1="180"
                    x2="900"
                    y2="140"
                    stroke="#6b7280"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                </svg>
              </div>
            </div>

            {/* Properties Panel */}
            <div className="w-80 border-l border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Properties</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Node Type
                  </label>
                  <select className="w-full p-2 border border-gray-300 rounded-lg">
                    <option>Trigger</option>
                    <option>Condition</option>
                    <option>Action</option>
                    <option>End</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    defaultValue="Customer Message"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    className="w-full p-2 border border-gray-300 rounded-lg h-24"
                    defaultValue="Triggered when a new message is received"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Conditions
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm">Message contains keywords</span>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm">Customer is returning</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Workflows</h1>
          <p className="text-gray-600">
            Automate your customer interactions with intelligent workflows
          </p>
        </div>
        <button
          onClick={() => setIsBuilding(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Workflow
        </button>
      </div>

      {/* Workflow Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Workflows
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">12</p>
            </div>
            <Workflow className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Active Workflows
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">8</p>
            </div>
            <Play className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Executions Today
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">1,247</p>
            </div>
            <Zap className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">96.3%</p>
            </div>
            <CheckCircle className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Workflow Templates */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Quick Start Templates
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200 cursor-pointer hover:shadow-md transition-shadow">
            <MessageSquare className="h-8 w-8 text-blue-600 mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">
              Customer Support
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Handle common support inquiries automatically
            </p>
            <div className="flex items-center text-sm text-blue-600">
              <span>Use Template</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200 cursor-pointer hover:shadow-md transition-shadow">
            <Target className="h-8 w-8 text-green-600 mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">
              Lead Qualification
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Qualify and route leads to the right team
            </p>
            <div className="flex items-center text-sm text-green-600">
              <span>Use Template</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200 cursor-pointer hover:shadow-md transition-shadow">
            <Clock className="h-8 w-8 text-purple-600 mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">
              Appointment Booking
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Schedule meetings and send confirmations
            </p>
            <div className="flex items-center text-sm text-purple-600">
              <span>Use Template</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </div>
          </div>
        </div>
      </div>

      {/* Workflows List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Your Workflows
            </h2>
            <div className="flex items-center space-x-4">
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </button>
            </div>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {workflows.map((workflow) => (
            <div
              key={workflow.id}
              className="p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {workflow.name}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(workflow.status)}`}
                    >
                      {workflow.status === "active" && (
                        <Play className="h-3 w-3 mr-1" />
                      )}
                      {workflow.status === "paused" && (
                        <Pause className="h-3 w-3 mr-1" />
                      )}
                      {workflow.status === "draft" && (
                        <Edit className="h-3 w-3 mr-1" />
                      )}
                      {workflow.status}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(workflow.category)}`}
                    >
                      {workflow.category}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{workflow.description}</p>
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <span>
                      {workflow.triggers} triggers • {workflow.actions} actions
                    </span>
                    <span>Last modified {workflow.lastModified}</span>
                    <span>{workflow.executions} executions</span>
                    <span>{workflow.successRate}% success rate</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-6">
                  <button
                    onClick={() => setIsBuilding(true)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                    <Copy className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                    <Settings className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkflowBuilder;
