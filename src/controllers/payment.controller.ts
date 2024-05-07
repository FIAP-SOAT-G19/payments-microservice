import { Request, Response } from 'express'
import PaymentUseCase from '../usecases/payment/payment.usecase'

class PaymentController {
  private readonly paymentUseCase: PaymentUseCase

  constructor(paymentUseCase: PaymentUseCase) {
    this.paymentUseCase = paymentUseCase
  }

  public async handleSQSMessage(req: Request, res: Response): Promise<void> {
    try {
      // const { orderNumber, cardId } = req.body
      // if (!orderNumber || !cardId) {
      //   res.status(400).send('Parâmetros inválidos.')
      //   return
      // }
      await this.paymentUseCase.consumeSQSMessages()
      res.status(200).send('Mensagem processada com sucesso.')
    } catch (error) {
      console.error('Erro ao processar mensagem SQS:', error)
      res.status(500).send('Erro ao processar mensagem SQS.')
    }
  }
}

export default PaymentController
