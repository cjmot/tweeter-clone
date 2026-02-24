import { AuthToken, Status, User } from 'tweeter-shared';
import { UserService } from '../model.service/UserService';
import { Presenter, View } from './Presenter';

export interface StatusItemsView extends View {
    addItems: (items: Status[]) => void;
}

export abstract class StatusItemsPresenter extends Presenter<StatusItemsView> {
    private _lastItem: Status | null = null;
    private _hasMoreItems: boolean = true;
    private userService: UserService;

    protected constructor(view: StatusItemsView) {
        super(view);
        this.userService = new UserService();
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
        return this.userService.getUser(authToken, alias);
    }

    reset() {
        this._lastItem = null;
        this._hasMoreItems = true;
    }
    public abstract loadMoreItems(authToken: AuthToken, alias: string): void;
}
