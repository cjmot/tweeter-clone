import { AuthToken, User } from "tweeter-shared";

export interface UserItemView {
    addItems: (items: User[]) => void;
    displayErrorMessage: (message: string) => void;
}

export abstract class UserItemPresenter {
    private readonly _view: UserItemView;
    private _lastItem: User | null = null;
    private _hasMoreItems: boolean = true;

    protected constructor(view: UserItemView) {
        this._view = view;
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

    reset() {
        this._lastItem = null;
        this._hasMoreItems = true;
    }
    public abstract loadMoreItems(authToken: AuthToken, userAlias: string): void;
    public abstract getUser(authToken: AuthToken, alias: string): Promise<User | null>;
}
