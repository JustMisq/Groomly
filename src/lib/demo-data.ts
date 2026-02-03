import { prisma } from './prisma'

// Configuration des données fictives pour le mode démo
const DEMO_DATA = {
  clients: [
    { firstName: 'Marie', lastName: 'Dupont', email: 'marie.dupont@demo.fr', phone: '06 12 34 56 78' },
    { firstName: 'Pierre', lastName: 'Martin', email: 'pierre.martin@demo.fr', phone: '06 98 76 54 32' },
    { firstName: 'Sophie', lastName: 'Bernard', email: 'sophie.bernard@demo.fr', phone: '06 55 44 33 22' },
    { firstName: 'Lucas', lastName: 'Petit', email: 'lucas.petit@demo.fr', phone: '06 11 22 33 44' },
    { firstName: 'Emma', lastName: 'Moreau', email: 'emma.moreau@demo.fr', phone: '06 77 88 99 00' },
  ],
  animals: [
    { name: 'Max', species: 'dog', breed: 'Golden Retriever', temperament: 'calm', weight: 32 },
    { name: 'Luna', species: 'dog', breed: 'Caniche', temperament: 'playful', weight: 8 },
    { name: 'Oscar', species: 'cat', breed: 'Persan', temperament: 'calm', weight: 5 },
    { name: 'Bella', species: 'dog', breed: 'Yorkshire', temperament: 'anxious', weight: 3.5, allergies: 'Shampoings parfumés' },
    { name: 'Charlie', species: 'dog', breed: 'Berger Allemand', temperament: 'mixed', weight: 35, healthNotes: 'Arthrose légère' },
    { name: 'Milo', species: 'cat', breed: 'Siamois', temperament: 'playful', weight: 4 },
    { name: 'Ruby', species: 'dog', breed: 'Cocker', temperament: 'calm', weight: 14 },
  ],
  services: [
    { name: 'Toilettage complet', description: 'Bain, séchage, coupe, finitions', price: 45, duration: 90 },
    { name: 'Toilettage express', description: 'Bain et séchage uniquement', price: 25, duration: 45 },
    { name: 'Coupe ciseaux', description: 'Coupe aux ciseaux avec finitions', price: 55, duration: 120 },
    { name: 'Épilation', description: 'Épilation manuelle complète', price: 50, duration: 90 },
    { name: 'Bain antiparasitaire', description: 'Traitement antipuces et tiques', price: 35, duration: 60 },
    { name: 'Coupe griffes', description: 'Coupe des griffes uniquement', price: 10, duration: 15 },
    { name: 'Nettoyage oreilles', description: 'Nettoyage et soin des oreilles', price: 12, duration: 15 },
  ],
  inventory: [
    { name: 'Shampooing chien', quantity: 15, unit: 'bouteilles', price: 8.50 },
    { name: 'Shampooing chat', quantity: 8, unit: 'bouteilles', price: 9.00 },
    { name: 'Après-shampooing', quantity: 12, unit: 'bouteilles', price: 7.50 },
    { name: 'Spray démêlant', quantity: 6, unit: 'bouteilles', price: 12.00 },
    { name: 'Lames tondeuse #10', quantity: 4, unit: 'pièces', price: 25.00 },
    { name: 'Lames tondeuse #30', quantity: 3, unit: 'pièces', price: 28.00 },
    { name: 'Serviettes microfibre', quantity: 20, unit: 'pièces', price: 5.00 },
  ],
}

/**
 * Génère des données fictives pour un salon (mode démo)
 */
export async function generateDemoData(salonId: string): Promise<{
  clients: number
  animals: number
  services: number
  appointments: number
  invoices: number
  inventory: number
}> {
  // 1. Créer les services
  const createdServices = await Promise.all(
    DEMO_DATA.services.map(service =>
      prisma.service.create({
        data: { ...service, salonId },
      })
    )
  )

  // 2. Créer les clients avec leurs animaux
  const createdClients = await Promise.all(
    DEMO_DATA.clients.map(client =>
      prisma.client.create({
        data: {
          ...client,
          salonId,
          notes: 'Client démo - données fictives',
        },
      })
    )
  )

  // 3. Distribuer les animaux aux clients
  const createdAnimals = []
  for (let i = 0; i < DEMO_DATA.animals.length; i++) {
    const clientIndex = i % createdClients.length
    const animal = await prisma.animal.create({
      data: {
        ...DEMO_DATA.animals[i],
        clientId: createdClients[clientIndex].id,
        notes: 'Animal démo - données fictives',
      },
    })
    createdAnimals.push(animal)
  }

  // 4. Créer les articles d'inventaire
  const createdInventory = await Promise.all(
    DEMO_DATA.inventory.map(item =>
      prisma.inventoryItem.create({
        data: { ...item, salonId },
      })
    )
  )

  // 5. Créer des rendez-vous sur les 30 derniers jours + 7 prochains jours
  const now = new Date()
  const appointments = []
  const invoices = []

  // RDV passés (30 derniers jours)
  for (let daysAgo = 30; daysAgo >= 1; daysAgo -= 2) {
    const date = new Date(now)
    date.setDate(date.getDate() - daysAgo)
    date.setHours(9 + Math.floor(Math.random() * 8), 0, 0, 0) // Entre 9h et 17h

    const client = createdClients[Math.floor(Math.random() * createdClients.length)]
    const animal = createdAnimals.find(a => a.clientId === client.id) || createdAnimals[0]
    const service = createdServices[Math.floor(Math.random() * createdServices.length)]

    const endTime = new Date(date.getTime() + service.duration * 60000)

    // Statuts variés pour les stats
    const statuses = ['completed', 'completed', 'completed', 'completed', 'cancelled', 'no_show']
    const status = statuses[Math.floor(Math.random() * statuses.length)]

    const appointment = await prisma.appointment.create({
      data: {
        salonId,
        clientId: client.id,
        animalId: animal.id,
        serviceId: service.id,
        date,
        startTime: date,
        endTime,
        totalPrice: service.price,
        status,
        notes: status === 'no_show' ? 'Client absent' : null,
      },
    })
    appointments.push(appointment)

    // Créer une facture pour les RDV completed
    if (status === 'completed') {
      const invNum: string = `INV-${date.getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`
      const taxAmount = service.price * 0.2
      const isPaid = Math.random() > 0.2 // 80% payées

      const inv = await prisma.invoice.create({
        data: {
          salonId,
          clientId: client.id,
          appointmentId: appointment.id,
          invoiceNumber: invNum,
          subtotal: service.price,
          taxRate: 20,
          taxAmount,
          total: service.price + taxAmount,
          status: isPaid ? 'paid' : 'sent',
          paidAt: isPaid ? date : null,
          paymentMethod: isPaid ? ['cash', 'card'][Math.floor(Math.random() * 2)] : null,
        },
      })
      invoices.push(inv)
    }
  }

  // RDV futurs (7 prochains jours)
  for (let daysAhead = 1; daysAhead <= 7; daysAhead++) {
    if (Math.random() > 0.4) { // Pas tous les jours
      const date = new Date(now)
      date.setDate(date.getDate() + daysAhead)
      date.setHours(10 + Math.floor(Math.random() * 6), 0, 0, 0)

      const client = createdClients[Math.floor(Math.random() * createdClients.length)]
      const animal = createdAnimals.find(a => a.clientId === client.id) || createdAnimals[0]
      const service = createdServices[Math.floor(Math.random() * createdServices.length)]

      const endTime = new Date(date.getTime() + service.duration * 60000)

      const appointment = await prisma.appointment.create({
        data: {
          salonId,
          clientId: client.id,
          animalId: animal.id,
          serviceId: service.id,
          date,
          startTime: date,
          endTime,
          totalPrice: service.price,
          status: 'scheduled',
        },
      })
      appointments.push(appointment)
    }
  }

  return {
    clients: createdClients.length,
    animals: createdAnimals.length,
    services: createdServices.length,
    appointments: appointments.length,
    invoices: invoices.length,
    inventory: createdInventory.length,
  }
}

/**
 * Supprime toutes les données démo d'un salon
 */
export async function clearDemoData(salonId: string): Promise<void> {
  // Supprimer dans l'ordre pour respecter les contraintes FK
  await prisma.invoice.deleteMany({ where: { salonId } })
  await prisma.appointment.deleteMany({ where: { salonId } })
  await prisma.animal.deleteMany({ where: { client: { salonId } } })
  await prisma.client.deleteMany({ where: { salonId } })
  await prisma.service.deleteMany({ where: { salonId } })
  await prisma.inventoryItem.deleteMany({ where: { salonId } })
}
