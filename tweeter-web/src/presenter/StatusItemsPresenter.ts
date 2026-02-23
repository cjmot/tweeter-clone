import { AuthToken, Status, User } from 'tweeter-shared';
import { UserService } from '../model.service/UserService';

export interface StatusItemsView {
    addItems: (items: Status[]) => void;
    displayErrorMessage: (message: string) => void;
}

export abstract class StatusItemsPresenter {
    private readonly _view: StatusItemsView;
    private _lastItem: Status | null = null;
    private _hasMoreItems: boolean = true;
    private userService: UserService;

    protected constructor(view: StatusItemsView) {
        this._view = view;
        this.userService = new UserService();
    }

    protected get view() {
        return this._view;
    }

    protected get lastItem() {
        return this._lastItem;
    }

    protected set lastItem(value: Status | null) {
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
    public abstract loadMoreItems(authToken: AuthToken, alias: string): void;
}
