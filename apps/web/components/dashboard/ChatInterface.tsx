"use client";
import React, { useState } from "react";
import {
  MessageSquare,
  Search,
  Filter,
  MoreVertical,
  Phone,
  Mail,
  Globe,
  Send,
  Paperclip,
  Bot,
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import usePresenseSocket from "../../hooks/sockets/usePresenceSocket";
import useChatSocket from "@/hooks/sockets/useChatSocket";

const ChatInterface: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<number>(0);
  const [inputMessage, setInputMessage] = useState<string>("");
  const { chatList } = usePresenseSocket();




  console.log('chat_list', chatList);

  const { messages, sendEmailMessage, isConnected } = useChatSocket(selectedConversation);
  console.log('messages', messages)



  const handleSelectConversation = (id:number)=>{
    console.log('conversation', id);
    setSelectedConversation(id)
  }



  const handleSendMessage =  async ()=>{
    if (inputMessage?.trim()===null) return
    console.log('sendMessage', )
      await sendEmailMessage({
      subject: "Test Email",
      body: "Hello World",
      to: "user@example.com",
      from: "saberas367@gmail.com",
      text: inputMessage,

    })
  }



  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "whatsapp":
        return <MessageSquare className="h-4 w-4 text-green-600" />;
      case "email":
        return <Mail className="h-4 w-4 text-blue-600" />;
      case "website":
        return <Globe className="h-4 w-4 text-purple-600" />;
      case "social":
        return <MessageSquare className="h-4 w-4 text-pink-600" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800";
      case "escalated":
        return "bg-orange-100 text-orange-800";
      case "active":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8 ">
      <div
        className="bg-white rounded-lg shadow-sm border overflow-hidden"
        style={{ height: "calc(100vh - 200px)" }}
      >
        <div className="flex h-full">
          {/* Conversation List */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Conversations
                </h2>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                    <Filter className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
              {chatList?.map((conv, index) => (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedConversation === index
                      ? "bg-blue-50 border-blue-200"
                      : ""
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                          {/*{conv.avatar}*/}
                        </span>
                      </div>
                      <div className="absolute -bottom-1 -right-1">
                        {getChannelIcon(conv.last_message.channel)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {conv.contact?.name}
                        </p>
                        <div className="flex items-center space-x-1">
                          {/*{conv.rating && (*/}
                          {/*  <div className="flex items-center">*/}
                          {/*    <Star className="h-3 w-3 text-yellow-400 fill-current" />*/}
                          {/*    <span className="text-xs text-gray-500 ml-1">*/}
                          {/*      {conv.rating}*/}
                          {/*    </span>*/}
                          {/*  </div>*/}
                          {/*)}*/}
                          <span className="text-xs text-gray-500">
                            {conv.last_message.created_at}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 truncate mb-2">
                        {conv.last_message.text}
                      </p>
                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(conv.last_message.status)}`}
                        >
                          {conv.last_message.status === "resolved" && (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          )}
                          {conv.last_message.status === "escalated" && (
                            <AlertTriangle className="h-3 w-3 mr-1" />
                          )}
                          {conv.last_message.status === "active" && (
                            <Clock className="h-3 w-3 mr-1" />
                          )}
                          {conv.last_message.status}
                        </span>
                        {/*{conv.unread > 0 && (*/}
                        {/*  <span className="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full">*/}
                        {/*    {conv.unread}*/}
                        {/*  </span>*/}
                        {/*)}*/}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-medium">
                      {/*{conversations[selectedConversation].avatar}*/}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {/*{conversations[selectedConversation].name}*/}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {/*{getChannelIcon(*/}
                      {/*  conversations[selectedConversation].channel,*/}
                      {/*)}*/}
                      <span className="text-sm text-gray-500 capitalize">
                        {/*{conversations[selectedConversation].channel}*/}
                      </span>
                      {/*<span*/}
                      {/*  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(conversations[selectedConversation].status)}`}*/}
                      {/*>*/}
                      {/*  {conversations[selectedConversation].status}*/}
                      {/*</span>*/}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                    <Phone className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.direction === "in" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${msg.direction === "in" ? "flex-row-reverse space-x-reverse" : ""}`}
                  >
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        msg.service_type === "ai" ? "bg-blue-100" : "bg-gray-100"
                      }`}
                    >
                      {msg.service_type === "ai" ? (
                        <Bot className="h-4 w-4 text-blue-600" />
                      ) : (
                        <User className="h-4 w-4 text-gray-600" />
                      )}
                    </div>
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        msg.direction === "in"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {msg.text}
                      </p>
                      <p
                        className={`text-xs mt-1 ${msg.direction === "in" ? "text-blue-100" : "text-gray-500"}`}
                      >
                        {msg.created_at}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <Paperclip className="h-5 w-5" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    // value={messageInput}
                    // onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                    onClick={handleSendMessage}
                    // disabled={!isConnected}
                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors">
                  <Send className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                💡 AI is actively handling this conversation. You can take over
                anytime.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
