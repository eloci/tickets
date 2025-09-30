// Test script to verify homepage content API

async function testHomepageContentAPI() {
  try {
    console.log('🧪 Testing Homepage Content API...\n')

    // Test GET endpoint
    console.log('📡 Testing GET /api/admin/homepage-content')
    const getResponse = await fetch('http://localhost:3000/api/admin/homepage-content')

    if (getResponse.ok) {
      const data = await getResponse.json()
      console.log('✅ GET Success:', data)
    } else {
      console.log('❌ GET Failed:', getResponse.status, await getResponse.text())
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Wait for server to be ready, then test
setTimeout(testHomepageContentAPI, 3000)