import { FakeData, Status, StatusDto, User } from 'tweeter-shared';

export class StatusService {
    public async loadMoreStoryItems(
        authToken: string,
        userAlias: string,
        pageSize: number,
        lastStoryItem: StatusDto | null
    ): Promise<[StatusDto[], boolean]> {
        // TODO: Replace with the result of calling server
        return this.getFakeData(lastStoryItem, pageSize);
    }

    public async loadMoreFeedItems(
        authToken: string,
        userAlias: string,
        pageSize: number,
        lastFeedItem: StatusDto | null
    ): Promise<[StatusDto[], boolean]> {
        // TODO: Replace with the result of calling server
        return this.getFakeData(lastFeedItem, pageSize);
    }

    public async postStatus(authToken: string, newStatus: StatusDto): Promise<void> {
        // Pause so we can see the posting message. Remove when connected to the server
        await new Promise((f) => setTimeout(f, 2000));

        // TODO: Call the server to post the status
    }

    private async getFakeData(lastItem: StatusDto | null, pageSize: number): Promise<[StatusDto[], boolean]> {
        const lastStatus =
            lastItem == null
                ? null
                : new Status(
                      lastItem.post,
                      new User(
                          lastItem.user.firstName,
                          lastItem.user.lastName,
                          lastItem.user.alias,
                          lastItem.user.imageUrl
                      ),
                      lastItem.timestamp
                  );

        const [statuses, hasMore] = FakeData.instance.getPageOfStatuses(lastStatus, pageSize);
        return [
            statuses.map((status) => ({
                post: status.post,
                user: status.user.dto,
                timestamp: status.timestamp,
            })),
            hasMore,
        ];
    }
}
