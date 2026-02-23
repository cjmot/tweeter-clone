import { StatusService } from '../model.service/StatusService';
import { AuthToken } from 'tweeter-shared';
import { StatusItemsPresenter, StatusItemsView } from './StatusItemsPresenter';

export const PAGE_SIZE = 10;

export class StoryItemsPresenter extends StatusItemsPresenter {
    private service: StatusService;

    public constructor(view: StatusItemsView) {
        super(view);
        this.service = new StatusService();
    }

    loadMoreItems = async (authToken: AuthToken, userAlias: string) => {
        try {
            const [newItems, hasMore] = await this.service.loadMoreStoryItems(
                authToken,
                userAlias,
                PAGE_SIZE,
                this.lastItem
            );

            this.hasMoreItems = hasMore;
            this.lastItem = newItems.length > 0 ? newItems[newItems.length - 1] : null;
            this.view.addItems(newItems);
        } catch (error) {
            this.view.displayErrorMessage(`Failed to load story items because of exception: ${error}`);
        }
    };
}
