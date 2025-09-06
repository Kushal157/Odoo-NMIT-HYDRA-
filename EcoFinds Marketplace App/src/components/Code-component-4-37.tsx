import React from 'react'
import { motion } from 'motion/react'
import { useApp } from '../App'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { 
  Home, 
  Plus, 
  User, 
  ShoppingCart, 
  MessageCircle, 
  Camera, 
  BarChart3,
  Recycle,
  LogOut
} from 'lucide-react'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { projectId, publicAnonKey } from '../utils/supabase/info'

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
)

export const Navigation = () => {
  const { 
    user, 
    setUser, 
    setAccessToken,
    currentView, 
    setCurrentView, 
    cart 
  } = useApp()

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setAccessToken(null)
      setCurrentView('auth')
    } catch (error) {
      console.log('Logout error:', error)
    }
  }

  const navItems = [
    { key: 'feed', icon: Home, label: 'Feed' },
    { key: 'add-product', icon: Plus, label: 'Sell' },
    { key: 'scan', icon: Camera, label: 'Scan' },
    { key: 'cart', icon: ShoppingCart, label: 'Cart', badge: cart.length },
    { key: 'chat', icon: MessageCircle, label: 'Chat' },
    { key: 'impact', icon: BarChart3, label: 'Impact' },
    { key: 'dashboard', icon: User, label: 'Profile' }
  ]

  return (
    <>
      {/* Top Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => setCurrentView('feed')}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Recycle className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                EcoFinds
              </span>
            </motion.div>

            {/* User Info & Logout */}
            <div className="flex items-center space-x-4">
              {user && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center space-x-3"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.name}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {user.ecoPoints} Eco Points
                      </span>
                      {user.badges && user.badges.length > 0 && (
                        <Badge variant="secondary" className="text-xs px-2 py-0">
                          {user.badges.length} badges
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleLogout}
                    className="p-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                  </motion.button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Bottom Navigation (Mobile) */}
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-white/20 dark:border-gray-700/20"
      >
        <div className="grid grid-cols-4 gap-1 p-2">
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.key
            
            return (
              <motion.button
                key={item.key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentView(item.key)}
                className={`relative flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400'
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                  >
                    {item.badge}
                  </motion.div>
                )}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-emerald-500/10 rounded-xl border border-emerald-500/30"
                  />
                )}
              </motion.button>
            )
          })}
        </div>
      </motion.nav>

      {/* Sidebar Navigation (Desktop) */}
      <motion.nav
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
        className="fixed left-0 top-16 bottom-0 z-30 hidden md:flex flex-col w-64 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-r border-white/20 dark:border-gray-700/20"
      >
        <div className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.key
            
            return (
              <motion.button
                key={item.key}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentView(item.key)}
                className={`relative w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto w-6 h-6 bg-red-500 text-white text-sm rounded-full flex items-center justify-center"
                  >
                    {item.badge}
                  </motion.div>
                )}
                {isActive && (
                  <motion.div
                    layoutId="activeSidebarTab"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-r"
                  />
                )}
              </motion.button>
            )
          })}
        </div>
      </motion.nav>
    </>
  )
}