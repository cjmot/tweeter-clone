import DAOFactory from '../../database/dao/DAOFactory';
import QueueDAO from '../../database/dao/QueueDAO';
import DynamoDAOFactory from '../../database/dynamoDB/DynamoDAOFactory';
import { PostStatusJob, QUEUE_MESSAGE_VERSION, UPDATE_FEED_JOB_TYPE, UpdateFeedJob } from '../../model/service/QueueMessages';

interface SqsRecord {
    body: string;
}

interface SqsEvent {
    Records: SqsRecord[];
}

interface LambdaContext {
    getRemainingTimeInMillis?: () => number;
}

const RECIPIENTS_PER_UPDATE_FEED_MESSAGE = 100;
const DEFAULT_FOLLOWERS_PAGE_SIZE = 100;
const DEFAULT_MAX_PAGES_PER_INVOCATION = 25;
const DEFAULT_MAX_CONTINUATION_DEPTH = 500;
const REMAINING_TIME_BUFFER_MS = 10_000;

export const handler = async (event: SqsEvent, context?: LambdaContext): Promise<void> => {
    const factory = new DynamoDAOFactory();
    const queueDao = factory.getQueueDao();

    for (const record of event.Records) {
        try {
            const job = parsePostStatusJob(record.body);
            await processPostStatusJob(job, factory, queueDao, context);
        } catch (error) {
            console.error('postUpdateFeedMessagesHandler failed', error);
            throw error;
        }
    }
};

const processPostStatusJob = async (
    job: PostStatusJob,
    factory: DAOFactory,
    queueDao: QueueDAO,
    context?: LambdaContext
): Promise<void> => {
    const currentDepth = job.continuationDepth ?? 0;
    const maxContinuationDepth = getMaxContinuationDepth();
    if (currentDepth > maxContinuationDepth) {
        throw new Error('internal-server-error: Max continuation depth exceeded');
    }

    const followersPageSize = getFollowersPageSize();
    const maxPagesPerInvocation = getMaxPagesPerInvocation();
    const followDao = factory.getFollowDao();
    let lastFollowerAlias = job.lastFollowerAlias;
    let hasMorePages = true;

    for (let pagesProcessed = 0; hasMorePages && pagesProcessed < maxPagesPerInvocation; pagesProcessed++) {
        const page = await followDao.getPageOfFollowers(job.authorAlias, followersPageSize, lastFollowerAlias);
        const recipientAliases = page.values.map((follow) => follow.follower_alias);

        if (recipientAliases.length > 0) {
            await enqueueUpdateFeedJobs(job, recipientAliases, queueDao);
        }

        if (page.hasMorePages && !page.lastKey) {
            throw new Error('internal-server-error: Missing continuation key for paged followers');
        }
        if (page.hasMorePages && page.lastKey === lastFollowerAlias) {
            throw new Error('internal-server-error: Pagination did not advance');
        }

        hasMorePages = page.hasMorePages;
        lastFollowerAlias = page.lastKey;

        if (hasMorePages && !hasTimeForAnotherPage(context)) {
            break;
        }
    }

    if (hasMorePages && lastFollowerAlias) {
        await enqueueContinuationJob(
            {
                ...job,
                lastFollowerAlias,
                continuationDepth: currentDepth + 1,
            },
            queueDao
        );
    }
};

const enqueueUpdateFeedJobs = async (job: PostStatusJob, recipientAliases: string[], queueDao: QueueDAO): Promise<void> => {
    const recipientChunks = chunk(recipientAliases, RECIPIENTS_PER_UPDATE_FEED_MESSAGE);
    const jobs: UpdateFeedJob[] = recipientChunks.map((aliases) => ({
            type: UPDATE_FEED_JOB_TYPE,
            version: QUEUE_MESSAGE_VERSION,
            status: job.status,
            recipientAliases: aliases,
        }));

    await queueDao.enqueueUpdateFeedJobs(jobs);
};

const enqueueContinuationJob = async (job: PostStatusJob, queueDao: QueueDAO): Promise<void> => {
    await queueDao.enqueuePostStatusJob(job);
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
    if (
        parsed.continuationDepth !== undefined &&
        (!Number.isInteger(parsed.continuationDepth) || parsed.continuationDepth < 0)
    ) {
        throw new Error('bad-request: Invalid continuation depth in post status message');
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

const getMaxPagesPerInvocation = (): number => {
    const configuredValue = process.env.MAX_PAGES_PER_INVOCATION;
    if (!configuredValue) {
        return DEFAULT_MAX_PAGES_PER_INVOCATION;
    }

    const parsedValue = Number.parseInt(configuredValue, 10);
    if (Number.isNaN(parsedValue) || parsedValue <= 0) {
        return DEFAULT_MAX_PAGES_PER_INVOCATION;
    }

    return parsedValue;
};

const getMaxContinuationDepth = (): number => {
    const configuredValue = process.env.MAX_CONTINUATION_DEPTH;
    if (!configuredValue) {
        return DEFAULT_MAX_CONTINUATION_DEPTH;
    }

    const parsedValue = Number.parseInt(configuredValue, 10);
    if (Number.isNaN(parsedValue) || parsedValue < 0) {
        return DEFAULT_MAX_CONTINUATION_DEPTH;
    }

    return parsedValue;
};

const hasTimeForAnotherPage = (context?: LambdaContext): boolean => {
    if (!context?.getRemainingTimeInMillis) {
        return true;
    }

    return context.getRemainingTimeInMillis() > REMAINING_TIME_BUFFER_MS;
};

function chunk<T>(items: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let index = 0; index < items.length; index += chunkSize) {
        chunks.push(items.slice(index, index + chunkSize));
    }

    return chunks;
}
