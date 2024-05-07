export interface QueueInterface {
  sendMessage: (queueName: string, message: string) => Promise<boolean>
  receiveMessage: (queueUrl: string) => Promise<any>
}
