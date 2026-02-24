import { StatusService } from '../model.service/StatusService';
import { AuthToken } from 'tweeter-shared';
import { StatusItemsPresenter, StatusItemsView } from './StatusItemsPresenter';

export const PAGE_SIZE = 10;

export class StoryItemsPresenter extends StatusItemsPresenter {
    private statusService: StatusService;

    public constructor(view: StatusItemsView) {
        super(view);
        this.statusService = new StatusService();
    }

    loadMoreItems = async (authToken: AuthToken, userAlias: string) => {
        this.doFailureReportingOperation(async () => {
            const [newItems, hasMore] = await this.statusService.loadMoreStoryItems(
                authToken,
                userAlias,
                PAGE_SIZE,
                this.lastItem
            );

            this.hasMoreItems = hasMore;
            this.lastItem = newItems.length > 0 ? newItems[newItems.length - 1] : null;
            this.view.addItems(newItems);
        }, 'load story items');
    };
}
