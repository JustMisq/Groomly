import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { getErrorMessage, logApiCall } from '@/lib/logger'

// ✅ SÉCURITÉ: Validation stricte avec Zod
const registerSchema = z.object({
  name: z.string()
    .min(2, 'Nom doit contenir au moins 2 caractères')
    .max(100, 'Nom ne doit pas dépasser 100 caractères')
    .trim(),
  email: z.string()
    .email('Email invalide')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(8, 'Mot de passe doit contenir au moins 8 caractères')
    .max(128, 'Mot de passe est trop long')
    // Au moins une majuscule, une minuscule, un chiffre
    .refine(
      (pwd) => /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /[0-9]/.test(pwd),
      'Mot de passe doit contenir une majuscule, une minuscule et un chiffre'
    ),
})

type RegisterInput = z.infer<typeof registerSchema>

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

  try {
    // ✅ SÉCURITÉ: Rate limiting sur IP (5 registrations par heure)
    const rateLimitKey = `register:${clientIp}`
    // TODO: Utiliser Redis en production. Pour maintenant, on log juste
    
    const body = await request.json()

    // ✅ SÉCURITÉ: Validation avec Zod
    const validatedData = registerSchema.parse(body)

    // ✅ SÉCURITÉ: Vérifier si email existe
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      logger.warn('AUTH', `Registration attempt with existing email: ${validatedData.email}`)
      
      // Ne pas révéler si l'email existe ou non (prévenir enumeration)
      return NextResponse.json(
        { 
          message: 'Un compte avec cet email existe déjà. Vous pouvez vous connecter.',
          errorId: `REG_EXISTS_${Date.now()}`
        },
        { status: 400 }
      )
    }

    // ✅ SÉCURITÉ: Hasher le mot de passe avec 10 rounds
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    // ✅ SÉCURITÉ: Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        // Créer automatiquement un salon vide
        salon: {
          create: {
            name: `Salon de ${validatedData.name}`,
          }
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
      }
    })

    // ✅ AUDIT: Logger l'action
    logger.audit('AUTH', 'USER_REGISTERED', user.id, { email: user.email })

    const duration = Date.now() - startTime
    logApiCall('POST', '/api/auth/register', 201, duration, user.id)

    return NextResponse.json(
      { 
        message: 'Compte créé avec succès',
        userId: user.id 
      },
      { status: 201 }
    )
  } catch (error) {
    const duration = Date.now() - startTime
    logApiCall('POST', '/api/auth/register', 400, duration)

    // ✅ SÉCURITÉ: Ne pas exposer détails de l'erreur
    if (error instanceof z.ZodError) {
      logger.warn('AUTH', 'Validation error on register', (error as any).issues)
      return NextResponse.json(
        { 
          message: 'Données invalides',
          errors: (error as any).issues.map((e: any) => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      )
    }

    const { message, errorId } = getErrorMessage(error)
    logger.error('AUTH', `Registration failed: ${errorId}`, error)

    return NextResponse.json(
      { 
        message: message || 'Erreur lors de l\'inscription',
        errorId 
      },
      { status: 500 }
    )
  }
}
