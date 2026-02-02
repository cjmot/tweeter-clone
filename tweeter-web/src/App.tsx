import "./App.css";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Login from "./components/authentication/login/Login";
import Register from "./components/authentication/register/Register";
import MainLayout from "./components/mainLayout/MainLayout";
import Toaster from "./components/toaster/Toaster";
import UserItemScroller from "./components/mainLayout/UserItemScroller";
import { AuthToken, FakeData, User, Status } from "tweeter-shared";
import StatusItemScroller from "./components/mainLayout/StatusItemScroller";
import { useUserInfo } from "./components/userInfo/UserHooks";
import { loadMoreFeedItems, loadMoreStoryItems, loadMoreFollowees, loadMoreFollowers } from "./services/loadItems"

const App = () => {
    const { currentUser, authToken } = useUserInfo();

    const isAuthenticated = (): boolean => {
        return !!currentUser && !!authToken;
    };

    return (
        <div>
            <Toaster position="top-right" />
            <BrowserRouter>
                {isAuthenticated() ? <AuthenticatedRoutes /> : <UnauthenticatedRoutes />}
            </BrowserRouter>
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
                        <StatusItemScroller
                            key={`feed-${displayedUser!.alias}`}
                            itemDescription="feed"
                            featureURL={"/feed"}
                            loadMore={loadMoreFeedItems}
                        />
                    }
                />
                <Route
                    path="story/:displayedUser"
                    element={
                        <StatusItemScroller
                            key={`story-${displayedUser!.alias}`}
                            itemDescription="story"
                            featureURL={"/story"}
                            loadMore={loadMoreStoryItems}
                        />
                    }
                />
                <Route
                    path="followees/:displayedUser"
                    element={
                        <UserItemScroller
                            key={`followees-${displayedUser!.alias}`}
                            itemDescription={"followees"}
                            featureURL={"/followees"}
                            loadMore={loadMoreFollowees}
                        />
                    }
                />
                <Route
                    path="followers/:displayedUser"
                    element={
                        <UserItemScroller
                            key={`followers-${displayedUser!.alias}`}
                            itemDescription={"followers"}
                            featureURL={"/followers"}
                            loadMore={loadMoreFollowers}
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
