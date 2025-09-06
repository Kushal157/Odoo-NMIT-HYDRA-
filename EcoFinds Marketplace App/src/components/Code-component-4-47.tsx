import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useApp, Product } from '../App'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Progress } from './ui/progress'
import { ImageWithFallback } from './figma/ImageWithFallback'
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  MessageCircle, 
  ShoppingCart,
  MapPin,
  Calendar,
  Eye,
  Leaf,
  Award,
  Star,
  Shield,
  Recycle,
  TreePine,
  Droplets
} from 'lucide-react'
import { projectId, publicAnonKey } from '../utils/supabase/info'

interface Seller {
  id: string
  name: string
  ecoPoints: number
  badges: string[]
}

export const ProductDetail = () => {
  const { 
    selectedProduct, 
    setCurrentView, 
    cart, 
    setCart, 
    accessToken,
    user 
  } = useApp()
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [seller, setSeller] = useState<Seller | null>(null)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (selectedProduct) {
      fetchProductDetails()
    }
  }, [selectedProduct])

  const fetchProductDetails = async () => {
    if (!selectedProduct) return
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d588a8d5/products/${selectedProduct.id}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      )
      
      if (response.ok) {
        const { seller: sellerData } = await response.json()
        setSeller(sellerData)
      }
    } catch (error) {
      console.log('Error fetching product details:', error)
    }
  }

  const addToCart = () => {
    if (!selectedProduct) return
    
    const existingItem = cart.find(item => item.product.id === selectedProduct.id)
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.product.id === selectedProduct.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, { product: selectedProduct, quantity: 1 }])
    }
  }

  const toggleWishlist = async () => {
    if (!selectedProduct || !accessToken) return
    
    setLoading(true)
    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-d588a8d5/wishlist/${selectedProduct.id}`
      const method = isWishlisted ? 'DELETE' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      
      if (response.ok) {
        setIsWishlisted(!isWishlisted)
      }
    } catch (error) {
      console.log('Error toggling wishlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const getEcoScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-orange-600 dark:text-orange-400'
  }

  const getEcoScoreGradient = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-600'
    if (score >= 60) return 'from-yellow-500 to-orange-500'
    return 'from-orange-500 to-red-500'
  }

  const calculateCO2Savings = (price: number, ecoScore: number) => {
    // Simple calculation: higher eco score and price means more CO2 saved
    return Math.round((price * ecoScore) / 100 * 0.5)
  }

  if (!selectedProduct) {
    return (
      <div className="pt-16 md:ml-64 min-h-screen flex items-center justify-center">
        <Button onClick={() => setCurrentView('feed')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Feed
        </Button>
      </div>
    )
  }

  const images = selectedProduct.images?.length 
    ? selectedProduct.images 
    : [`https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=800&fit=crop`]

  return (
    <div className="pt-16 md:ml-64 pb-20 md:pb-8 min-h-screen">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => setCurrentView('feed')}
            className="hover:bg-emerald-500/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Feed
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/30 dark:border-gray-700/30">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full"
              >
                <ImageWithFallback
                  src={images[currentImageIndex]}
                  alt={selectedProduct.title}
                  className="w-full h-full object-cover cursor-zoom-in"
                />
              </motion.div>
              
              {/* Image Navigation */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentImageIndex
                          ? 'bg-white shadow-lg scale-125'
                          : 'bg-white/60 hover:bg-white/80'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.slice(0, 4).map((image, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                      index === currentImageIndex
                        ? 'border-emerald-500 shadow-lg'
                        : 'border-white/30 dark:border-gray-700/30 hover:border-emerald-400'
                    }`}
                  >
                    <ImageWithFallback
                      src={image}
                      alt={`${selectedProduct.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Title and Price */}
            <div>
              <h1 className="text-3xl font-bold mb-2">{selectedProduct.title}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                  ${selectedProduct.price}
                </span>
                <Badge variant="outline" className="px-3 py-1">
                  {selectedProduct.condition}
                </Badge>
              </div>
            </div>

            {/* EcoScore Gauge */}
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/30 dark:border-gray-700/30">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Leaf className="w-5 h-5 text-emerald-500" />
                  <span>EcoScore</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-2xl font-bold ${getEcoScoreColor(selectedProduct.ecoScore || 0)}`}>
                        {selectedProduct.ecoScore || 0}/100
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Sustainability Score
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedProduct.ecoScore || 0}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={`h-3 rounded-full bg-gradient-to-r ${getEcoScoreGradient(selectedProduct.ecoScore || 0)}`}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="space-y-1">
                      <TreePine className="w-5 h-5 text-green-500 mx-auto" />
                      <div className="text-sm font-medium">
                        {calculateCO2Savings(selectedProduct.price, selectedProduct.ecoScore || 0)}kg
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">CO₂ Saved</div>
                    </div>
                    <div className="space-y-1">
                      <Recycle className="w-5 h-5 text-blue-500 mx-auto" />
                      <div className="text-sm font-medium">
                        {selectedProduct.material || 'Mixed'}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Material</div>
                    </div>
                    <div className="space-y-1">
                      <Droplets className="w-5 h-5 text-cyan-500 mx-auto" />
                      <div className="text-sm font-medium">
                        {Math.round((selectedProduct.ecoScore || 0) / 10)}L
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Water Saved</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Description</h3>
              <p className="text-gray-700 dark:text-gray-300">
                {selectedProduct.description}
              </p>
            </div>

            {/* Seller Info */}
            {seller && (
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/30 dark:border-gray-700/30">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-emerald-500 text-white">
                        {seller.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold">{seller.name}</h4>
                        {seller.badges?.length > 0 && (
                          <Award className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Leaf className="w-4 h-4 text-emerald-500" />
                          <span>{seller.ecoPoints} Eco Points</span>
                        </div>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:bg-emerald-500/10"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex space-x-3">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1"
                >
                  <Button
                    onClick={addToCart}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-emerald-500/25"
                    size="lg"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </Button>
                </motion.div>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleWishlist}
                  disabled={loading}
                  className={`p-3 rounded-lg border transition-all duration-300 ${
                    isWishlisted
                      ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                      : 'bg-white/70 border-white/30 hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:bg-gray-800/70 dark:border-gray-700/30'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-3 rounded-lg bg-white/70 dark:bg-gray-800/70 border border-white/30 dark:border-gray-700/30 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-300"
                >
                  <Share2 className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Product Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>Listed {new Date(selectedProduct.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                    <Eye className="w-4 h-4" />
                    <span>{selectedProduct.views || 0} views</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {selectedProduct.location && (
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedProduct.location}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                    <Shield className="w-4 h-4" />
                    <span>EcoFinds Protected</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}