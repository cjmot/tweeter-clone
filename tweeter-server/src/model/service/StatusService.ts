import { FakeData, Status, StatusDto } from 'tweeter-shared';

export class StatusService {
    public async loadMoreStoryItems(
        token: string,
        userAlias: string,
        pageSize: number,
        lastStoryItem: StatusDto | null
    ): Promise<[StatusDto[], boolean]> {
        // TODO: Replace with the result of calling DB
        return this.getFakeData(lastStoryItem, pageSize);
    }

    public async loadMoreFeedItems(
        token: string,
        userAlias: string,
        pageSize: number,
        lastFeedItem: StatusDto | null
    ): Promise<[StatusDto[], boolean]> {
        // TODO: Replace with the result of calling DB
        return this.getFakeData(lastFeedItem, pageSize);
    }

    public async postStatus(token: string, newStatus: StatusDto): Promise<void> {
        // Pause so we can see the posting message. Remove when connected to the DB
        await new Promise((f) => setTimeout(f, 2000));

        // TODO: Call the DB to post the status
    }

    private async getFakeData(lastItem: StatusDto | null, pageSize: number): Promise<[StatusDto[], boolean]> {
        const lastStatus = Status.fromDto(lastItem);

        const [statuses, hasMore] = FakeData.instance.getPageOfStatuses(lastStatus, pageSize);
        return [statuses.map((status) => status.dto), hasMore];
    }
}
