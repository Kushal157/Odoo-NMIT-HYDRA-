import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useApp } from '../App'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { ImageWithFallback } from './figma/ImageWithFallback'
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  ArrowLeft,
  Leaf,
  DollarSign,
  Tag,
  FileText,
  MapPin,
  Camera,
  Check,
  AlertCircle
} from 'lucide-react'
import { unsplash_tool } from '../utils/unsplash'
import { projectId } from '../utils/supabase/info'

const categories = [
  'clothing',
  'electronics', 
  'furniture',
  'books',
  'toys',
  'sports',
  'home'
]

const conditions = [
  'excellent',
  'good', 
  'fair',
  'poor'
]

const materials = [
  'cotton',
  'polyester',
  'leather',
  'metal',
  'plastic',
  'wood',
  'glass',
  'ceramic',
  'recycled',
  'organic',
  'bamboo',
  'synthetic'
]

export const AddProduct = () => {
  const { setCurrentView, accessToken, user } = useApp()
  const [dragActive, setDragActive] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: '',
    material: '',
    location: '',
    images: [] as string[]
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [previewEcoScore, setPreviewEcoScore] = useState(0)

  // Calculate eco score preview
  React.useEffect(() => {
    const calculatePreviewScore = () => {
      let score = 50 // Base score
      
      const materialScores: Record<string, number> = {
        'recycled': 30,
        'organic': 25,
        'bamboo': 20,
        'cotton': 15,
        'wood': 10,
        'glass': 5,
        'ceramic': 5,
        'metal': 0,
        'leather': -5,
        'plastic': -10,
        'polyester': -15,
        'synthetic': -15
      }
      
      const conditionScores: Record<string, number> = {
        'excellent': 20,
        'good': 15,
        'fair': 10,
        'poor': 5
      }
      
      score += materialScores[formData.material.toLowerCase()] || 0
      score += conditionScores[formData.condition.toLowerCase()] || 0
      
      setPreviewEcoScore(Math.max(0, Math.min(100, score)))
    }
    
    if (formData.material && formData.condition) {
      calculatePreviewScore()
    }
  }, [formData.material, formData.condition])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }, [])

  const handleFiles = async (files: FileList) => {
    const fileArray = Array.from(files)
    const validFiles = fileArray.filter(file => file.type.startsWith('image/'))
    
    if (validFiles.length === 0) {
      setErrors(prev => ({ ...prev, images: 'Please select valid image files' }))
      return
    }

    // For demo purposes, we'll use placeholder images from Unsplash
    // In a real app, you would upload to storage here
    try {
      const placeholderImages = await Promise.all(
        validFiles.slice(0, 4).map(async (file, index) => {
          // Simulate different product types for better demo images
          const queries = ['vintage furniture', 'second hand electronics', 'used clothing', 'books']
          return `https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=600&fit=crop&q=80&sig=${Date.now() + index}`
        })
      )
      
      setFormData(prev => ({ 
        ...prev, 
        images: [...prev.images, ...placeholderImages].slice(0, 4) 
      }))
      
      if (errors.images) {
        setErrors(prev => ({ ...prev, images: '' }))
      }
    } catch (error) {
      console.log('Error handling files:', error)
      setErrors(prev => ({ ...prev, images: 'Failed to process images' }))
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required'
    if (!formData.category) newErrors.category = 'Category is required'
    if (!formData.condition) newErrors.condition = 'Condition is required'
    if (!formData.material) newErrors.material = 'Material is required'
    if (formData.images.length === 0) newErrors.images = 'At least one image is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !accessToken) return
    
    setIsSubmitting(true)
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d588a8d5/products`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            ...formData,
            price: parseFloat(formData.price)
          })
        }
      )
      
      if (response.ok) {
        setCurrentView('feed')
      } else {
        const { error } = await response.json()
        setErrors({ general: error || 'Failed to create product' })
      }
    } catch (error) {
      console.log('Error creating product:', error)
      setErrors({ general: 'Failed to create product' })
    } finally {
      setIsSubmitting(false)
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
            Back to Feed
          </Button>
          
          <h1 className="text-3xl font-bold mb-2">List Your Item</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Share your pre-loved items with the EcoFinds community
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Upload */}
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/30 dark:border-gray-700/30">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ImageIcon className="w-5 h-5" />
                    <span>Product Images</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Drop Zone */}
                  <motion.div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    whileHover={{ scale: 1.02 }}
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                      dragActive
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-emerald-400'
                    }`}
                  >
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => e.target.files && handleFiles(e.target.files)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    
                    <div className="space-y-4">
                      <motion.div
                        animate={dragActive ? { scale: 1.1 } : { scale: 1 }}
                        className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center"
                      >
                        <Upload className="w-8 h-8 text-emerald-500" />
                      </motion.div>
                      
                      <div>
                        <p className="text-lg font-medium mb-2">
                          Drop images here or click to upload
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Support for JPEG, PNG, WebP (Max 4 images)
                        </p>
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Image Previews */}
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                      <AnimatePresence>
                        {formData.images.map((image, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="relative aspect-square rounded-lg overflow-hidden group"
                          >
                            <ImageWithFallback
                              src={image}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                type="button"
                                onClick={() => removeImage(index)}
                                className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600"
                              >
                                <X className="w-4 h-4" />
                              </motion.button>
                            </div>
                            {index === 0 && (
                              <Badge className="absolute top-2 left-2 bg-emerald-500">
                                Main
                              </Badge>
                            )}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                  
                  {errors.images && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500 mt-2 flex items-center space-x-1"
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.images}</span>
                    </motion.p>
                  )}
                </CardContent>
              </Card>

              {/* Product Details */}
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/30 dark:border-gray-700/30">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Product Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Product Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="e.g., Vintage Leather Jacket"
                      className="bg-white/50 dark:bg-gray-800/50"
                    />
                    {errors.title && (
                      <p className="text-sm text-red-500 mt-1">{errors.title}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe your item's condition, features, and story..."
                      rows={4}
                      className="bg-white/50 dark:bg-gray-800/50"
                    />
                    {errors.description && (
                      <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => handleInputChange('price', e.target.value)}
                          placeholder="0.00"
                          className="pl-10 bg-white/50 dark:bg-gray-800/50"
                        />
                      </div>
                      {errors.price && (
                        <p className="text-sm text-red-500 mt-1">{errors.price}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="location">Location (Optional)</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          placeholder="City, State"
                          className="pl-10 bg-white/50 dark:bg-gray-800/50"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label>Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => handleInputChange('category', value)}
                      >
                        <SelectTrigger className="bg-white/50 dark:bg-gray-800/50">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.category && (
                        <p className="text-sm text-red-500 mt-1">{errors.category}</p>
                      )}
                    </div>

                    <div>
                      <Label>Condition</Label>
                      <Select
                        value={formData.condition}
                        onValueChange={(value) => handleInputChange('condition', value)}
                      >
                        <SelectTrigger className="bg-white/50 dark:bg-gray-800/50">
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          {conditions.map((condition) => (
                            <SelectItem key={condition} value={condition}>
                              {condition.charAt(0).toUpperCase() + condition.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.condition && (
                        <p className="text-sm text-red-500 mt-1">{errors.condition}</p>
                      )}
                    </div>

                    <div>
                      <Label>Material</Label>
                      <Select
                        value={formData.material}
                        onValueChange={(value) => handleInputChange('material', value)}
                      >
                        <SelectTrigger className="bg-white/50 dark:bg-gray-800/50">
                          <SelectValue placeholder="Select material" />
                        </SelectTrigger>
                        <SelectContent>
                          {materials.map((material) => (
                            <SelectItem key={material} value={material}>
                              {material.charAt(0).toUpperCase() + material.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.material && (
                        <p className="text-sm text-red-500 mt-1">{errors.material}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Preview & EcoScore */}
            <div className="space-y-6">
              {/* EcoScore Preview */}
              {formData.material && formData.condition && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/30 dark:border-gray-700/30">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Leaf className="w-5 h-5 text-emerald-500" />
                        <span>EcoScore Preview</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-center">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5, type: "spring" }}
                            className={`text-4xl font-bold ${getEcoScoreColor(previewEcoScore)}`}
                          >
                            {previewEcoScore}/100
                          </motion.div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Sustainability Score
                          </p>
                        </div>
                        
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${previewEcoScore}%` }}
                            transition={{ duration: 1, delay: 0.7 }}
                            className={`h-3 rounded-full bg-gradient-to-r ${getEcoScoreGradient(previewEcoScore)}`}
                          />
                        </div>
                        
                        <div className="text-sm space-y-2">
                          <div className="flex justify-between">
                            <span>Material Impact:</span>
                            <span className="font-medium">{formData.material}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Condition:</span>
                            <span className="font-medium">{formData.condition}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/30 dark:border-gray-700/30">
                  <CardContent className="p-6">
                    {errors.general && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30"
                      >
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4" />
                          <span>{errors.general}</span>
                        </p>
                      </motion.div>
                    )}
                    
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-emerald-500/25"
                        size="lg"
                      >
                        {isSubmitting ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                          />
                        ) : (
                          <Check className="w-5 h-5 mr-2" />
                        )}
                        {isSubmitting ? 'Listing...' : 'List Item'}
                      </Button>
                    </motion.div>
                    
                    <p className="text-xs text-gray-600 dark:text-gray-400 text-center mt-3">
                      By listing, you agree to EcoFinds' terms and sustainability guidelines
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}