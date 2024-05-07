import { PaymentRepository } from '../../repositories/payment/payment.repository'
import { AwsSqsAdapter } from '../../queue/aws-sqs.adapter'
import { ProcessPayment } from '../usecase.interface'

class PaymentUseCase {
  private readonly paymentRepository: PaymentRepository
  private readonly sqsAdapter: AwsSqsAdapter

  constructor(paymentRepository: PaymentRepository, sqsAdapter: AwsSqsAdapter) {
    this.paymentRepository = paymentRepository
    this.sqsAdapter = sqsAdapter
  }

  public async consumeSQSMessages(): Promise<void> {
    const queueUrl = 'http://172.17.0.2:4566/000000000000/created_payment'

    // Recebe uma mensagem da fila SQS
    const message = await this.sqsAdapter.receiveMessage(queueUrl)
    console.log('Mensagem recebida:', message)

    // Se não houver mensagem, interrompe o loop
    if (!message) {
      return
    }

    // Extrai o número do pedido e o ID do cartão da mensagem
    const { orderNumber, cardId } = JSON.parse(message.Body as string)

    // Processa a mensagem
    await this.processSQSMessage(orderNumber as string, cardId as string)

    // Remove a mensagem da fila para evitar o reprocessamento
    // await this.sqsAdapter.deleteMessage(queueUrl, message.ReceiptHandle)
  }

  public async processSQSMessage(orderNumber: string, cardId: string): Promise<void> {
    try {
      // 1. Chamada ao microsserviço card_encryptor para obter os dados do cartão
      const cardData = await this.callCardEncryptor(cardId)

      // 2. Decrypta os dados do cartão
      const decryptedCardData = this.decryptCardData(cardData)

      // 3. Processa o pagamento
      const paymentResult = this.processPayment(decryptedCardData)

      // 4. Persiste o resultado no banco de dados e publica na fila SQS
      await this.persistAndPublishPaymentResult(orderNumber, paymentResult)
    } catch (error) {
      console.error('Erro ao processar mensagem SQS:', error)
      throw error
    }
  }

  private async callCardEncryptor(cardId: string): Promise<string> {
    return 'DADOS_DO_CARTAO'
    // Implemente a lógica para chamar o microsserviço card_encryptor e obter os dados do cartão
  }

  private decryptCardData(cardData: string): string {
    return '4001 2345 6789 0123'
  }

  private processPayment(cardData: string): ProcessPayment {
    return {
      accept: true
    }
  }

  private async persistAndPublishPaymentResult(orderNumber: string, paymentResult: ProcessPayment): Promise<void> {
    try {
      // Persiste o resultado no banco de dados
      const paymentInput = {
        orderNumber,
        status: paymentResult.accept,
        reason: paymentResult.reason
      }

      await this.paymentRepository.createPayment(paymentInput)

      // Publica o resultado na fila SQS
      const resultQueueUrl = 'http://172.17.0.2:4566/000000000000/appoved_payment' // Defina a URL da fila de resultados correta
      await this.sqsAdapter.publishPaymentResult(resultQueueUrl, orderNumber, paymentResult.accept)
    } catch (error) {
      console.error('Erro ao persistir e publicar o resultado do pagamento:', error)
      throw error
    }
  }
}

export default PaymentUseCase
