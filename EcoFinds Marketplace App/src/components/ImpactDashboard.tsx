import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useApp } from '../App'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts'
import { 
  ArrowLeft,
  TrendingUp,
  TreePine,
  Droplets,
  Recycle,
  Globe,
  Award,
  Users,
  Calendar,
  Target,
  Leaf,
  Zap,
  Star,
  Crown
} from 'lucide-react'
import { projectId } from '../utils/supabase/info'

// Mock data for charts
const monthlyImpactData = [
  { month: 'Jan', co2Saved: 45, waterSaved: 120, itemsTraded: 8 },
  { month: 'Feb', co2Saved: 52, waterSaved: 140, itemsTraded: 12 },
  { month: 'Mar', co2Saved: 38, waterSaved: 95, itemsTraded: 6 },
  { month: 'Apr', co2Saved: 67, waterSaved: 180, itemsTraded: 15 },
  { month: 'May', co2Saved: 73, waterSaved: 200, itemsTraded: 18 },
  { month: 'Jun', co2Saved: 89, waterSaved: 245, itemsTraded: 22 }
]

const categoryImpactData = [
  { name: 'Clothing', value: 35, color: '#10b981' },
  { name: 'Electronics', value: 25, color: '#3b82f6' },
  { name: 'Furniture', value: 20, color: '#f59e0b' },
  { name: 'Books', value: 12, color: '#8b5cf6' },
  { name: 'Other', value: 8, color: '#ef4444' }
]

const leaderboardData = [
  { rank: 1, name: 'Sarah Green', ecoPoints: 2450, co2Saved: 125, avatar: '🌱' },
  { rank: 2, name: 'Mike Eco', ecoPoints: 2180, co2Saved: 110, avatar: '♻️' },
  { rank: 3, name: 'Emma Earth', ecoPoints: 1995, co2Saved: 98, avatar: '🌍' },
  { rank: 4, name: 'Alex Nature', ecoPoints: 1875, co2Saved: 87, avatar: '🌿' },
  { rank: 5, name: 'You', ecoPoints: 1650, co2Saved: 78, avatar: '⭐' }
]

const communityStats = {
  totalMembers: 12543,
  totalCO2Saved: 87560,
  totalWaterSaved: 234890,
  totalItemsTraded: 45672,
  treesEquivalent: 3890
}

export const ImpactDashboard = () => {
  const { setCurrentView, user, accessToken } = useApp()
  const [activeTab, setActiveTab] = useState('personal')
  const [animationKey, setAnimationKey] = useState(0)

  useEffect(() => {
    // Trigger chart re-animation when tab changes
    setAnimationKey(prev => prev + 1)
  }, [activeTab])

  const getCurrentUserRank = () => {
    const userEntry = leaderboardData.find(entry => entry.name === 'You')
    return userEntry ? userEntry.rank : 5
  }

  const getPersonalStats = () => {
    return {
      co2Saved: monthlyImpactData.reduce((sum, month) => sum + month.co2Saved, 0),
      waterSaved: monthlyImpactData.reduce((sum, month) => sum + month.waterSaved, 0),
      itemsTraded: monthlyImpactData.reduce((sum, month) => sum + month.itemsTraded, 0),
      treesEquivalent: Math.floor(monthlyImpactData.reduce((sum, month) => sum + month.co2Saved, 0) / 22)
    }
  }

  const personalStats = getPersonalStats()

  return (
    <div className="pt-16 md:ml-64 pb-20 md:pb-8 min-h-screen">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
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
            <h1 className="text-3xl font-bold mb-2">Impact Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Track your environmental impact and see how the EcoFinds community 
              is making a difference together
            </p>
          </div>
        </motion.div>

        {/* Impact Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
            <TabsTrigger value="personal" className="flex items-center space-x-2">
              <TreePine className="w-4 h-4" />
              <span className="hidden sm:inline">Personal Impact</span>
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center space-x-2">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Community</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center space-x-2">
              <Crown className="w-4 h-4" />
              <span className="hidden sm:inline">Leaderboard</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-6">
            {/* Personal Stats Overview */}
            <motion.div
              key={`personal-stats-${animationKey}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm border-emerald-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                      <TreePine className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">CO₂ Saved</p>
                      <motion.p 
                        key={`co2-${animationKey}`}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-2xl font-bold text-green-600"
                      >
                        {personalStats.co2Saved}kg
                      </motion.p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm border-blue-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Droplets className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Water Saved</p>
                      <motion.p 
                        key={`water-${animationKey}`}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-2xl font-bold text-blue-600"
                      >
                        {personalStats.waterSaved}L
                      </motion.p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm border-purple-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <Recycle className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Items Traded</p>
                      <motion.p 
                        key={`items-${animationKey}`}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-2xl font-bold text-purple-600"
                      >
                        {personalStats.itemsTraded}
                      </motion.p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-sm border-yellow-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                      <Star className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Trees Equivalent</p>
                      <motion.p 
                        key={`trees-${animationKey}`}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-2xl font-bold text-yellow-600"
                      >
                        {personalStats.treesEquivalent}
                      </motion.p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Monthly Impact Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                key={`chart1-${animationKey}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/30 dark:border-gray-700/30">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-emerald-500" />
                      <span>Monthly Impact Trend</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={monthlyImpactData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px'
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="co2Saved"
                          stroke="#10b981"
                          fill="url(#colorCO2)"
                          strokeWidth={3}
                        />
                        <defs>
                          <linearGradient id="colorCO2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                          </linearGradient>
                        </defs>
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Category Breakdown */}
              <motion.div
                key={`chart2-${animationKey}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/30 dark:border-gray-700/30">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Recycle className="w-5 h-5 text-emerald-500" />
                      <span>Impact by Category</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={categoryImpactData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryImpactData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                      {categoryImpactData.map((entry, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: entry.color }}
                          />
                          <span>{entry.name}: {entry.value}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Achievement Section */}
            <motion.div
              key={`achievements-${animationKey}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 backdrop-blur-sm border-emerald-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-emerald-500" />
                    <span>Your Environmental Achievement</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div className="text-6xl">🌟</div>
                    <div>
                      <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        Eco Champion
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-2">
                        You've saved the equivalent of {personalStats.treesEquivalent} trees worth of CO₂! 
                        Your sustainable choices are making a real difference.
                      </p>
                    </div>
                    <div className="flex justify-center space-x-8 text-sm">
                      <div className="text-center">
                        <div className="text-xl font-bold text-green-600">{personalStats.co2Saved}kg</div>
                        <div className="text-gray-600 dark:text-gray-400">CO₂ Prevented</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-blue-600">{personalStats.waterSaved}L</div>
                        <div className="text-gray-600 dark:text-gray-400">Water Conserved</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="community" className="space-y-6">
            {/* Community Stats */}
            <motion.div
              key={`community-stats-${animationKey}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm border-blue-500/30">
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <motion.div
                    key={`members-${animationKey}`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-2xl font-bold text-blue-600"
                  >
                    {communityStats.totalMembers.toLocaleString()}
                  </motion.div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Members</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm border-green-500/30">
                <CardContent className="p-6 text-center">
                  <TreePine className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <motion.div
                    key={`community-co2-${animationKey}`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-bold text-green-600"
                  >
                    {(communityStats.totalCO2Saved / 1000).toFixed(1)}T
                  </motion.div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">CO₂ Saved</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-sm border-cyan-500/30">
                <CardContent className="p-6 text-center">
                  <Droplets className="w-8 h-8 text-cyan-600 mx-auto mb-2" />
                  <motion.div
                    key={`community-water-${animationKey}`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl font-bold text-cyan-600"
                  >
                    {(communityStats.totalWaterSaved / 1000).toFixed(0)}kL
                  </motion.div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Water Saved</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm border-purple-500/30">
                <CardContent className="p-6 text-center">
                  <Recycle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <motion.div
                    key={`community-items-${animationKey}`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-2xl font-bold text-purple-600"
                  >
                    {(communityStats.totalItemsTraded / 1000).toFixed(0)}k
                  </motion.div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Items Traded</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Community Impact Visualization */}
            <motion.div
              key={`community-chart-${animationKey}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/30 dark:border-gray-700/30">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="w-5 h-5 text-emerald-500" />
                    <span>Community Impact Over Time</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={monthlyImpactData.map(item => ({
                      ...item,
                      communityCO2: item.co2Saved * 142, // Scale up for community
                      communityWater: item.waterSaved * 67,
                      communityItems: item.itemsTraded * 89
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="communityCO2" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        name="CO₂ Saved (kg)"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="communityItems" 
                        stroke="#8b5cf6" 
                        strokeWidth={3}
                        name="Items Traded"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Forest Equivalent */}
            <motion.div
              key={`forest-${animationKey}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-sm border-green-500/30">
                <CardContent className="p-8 text-center">
                  <div className="text-6xl mb-4">🌲</div>
                  <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                    Community Forest Impact
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Together, our community has saved the equivalent of
                  </p>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8, type: "spring" }}
                    className="text-5xl font-bold text-green-600 dark:text-green-400"
                  >
                    {communityStats.treesEquivalent.toLocaleString()} Trees
                  </motion.div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    That's like planting a small forest! 🌳
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            {/* Your Rank */}
            <motion.div
              key={`rank-${animationKey}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-sm border-yellow-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-4xl">⭐</div>
                      <div>
                        <h3 className="text-xl font-semibold">Your Rank</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          You're #{getCurrentUserRank()} in the community!
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-emerald-600">
                        {user?.ecoPoints || 1650} pts
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Eco Points</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Leaderboard */}
            <motion.div
              key={`leaderboard-${animationKey}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/30 dark:border-gray-700/30">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Crown className="w-5 h-5 text-yellow-500" />
                    <span>Eco Champions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <AnimatePresence>
                      {leaderboardData.map((entry, index) => (
                        <motion.div
                          key={entry.rank}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02, x: 4 }}
                          className={`flex items-center justify-between p-4 rounded-lg transition-all duration-300 ${
                            entry.name === 'You'
                              ? 'bg-emerald-500/20 border-2 border-emerald-500/50'
                              : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-emerald-500/10'
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                              entry.rank === 1
                                ? 'bg-yellow-500 text-white'
                                : entry.rank === 2
                                ? 'bg-gray-400 text-white'
                                : entry.rank === 3
                                ? 'bg-orange-500 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}>
                              {entry.rank <= 3 ? (
                                entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'
                              ) : (
                                entry.rank
                              )}
                            </div>
                            
                            <div className="text-2xl">{entry.avatar}</div>
                            
                            <div>
                              <h4 className="font-semibold">{entry.name}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {entry.co2Saved}kg CO₂ saved
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                              {entry.ecoPoints.toLocaleString()}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">points</p>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Monthly Challenge */}
            <motion.div
              key={`challenge-${animationKey}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm border-purple-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-purple-500" />
                    <span>Monthly Challenge</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Trade 5 More Items This Month</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        You've traded 3 items so far. Complete 2 more to earn a special badge!
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>3/5 items</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '60%' }}
                          transition={{ duration: 1, delay: 0.8 }}
                          className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                        />
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => setCurrentView('add-product')}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      List an Item
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}