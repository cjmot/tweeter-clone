import { ReactNode, useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { PagedItemPresenter, PagedItemView } from '../../presenter/PagedItemPresenter';
import { useParams } from 'react-router-dom';
import { useUserInfo, useUserInfoActions } from '../userInfo/UserHooks';
import { useMessageActions } from '../toaster/MessageHooks';

interface Props<T, P extends PagedItemPresenter<T, any>> {
    itemDescription: string;
    presenterFactory: (view: PagedItemView<T>) => P;
    renderItem: (item: T, index: number) => ReactNode;
}

export function ItemScroller<T, P extends PagedItemPresenter<T, any>>(props: Props<T, P>) {
    const [items, setItems] = useState<T[]>([]);

    const { displayedUser, authToken } = useUserInfo();
    const { setDisplayedUser } = useUserInfoActions();
    const { displayErrorMessage } = useMessageActions();

    const presenterRef = useRef<P | null>(null);

    const { displayedUser: displayedUserAliasParam } = useParams();

    const listener: PagedItemView<T> = {
        addItems: (newItems: T[]) => setItems((previousItems) => [...previousItems, ...newItems]),
        displayErrorMessage: displayErrorMessage,
    };

    if (!presenterRef.current) {
        presenterRef.current = props.presenterFactory(listener);
    }

    useEffect(() => {
        let isCancelled = false;

        if (authToken && displayedUserAliasParam && displayedUserAliasParam !== displayedUser?.alias) {
            presenterRef
                .current?.getUser(authToken, displayedUserAliasParam)
                .then((user) => {
                    if (!isCancelled && user) {
                        setDisplayedUser(user);
                    }
                })
                .catch((error) => {
                    if (!isCancelled) {
                        displayErrorMessage(`Failed to load user: ${error}`);
                    }
                });
        }

        return () => {
            isCancelled = true;
        };
    }, [displayedUserAliasParam, authToken, displayedUser?.alias, setDisplayedUser, displayErrorMessage]);

    useEffect(() => {
        setItems([]);
        presenterRef.current?.reset();
        loadMoreItems();
    }, [displayedUser]);

    const loadMoreItems = async () => {
        if (authToken && displayedUser) {
            await presenterRef.current?.loadMoreItems(authToken, displayedUser.alias);
        }
    };

    return (
        <div className="container px-0 overflow-visible vh-100">
            <InfiniteScroll
                className="pr-0 mr-0"
                dataLength={items.length}
                next={loadMoreItems}
                hasMore={presenterRef.current?.hasMoreItems ?? false}
                loader={<h4>Loading...</h4>}
            >
                {items.map((item, index) => {
                    return (
                        <div className="row mb-3 mx-0 px-0 border rounded bg-white" key={index}>
                            {props.renderItem(item, index)}
                        </div>
                    );
                })}
            </InfiniteScroll>
        </div>
    );
}
