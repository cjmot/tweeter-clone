import { FollowService } from "../model.service/FollowService";
import { UserService } from "../model.service/UserService";
import { AuthToken, User } from "tweeter-shared";
import { UserItemPresenter, UserItemView } from "./UserItemPresenter";

export const PAGE_SIZE = 10;

export class FolloweePresenter extends UserItemPresenter {
    private service: FollowService;
    private userService: UserService;

    public constructor(view: UserItemView) {
        super(view);
        this.service = new FollowService();
        this.userService = new UserService();
    }

    public async getUser(authToken: AuthToken, alias: string): Promise<User | null> {
        // TODO: Replace with the result of calling server
        return this.userService.getUser(authToken, alias);
    }

    loadMoreItems = async (authToken: AuthToken, userAlias: string) => {
        try {
            const [newItems, hasMore] = await this.service.loadMoreFollowees(
                authToken,
                userAlias,
                PAGE_SIZE,
                this.lastItem
            );

            this.hasMoreItems = hasMore;
            this.lastItem = newItems.length > 0 ? newItems[newItems.length - 1] : null;
            this.view.addItems(newItems);
        } catch (error) {
            this.view.displayErrorMessage(
                `Failed to load followees because of exception: ${error}`
            );
        }
    };
}
