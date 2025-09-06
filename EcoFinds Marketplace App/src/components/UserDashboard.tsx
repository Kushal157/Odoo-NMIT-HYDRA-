import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useApp, Product } from '../App'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { ImageWithFallback } from './figma/ImageWithFallback'
import { 
  User, 
  Heart, 
  Package, 
  TrendingUp, 
  Award, 
  Leaf, 
  Eye, 
  Edit,
  Star,
  Calendar,
  MapPin,
  Settings,
  Trophy,
  Recycle,
  TreePine,
  Droplets
} from 'lucide-react'
import { projectId } from '../utils/supabase/info'

const ecoBadges = [
  { id: 'eco-warrior', name: 'Eco Warrior', icon: '🌱', description: 'Listed 50+ sustainable items', requirement: 50 },
  { id: 'carbon-saver', name: 'Carbon Saver', icon: '🌍', description: 'Saved 100kg CO₂', requirement: 100 },
  { id: 'trusted-seller', name: 'Trusted Seller', icon: '⭐', description: '5-star average rating', requirement: 5 },
  { id: 'recycling-champion', name: 'Recycling Champion', icon: '♻️', description: 'Listed items from all categories', requirement: 7 },
  { id: 'community-hero', name: 'Community Hero', icon: '🤝', description: '100+ transactions completed', requirement: 100 },
  { id: 'green-pioneer', name: 'Green Pioneer', icon: '🏆', description: 'Early adopter badge', requirement: 1 }
]

export const UserDashboard = () => {
  const { user, accessToken, setCurrentView, setSelectedProduct } = useApp()
  const [userProducts, setUserProducts] = useState<Product[]>([])
  const [wishlist, setWishlist] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (user && accessToken) {
      fetchUserData()
    }
  }, [user, accessToken])

  const fetchUserData = async () => {
    try {
      const [productsRes, wishlistRes] = await Promise.all([
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d588a8d5/user/products`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }),
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d588a8d5/wishlist`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        })
      ])

      if (productsRes.ok) {
        const { products } = await productsRes.json()
        setUserProducts(products || [])
      }

      if (wishlistRes.ok) {
        const { products } = await wishlistRes.json()
        setWishlist(products || [])
      }
    } catch (error) {
      console.log('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getUserBadges = () => {
    if (!user) return []
    
    const earnedBadges: typeof ecoBadges = []
    const stats = {
      itemsListed: userProducts.length,
      co2Saved: userProducts.reduce((total, product) => total + (product.ecoScore || 0) * 0.5, 0),
      avgRating: 4.8, // Mock rating
      categoriesUsed: new Set(userProducts.map(p => p.category)).size,
      transactions: Math.floor(userProducts.length * 0.7), // Mock transactions
      isEarlyAdopter: true // Mock early adopter status
    }

    ecoBadges.forEach(badge => {
      let earned = false
      
      switch (badge.id) {
        case 'eco-warrior':
          earned = stats.itemsListed >= badge.requirement
          break
        case 'carbon-saver':
          earned = stats.co2Saved >= badge.requirement
          break
        case 'trusted-seller':
          earned = stats.avgRating >= badge.requirement
          break
        case 'recycling-champion':
          earned = stats.categoriesUsed >= badge.requirement
          break
        case 'community-hero':
          earned = stats.transactions >= badge.requirement
          break
        case 'green-pioneer':
          earned = stats.isEarlyAdopter
          break
      }
      
      if (earned) {
        earnedBadges.push(badge)
      }
    })

    return earnedBadges
  }

  const calculateTotalViews = () => {
    return userProducts.reduce((total, product) => total + (product.views || 0), 0)
  }

  const calculateTotalCO2Saved = () => {
    return Math.round(userProducts.reduce((total, product) => 
      total + (product.ecoScore || 0) * (product.price || 0) / 100 * 0.5, 0
    ))
  }

  if (loading) {
    return (
      <div className="pt-16 md:ml-64 min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="pt-16 md:ml-64 min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <p>Please log in to view your dashboard</p>
        </Card>
      </div>
    )
  }

  const earnedBadges = getUserBadges()

  return (
    <div className="pt-16 md:ml-64 pb-20 md:pb-8 min-h-screen">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 backdrop-blur-sm border-white/30 dark:border-gray-700/30">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <Avatar className="w-24 h-24">
                  <AvatarFallback className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-2xl">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold">{user.name}</h1>
                    <Badge variant="secondary" className="px-3 py-1">
                      <Leaf className="w-4 h-4 mr-1" />
                      {user.ecoPoints} Eco Points
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Member since {new Date(user.joinedAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long' 
                    })}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {earnedBadges.slice(0, 3).map((badge) => (
                      <motion.div
                        key={badge.id}
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center space-x-2 px-3 py-1 rounded-full bg-white/50 dark:bg-gray-800/50 border border-white/30 dark:border-gray-700/30"
                      >
                        <span className="text-lg">{badge.icon}</span>
                        <span className="text-sm font-medium">{badge.name}</span>
                      </motion.div>
                    ))}
                    {earnedBadges.length > 3 && (
                      <Badge variant="outline" className="px-3 py-1">
                        +{earnedBadges.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                <Button variant="outline" className="hover:bg-emerald-500/10">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center space-x-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">My Items</span>
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="flex items-center space-x-2">
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline">Wishlist</span>
            </TabsTrigger>
            <TabsTrigger value="badges" className="flex items-center space-x-2">
              <Award className="w-4 h-4" />
              <span className="hidden sm:inline">Badges</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/30 dark:border-gray-700/30">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <Package className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Items Listed</p>
                      <p className="text-2xl font-bold">{userProducts.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/30 dark:border-gray-700/30">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Eye className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Views</p>
                      <p className="text-2xl font-bold">{calculateTotalViews()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/30 dark:border-gray-700/30">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                      <TreePine className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">CO₂ Saved</p>
                      <p className="text-2xl font-bold">{calculateTotalCO2Saved()}kg</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/30 dark:border-gray-700/30">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Badges Earned</p>
                      <p className="text-2xl font-bold">{earnedBadges.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Activity */}
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/30 dark:border-gray-700/30">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userProducts.slice(0, 3).map((product) => (
                    <motion.div
                      key={product.id}
                      whileHover={{ x: 4 }}
                      className="flex items-center space-x-4 p-3 rounded-lg hover:bg-emerald-500/5 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedProduct(product)
                        setCurrentView('product-detail')
                      }}
                    >
                      <ImageWithFallback
                        src={product.images?.[0] || `https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop`}
                        alt={product.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{product.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Listed {new Date(product.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${product.price}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {product.views || 0} views
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">My Listed Items</h2>
              <Button
                onClick={() => setCurrentView('add-product')}
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                List New Item
              </Button>
            </div>

            {userProducts.length === 0 ? (
              <Card className="text-center p-12">
                <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No items listed yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Start your sustainable selling journey by listing your first item
                </p>
                <Button
                  onClick={() => setCurrentView('add-product')}
                  className="bg-emerald-500 hover:bg-emerald-600"
                >
                  List Your First Item
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {userProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                      onClick={() => {
                        setSelectedProduct(product)
                        setCurrentView('product-detail')
                      }}
                      className="cursor-pointer"
                    >
                      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/30 dark:border-gray-700/30 hover:border-emerald-500/50 transition-all duration-300">
                        <div className="aspect-square relative">
                          <ImageWithFallback
                            src={product.images?.[0] || `https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop`}
                            alt={product.title}
                            className="w-full h-full object-cover rounded-t-lg"
                          />
                          <Badge className="absolute top-2 left-2 bg-emerald-500">
                            {product.ecoScore}/100
                          </Badge>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold line-clamp-1 mb-2">{product.title}</h3>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-lg font-bold text-emerald-600">
                              ${product.price}
                            </span>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <Eye className="w-4 h-4" />
                              <span>{product.views || 0}</span>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {product.condition}
                          </Badge>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>

          <TabsContent value="wishlist" className="space-y-6">
            <h2 className="text-2xl font-bold">My Wishlist</h2>

            {wishlist.length === 0 ? (
              <Card className="text-center p-12">
                <Heart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Browse items and save your favorites for later
                </p>
                <Button
                  onClick={() => setCurrentView('feed')}
                  className="bg-emerald-500 hover:bg-emerald-600"
                >
                  Browse Items
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {wishlist.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                      onClick={() => {
                        setSelectedProduct(product)
                        setCurrentView('product-detail')
                      }}
                      className="cursor-pointer"
                    >
                      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/30 dark:border-gray-700/30 hover:border-emerald-500/50 transition-all duration-300">
                        <div className="aspect-square relative">
                          <ImageWithFallback
                            src={product.images?.[0] || `https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop`}
                            alt={product.title}
                            className="w-full h-full object-cover rounded-t-lg"
                          />
                          <Badge className="absolute top-2 left-2 bg-emerald-500">
                            {product.ecoScore}/100
                          </Badge>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold line-clamp-1 mb-2">{product.title}</h3>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-emerald-600">
                              ${product.price}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {product.condition}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>

          <TabsContent value="badges" className="space-y-6">
            <h2 className="text-2xl font-bold">Eco Badges</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {ecoBadges.map((badge) => {
                const isEarned = earnedBadges.some(earned => earned.id === badge.id)
                
                return (
                  <motion.div
                    key={badge.id}
                    whileHover={{ scale: 1.05 }}
                    className={`relative ${isEarned ? '' : 'opacity-50'}`}
                  >
                    <Card className={`bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/30 dark:border-gray-700/30 ${
                      isEarned ? 'border-emerald-500/50 shadow-emerald-500/20 shadow-lg' : ''
                    }`}>
                      <CardContent className="p-6 text-center">
                        <div className="text-6xl mb-4">{badge.icon}</div>
                        <h3 className="text-lg font-semibold mb-2">{badge.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {badge.description}
                        </p>
                        {isEarned && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center"
                          >
                            <Award className="w-4 h-4" />
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}