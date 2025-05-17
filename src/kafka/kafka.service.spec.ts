import { KafkaService } from './kafka.service';

jest.mock('kafkajs', () => {
  const sendMock = jest.fn();
  const connectMock = jest.fn();
  const disconnectMock = jest.fn();
  const listTopicsMock = jest.fn();
  const createTopicsMock = jest.fn();

  const producer = {
    connect: connectMock,
    disconnect: disconnectMock,
    send: sendMock,
  };

  const admin = {
    connect: connectMock,
    disconnect: disconnectMock,
    listTopics: listTopicsMock,
    createTopics: createTopicsMock,
  };

  return {
    Kafka: jest.fn(() => ({
      producer: () => producer,
      admin: () => admin,
    })),
  };
});

describe('KafkaService', () => {
  let kafkaService: KafkaService;

  beforeEach(() => {
    jest.clearAllMocks();
    kafkaService = new KafkaService();
  });

  it('should connect producer and create topics on module init', async () => {
    const expectedTopics = ['order_created', 'order_status_updated'];
    const mockedAdmin = (kafkaService as any).kafka.admin();
    mockedAdmin.listTopics.mockResolvedValue(['some_other_topic']);

    await kafkaService.onModuleInit();

    expect(mockedAdmin.connect).toHaveBeenCalled();
    expect(mockedAdmin.createTopics).toHaveBeenCalledWith({
      topics: expectedTopics.map((topic) => ({
        topic,
        numPartitions: 1,
        replicationFactor: 1,
      })),
    });
    expect(mockedAdmin.disconnect).toHaveBeenCalled();
  });

  it('should not create topics if they already exist', async () => {
    const mockedAdmin = (kafkaService as any).kafka.admin();
    mockedAdmin.listTopics.mockResolvedValue([
      'order_created',
      'order_status_updated',
    ]);

    await kafkaService.onModuleInit();

    expect(mockedAdmin.createTopics).not.toHaveBeenCalled();
  });

  it('should emit a message', async () => {
    const topic = 'order_created';
    const message = { id: 1, status: 'pending' };
    const mockedProducer = (kafkaService as any).producer;

    await kafkaService.emit(topic, message);

    expect(mockedProducer.send).toHaveBeenCalledWith({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
  });

  it('should disconnect the producer on module destroy', async () => {
    const mockedProducer = (kafkaService as any).producer;

    await kafkaService.onModuleDestroy();

    expect(mockedProducer.disconnect).toHaveBeenCalled();
  });
});
