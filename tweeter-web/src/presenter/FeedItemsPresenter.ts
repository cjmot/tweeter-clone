import { AuthToken, Status } from 'tweeter-shared';
import { StatusItemsPresenter } from './StatusItemsPresenter';
import { PAGE_SIZE } from './PagedItemPresenter';

export class FeedItemsPresenter extends StatusItemsPresenter {
    protected operationDescription(): string {
        return 'load feed items';
    }

    protected getMoreItems(authToken: AuthToken, userAlias: string): Promise<[Status[], boolean]> {
        return this.service.loadMoreFeedItems(authToken, userAlias, PAGE_SIZE, this.lastItem);
    }
}
