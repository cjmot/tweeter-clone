import { StatusDto } from 'tweeter-shared';
import DAOFactory from '../../database/dao/DAOFactory';
import FeedDAO from '../../database/dao/FeedDAO';
import DynamoDAOFactory from '../../database/dynamoDB/DynamoDAOFactory';
import { AuthGuard } from './AuthGuard';

export class FeedService {
    private authGuard: AuthGuard;
    private feedDao: FeedDAO;

    public constructor(factory: DAOFactory = new DynamoDAOFactory()) {
        this.authGuard = new AuthGuard(factory);
        this.feedDao = factory.getFeedDao();
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
}
