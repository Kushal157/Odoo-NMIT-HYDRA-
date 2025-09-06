import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js'
import * as kv from './kv_store.tsx'

const app = new Hono()

// Middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))
app.use('*', logger(console.log))

// Initialize Supabase client for auth operations
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// Auth helper
async function getUserFromToken(authHeader: string | null) {
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.split(' ')[1]
  const { data: { user }, error } = await supabase.auth.getUser(token)
  return error ? null : user
}

// Auth Routes
app.post('/make-server-d588a8d5/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json()
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    })

    if (error) {
      console.log('Signup error:', error)
      return c.json({ error: error.message }, 400)
    }

    // Create user profile in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      ecoPoints: 0,
      badges: [],
      joinedAt: new Date().toISOString()
    })

    return c.json({ user: data.user })
  } catch (error) {
    console.log('Signup error:', error)
    return c.json({ error: 'Signup failed' }, 500)
  }
})

// Product Routes
app.get('/make-server-d588a8d5/products', async (c) => {
  try {
    const category = c.req.query('category')
    const search = c.req.query('search')
    
    let products = await kv.getByPrefix('product:')
    
    // Filter by category
    if (category && category !== 'all') {
      products = products.filter(p => p.category === category)
    }
    
    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase()
      products = products.filter(p => 
        p.title.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
      )
    }
    
    // Sort by created date (newest first)
    products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    return c.json({ products })
  } catch (error) {
    console.log('Error fetching products:', error)
    return c.json({ error: 'Failed to fetch products' }, 500)
  }
})

app.post('/make-server-d588a8d5/products', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const productData = await c.req.json()
    const productId = crypto.randomUUID()
    
    // Calculate EcoScore based on material and condition
    const ecoScore = calculateEcoScore(productData.material, productData.condition)
    
    const product = {
      id: productId,
      sellerId: user.id,
      ...productData,
      ecoScore,
      createdAt: new Date().toISOString(),
      views: 0,
      likes: 0
    }
    
    await kv.set(`product:${productId}`, product)
    
    // Award eco points to seller
    const userProfile = await kv.get(`user:${user.id}`)
    if (userProfile) {
      userProfile.ecoPoints = (userProfile.ecoPoints || 0) + 10
      await kv.set(`user:${user.id}`, userProfile)
    }
    
    return c.json({ product })
  } catch (error) {
    console.log('Error creating product:', error)
    return c.json({ error: 'Failed to create product' }, 500)
  }
})

app.get('/make-server-d588a8d5/products/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const product = await kv.get(`product:${id}`)
    
    if (!product) {
      return c.json({ error: 'Product not found' }, 404)
    }
    
    // Increment view count
    product.views = (product.views || 0) + 1
    await kv.set(`product:${id}`, product)
    
    // Get seller info
    const seller = await kv.get(`user:${product.sellerId}`)
    
    return c.json({ 
      product,
      seller: seller ? { 
        id: seller.id, 
        name: seller.name, 
        ecoPoints: seller.ecoPoints,
        badges: seller.badges 
      } : null 
    })
  } catch (error) {
    console.log('Error fetching product:', error)
    return c.json({ error: 'Failed to fetch product' }, 500)
  }
})

// Sample Products Creation Route (for demo purposes)
app.post('/make-server-d588a8d5/seed-products', async (c) => {
  try {
    const sampleProducts = [
      {
        id: crypto.randomUUID(),
        sellerId: 'demo-seller-1',
        title: 'Vintage Denim Jacket',
        description: 'Beautiful vintage denim jacket in excellent condition. Perfect for sustainable fashion lovers.',
        price: 45,
        category: 'clothing',
        condition: 'excellent',
        material: 'cotton',
        images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop'],
        ecoScore: 85,
        createdAt: new Date().toISOString(),
        views: 12,
        likes: 3,
        location: 'San Francisco, CA'
      },
      {
        id: crypto.randomUUID(),
        sellerId: 'demo-seller-2',
        title: 'Bamboo Laptop Stand',
        description: 'Eco-friendly bamboo laptop stand, adjustable height, perfect for remote work.',
        price: 35,
        category: 'electronics',
        condition: 'good',
        material: 'bamboo',
        images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop'],
        ecoScore: 92,
        createdAt: new Date().toISOString(),
        views: 8,
        likes: 2,
        location: 'Portland, OR'
      },
      {
        id: crypto.randomUUID(),
        sellerId: 'demo-seller-3',
        title: 'Reclaimed Wood Coffee Table',
        description: 'Handcrafted coffee table made from reclaimed barn wood. Unique piece with character.',
        price: 180,
        category: 'furniture',
        condition: 'excellent',
        material: 'recycled',
        images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop'],
        ecoScore: 88,
        createdAt: new Date().toISOString(),
        views: 15,
        likes: 7,
        location: 'Austin, TX'
      },
      {
        id: crypto.randomUUID(),
        sellerId: 'demo-seller-4',
        title: 'Organic Cotton Sweater',
        description: 'Cozy organic cotton sweater, size medium, barely worn. Soft and sustainable.',
        price: 28,
        category: 'clothing',
        condition: 'good',
        material: 'organic',
        images: ['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=400&fit=crop'],
        ecoScore: 78,
        createdAt: new Date().toISOString(),
        views: 6,
        likes: 1,
        location: 'Seattle, WA'
      },
      {
        id: crypto.randomUUID(),
        sellerId: 'demo-seller-5',
        title: 'Classic Literature Collection',
        description: 'Set of 12 classic literature books in great condition. Perfect for book lovers.',
        price: 25,
        category: 'books',
        condition: 'good',
        material: 'recycled',
        images: ['https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop'],
        ecoScore: 75,
        createdAt: new Date().toISOString(),
        views: 9,
        likes: 4,
        location: 'Boston, MA'
      },
      {
        id: crypto.randomUUID(),
        sellerId: 'demo-seller-6',
        title: 'Wooden Building Blocks Set',
        description: 'Natural wooden building blocks set, safe for children, eco-friendly paint.',
        price: 22,
        category: 'toys',
        condition: 'excellent',
        material: 'organic',
        images: ['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop'],
        ecoScore: 90,
        createdAt: new Date().toISOString(),
        views: 11,
        likes: 5,
        location: 'Denver, CO'
      },
      {
        id: crypto.randomUUID(),
        sellerId: 'demo-seller-7',
        title: 'Yoga Mat - Eco-Friendly',
        description: 'Non-toxic, biodegradable yoga mat made from natural rubber. Excellent grip.',
        price: 42,
        category: 'sports',
        condition: 'good',
        material: 'organic',
        images: ['https://images.unsplash.com/photo-1588286840104-8957b019727f?w=400&h=400&fit=crop'],
        ecoScore: 83,
        createdAt: new Date().toISOString(),
        views: 7,
        likes: 2,
        location: 'Los Angeles, CA'
      },
      {
        id: crypto.randomUUID(),
        sellerId: 'demo-seller-8',
        title: 'Succulent Garden Starter Kit',
        description: 'Complete starter kit with 6 different succulents and recycled planters.',
        price: 32,
        category: 'home',
        condition: 'excellent',
        material: 'organic',
        images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop'],
        ecoScore: 95,
        createdAt: new Date().toISOString(),
        views: 14,
        likes: 8,
        location: 'Miami, FL'
      }
    ]

    // Store all sample products
    for (const product of sampleProducts) {
      await kv.set(`product:${product.id}`, product)
    }

    return c.json({ message: 'Sample products created successfully', count: sampleProducts.length })
  } catch (error) {
    console.log('Error seeding products:', error)
    return c.json({ error: 'Failed to seed products' }, 500)
  }
})

// User Routes
app.get('/make-server-d588a8d5/user/profile', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const profile = await kv.get(`user:${user.id}`)
    return c.json({ profile })
  } catch (error) {
    console.log('Error fetching profile:', error)
    return c.json({ error: 'Failed to fetch profile' }, 500)
  }
})

app.get('/make-server-d588a8d5/user/products', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const products = await kv.getByPrefix('product:')
    const userProducts = products.filter(p => p.sellerId === user.id)
    
    return c.json({ products: userProducts })
  } catch (error) {
    console.log('Error fetching user products:', error)
    return c.json({ error: 'Failed to fetch products' }, 500)
  }
})

// Wishlist Routes
app.post('/make-server-d588a8d5/wishlist/:productId', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const productId = c.req.param('productId')
    const wishlistKey = `wishlist:${user.id}:${productId}`
    
    await kv.set(wishlistKey, {
      userId: user.id,
      productId,
      addedAt: new Date().toISOString()
    })
    
    return c.json({ success: true })
  } catch (error) {
    console.log('Error adding to wishlist:', error)
    return c.json({ error: 'Failed to add to wishlist' }, 500)
  }
})

app.delete('/make-server-d588a8d5/wishlist/:productId', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const productId = c.req.param('productId')
    const wishlistKey = `wishlist:${user.id}:${productId}`
    
    await kv.del(wishlistKey)
    
    return c.json({ success: true })
  } catch (error) {
    console.log('Error removing from wishlist:', error)
    return c.json({ error: 'Failed to remove from wishlist' }, 500)
  }
})

app.get('/make-server-d588a8d5/wishlist', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const wishlistItems = await kv.getByPrefix(`wishlist:${user.id}:`)
    const productIds = wishlistItems.map(item => item.productId)
    
    const products = await Promise.all(
      productIds.map(id => kv.get(`product:${id}`))
    )
    
    return c.json({ products: products.filter(Boolean) })
  } catch (error) {
    console.log('Error fetching wishlist:', error)
    return c.json({ error: 'Failed to fetch wishlist' }, 500)
  }
})

// Chat Routes
app.post('/make-server-d588a8d5/chat/message', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { recipientId, message, productId } = await c.req.json()
    const messageId = crypto.randomUUID()
    
    const chatMessage = {
      id: messageId,
      senderId: user.id,
      recipientId,
      message,
      productId,
      timestamp: new Date().toISOString(),
      read: false
    }
    
    await kv.set(`message:${messageId}`, chatMessage)
    
    return c.json({ message: chatMessage })
  } catch (error) {
    console.log('Error sending message:', error)
    return c.json({ error: 'Failed to send message' }, 500)
  }
})

app.get('/make-server-d588a8d5/chat/:otherUserId', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const otherUserId = c.req.param('otherUserId')
    const messages = await kv.getByPrefix('message:')
    
    const chatMessages = messages.filter(msg => 
      (msg.senderId === user.id && msg.recipientId === otherUserId) ||
      (msg.senderId === otherUserId && msg.recipientId === user.id)
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    
    return c.json({ messages: chatMessages })
  } catch (error) {
    console.log('Error fetching chat:', error)
    return c.json({ error: 'Failed to fetch messages' }, 500)
  }
})

// Leaderboard Route
app.get('/make-server-d588a8d5/leaderboard', async (c) => {
  try {
    const users = await kv.getByPrefix('user:')
    const leaderboard = users
      .sort((a, b) => (b.ecoPoints || 0) - (a.ecoPoints || 0))
      .slice(0, 10)
      .map(user => ({
        id: user.id,
        name: user.name,
        ecoPoints: user.ecoPoints || 0,
        badges: user.badges || []
      }))
    
    return c.json({ leaderboard })
  } catch (error) {
    console.log('Error fetching leaderboard:', error)
    return c.json({ error: 'Failed to fetch leaderboard' }, 500)
  }
})

// EcoScore calculation function
function calculateEcoScore(material: string, condition: string): number {
  let score = 50 // Base score
  
  // Material impact
  const materialScores: Record<string, number> = {
    'recycled': 30,
    'organic': 25,
    'bamboo': 20,
    'cotton': 15,
    'plastic': -10,
    'synthetic': -15
  }
  
  // Condition impact
  const conditionScores: Record<string, number> = {
    'excellent': 20,
    'good': 15,
    'fair': 10,
    'poor': 5
  }
  
  score += materialScores[material.toLowerCase()] || 0
  score += conditionScores[condition.toLowerCase()] || 0
  
  return Math.max(0, Math.min(100, score))
}

Deno.serve(app.fetch)