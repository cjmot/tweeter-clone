import { Presenter, View } from './Presenter';
import { AuthToken } from 'tweeter-shared';
import { Service } from '../model.service/Service';

export const PAGE_SIZE = 10;

export interface PagedItemView<T> extends View {
    addItems: (newItems: T[]) => void;
}

export abstract class PagedItemPresenter<T, U extends Service> extends Presenter<PagedItemView<T>> {
    private _lastItem: T | null = null;
    private _hasMoreItems: boolean = true;
    private _service: U;

    protected constructor(view: PagedItemView<T>) {
        super(view);
        this._service = this.serviceFactory();
    }

    protected abstract serviceFactory(): U;

    protected get service(): U {
        return this._service;
    }

    protected get lastItem() {
        return this._lastItem;
    }

    protected set lastItem(value: T | null) {
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

    public async loadMoreItems(authToken: AuthToken, userAlias: string) {
        this.doFailureReportingOperation(async () => {
            const [newItems, hasMore] = await this.getMoreItems(authToken, userAlias);

            this.hasMoreItems = hasMore;
            this.lastItem = newItems.length > 0 ? newItems[newItems.length - 1] : null;
            this.view.addItems(newItems);
        }, this.operationDescription());
    }

    protected abstract operationDescription(): string;

    protected abstract getMoreItems(authToken: AuthToken, userAlias: string): Promise<[T[], boolean]>;
}
