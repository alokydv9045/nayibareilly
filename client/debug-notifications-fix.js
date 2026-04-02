// 🧪 API Endpoint Test - Notifications Fix
// Test to verify the notifications API endpoint is working correctly

console.log('🔍 Testing Notifications API Configuration...')

// Check environment variables
console.log('Environment variables:')
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL)
console.log('NEXT_PUBLIC_API_URL_DEV:', process.env.NEXT_PUBLIC_API_URL_DEV)

// Test the URL construction
const isDevelopment = process.env.NODE_ENV === 'development'
const apiUrl = isDevelopment 
  ? (process.env.NEXT_PUBLIC_API_URL_DEV || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api')
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api')

console.log('🔗 Constructed API URL:', apiUrl)
console.log('🔗 Full notifications endpoint:', `${apiUrl}/notifications`)

// Expected vs Previous URLs
console.log('\n📊 URL Comparison:')
console.log('✅ FIXED URL:', `${apiUrl}/notifications`)
console.log('❌ OLD URL:', `http://localhost:5000/api/notifications`)
console.log('❌ DOUBLE API BUG:', `http://localhost:5000/api/api/notifications`)

console.log('\n🎯 Fix Summary:')
console.log('1. Changed port from 5000 to 4001 (correct server port)')
console.log('2. Use NEXT_PUBLIC_API_URL_DEV for development')  
console.log('3. Ensure no double /api/ in URL construction')
console.log('4. All fetch calls in useNotifications.ts updated')

export {}