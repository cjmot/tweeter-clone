import { FollowService } from '../model.service/FollowService';
import { AuthToken } from 'tweeter-shared';
import { UserItemPresenter, UserItemView } from './UserItemPresenter';

export const PAGE_SIZE = 10;

export class FolloweePresenter extends UserItemPresenter {
    private followService: FollowService;

    public constructor(view: UserItemView) {
        super(view);
        this.followService = new FollowService();
    }

    loadMoreItems = async (authToken: AuthToken, userAlias: string) => {
        this.doFailureReportingOperation(async () => {
            const [newItems, hasMore] = await this.followService.loadMoreFollowees(
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
