import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly kafka = new Kafka({
    clientId: 'orders-service',
    brokers: [process.env.KAFKA_BROKER || 'kafka:9092'],
  });

  private readonly producer: Producer = this.kafka.producer();

  async onModuleInit() {
    try {
      await this.producer.connect();

      const admin = this.kafka.admin();
      await admin.connect();

      try {
        const topicsToCreate = ['order_created', 'order_status_updated'];
        const existingTopics = await admin.listTopics();

        const topics = topicsToCreate
          .filter((topic) => !existingTopics.includes(topic))
          .map((topic) => ({
            topic,
            numPartitions: 1,
            replicationFactor: 1,
          }));

        if (topics.length > 0) {
          await admin.createTopics({ topics });
        }
      } finally {
        await admin.disconnect();
      }

      console.log('KafkaService inicializado com sucesso.');
    } catch (error) {
      console.error('Erro ao inicializar KafkaService:', error);
    }
  }

  async emit(topic: string, message: any) {
    try {
      await this.producer.send({
        topic,
        messages: [{ value: JSON.stringify(message) }],
      });
      console.log(
        `Mensagem enviada para o tópico ${topic}:`,
        JSON.stringify(message),
      );
    } catch (error) {
      console.error(`Erro ao emitir mensagem para o tópico ${topic}:`, error);
    }
  }

  async onModuleDestroy() {
    try {
      await this.producer.disconnect();
      console.log('Producer Kafka desconectado.');
    } catch (error) {
      console.error('Erro ao desconectar o Producer do Kafka:', error);
    }
  }
}
