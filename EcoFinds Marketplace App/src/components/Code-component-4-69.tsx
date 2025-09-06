import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useApp } from '../App'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Badge } from './ui/badge'
import { 
  MessageCircle, 
  Send, 
  ArrowLeft,
  Online,
  Search,
  MoreVertical,
  Paperclip,
  Smile,
  Phone,
  Video
} from 'lucide-react'
import { projectId } from '../utils/supabase/info'

interface ChatMessage {
  id: string
  senderId: string
  recipientId: string
  message: string
  timestamp: string
  read: boolean
  productId?: string
}

interface ChatUser {
  id: string
  name: string
  lastMessage?: string
  lastMessageTime?: string
  unreadCount: number
  online: boolean
}

// Mock data for demo
const mockUsers: ChatUser[] = [
  {
    id: '1',
    name: 'Sarah Wilson',
    lastMessage: 'Is this item still available?',
    lastMessageTime: '2 min ago',
    unreadCount: 2,
    online: true
  },
  {
    id: '2', 
    name: 'Mike Chen',
    lastMessage: 'Thanks for the quick response!',
    lastMessageTime: '1 hour ago',
    unreadCount: 0,
    online: false
  },
  {
    id: '3',
    name: 'Emma Davis',
    lastMessage: 'Could you provide more photos?',
    lastMessageTime: '3 hours ago',
    unreadCount: 1,
    online: true
  }
]

const mockMessages: ChatMessage[] = [
  {
    id: '1',
    senderId: '1',
    recipientId: 'current-user',
    message: 'Hi! I\'m interested in your vintage leather jacket. Is it still available?',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: true
  },
  {
    id: '2',
    senderId: 'current-user',
    recipientId: '1',
    message: 'Yes, it\'s still available! It\'s in excellent condition and barely worn.',
    timestamp: new Date(Date.now() - 3300000).toISOString(),
    read: true
  },
  {
    id: '3',
    senderId: '1',
    recipientId: 'current-user',
    message: 'Perfect! Could you tell me more about the sizing? I\'m usually a medium.',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    read: false
  }
]

export const ChatInterface = () => {
  const { setCurrentView, user, accessToken } = useApp()
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null)
  const [users, setUsers] = useState<ChatUser[]>(mockUsers)
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages)
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || !accessToken) return

    const messageData = {
      recipientId: selectedUser.id,
      message: newMessage.trim(),
      productId: undefined // Would be set if chatting about a specific product
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d588a8d5/chat/message`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify(messageData)
        }
      )

      if (response.ok) {
        const { message } = await response.json()
        setMessages(prev => [...prev, message])
        setNewMessage('')
        
        // Update user list with new last message
        setUsers(prev => prev.map(u => 
          u.id === selectedUser.id 
            ? { ...u, lastMessage: newMessage.trim(), lastMessageTime: 'Just now' }
            : u
        ))
      }
    } catch (error) {
      console.log('Error sending message:', error)
      
      // Fallback for demo - add message locally
      const demoMessage: ChatMessage = {
        id: Date.now().toString(),
        senderId: user?.id || 'current-user',
        recipientId: selectedUser.id,
        message: newMessage.trim(),
        timestamp: new Date().toISOString(),
        read: false
      }
      
      setMessages(prev => [...prev, demoMessage])
      setNewMessage('')
      
      setUsers(prev => prev.map(u => 
        u.id === selectedUser.id 
          ? { ...u, lastMessage: newMessage.trim(), lastMessageTime: 'Just now' }
          : u
      ))
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const currentMessages = selectedUser 
    ? messages.filter(msg => 
        (msg.senderId === selectedUser.id && msg.recipientId === 'current-user') ||
        (msg.senderId === 'current-user' && msg.recipientId === selectedUser.id)
      )
    : []

  return (
    <div className="pt-16 md:ml-64 pb-20 md:pb-8 min-h-screen">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 h-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => setCurrentView('feed')}
            className="mb-4 hover:bg-emerald-500/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Feed
          </Button>
          
          <h1 className="text-3xl font-bold mb-2">Messages</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Chat with buyers and sellers in your community
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-300px)]">
          {/* Chat List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="h-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/30 dark:border-gray-700/30">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5" />
                  <span>Conversations</span>
                </CardTitle>
                
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/50 dark:bg-gray-800/50"
                  />
                </div>
              </CardHeader>
              
              <CardContent className="p-0 flex-1">
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  <AnimatePresence>
                    {filteredUsers.map((chatUser) => (
                      <motion.div
                        key={chatUser.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        whileHover={{ x: 4 }}
                        onClick={() => setSelectedUser(chatUser)}
                        className={`p-4 cursor-pointer transition-all duration-300 ${
                          selectedUser?.id === chatUser.id
                            ? 'bg-emerald-500/20 border-r-2 border-emerald-500'
                            : 'hover:bg-emerald-500/10'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <Avatar className="w-12 h-12">
                              <AvatarFallback className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                                {chatUser.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            {chatUser.online && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-medium truncate">{chatUser.name}</h3>
                              {chatUser.lastMessageTime && (
                                <span className="text-xs text-gray-500">
                                  {chatUser.lastMessageTime}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                {chatUser.lastMessage}
                              </p>
                              {chatUser.unreadCount > 0 && (
                                <Badge className="bg-emerald-500 text-white px-2 py-0 min-w-[20px] h-5 text-xs">
                                  {chatUser.unreadCount}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Chat Area */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            {selectedUser ? (
              <Card className="h-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/30 dark:border-gray-700/30 flex flex-col">
                {/* Chat Header */}
                <CardHeader className="flex-row items-center space-y-0 pb-4">
                  <div className="flex items-center space-x-3 flex-1">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                        {selectedUser.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{selectedUser.name}</h3>
                      <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                        <div className={`w-2 h-2 rounded-full ${selectedUser.online ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <span>{selectedUser.online ? 'Online' : 'Offline'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 p-4 overflow-y-auto max-h-96">
                  <div className="space-y-4">
                    <AnimatePresence>
                      {currentMessages.map((message) => {
                        const isCurrentUser = message.senderId === 'current-user' || message.senderId === user?.id
                        
                        return (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              isCurrentUser
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                            }`}>
                              <p className="text-sm">{message.message}</p>
                              <p className={`text-xs mt-1 ${
                                isCurrentUser
                                  ? 'text-emerald-100'
                                  : 'text-gray-500 dark:text-gray-400'
                              }`}>
                                {new Date(message.timestamp).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                            </div>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                  </div>
                </CardContent>

                {/* Message Input */}
                <div className="p-4 border-t border-white/20 dark:border-gray-700/20">
                  <div className="flex items-center space-x-3">
                    <Button variant="ghost" size="sm">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    
                    <div className="flex-1 relative">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="pr-12 bg-white/50 dark:bg-gray-800/50"
                      />
                      <Button variant="ghost" size="sm" className="absolute right-1 top-1/2 transform -translate-y-1/2">
                        <Smile className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="h-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/30 dark:border-gray-700/30 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <MessageCircle className="w-12 h-12 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Select a conversation</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Choose a conversation from the list to start chatting
                  </p>
                </div>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}