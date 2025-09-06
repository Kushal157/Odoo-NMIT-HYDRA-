import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useApp, CartItem } from '../App'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { ImageWithFallback } from './figma/ImageWithFallback'
import { 
  ShoppingCart, 
  Minus, 
  Plus, 
  Trash2, 
  ArrowLeft,
  CreditCard,
  Leaf,
  TreePine,
  Sparkles,
  Gift
} from 'lucide-react'

export const CartView = () => {
  const { cart, setCart, setCurrentView, setSelectedProduct } = useApp()

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId)
      return
    }
    
    setCart(cart.map(item =>
      item.product.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ))
  }

  const removeItem = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId))
  }

  const clearCart = () => {
    setCart([])
  }

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0)
  }

  const calculateTotalEcoScore = () => {
    if (cart.length === 0) return 0
    const totalScore = cart.reduce((total, item) => 
      total + ((item.product.ecoScore || 0) * item.quantity), 0
    )
    return Math.round(totalScore / cart.reduce((total, item) => total + item.quantity, 0))
  }

  const calculateCO2Savings = () => {
    return Math.round(cart.reduce((total, item) => 
      total + ((item.product.ecoScore || 0) * item.product.price * item.quantity / 100 * 0.5), 0
    ))
  }

  const subtotal = calculateSubtotal()
  const tax = subtotal * 0.08 // 8% tax
  const shipping = subtotal > 50 ? 0 : 5.99 // Free shipping over $50
  const total = subtotal + tax + shipping

  return (
    <div className="pt-16 md:ml-64 pb-20 md:pb-8 min-h-screen">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => setCurrentView('feed')}
            className="mb-4 hover:bg-emerald-500/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continue Shopping
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Shopping Cart</h1>
              <p className="text-gray-600 dark:text-gray-400">
                {cart.length} {cart.length === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
            
            {cart.length > 0 && (
              <Button
                variant="outline"
                onClick={clearCart}
                className="hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Cart
              </Button>
            )}
          </div>
        </motion.div>

        {cart.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <ShoppingCart className="w-16 h-16 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Discover amazing second-hand finds and start building your sustainable collection
            </p>
            <Button
              onClick={() => setCurrentView('feed')}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
              size="lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Start Shopping
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {cart.map((item: CartItem) => (
                  <motion.div
                    key={item.product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -300 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/30 dark:border-gray-700/30">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          {/* Product Image */}
                          <div 
                            className="w-24 h-24 rounded-lg overflow-hidden cursor-pointer"
                            onClick={() => {
                              setSelectedProduct(item.product)
                              setCurrentView('product-detail')
                            }}
                          >
                            <ImageWithFallback
                              src={item.product.images?.[0] || `https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=200&fit=crop`}
                              alt={item.product.title}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>

                          {/* Product Details */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 
                                  className="font-semibold cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                                  onClick={() => {
                                    setSelectedProduct(item.product)
                                    setCurrentView('product-detail')
                                  }}
                                >
                                  {item.product.title}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                  {item.product.description}
                                </p>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => removeItem(item.product.id)}
                                className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>
                            </div>

                            <div className="flex items-center space-x-3 mb-3">
                              <Badge 
                                variant="outline" 
                                className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                              >
                                <Leaf className="w-3 h-3 mr-1" />
                                {item.product.ecoScore}/100
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {item.product.condition}
                              </Badge>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                  ${item.product.price}
                                </span>
                                {item.quantity > 1 && (
                                  <span className="text-sm text-gray-500">
                                    x{item.quantity} = ${(item.product.price * item.quantity).toFixed(2)}
                                  </span>
                                )}
                              </div>

                              {/* Quantity Controls */}
                              <div className="flex items-center space-x-2">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-colors"
                                >
                                  <Minus className="w-4 h-4" />
                                </motion.button>
                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                  className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-colors"
                                >
                                  <Plus className="w-4 h-4" />
                                </motion.button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              {/* Eco Impact */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-sm border-emerald-500/30">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TreePine className="w-5 h-5 text-emerald-500" />
                      <span>Environmental Impact</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                        {calculateTotalEcoScore()}/100
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Average EcoScore</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-xl font-bold text-green-600">
                          {calculateCO2Savings()}kg
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">CO₂ Saved</p>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-blue-600">
                          {Math.round(calculateTotalEcoScore() / 10)}L
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Water Saved</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Order Summary */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/30 dark:border-gray-700/30">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span>${tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span className={shipping === 0 ? 'text-green-600 dark:text-green-400' : ''}>
                          {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                        </span>
                      </div>
                      {shipping > 0 && (
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Free shipping on orders over $50
                        </p>
                      )}
                    </div>
                    
                    <div className="border-t border-white/30 dark:border-gray-700/30 pt-2">
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-emerald-500/25"
                        size="lg"
                      >
                        <CreditCard className="w-5 h-5 mr-2" />
                        Proceed to Checkout
                      </Button>
                    </motion.div>

                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Gift className="w-4 h-4" />
                      <span>EcoFinds Protected Purchase</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}