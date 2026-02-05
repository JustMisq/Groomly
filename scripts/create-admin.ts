/**
 * Script pour créer un utilisateur admin Groomly
 * 
 * Usage:
 * npx ts-node --esm -P tsconfig.json scripts/create-admin.ts email@example.com password123
 * 
 * Ou insérer manuellement en DB:
 * UPDATE "User" SET "isAdmin" = true WHERE email = 'admin@groomly.fr';
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdmin(email: string, password: string) {
  try {
    // Vérifier si l'utilisateur existe
    let user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      // Créer un nouvel utilisateur admin
      const hashedPassword = await bcrypt.hash(password, 10)

      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: 'Admin Groomly',
          isAdmin: true,
        },
      })

      console.log(`✅ Utilisateur admin créé: ${email}`)
    } else {
      // Mettre à jour l'utilisateur existant
      user = await prisma.user.update({
        where: { email },
        data: { isAdmin: true },
      })

      console.log(`✅ Utilisateur ${email} est maintenant admin`)
    }

    console.log('Détails:', {
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
    })
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Récupérer les arguments
const args = process.argv.slice(2)
if (args.length < 2) {
  console.error('Usage: npx ts-node scripts/create-admin.ts <email> <password>')
  process.exit(1)
}

createAdmin(args[0], args[1])
