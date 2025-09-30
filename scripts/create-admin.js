import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash('admin', 12)

    // Create or update admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@admin.com' },
      update: {
        password: hashedPassword,
        role: 'ADMIN',
        name: 'Admin User'
      },
      create: {
        email: 'admin@admin.com',
        password: hashedPassword,
        role: 'ADMIN',
        name: 'Admin User'
      }
    })

    console.log('✅ Admin user created/updated successfully:')
    console.log('Email:', adminUser.email)
    console.log('Name:', adminUser.name)
    console.log('Role:', adminUser.role)
    console.log('ID:', adminUser.id)
    console.log('\n🔑 Credentials:')
    console.log('Email: admin@admin.com')
    console.log('Password: admin')

    // List all users
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true
      }
    })

    console.log('\n👥 All users in database:')
    allUsers.forEach(user => {
      console.log(`- ${user.email} (${user.role}) - ${user.name} - Has Password: ${!!user.password}`)
    })

  } catch (error) {
    console.error('❌ Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()