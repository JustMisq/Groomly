import { prisma } from './prisma'

type AuditAction = 'create' | 'update' | 'delete' | 'cancel' | 'no_show' | 'payment' | 'login' | 'export'
type EntityType = 'client' | 'animal' | 'appointment' | 'invoice' | 'service' | 'salon' | 'user'

interface AuditLogParams {
  userId: string
  salonId: string
  action: AuditAction
  entityType: EntityType
  entityId: string
  oldValue?: Record<string, unknown> | null
  newValue?: Record<string, unknown> | null
  ipAddress?: string
  userAgent?: string
}

/**
 * Crée une entrée dans le journal d'audit
 * Usage minimal et pragmatique - uniquement pour les actions importantes
 */
export async function createAuditLog(params: AuditLogParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        salonId: params.salonId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        oldValue: params.oldValue ? JSON.stringify(params.oldValue) : null,
        newValue: params.newValue ? JSON.stringify(params.newValue) : null,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    })
  } catch (error) {
    // Log silencieux - on ne bloque pas l'action si l'audit échoue
    console.error('Audit log error:', error)
  }
}

/**
 * Récupère les logs d'audit pour un salon
 */
export async function getAuditLogs(
  salonId: string,
  options?: {
    entityType?: EntityType
    entityId?: string
    limit?: number
    offset?: number
  }
) {
  const where: Record<string, unknown> = { salonId }
  
  if (options?.entityType) {
    where.entityType = options.entityType
  }
  if (options?.entityId) {
    where.entityId = options.entityId
  }

  return prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: options?.limit ?? 50,
    skip: options?.offset ?? 0,
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
  })
}

/**
 * Actions à auditer (référence)
 * 
 * OBLIGATOIRE (traçabilité légale) :
 * - Suppression de données
 * - Modification de factures payées
 * - Annulations de RDV
 * - Export de données
 * 
 * RECOMMANDÉ (debug) :
 * - Création de factures
 * - Marquage no-show
 * - Changement de statut paiement
 */
