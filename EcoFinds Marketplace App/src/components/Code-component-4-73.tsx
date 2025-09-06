import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useApp } from '../App'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { 
  Camera, 
  ArrowLeft, 
  Scan, 
  Upload, 
  Zap,
  Leaf,
  Ruler,
  Package,
  DollarSign,
  TreePine,
  Droplets,
  Recycle,
  CheckCircle
} from 'lucide-react'

interface ScanResult {
  itemType: string
  material: string
  condition: string
  dimensions: {
    width: number
    height: number
    depth: number
  }
  estimatedPrice: number
  ecoScore: number
  co2Savings: number
  confidence: number
}

const mockScanResults: ScanResult[] = [
  {
    itemType: 'Vintage Leather Jacket',
    material: 'Genuine Leather',
    condition: 'Good',
    dimensions: { width: 55, height: 70, depth: 5 },
    estimatedPrice: 89.99,
    ecoScore: 75,
    co2Savings: 12.5,
    confidence: 92
  },
  {
    itemType: 'Wooden Coffee Table',
    material: 'Oak Wood',
    condition: 'Excellent',
    dimensions: { width: 120, height: 45, depth: 60 },
    estimatedPrice: 245.00,
    ecoScore: 88,
    co2Savings: 35.2,
    confidence: 89
  },
  {
    itemType: 'Electronics - Smartphone',
    material: 'Aluminum/Glass',
    condition: 'Fair',
    dimensions: { width: 7, height: 15, depth: 1 },
    estimatedPrice: 156.50,
    ecoScore: 65,
    co2Savings: 8.9,
    confidence: 87
  }
]

export const CameraScan = () => {
  const { setCurrentView } = useApp()
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const startScan = () => {
    setIsScanning(true)
    setScanProgress(0)
    setScanResult(null)
    
    // Simulate scanning progress
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsScanning(false)
          // Show random result for demo
          setScanResult(mockScanResults[Math.floor(Math.random() * mockScanResults.length)])
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 200)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
        // Auto-start scanning after image selection
        setTimeout(startScan, 1000)
      }
      reader.readAsDataURL(file)
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

  const createListing = () => {
    // In a real app, this would pre-fill the AddProduct form with scan results
    setCurrentView('add-product')
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
          
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">AI Scan & Estimate</h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Use our AI-powered scanner to instantly identify items, estimate their value, 
              and calculate their environmental impact
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Camera/Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/30 dark:border-gray-700/30">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="w-5 h-5" />
                  <span>Scan Your Item</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Camera Preview/Upload Area */}
                  <div className="aspect-square rounded-lg bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center relative overflow-hidden">
                    {selectedImage ? (
                      <div className="w-full h-full relative">
                        <img
                          src={selectedImage}
                          alt="Scanned item"
                          className="w-full h-full object-cover"
                        />
                        {isScanning && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <motion.div
                              animate={{ 
                                scale: [1, 1.2, 1],
                                rotate: [0, 180, 360]
                              }}
                              transition={{ 
                                duration: 2, 
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                              className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full"
                            />
                          </div>
                        )}
                        {scanResult && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute inset-0 bg-black/30 flex items-center justify-center"
                          >
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center space-x-2">
                              <CheckCircle className="w-6 h-6 text-green-500" />
                              <span className="font-medium">Scan Complete!</span>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center">
                        <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                          Position your item in the frame
                        </p>
                        <p className="text-sm text-gray-500">
                          Make sure the item is well-lit and clearly visible
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Scanning Progress */}
                  {isScanning && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Analyzing...</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {Math.round(scanProgress)}%
                        </span>
                      </div>
                      <Progress value={scanProgress} className="h-2" />
                      <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <div className={scanProgress > 20 ? 'text-emerald-600 dark:text-emerald-400' : ''}>
                          ✓ Detecting object
                        </div>
                        <div className={scanProgress > 60 ? 'text-emerald-600 dark:text-emerald-400' : ''}>
                          ✓ Analyzing material
                        </div>
                        <div className={scanProgress > 90 ? 'text-emerald-600 dark:text-emerald-400' : ''}>
                          ✓ Calculating value
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isScanning}
                        variant="outline"
                        className="w-full hover:bg-emerald-500/10"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Photo
                      </Button>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={selectedImage ? startScan : () => fileInputRef.current?.click()}
                        disabled={isScanning}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                      >
                        {selectedImage ? (
                          <>
                            <Scan className="w-4 h-4 mr-2" />
                            {isScanning ? 'Scanning...' : 'Scan Item'}
                          </>
                        ) : (
                          <>
                            <Camera className="w-4 h-4 mr-2" />
                            Take Photo
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <AnimatePresence mode="wait">
              {scanResult ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Item Details */}
                  <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/30 dark:border-gray-700/30">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Scan Results</span>
                        <Badge 
                          variant="outline" 
                          className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                        >
                          {scanResult.confidence}% Confidence
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{scanResult.itemType}</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Material:</span>
                            <span className="ml-2 font-medium">{scanResult.material}</span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Condition:</span>
                            <span className="ml-2 font-medium">{scanResult.condition}</span>
                          </div>
                        </div>
                      </div>

                      {/* Dimensions */}
                      <div className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <Ruler className="w-5 h-5 text-gray-500" />
                        <div className="text-sm">
                          <span className="font-medium">Dimensions:</span>
                          <span className="ml-2">
                            {scanResult.dimensions.width}cm × {scanResult.dimensions.height}cm × {scanResult.dimensions.depth}cm
                          </span>
                        </div>
                      </div>

                      {/* Price Estimate */}
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-lg border border-emerald-500/20">
                        <div className="flex items-center space-x-3">
                          <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Estimated Value</p>
                            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                              ${scanResult.estimatedPrice}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="px-3 py-1">
                          Market Rate
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Environmental Impact */}
                  <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm border-emerald-500/30">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Leaf className="w-5 h-5 text-emerald-500" />
                        <span>Environmental Impact</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <div className={`text-4xl font-bold ${getEcoScoreColor(scanResult.ecoScore)}`}>
                          {scanResult.ecoScore}/100
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">EcoScore</p>
                        
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${scanResult.ecoScore}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className={`h-2 rounded-full bg-gradient-to-r ${getEcoScoreGradient(scanResult.ecoScore)}`}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="space-y-1">
                          <TreePine className="w-6 h-6 text-green-500 mx-auto" />
                          <div className="text-lg font-bold">{scanResult.co2Savings}kg</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">CO₂ Saved</div>
                        </div>
                        <div className="space-y-1">
                          <Recycle className="w-6 h-6 text-blue-500 mx-auto" />
                          <div className="text-lg font-bold">♻️</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Reusable</div>
                        </div>
                        <div className="space-y-1">
                          <Droplets className="w-6 h-6 text-cyan-500 mx-auto" />
                          <div className="text-lg font-bold">{Math.round(scanResult.ecoScore / 10)}L</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Water Saved</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setScanResult(null)
                        setSelectedImage(null)
                      }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      Scan Another Item
                    </Button>
                    
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={createListing}
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                      >
                        <Package className="w-4 h-4 mr-2" />
                        Create Listing
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/30 dark:border-gray-700/30 h-96 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <Zap className="w-12 h-12 text-emerald-500" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Ready to Scan</h3>
                      <p className="text-gray-600 dark:text-gray-400 max-w-sm">
                        Upload or take a photo of your item to get instant AI-powered 
                        analysis and pricing estimates
                      </p>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  )
}