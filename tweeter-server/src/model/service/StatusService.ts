import { StatusDto } from 'tweeter-shared';
import DAOFactory from '../../database/dao/DAOFactory';
import DynamoDAOFactory from '../../database/dynamoDB/DynamoDAOFactory';
import { AuthGuard } from './AuthGuard';
import FeedDAO from '../../database/dao/FeedDAO';
import FollowDAO from '../../database/dao/FollowDAO';
import StatusDAO from '../../database/dao/StatusDAO';

export class StatusService {
    private authGuard: AuthGuard;
    private feedDao: FeedDAO;
    private followDao: FollowDAO;
    private statusDao: StatusDAO;

    public constructor(factory: DAOFactory = new DynamoDAOFactory()) {
        this.authGuard = new AuthGuard(factory);
        this.feedDao = factory.getFeedDao();
        this.followDao = factory.getFollowDao();
        this.statusDao = factory.getStatusDao();
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

        const followers = await this.followDao.getFollowersForFollowee(authorAlias);
        const recipientAliases = followers.map((follow) => follow.follower_alias);
        await this.feedDao.batchPutFeedStatuses(recipientAliases, statusToPersist);
    }
}
