import { SendMessageRequest, ReceiveMessageCommand, SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs'
import { QueueInterface } from './queue.interface'
import constants from '../shared/constants'

export class AwsSqsAdapter implements QueueInterface {
  private readonly client: SQSClient

  constructor() {
    this.client = this.getClient()
  }

  async sendMessage(queueName: string, message: string): Promise<boolean> {
    const input: SendMessageRequest = {
      QueueUrl: queueName,
      MessageBody: message,
      MessageGroupId: constants.MESSAGE_GROUP_ID,
      MessageDeduplicationId: constants.MESSAGE_DUPLICATION_ID
    }

    const command = new SendMessageCommand(input)
    const sendMessage = await this.client.send(command)

    return !!sendMessage
  }

  async receiveMessage(queueUrl: string): Promise<any> {
    console.log('Recebendo mensagem da fila SQS...')
    console.log('Fila:', queueUrl)
    const command = new ReceiveMessageCommand({
      QueueUrl: queueUrl,
      MaxNumberOfMessages: 10
    })
    const result = this.client.send(command)
    console.log('Comando:', result)
    return result
  }

  async publishPaymentResult(queueName: string, orderNumber: string, paymentResult: boolean): Promise<boolean> {
    const message = JSON.stringify({ orderNumber, paymentResult })
    return await this.sendMessage(queueName, message)
  }

  private getClient(): SQSClient {
    return new SQSClient({
      endpoint: 'http://172.17.0.2:4566',
      region: 'us-east-1',
      credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test'
      }
    })
  }
}
