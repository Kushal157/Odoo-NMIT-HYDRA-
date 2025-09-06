import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useApp } from '../App'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Leaf, Mail, Lock, User, Eye, EyeOff, Recycle } from 'lucide-react'
import { supabase } from '../utils/supabase/client'
import { projectId, publicAnonKey } from '../utils/supabase/info'

export const AuthScreen = () => {
  const { setUser, setCurrentView, setAccessToken } = useApp()
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    if (!isLogin && !formData.name) {
      newErrors.name = 'Name is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    
    try {
      if (isLogin) {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        })
        
        if (error) {
          setErrors({ general: error.message })
          return
        }
        
        if (data.session?.access_token) {
          setAccessToken(data.session.access_token)
          await fetchUserProfile(data.session.access_token)
          setCurrentView('feed')
        }
      } else {
        // Sign up
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d588a8d5/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            name: formData.name
          })
        })
        
        if (!response.ok) {
          const { error } = await response.json()
          setErrors({ general: error || 'Signup failed' })
          return
        }
        
        // Auto sign in after signup
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        })
        
        if (error) {
          setErrors({ general: 'Account created but login failed. Please try logging in.' })
          setIsLogin(true)
          return
        }
        
        if (data.session?.access_token) {
          setAccessToken(data.session.access_token)
          await fetchUserProfile(data.session.access_token)
          setCurrentView('feed')
        }
      }
    } catch (error) {
      console.log('Auth error:', error)
      setErrors({ general: 'Authentication failed. Please try again.' })
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Enhanced Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Animated gradient orbs */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            rotate: [0, 180, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -150, 0],
            y: [0, 150, 0],
            rotate: [360, 180, 0],
            scale: [1, 0.8, 1]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"
        />
        
        {/* Floating eco elements */}
        <motion.div
          animate={{
            y: [-20, 20, -20],
            rotate: [0, 10, 0]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 right-20 text-4xl opacity-20"
        >
          🌱
        </motion.div>
        <motion.div
          animate={{
            y: [20, -20, 20],
            rotate: [0, -10, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-20 left-20 text-3xl opacity-20"
        >
          ♻️
        </motion.div>
        <motion.div
          animate={{
            y: [-15, 15, -15],
            rotate: [0, 5, 0]
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
          className="absolute top-1/3 right-1/3 text-2xl opacity-20"
        >
          🍃
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Enhanced Logo and Brand */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotateY: 180 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
          className="text-center mb-8"
        >
          <motion.div 
            whileHover={{ scale: 1.1, rotateY: 15 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-2xl mb-4 relative"
          >
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              <Recycle className="w-10 h-10 text-white" />
            </motion.div>
            
            {/* Sparkle effects */}
            <motion.div
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 0.5
              }}
              className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"
            />
            <motion.div
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 1.5
              }}
              className="absolute -bottom-1 -left-1 w-2 h-2 bg-cyan-400 rounded-full"
            />
          </motion.div>
          
          <motion.h1 
            initial={{ letterSpacing: "10px", opacity: 0 }}
            animate={{ letterSpacing: "normal", opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent"
          >
            EcoFinds
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="text-gray-600 dark:text-gray-400 mt-2"
          >
            Sustainable second-hand marketplace
          </motion.p>
        </motion.div>

        {/* Enhanced Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, rotateX: 20 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          whileHover={{ scale: 1.02 }}
        >
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl border-white/30 dark:border-gray-700/30 shadow-2xl relative overflow-hidden">
            {/* Card background effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-50" />
            
            <CardHeader className="text-center relative z-10">
              <motion.div
                key={isLogin}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                  <motion.span
                    animate={isLogin ? { rotate: 0 } : { rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    {isLogin ? '👋' : '🌟'}
                  </motion.span>
                  {isLogin ? 'Welcome Back' : 'Join EcoFinds'}
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isLogin ? 'Sign in to continue your eco journey' : 'Start your sustainable shopping journey'}
                </p>
              </motion.div>
            </CardHeader>
            
            <CardContent className="relative z-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                <AnimatePresence>
                  {!isLogin && (
                    <motion.div
                      initial={{ height: 0, opacity: 0, scale: 0.8 }}
                      animate={{ height: 'auto', opacity: 1, scale: 1 }}
                      exit={{ height: 0, opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.4 }}
                      className="overflow-hidden"
                    >
                      <Label htmlFor="name" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Full Name
                      </Label>
                      <motion.div 
                        className="relative"
                        whileFocus={{ scale: 1.02 }}
                      >
                        <motion.div
                          animate={{
                            scale: focusedField === 'name' ? 1.02 : 1,
                            rotateY: focusedField === 'name' ? 2 : 0
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleInputChange}
                            onFocus={() => setFocusedField('name')}
                            onBlur={() => setFocusedField(null)}
                            className="pl-10 bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all duration-300"
                            placeholder="Enter your full name"
                          />
                        </motion.div>
                      </motion.div>
                      <AnimatePresence>
                        {errors.name && (
                          <motion.p
                            initial={{ opacity: 0, y: -10, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.8 }}
                            className="text-sm text-red-500 mt-1 flex items-center gap-1"
                          >
                            ⚠️ {errors.name}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <motion.div 
                    className="relative"
                    animate={{
                      scale: focusedField === 'email' ? 1.02 : 1,
                      rotateY: focusedField === 'email' ? 2 : 0
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      className="pl-10 bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all duration-300"
                      placeholder="Enter your email"
                    />
                  </motion.div>
                  <AnimatePresence>
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -10, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.8 }}
                        className="text-sm text-red-500 mt-1 flex items-center gap-1"
                      >
                        ⚠️ {errors.email}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Password
                  </Label>
                  <motion.div 
                    className="relative"
                    animate={{
                      scale: focusedField === 'password' ? 1.02 : 1,
                      rotateY: focusedField === 'password' ? 2 : 0
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      className="pl-10 pr-10 bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all duration-300"
                      placeholder="Enter your password"
                    />
                    <motion.button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <motion.div
                        animate={{ rotateY: showPassword ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </motion.div>
                    </motion.button>
                  </motion.div>
                  <AnimatePresence>
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, y: -10, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.8 }}
                        className="text-sm text-red-500 mt-1 flex items-center gap-1"
                      >
                        ⚠️ {errors.password}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <AnimatePresence>
                  {errors.general && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30"
                    >
                      <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                        ❌ {errors.general}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 relative overflow-hidden"
                  >
                    {/* Button background animation */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.6 }}
                      style={{ mixBlendMode: "overlay" }}
                    />
                    
                    <AnimatePresence mode="wait">
                      {isLoading ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="flex items-center justify-center"
                        >
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                          />
                          <span>Processing...</span>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="content"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="flex items-center justify-center"
                        >
                          <motion.div
                            animate={{ rotateY: [0, 360] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          >
                            <Leaf className="w-5 h-5 mr-2" />
                          </motion.div>
                          {isLogin ? 'Sign In' : 'Join EcoFinds'}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
              </form>

              <div className="mt-6 text-center">
                <motion.button
                  onClick={() => {
                    setIsLogin(!isLogin)
                    setErrors({})
                    setFormData({ email: '', password: '', name: '' })
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors relative"
                >
                  <motion.span
                    key={isLogin}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                  </motion.span>
                  
                  {/* Underline animation */}
                  <motion.div
                    className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500"
                    initial={{ width: "0%" }}
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}