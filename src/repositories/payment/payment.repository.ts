import { PrismaClient, Payment } from '@prisma/client'
import { PaymentInput } from '../repository.interface'
import { v4 as uuidv4 } from 'uuid'

export class PaymentRepository {
  private readonly prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  public async createPayment(input: PaymentInput): Promise<Payment> {
    return await this.prisma.payment.create({
      data: {
        id: uuidv4(),
        orderNumber: input.orderNumber,
        status: input.status,
        reason: input.reason,
        createdAt: new Date()
      }
    })
  }
}
