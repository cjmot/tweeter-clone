import { StatusService } from "../model.service/StatusService";
import { UserService } from "../model.service/UserService";
import { AuthToken, User } from "tweeter-shared";
import { StatusItemsPresenter, StatusItemsView } from "./StatusItemsPresenter";

export const PAGE_SIZE = 10;

export class StoryItemsPresenter extends StatusItemsPresenter {
    private service: StatusService;
    private userService: UserService;

    public constructor(view: StatusItemsView) {
        super(view);
        this.service = new StatusService();
        this.userService = new UserService();
    }

    public async getUser(authToken: AuthToken, alias: string): Promise<User | null> {
        // TODO: Replace with the result of calling server
        return this.userService.getUser(authToken, alias);
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
