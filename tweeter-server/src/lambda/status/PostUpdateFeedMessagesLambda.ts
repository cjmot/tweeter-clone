import { SendMessageBatchCommand, SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import DAOFactory from '../../database/dao/DAOFactory';
import DynamoDAOFactory from '../../database/dynamoDB/DynamoDAOFactory';
import { PostStatusJob, QUEUE_MESSAGE_VERSION, UPDATE_FEED_JOB_TYPE } from '../../model/service/QueueMessages';

interface SqsRecord {
    body: string;
}

interface SqsEvent {
    Records: SqsRecord[];
}

const MAX_SQS_BATCH_ENTRIES = 10;
const RECIPIENTS_PER_UPDATE_FEED_MESSAGE = 25;
const DEFAULT_FOLLOWERS_PAGE_SIZE = 100;

const region = process.env.REGION ?? process.env.AWS_REGION ?? 'us-east-1';
const sqsClient = new SQSClient({ region });

export const handler = async (event: SqsEvent): Promise<void> => {
    const factory = new DynamoDAOFactory();

    for (const record of event.Records) {
        const job = parsePostStatusJob(record.body);
        await processPostStatusJob(job, factory);
    }
};

const processPostStatusJob = async (job: PostStatusJob, factory: DAOFactory): Promise<void> => {
    const followersPageSize = getFollowersPageSize();
    const followDao = factory.getFollowDao();
    const page = await followDao.getPageOfFollowers(job.authorAlias, followersPageSize, job.lastFollowerAlias);
    const recipientAliases = page.values.map((follow) => follow.follower_alias);

    if (recipientAliases.length > 0) {
        await enqueueUpdateFeedJobs(job, recipientAliases);
    }

    if (page.hasMorePages && page.lastKey) {
        await enqueueContinuationJob({
            ...job,
            lastFollowerAlias: page.lastKey,
        });
    }
};

const enqueueUpdateFeedJobs = async (job: PostStatusJob, recipientAliases: string[]): Promise<void> => {
    const updateFeedQueueUrl = process.env.UPDATE_FEED_QUEUE_URL;
    if (!updateFeedQueueUrl) {
        throw new Error('internal-server-error: UPDATE_FEED_QUEUE_URL is not configured');
    }

    const recipientChunks = chunk(recipientAliases, RECIPIENTS_PER_UPDATE_FEED_MESSAGE);
    const messageBodies = recipientChunks.map((aliases) =>
        JSON.stringify({
            type: UPDATE_FEED_JOB_TYPE,
            version: QUEUE_MESSAGE_VERSION,
            status: job.status,
            recipientAliases: aliases,
        })
    );

    const entryChunks = chunk(
        messageBodies.map((messageBody, index) => ({
            Id: `${index}`,
            MessageBody: messageBody,
        })),
        MAX_SQS_BATCH_ENTRIES
    );

    for (const entries of entryChunks) {
        const response = await sqsClient.send(
            new SendMessageBatchCommand({
                QueueUrl: updateFeedQueueUrl,
                Entries: entries,
            })
        );

        if ((response.Failed?.length ?? 0) > 0) {
            const failedIds = response.Failed?.map((failed) => failed.Id).join(', ');
            throw new Error(`internal-server-error: Failed to enqueue update feed jobs: ${failedIds ?? 'unknown failure'}`);
        }
    }
};

const enqueueContinuationJob = async (job: PostStatusJob): Promise<void> => {
    const postStatusQueueUrl = process.env.POST_STATUS_QUEUE_URL;
    if (!postStatusQueueUrl) {
        throw new Error('internal-server-error: POST_STATUS_QUEUE_URL is not configured');
    }

    await sqsClient.send(
        new SendMessageCommand({
            QueueUrl: postStatusQueueUrl,
            MessageBody: JSON.stringify(job),
        })
    );
};

const parsePostStatusJob = (json: string): PostStatusJob => {
    const parsed = JSON.parse(json) as Partial<PostStatusJob>;

    if (!parsed || typeof parsed !== 'object') {
        throw new Error('bad-request: Invalid SQS post status message payload');
    }
    if (typeof parsed.type !== 'string' || parsed.type !== 'post-status-job') {
        throw new Error('bad-request: Unexpected post status message type');
    }
    if (parsed.version !== QUEUE_MESSAGE_VERSION) {
        throw new Error('bad-request: Unsupported post status message version');
    }
    if (typeof parsed.authorAlias !== 'string' || parsed.authorAlias.length === 0) {
        throw new Error('bad-request: Missing author alias in post status message');
    }
    if (!parsed.status || typeof parsed.status !== 'object') {
        throw new Error('bad-request: Missing status in post status message');
    }

    return parsed as PostStatusJob;
};

const getFollowersPageSize = (): number => {
    const configuredValue = process.env.FOLLOWERS_PAGE_SIZE;
    if (!configuredValue) {
        return DEFAULT_FOLLOWERS_PAGE_SIZE;
    }

    const parsedValue = Number.parseInt(configuredValue, 10);
    if (Number.isNaN(parsedValue) || parsedValue <= 0) {
        return DEFAULT_FOLLOWERS_PAGE_SIZE;
    }

    return parsedValue;
};

function chunk<T>(items: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let index = 0; index < items.length; index += chunkSize) {
        chunks.push(items.slice(index, index + chunkSize));
    }

    return chunks;
}
