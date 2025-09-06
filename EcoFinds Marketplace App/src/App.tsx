import React, { createContext, useContext, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { AuthScreen } from './components/AuthScreen'
import { ProductFeed } from './components/ProductFeed'
import { ProductDetail } from './components/ProductDetail'
import { AddProduct } from './components/AddProduct'
import { UserDashboard } from './components/UserDashboard'
import { CartView } from './components/CartView'
import { ChatInterface } from './components/ChatInterface'
import { CameraScan } from './components/CameraScan'
import { ImpactDashboard } from './components/ImpactDashboard'
import { Navigation } from './components/Navigation'
import { supabase } from './utils/supabase/client'
import { projectId } from './utils/supabase/info'
import { Moon, Sun } from 'lucide-react'

// Types
export interface User {
  id: string
  email: string
  name: string
  ecoPoints: number
  badges: string[]
  joinedAt: string
}

export interface Product {
  id: string
  sellerId: string
  title: string
  description: string
  price: number
  category: string
  condition: string
  material: string
  images: string[]
  ecoScore: number
  createdAt: string
  views: number
  likes: number
  location?: string
}

export interface CartItem {
  product: Product
  quantity: number
}

// Context
interface AppContextType {
  user: User | null
  setUser: (user: User | null) => void
  currentView: string
  setCurrentView: (view: string) => void
  selectedProduct: Product | null
  setSelectedProduct: (product: Product | null) => void
  cart: CartItem[]
  setCart: (cart: CartItem[]) => void
  darkMode: boolean
  toggleDarkMode: () => void
  accessToken: string | null
  setAccessToken: (token: string | null) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState('auth')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [darkMode, setDarkMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on load
  useEffect(() => {
    checkSession()
  }, [])

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (session?.access_token) {
        setAccessToken(session.access_token)
        await fetchUserProfile(session.access_token)
        setCurrentView('feed')
      }
    } catch (error) {
      console.log('Session check failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d588a8d5/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const { profile } = await response.json()
        setUser(profile)
      }
    } catch (error) {
      console.log('Failed to fetch user profile:', error)
    }
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  const contextValue: AppContextType = {
    user,
    setUser,
    currentView,
    setCurrentView,
    selectedProduct,
    setSelectedProduct,
    cart,
    setCart,
    darkMode,
    toggleDarkMode,
    accessToken,
    setAccessToken
  }

  return (
    <AppContext.Provider value={contextValue}>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-500">
        {/* Dark Mode Toggle */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleDarkMode}
          className="fixed top-4 right-4 z-50 p-3 rounded-full bg-white/20 dark:bg-gray-800/20 backdrop-blur-md border border-white/30 dark:border-gray-700/30 shadow-lg"
        >
          <AnimatePresence mode="wait">
            {darkMode ? (
              <motion.div
                key="sun"
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 180, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Sun className="w-5 h-5 text-yellow-500" />
              </motion.div>
            ) : (
              <motion.div
                key="moon"
                initial={{ rotate: 180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -180, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Moon className="w-5 h-5 text-slate-700" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        <AnimatePresence mode="wait">
          {currentView === 'auth' && (
            <motion.div
              key="auth"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <AuthScreen />
            </motion.div>
          )}

          {currentView === 'feed' && (
            <motion.div
              key="feed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Navigation />
              <ProductFeed />
            </motion.div>
          )}

          {currentView === 'product-detail' && (
            <motion.div
              key="product-detail"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <Navigation />
              <ProductDetail />
            </motion.div>
          )}

          {currentView === 'add-product' && (
            <motion.div
              key="add-product"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.4 }}
            >
              <Navigation />
              <AddProduct />
            </motion.div>
          )}

          {currentView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.4 }}
            >
              <Navigation />
              <UserDashboard />
            </motion.div>
          )}

          {currentView === 'cart' && (
            <motion.div
              key="cart"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <Navigation />
              <CartView />
            </motion.div>
          )}

          {currentView === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.4 }}
            >
              <Navigation />
              <ChatInterface />
            </motion.div>
          )}

          {currentView === 'scan' && (
            <motion.div
              key="scan"
              initial={{ opacity: 0, rotateY: 90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: -90 }}
              transition={{ duration: 0.5 }}
            >
              <Navigation />
              <CameraScan />
            </motion.div>
          )}

          {currentView === 'impact' && (
            <motion.div
              key="impact"
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -100 }}
              transition={{ duration: 0.5 }}
            >
              <Navigation />
              <ImpactDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppContext.Provider>
  )
}