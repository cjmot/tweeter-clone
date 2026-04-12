import DAOFactory from '../../database/dao/DAOFactory';
import DynamoDAOFactory from '../../database/dynamoDB/DynamoDAOFactory';
import { QUEUE_MESSAGE_VERSION, UPDATE_FEED_JOB_TYPE, UpdateFeedJob } from '../../model/service/QueueMessages';

interface SqsRecord {
    body: string;
}

interface SqsEvent {
    Records: SqsRecord[];
}

export const handler = async (event: SqsEvent): Promise<void> => {
    const factory = new DynamoDAOFactory();

    for (const record of event.Records) {
        const job = parseUpdateFeedJob(record.body);
        await processUpdateFeedJob(job, factory);
    }
};

const processUpdateFeedJob = async (job: UpdateFeedJob, factory: DAOFactory): Promise<void> => {
    const feedDao = factory.getFeedDao();
    await feedDao.batchPutFeedStatuses(job.recipientAliases, job.status);
};

const parseUpdateFeedJob = (json: string): UpdateFeedJob => {
    const parsed = JSON.parse(json) as Partial<UpdateFeedJob>;

    if (!parsed || typeof parsed !== 'object') {
        throw new Error('bad-request: Invalid SQS update feed message payload');
    }
    if (typeof parsed.type !== 'string' || parsed.type !== UPDATE_FEED_JOB_TYPE) {
        throw new Error('bad-request: Unexpected update feed message type');
    }
    if (parsed.version !== QUEUE_MESSAGE_VERSION) {
        throw new Error('bad-request: Unsupported update feed message version');
    }
    if (!Array.isArray(parsed.recipientAliases)) {
        throw new Error('bad-request: Missing recipient aliases for update feed message');
    }
    if (!parsed.status || typeof parsed.status !== 'object') {
        throw new Error('bad-request: Missing status for update feed message');
    }

    return parsed as UpdateFeedJob;
};
