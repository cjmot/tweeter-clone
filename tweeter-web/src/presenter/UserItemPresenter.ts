import { AuthToken, User } from "tweeter-shared";
import { UserService } from "../model.service/UserService";

export interface UserItemView {
    addItems: (items: User[]) => void;
    displayErrorMessage: (message: string) => void;
}

export abstract class UserItemPresenter {
    private readonly _view: UserItemView;
    private _lastItem: User | null = null;
    private _hasMoreItems: boolean = true;
    private userService: UserService;

    protected constructor(view: UserItemView) {
        this._view = view;
        this.userService = new UserService();
    }

    protected get view() {
        return this._view;
    }

    protected get lastItem() {
        return this._lastItem;
    }

    protected set lastItem(value: User | null) {
        this._lastItem = value;
    }

    public get hasMoreItems() {
        return this._hasMoreItems;
    }

    protected set hasMoreItems(value: boolean) {
        this._hasMoreItems = value;
    }

    public async getUser(authToken: AuthToken, alias: string): Promise<User | null> {
        // TODO: Replace with the result of calling server
        return this.userService.getUser(authToken, alias);
    }

    reset() {
        this._lastItem = null;
        this._hasMoreItems = true;
    }
    public abstract loadMoreItems(authToken: AuthToken, userAlias: string): void;
}
