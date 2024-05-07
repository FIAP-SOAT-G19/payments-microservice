import { Router } from 'express'
import PaymentController from '../controllers/payment.controller'
import { PaymentRepository } from '../repositories/payment/payment.repository'
import { AwsSqsAdapter } from '../queue/aws-sqs.adapter'
import PaymentUseCase from '@/usecases/payment/payment.usecase'
import { PrismaClient } from '@prisma/client'

const router = Router()

const sqsAdapter = new AwsSqsAdapter()
const prismaClient = new PrismaClient()
const paymentRepository = new PaymentRepository(prismaClient)
const paymentUseCase = new PaymentUseCase(paymentRepository, sqsAdapter)
const paymentController = new PaymentController(paymentUseCase)

router.get('/process', async (req, res) => {
  await paymentController.handleSQSMessage(req, res)
})

export { router }
