import { AuthToken, Status, User } from "tweeter-shared";

export interface StatusItemsView {
    addItems: (items: Status[]) => void;
    displayErrorMessage: (message: string) => void;
}

export abstract class StatusItemsPresenter {
    private readonly _view: StatusItemsView;
    private _lastItem: Status | null = null;
    private _hasMoreItems: boolean = true;

    protected constructor(view: StatusItemsView) {
        this._view = view;
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

    reset() {
        this._lastItem = null;
        this._hasMoreItems = true;
    }
    public abstract loadMoreItems(authToken: AuthToken, alias: string): void;
    public abstract getUser(authToken: AuthToken, alias: string): Promise<User | null>;
}
