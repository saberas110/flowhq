// components/chat/MessageInput.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Mail,
  Send,
  MessageCircle,
  ChevronDown,
  Check,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2,
  Smile,
  Type,
  Code,
  ImageIcon,
  Paperclip,
  Mic,
  AtSign,
  Wand2,
  GripHorizontal,
} from 'lucide-react'
import { sendEmailResolver, sendWhatsAppResolver, TEmailMessageRequest, TSendEmailMessage, TSendMessageParams, TSendMessageRequest, TServiceAccount, TServiceTypeEnum, TWhatsAppMessageRequest } from '@flowhq/shared'
import { useForm } from 'react-hook-form'
import useChatSocket from '@/hooks/sockets/useChatSocket'
import { useChatContext } from '@/contexts/ChatContext'



interface MessageInputProps {
  conversationId: number
}



export function MessageInput({ conversationId }: MessageInputProps) {
  // Channel states
  const [selectedChannel, setSelectedChannel] = useState<TServiceAccount | null>(null)
  const [showChannelDropdown, setShowChannelDropdown] = useState(false)
  const [showCC, setShowCC] = useState(false)
  const [showBCC, setShowBCC] = useState(false)
  const { sendEmailMessage, sendWhatsAppMessage } = useChatSocket(conversationId);
  const [messageText, setMessageText] = useState<string>("")
  const { channels } = useChatContext()


  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    setValue: setValueEmail,
    reset: resetEmail,
    formState: { errors: emailErrors }

  } = useForm({ resolver: sendEmailResolver })


  const {
    register: registerWhatsApp,
    handleSubmit: handleSubmitWhatsApp,
    setValue: setValueWhatsApp,
    reset: resetWhatsApp,
    formState: { errors: errorWhatsApp }

  } = useForm({ resolver: sendWhatsAppResolver })







  const [emailBodyHeight, setEmailBodyHeight] = useState(150)
  const [isResizing, setIsResizing] = useState(false)
  const resizeRef = useRef({
    startY: 0,
    startHeight: 0
  })

  // داده‌های فرضی چنل‌ها


  // Load saved height (only once)
  useEffect(() => {
    const savedHeight = localStorage.getItem('emailBodyHeight')
    if (savedHeight) {
      const height = parseInt(savedHeight)
      if (!isNaN(height) && height >= 100 && height <= 500) {
        setEmailBodyHeight(height)
      }
    }
  }, [])

  // Set selected channel when channels load
  useEffect(() => {
    if (channels.length === 0) return  // Wait for channels
    if (selectedChannel) return  // Already selected

    const savedChannelId = parseInt(localStorage.getItem('lastSelectedChannel') || '0')
    if (savedChannelId) {
      const channel = channels.find(c => c.id === savedChannelId)
      setSelectedChannel(channel || channels[0])
    } else {
      setSelectedChannel(channels[0])
    }
  }, [channels, selectedChannel])


  useEffect(() => {
    if (selectedChannel && 'email' in selectedChannel) {
      setValueEmail('from_email', selectedChannel.email as string)
    }
  }, [selectedChannel, setValueEmail])


  useEffect(() => {
    if (selectedChannel) {
      setValueWhatsApp('service_account_id', selectedChannel.id)
    }
  }, [selectedChannel, setValueWhatsApp])



  // Save height to localStorage when it changes (not during resize)
  useEffect(() => {
    if (!isResizing && emailBodyHeight !== 150) {
      localStorage.setItem('emailBodyHeight', emailBodyHeight.toString())
    }
  }, [emailBodyHeight, isResizing])

  // Handle channel selection
  const handleChannelSelect = (channel: TServiceAccount) => {
    setSelectedChannel(channel)
    setValueEmail('service_account_id', channel.id)
    setValueWhatsApp('service_account_id', channel.id)
    setShowChannelDropdown(false)
    localStorage.setItem('lastSelectedChannel', channel.id.toString())

    // Reset fields when switching
    if (channel.service_type !== TServiceTypeEnum.EMAIL) {
      setShowCC(false)
      setShowBCC(false)

    }
  }

  // Resize handlers - Mouse
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    resizeRef.current = {
      startY: e.clientY,
      startHeight: emailBodyHeight
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return

    const deltaY = e.clientY - resizeRef.current.startY
    const newHeight = resizeRef.current.startHeight - deltaY

    // Clamp between 100px and 500px
    const clampedHeight = Math.max(100, Math.min(500, newHeight))
    setEmailBodyHeight(clampedHeight)
  }

  const handleMouseUp = () => {
    setIsResizing(false)
  }

  // Resize handlers - Touch (for mobile)
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsResizing(true)
    resizeRef.current = {
      startY: e.touches[0].clientY,
      startHeight: emailBodyHeight
    }
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!isResizing || !e.touches[0]) return

    const deltaY = e.touches[0].clientY - resizeRef.current.startY
    const newHeight = resizeRef.current.startHeight - deltaY

    // Clamp between 100px and 500px
    const clampedHeight = Math.max(100, Math.min(500, newHeight))
    setEmailBodyHeight(clampedHeight)
  }

  const handleTouchEnd = () => {
    setIsResizing(false)
  }

  // Add/remove event listeners for resize
  useEffect(() => {
    if (isResizing) {
      // Add cursor style to body
      document.body.style.cursor = 'ns-resize'
      document.body.style.userSelect = 'none'

      // Add event listeners
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleTouchMove)
      document.addEventListener('touchend', handleTouchEnd)

      return () => {
        // Cleanup
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.removeEventListener('touchmove', handleTouchMove)
        document.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [isResizing])

  // Handle send message
  const handleSendEmail = async (data?: TSendMessageRequest) => {
    if (selectedChannel?.service_type === TServiceTypeEnum.EMAIL) {
      await sendEmailMessage(data as TEmailMessageRequest)
      resetEmail({
        html_body: '',
        cc_email: undefined,
        bcc_email: undefined,
      })
      setShowCC(false)
      setShowBCC(false)
    }
  }


  const handleSendWhatsApp = async (data?: TWhatsAppMessageRequest) => {
    if (selectedChannel?.service_type === TServiceTypeEnum.WHATSAPP) {
      console.log('its from handle sendWhatsApp', data);
      
      await sendWhatsAppMessage(data as TWhatsAppMessageRequest)
      resetWhatsApp({
        text: ''
      })
    }
  }







  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (selectedChannel?.service_type === TServiceTypeEnum.EMAIL) {
        // Trigger form submission for email
        handleSubmitEmail(handleSendEmail)()
      } else {
        handleSendEmail()
      }
    }
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (showChannelDropdown && !target.closest('.channel-dropdown-container')) {
        setShowChannelDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showChannelDropdown])

  if (!selectedChannel) return null

  return (
    <div className="border-t border-gray-200">
      {selectedChannel.service_type === TServiceTypeEnum.EMAIL ? (
        // ============================================
        // EMAIL ADVANCED INPUT
        // ============================================
        <form onSubmit={handleSubmitEmail(handleSendEmail)}>
          <input type="hidden" {...registerEmail('from_email')} />
          <input type="hidden" {...registerEmail('service_account_id')} />

          <div className="p-4 space-y-3">
            {/* Channel Selector */}
            <div className="relative channel-dropdown-container">
              <button
                onClick={() => setShowChannelDropdown(!showChannelDropdown)}
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
              >
                <span className="h-4 w-4">{selectedChannel.icon}</span>
                <span className="font-medium">{selectedChannel.display_name}</span>
                {'email' in selectedChannel && (
                  <span className="text-gray-500 text-xs hidden sm:inline">
                    - to: {selectedChannel.email}
                  </span>
                )}
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showChannelDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown */}
              {showChannelDropdown && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-2 max-h-64 overflow-y-auto">
                    {channels.map((channel) => (
                      <button
                        key={channel.id}
                        onClick={() => handleChannelSelect(channel)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors ${selectedChannel.id === channel.id ? 'bg-blue-50' : ''
                          }`}
                      >
                        <span className="h-4 w-4 text-gray-600 flex-shrink-0">{channel.icon}</span>
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {channel.display_name}
                          </p>
                          {'email' in channel && (
                            <p className="text-xs text-gray-500 truncate">{channel.email}</p>
                          )}
                        </div>
                        {selectedChannel.id === channel.id && (
                          <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Subject with CC/BCC */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 w-16 sm:w-20 flex-shrink-0">
                  Subject:
                </label>
                <input
                  {...registerEmail('subject')}
                  placeholder="Add Subject"
                  required
                  className="flex-1 px-3 py-2 text-sm border-0 border-b border-gray-300 focus:border-blue-500 focus:ring-0 bg-transparent outline-none"
                  onKeyDown={handleKeyDown}
                />
                <button
                  onClick={() => setShowCC(!showCC)}
                  className={`text-xs font-medium px-2 py-1 rounded transition-colors flex-shrink-0 ${showCC ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                >
                  CC
                </button>
                <button
                  onClick={() => setShowBCC(!showBCC)}
                  className={`text-xs font-medium px-2 py-1 rounded transition-colors flex-shrink-0 ${showBCC ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                >
                  BCC
                </button>
              </div>

              {/* CC Input */}
              {showCC && (
                <div className="flex items-center gap-2 animate-slideDown">
                  <label className="text-sm font-medium text-gray-700 w-16 sm:w-20 flex-shrink-0">
                    CC:
                  </label>
                  <input
                    {...registerEmail('cc_email')}
                    placeholder="Add CC"
                    className="flex-1 px-3 py-2 text-sm border-0 border-b border-gray-300 focus:border-blue-500 focus:ring-0 bg-transparent outline-none"
                    onKeyDown={handleKeyDown}
                  />
                </div>
              )}

              {/* BCC Input */}
              {showBCC && (
                <div className="flex items-center gap-2 animate-slideDown">
                  <label className="text-sm font-medium text-gray-700 w-16 sm:w-20 flex-shrink-0">
                    BCC:
                  </label>
                  <input
                    {...registerEmail('bcc_email')}
                    placeholder="Add BCC"
                    className="flex-1 px-3 py-2 text-sm border-0 border-b border-gray-300 focus:border-blue-500 focus:ring-0 bg-transparent outline-none"
                    onKeyDown={handleKeyDown}
                  />
                </div>
              )}
            </div>

            {/* Text Editor Toolbar */}
            <div className="flex items-center gap-1 px-2 py-2 border-t border-gray-200 overflow-x-auto scrollbar-thin">
              <select className="text-xs border-0 bg-transparent focus:ring-0 text-gray-700 cursor-pointer">
                <option>Sans Serif</option>
                <option>Arial</option>
                <option>Times New Roman</option>
                <option>Courier New</option>
              </select>
              <div className="h-4 w-px bg-gray-300 mx-1 flex-shrink-0" />
              <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded flex-shrink-0" title="Text Size">
                <Type className="h-4 w-4" />
              </button>
              <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded flex-shrink-0" title="Bold">
                <Bold className="h-4 w-4" />
              </button>
              <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded flex-shrink-0" title="Italic">
                <Italic className="h-4 w-4" />
              </button>
              <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded flex-shrink-0" title="Underline">
                <Underline className="h-4 w-4" />
              </button>
              <div className="h-4 w-px bg-gray-300 mx-1 flex-shrink-0" />
              <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded flex-shrink-0" title="Bullet List">
                <List className="h-4 w-4" />
              </button>
              <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded flex-shrink-0" title="Numbered List">
                <ListOrdered className="h-4 w-4" />
              </button>
              <div className="h-4 w-px bg-gray-300 mx-1 flex-shrink-0" />
              <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded flex-shrink-0" title="Insert Link">
                <Link2 className="h-4 w-4" />
              </button>
              <div className="flex-1 min-w-[20px]" />
              <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded flex-shrink-0" title="Emoji">
                <Smile className="h-4 w-4" />
              </button>
            </div>

            {/* Message Body with Resize */}
            <div className="relative group">
              <textarea
                {...registerEmail('html_body')}
                placeholder="Use '/' for snippets, '$' for variables, ':' for emoji"
                className="w-full px-3 py-2 pt-6 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-shadow outline-none"
                style={{ height: `${emailBodyHeight}px` }}
                onKeyDown={(e) => {
                  // Allow Shift+Enter for new line
                  if (e.key === 'Enter' && e.shiftKey) {
                    return
                  }
                  handleKeyDown(e)
                }}
              />

              {/* Resize Handle */}
              <div
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                className={`absolute top-0 left-0 right-0 h-5 cursor-ns-resize flex items-center justify-center transition-all rounded-t-lg ${isResizing
                  ? 'bg-blue-100'
                  : 'bg-transparent hover:bg-blue-50'
                  }`}
                title="Drag to resize"
              >
                <GripHorizontal className={`h-4 w-4 transition-colors ${isResizing
                  ? 'text-blue-600'
                  : 'text-gray-400 group-hover:text-blue-500'
                  }`} />
              </div>

              {/* Height Indicator */}
              {isResizing && (
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded shadow-lg pointer-events-none z-10">
                  {emailBodyHeight}px
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1 flex-wrap">
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors" title="AI Assist">
                  <Wand2 className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors" title="Text Format">
                  <Type className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors" title="Code Block">
                  <Code className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors" title="Insert Image">
                  <ImageIcon className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors" title="Attach File">
                  <Paperclip className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors" title="Voice Message">
                  <Mic className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors" title="Mention">
                  <AtSign className="h-4 w-4" />
                </button>
              </div>
              <button type='submit'
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
              >
                <Send className="h-4 w-4" />
                <span className="text-sm font-medium">Send</span>
              </button>
            </div>
          </div>



        </form>
      ) : (
        // ============================================
        // SIMPLE INPUT (Telegram/WhatsApp)
        // ============================================
        <form onSubmit={handleSubmitWhatsApp(handleSendWhatsApp)}>
            <input type="hidden" {...registerWhatsApp('service_account_id')}/>
          <div className="p-4">
            {/* Channel Selector */}
            <div className="relative channel-dropdown-container mb-3">
              <button
              type='button'
                onClick={() => setShowChannelDropdown(!showChannelDropdown)}
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
              >
                <span className="h-4 w-4">{selectedChannel.icon}</span>
                <span className="font-medium">{selectedChannel.display_name}</span>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showChannelDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown */}
              {showChannelDropdown && (
                <div className="absolute bottom-full left-0 mb-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-2 max-h-64 overflow-y-auto">
                    {channels.map((channel) => (
                      <button
                      type='button'
                        key={channel.id}
                        onClick={() => handleChannelSelect(channel)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors ${selectedChannel.id === channel.id ? 'bg-blue-50' : ''
                          }`}
                      >
                        <span className="h-4 w-4 text-gray-600 flex-shrink-0">{channel.icon}</span>
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {channel.display_name}
                          </p>
                          {'email' in channel && (
                            <p className="text-xs text-gray-500 truncate">{channel.email}</p>
                          )}
                        </div>
                        {selectedChannel.id === channel.id && (
                          <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Simple Input */}
            <div className="flex items-center gap-2 sm:gap-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 flex-shrink-0 transition-colors">
                <Paperclip className="h-5 w-5" />
              </button>
              <div className="flex-1 relative">
                <input
                {...registerWhatsApp('text')}
                  type="text"
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm outline-none"
                />
              </div>
              <button
              type='submit'
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>

            {/* AI Message */}
            <div className="mt-2 text-xs text-gray-500 hidden sm:block">
              💡 AI is actively handling this conversation. You can take over anytime.
            </div>
          </div>
        </form>
      )}
    </div>
  )
}