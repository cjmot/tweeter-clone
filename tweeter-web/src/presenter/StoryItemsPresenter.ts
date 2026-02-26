import { AuthToken, Status } from 'tweeter-shared';
import { StatusItemsPresenter } from './StatusItemsPresenter';
import { PAGE_SIZE } from './PagedItemPresenter';

export class StoryItemsPresenter extends StatusItemsPresenter {
    protected operationDescription(): string {
        return 'load story items';
    }

    protected getMoreItems(authToken: AuthToken, userAlias: string): Promise<[Status[], boolean]> {
        return this.service.loadMoreStoryItems(authToken, userAlias, PAGE_SIZE, this.lastItem);
    }
}
