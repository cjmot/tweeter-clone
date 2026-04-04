import { FakeData, Status, StatusDto } from 'tweeter-shared';
import DAOFactory from '../../database/dao/DAOFactory';
import DynamoDAOFactory from '../../database/dynamoDB/DynamoDAOFactory';
import { AuthGuard } from './AuthGuard';
import StatusDAO from '../../database/dao/StatusDAO';

export class StatusService {
    private authGuard: AuthGuard;
    private statusDao: StatusDAO;

    public constructor(factory: DAOFactory = new DynamoDAOFactory()) {
        this.authGuard = new AuthGuard(factory);
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
        // TODO: Replace with the result of calling DB
        return this.getFakeData(lastFeedItem, pageSize);
    }

    public async postStatus(token: string, newStatus: StatusDto): Promise<void> {
        await this.authGuard.verifySession(token);
        // Pause so we can see the posting message. Remove when connected to the DB
        await this.statusDao.putStatus(newStatus);
    }

    private async getFakeData(lastItem: StatusDto | null, pageSize: number): Promise<[StatusDto[], boolean]> {
        const lastStatus = Status.fromDto(lastItem);

        const [statuses, hasMore] = FakeData.instance.getPageOfStatuses(lastStatus, pageSize);
        return [statuses.map((status) => status.dto), hasMore];
    }
}
