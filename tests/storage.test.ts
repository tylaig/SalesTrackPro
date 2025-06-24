import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock the database module before importing the storage
let salesData: any[] = []

vi.mock('../server/db', () => {
  const mockDb = {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          orderBy: vi.fn(() => salesData)
        }))
      }))
    })),
    update: vi.fn(() => ({
      set: (values: any) => ({
        where: vi.fn(async () => {
          Object.assign(salesData[0], values)
          return []
        })
      })
    }))
  }
  return { db: mockDb }
})

import { DatabaseStorage } from '../server/storage'

describe('DatabaseStorage.processWebhookEvent', () => {
  let storage: DatabaseStorage
  let clients: any[]
  let events: any[]

  beforeEach(() => {
    clients = [{ id: 1, name: 'John', phone: '1234567890' }]
    salesData = [{ id: 1, clientId: 1, status: 'lost', saleId: null, product: 'Test', value: '100', date: new Date() }]
    events = []

    storage = new DatabaseStorage()
    storage.getClientByPhone = vi.fn(async (phone: string) => clients.find(c => c.phone === phone))
    storage.createClient = vi.fn(async (data: any) => {
      const c = { id: clients.length + 1, ...data }
      clients.push(c)
      return c
    })
    storage.createClientEvent = vi.fn(async (data: any) => {
      events.push(data)
      return { id: events.length, ...data }
    })
  })

  it('updates a lost sale to recovered on SALE_APPROVED', async () => {
    const result = await storage.processWebhookEvent({
      event: 'SALE_APPROVED',
      customer: { phone_number: '1234567890', name: 'John' },
      sale_id: 'ABC123',
      payment_method: 'pix',
      total_price: 'R$ 100,00',
      products: [{ name: 'Test Product' }]
    })

    expect(result.success).toBe(true)
    expect(salesData[0].status).toBe('recovered')
    expect(salesData[0].saleId).toBe('ABC123')
  })
})
