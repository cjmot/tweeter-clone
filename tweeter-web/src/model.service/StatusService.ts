import { AuthToken, FakeData, Status } from "tweeter-shared";

export class StatusService {
    public async loadMoreStoryItems(
        authToken: AuthToken,
        userAlias: string,
        pageSize: number,
        lastStoryItem: Status | null
    ): Promise<[Status[], boolean]> {
        // TODO: Replace with the result of calling server
        return FakeData.instance.getPageOfStatuses(lastStoryItem, pageSize);
    }

    public async loadMoreFeedItems(
        authToken: AuthToken,
        userAlias: string,
        pageSize: number,
        lastFeedItem: Status | null
    ): Promise<[Status[], boolean]> {
        // TODO: Replace with the result of calling server
        return FakeData.instance.getPageOfStatuses(lastFeedItem, pageSize);
    }

    public async postStatus(authToken: AuthToken, newStatus: Status): Promise<void> {
        // Pause so we can see the posting message. Remove when connected to the server
        await new Promise((f) => setTimeout(f, 2000));

        // TODO: Call the server to post the status
    }
}
