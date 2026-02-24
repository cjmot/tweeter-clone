import { AuthToken } from 'tweeter-shared';
import { StatusItemsPresenter, StatusItemsView } from './StatusItemsPresenter';
import { StatusService } from '../model.service/StatusService';

export const PAGE_SIZE = 10;

export class FeedItemsPresenter extends StatusItemsPresenter {
    private statusService: StatusService;

    public constructor(view: StatusItemsView) {
        super(view);
        this.statusService = new StatusService();
    }

    loadMoreItems = async (authToken: AuthToken, userAlias: string) => {
        this.doFailureReportingOperation(async () => {
            const [newItems, hasMore] = await this.statusService.loadMoreFeedItems(
                authToken,
                userAlias,
                PAGE_SIZE,
                this.lastItem
            );

            this.hasMoreItems = hasMore;
            this.lastItem = newItems.length > 0 ? newItems[newItems.length - 1] : null;
            this.view.addItems(newItems);
        }, 'load followees');
    };
}
