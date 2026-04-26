import { StatusDto } from 'tweeter-shared';
import DAOFactory from '../../database/dao/DAOFactory';
import DynamoDAOFactory from '../../database/dynamoDB/DynamoDAOFactory';
import { AuthGuard } from './AuthGuard';
import FeedDAO from '../../database/dao/FeedDAO';
import StatusDAO from '../../database/dao/StatusDAO';
import QueueDAO from '../../database/dao/QueueDAO';
import { PostStatusJob, POST_STATUS_JOB_TYPE, QUEUE_MESSAGE_VERSION } from './QueueMessages';

export class StatusService {
    private authGuard: AuthGuard;
    private feedDao: FeedDAO;
    private statusDao: StatusDAO;
    private queueDao: QueueDAO;

    public constructor(factory: DAOFactory = new DynamoDAOFactory()) {
        this.authGuard = new AuthGuard(factory);
        this.feedDao = factory.getFeedDao();
        this.statusDao = factory.getStatusDao();
        this.queueDao = factory.getQueueDao();
    }

    public async loadMoreStoryItems(
        token: string,
        userAlias: string,
        pageSize: number,
        lastStoryItem: StatusDto | null
    ): Promise<[StatusDto[], boolean]> {
        await this.authGuard.verifySession(token);
        const normalizedAlias = userAlias.startsWith('@') ? userAlias : `@${userAlias}`;
        const page = await this.statusDao.getPageOfStories(normalizedAlias, pageSize, lastStoryItem?.timestamp);
        return [page.values, page.hasMorePages];
    }

    public async loadMoreFeedItems(
        token: string,
        userAlias: string,
        pageSize: number,
        lastFeedItem: StatusDto | null
    ): Promise<[StatusDto[], boolean]> {
        await this.authGuard.verifySession(token);
        const normalizedAlias = userAlias.startsWith('@') ? userAlias : `@${userAlias}`;
        const page = await this.feedDao.getPageOfFeedStatuses(normalizedAlias, pageSize, lastFeedItem?.timestamp);
        return [page.values, page.hasMorePages];
    }

    public async postStatus(token: string, newStatus: StatusDto): Promise<void> {
        const session = await this.authGuard.verifySession(token);
        const authorAlias = session.alias.startsWith('@') ? session.alias : `@${session.alias}`;
        const statusToPersist: StatusDto = {
            ...newStatus,
            user: {
                ...newStatus.user,
                alias: authorAlias,
            },
        };

        await this.statusDao.putStatus(statusToPersist);
        await this.enqueuePostStatusJob(authorAlias, statusToPersist);
    }

    private async enqueuePostStatusJob(authorAlias: string, status: StatusDto): Promise<void> {
        const message: PostStatusJob = {
            type: POST_STATUS_JOB_TYPE,
            version: QUEUE_MESSAGE_VERSION,
            authorAlias,
            status,
            continuationDepth: 0,
        };

        await this.queueDao.enqueuePostStatusJob(message);
    }
}
