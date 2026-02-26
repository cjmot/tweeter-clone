import './App.css';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Login from './components/authentication/login/Login';
import Register from './components/authentication/register/Register';
import MainLayout from './components/mainLayout/MainLayout';
import Toaster from './components/toaster/Toaster';
import { useUserInfo } from './components/userInfo/UserHooks';
import { FolloweePresenter } from './presenter/FolloweePresenter';
import { FollowerPresenter } from './presenter/FollowerPresenter';
import { PagedItemView } from './presenter/PagedItemPresenter';
import { FeedItemsPresenter } from './presenter/FeedItemsPresenter';
import { Status, User } from 'tweeter-shared';
import { ItemScroller } from './components/mainLayout/ItemScroller';
import StatusItem from './components/items/StatusItem';
import { StoryItemsPresenter } from './presenter/StoryItemsPresenter';
import UserItem from './components/items/UserItem';

const App = () => {
    const { currentUser, authToken } = useUserInfo();

    const isAuthenticated = (): boolean => {
        return !!currentUser && !!authToken;
    };

    return (
        <div>
            <Toaster position="top-right" />
            <BrowserRouter>{isAuthenticated() ? <AuthenticatedRoutes /> : <UnauthenticatedRoutes />}</BrowserRouter>
        </div>
    );
};

const AuthenticatedRoutes = () => {
    const { displayedUser } = useUserInfo();

    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route index element={<Navigate to={`/feed/${displayedUser!.alias}`} />} />
                <Route
                    path="feed/:displayedUser"
                    element={
                        <ItemScroller
                            key={`feed-${displayedUser!.alias}`}
                            itemDescription="feed"
                            renderItem={(item: Status, index: number) => (
                                <StatusItem key={index} item={item} featureURL={'/feed'} />
                            )}
                            presenterFactory={(view: PagedItemView<Status>) => new FeedItemsPresenter(view)}
                        />
                    }
                />
                <Route
                    path="story/:displayedUser"
                    element={
                        <ItemScroller
                            key={`story-${displayedUser!.alias}`}
                            itemDescription="story"
                            renderItem={(item: Status, index: number) => (
                                <StatusItem key={index} item={item} featureURL={'/story'} />
                            )}
                            presenterFactory={(view: PagedItemView<Status>) => new StoryItemsPresenter(view)}
                        />
                    }
                />
                <Route
                    path="followees/:displayedUser"
                    element={
                        <ItemScroller
                            key={`followees-${displayedUser!.alias}`}
                            itemDescription="followees"
                            renderItem={(item: User, index: number) => (
                                <UserItem key={index} user={item} featureURL={'/followees'} />
                            )}
                            presenterFactory={(view: PagedItemView<User>) => new FolloweePresenter(view)}
                        />
                    }
                />
                <Route
                    path="followers/:displayedUser"
                    element={
                        <ItemScroller
                            key={`followers-${displayedUser!.alias}`}
                            itemDescription="followers"
                            renderItem={(item: User, index: number) => (
                                <UserItem key={index} user={item} featureURL={'/followers'} />
                            )}
                            presenterFactory={(view: PagedItemView<User>) => new FollowerPresenter(view)}
                        />
                    }
                />
                <Route path="logout" element={<Navigate to="/login" />} />
                <Route path="*" element={<Navigate to={`/feed/${displayedUser!.alias}`} />} />
            </Route>
        </Routes>
    );
};

const UnauthenticatedRoutes = () => {
    const location = useLocation();

    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Login originalUrl={location.pathname} />} />
        </Routes>
    );
};

export default App;
