const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    // Update existing user to admin (replace with actual email)
    const email = 'your-email@example.com' // Change this to your email

    const user = await prisma.user.update({
      where: { email: email },
      data: { role: 'ADMIN' }
    })

    console.log('✅ User updated to admin:', user.email, user.role)
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.log('💡 Make sure the user exists first by signing up through the web app')
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()