import { AuthToken, Status, StatusDto } from 'tweeter-shared';
import { Service } from './Service';

export class StatusService extends Service {
    constructor() {
        super();
    }

    public async loadMoreStoryItems(
        authToken: AuthToken,
        userAlias: string,
        pageSize: number,
        lastStoryItem: Status | null
    ): Promise<[Status[], boolean]> {
        const [storyItems, hasMore] = await this.serverFacade.getMoreStoryItems(
            authToken.token,
            userAlias,
            pageSize,
            lastStoryItem?.dto ?? null
        );
        return [this.toStatuses(storyItems), hasMore];
    }

    public async loadMoreFeedItems(
        authToken: AuthToken,
        userAlias: string,
        pageSize: number,
        lastFeedItem: Status | null
    ): Promise<[Status[], boolean]> {
        const [feedItems, hasMore] = await this.serverFacade.getMoreFeedItems(
            authToken.token,
            userAlias,
            pageSize,
            lastFeedItem?.dto ?? null
        );
        return [this.toStatuses(feedItems), hasMore];
    }

    public async postStatus(authToken: AuthToken, newStatus: Status): Promise<void> {
        await this.serverFacade.postStatus(authToken.token, newStatus.dto);
    }

    private toStatuses(dtos: StatusDto[]): Status[] {
        return dtos
            .map((dto) => Status.fromDto(dto))
            .filter((status): status is Status => status != null);
    }
}
