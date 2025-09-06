import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useApp, Product } from '../App'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Card, CardContent } from './ui/card'
import { ImageWithFallback } from './figma/ImageWithFallback'
import { 
  Search, 
  Filter, 
  Heart, 
  Eye, 
  MapPin, 
  Leaf,
  Star,
  TrendingUp
} from 'lucide-react'
import { projectId, publicAnonKey } from '../utils/supabase/info'

const categories = [
  { id: 'all', name: 'All Items', icon: '🌍' },
  { id: 'clothing', name: 'Clothing', icon: '👕' },
  { id: 'electronics', name: 'Electronics', icon: '📱' },
  { id: 'furniture', name: 'Furniture', icon: '🪑' },
  { id: 'books', name: 'Books', icon: '📚' },
  { id: 'toys', name: 'Toys', icon: '🧸' },
  { id: 'sports', name: 'Sports', icon: '⚽' },
  { id: 'home', name: 'Home & Garden', icon: '🏠' }
]

export const ProductFeed = () => {
  const { setCurrentView, setSelectedProduct, accessToken } = useApp()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    filterAndSortProducts()
  }, [products, selectedCategory, searchQuery, sortBy])

  const fetchProducts = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d588a8d5/products`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      )
      
      if (response.ok) {
        const { products } = await response.json()
        setProducts(products || [])
      }
    } catch (error) {
      console.log('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortProducts = () => {
    let filtered = [...products]
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.category?.toLowerCase() === selectedCategory.toLowerCase()
      )
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(product =>
        product.title?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query)
      )
    }
    
    // Sort products
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'eco-score':
        filtered.sort((a, b) => (b.ecoScore || 0) - (a.ecoScore || 0))
        break
      case 'popular':
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0))
        break
    }
    
    setFilteredProducts(filtered)
  }

  const getEcoScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-orange-600 dark:text-orange-400'
  }

  const getEcoScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500/20'
    if (score >= 60) return 'bg-yellow-500/20'
    return 'bg-orange-500/20'
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

  return (
    <div className="pt-16 md:ml-64 pb-20 md:pb-8 min-h-screen">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Discover Sustainable Finds</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Browse eco-friendly second-hand items from our community
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 space-y-4"
        >
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/30 dark:border-gray-700/30"
            />
          </div>

          {/* Category Filters */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'bg-white/50 dark:bg-gray-800/50 hover:bg-emerald-500/10 border border-white/30 dark:border-gray-700/30'
                }`}
              >
                <span>{category.icon}</span>
                <span className="font-medium">{category.name}</span>
              </motion.button>
            ))}
          </div>

          {/* Sort Options */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/30 dark:border-gray-700/30 rounded-lg px-3 py-2 text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="eco-score">Best Eco Score</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
            
            <Badge variant="secondary" className="px-3 py-1">
              {filteredProducts.length} items
            </Badge>
          </div>
        </motion.div>

        {/* Products Grid */}
        <AnimatePresence>
          {filteredProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Leaf className="w-16 h-16 text-emerald-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No items found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Try adjusting your search or filters
              </p>
              <Button
                onClick={() => setCurrentView('add-product')}
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                List Your First Item
              </Button>
            </motion.div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  onClick={() => {
                    setSelectedProduct(product)
                    setCurrentView('product-detail')
                  }}
                  className="cursor-pointer group"
                >
                  <Card className="h-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/30 dark:border-gray-700/30 hover:border-emerald-500/50 transition-all duration-300 overflow-hidden">
                    <div className="relative aspect-square">
                      <ImageWithFallback
                        src={product.images?.[0] || `https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop`}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      
                      {/* EcoScore Badge */}
                      <div className={`absolute top-2 left-2 px-2 py-1 rounded-full ${getEcoScoreBg(product.ecoScore || 0)} backdrop-blur-sm`}>
                        <div className="flex items-center space-x-1">
                          <Leaf className={`w-3 h-3 ${getEcoScoreColor(product.ecoScore || 0)}`} />
                          <span className={`text-xs font-medium ${getEcoScoreColor(product.ecoScore || 0)}`}>
                            {product.ecoScore || 0}
                          </span>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="absolute top-2 right-2 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Heart className="w-4 h-4 text-gray-600 dark:text-gray-400 hover:text-red-500" />
                        </motion.button>
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <div className="mb-2">
                        <h3 className="font-semibold line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {product.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                          {product.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                          ${product.price}
                        </span>
                        
                        <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>{product.views || 0}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge 
                          variant="outline" 
                          className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                        >
                          {product.condition}
                        </Badge>
                        
                        {product.location && (
                          <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                            <MapPin className="w-3 h-3" />
                            <span>{product.location}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}