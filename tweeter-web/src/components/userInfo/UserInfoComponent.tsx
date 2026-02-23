import './UserInfoComponent.css';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useMessageActions } from '../toaster/MessageHooks';
import { useUserInfo, useUserInfoActions } from './UserHooks';
import { UserInfoPresenter, UserInfoView } from '../../presenter/UserInfoPresenter';

const UserInfo = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isFollower, setIsFollower] = useState(false);
    const [followeeCount, setFolloweeCount] = useState(-1);
    const [followerCount, setFollowerCount] = useState(-1);

    const { displayInfoMessage, displayErrorMessage, deleteMessage } = useMessageActions();

    const { currentUser, authToken, displayedUser } = useUserInfo();
    const { setDisplayedUser } = useUserInfoActions();
    const navigate = useNavigate();
    const location = useLocation();

    const view: UserInfoView = {
        setIsFollower: setIsFollower,
        setFolloweeCount: setFolloweeCount,
        setFollowerCount: setFollowerCount,
        displayErrorMessage: displayErrorMessage,
    };

    const presenterRef = useRef<UserInfoPresenter | null>(null);
    if (!presenterRef.current) {
        presenterRef.current = new UserInfoPresenter(view);
    }

    if (!displayedUser) {
        setDisplayedUser(currentUser!);
    }

    useEffect(() => {
        if (authToken && currentUser && displayedUser) {
            presenterRef.current!.loadUserInfo(authToken, currentUser, displayedUser);
        }
    }, [displayedUser]);

    const switchToLoggedInUser = (event: React.MouseEvent): void => {
        event.preventDefault();
        setDisplayedUser(currentUser!);
        navigate(`${getBaseUrl()}/${currentUser!.alias}`);
    };

    const getBaseUrl = (): string => {
        const segments = location.pathname.split('/@');
        return segments.length > 1 ? segments[0] : '/';
    };

    const followDisplayedUser = async (event: React.MouseEvent): Promise<void> => {
        event.preventDefault();

        let followingUserToast = '';

        try {
            setIsLoading(true);
            followingUserToast = displayInfoMessage(`Following ${displayedUser!.name}...`, 0);
            await presenterRef.current!.followUser(authToken!, displayedUser!);
        } catch (error) {
            displayErrorMessage(`Failed to follow user because of exception: ${error}`);
        } finally {
            deleteMessage(followingUserToast);
            setIsLoading(false);
        }
    };

    const unfollowDisplayedUser = async (event: React.MouseEvent): Promise<void> => {
        event.preventDefault();

        let unfollowingUserToast = '';

        try {
            setIsLoading(true);
            unfollowingUserToast = displayInfoMessage(`Unfollowing ${displayedUser!.name}...`, 0);
            await presenterRef.current!.unfollowUser(authToken!, displayedUser!);
        } catch (error) {
            displayErrorMessage(`Failed to unfollow user because of exception: ${error}`);
        } finally {
            deleteMessage(unfollowingUserToast);
            setIsLoading(false);
        }
    };

    return (
        <>
            {currentUser === null || displayedUser === null || authToken === null ? (
                <></>
            ) : (
                <div className="container">
                    <div className="row">
                        <div className="col-auto p-3">
                            <img src={displayedUser.imageUrl} className="img-fluid" width="100" alt="Posting user" />
                        </div>
                        <div className="col p-3">
                            {!displayedUser.equals(currentUser) && (
                                <p id="returnToLoggedInUser">
                                    Return to{' '}
                                    <Link to={`./${currentUser.alias}`} onClick={switchToLoggedInUser}>
                                        logged in user
                                    </Link>
                                </p>
                            )}
                            <h2>
                                <b>{displayedUser.name}</b>
                            </h2>
                            <h3>{displayedUser.alias}</h3>
                            <br />
                            {followeeCount > -1 && followerCount > -1 && (
                                <div>
                                    Followees: {followeeCount} Followers: {followerCount}
                                </div>
                            )}
                        </div>
                        <form>
                            {!displayedUser.equals(currentUser) && (
                                <div className="form-group">
                                    {isFollower ? (
                                        <button
                                            id="unFollowButton"
                                            className="btn btn-md btn-secondary me-1"
                                            type="submit"
                                            style={{ width: '6em' }}
                                            onClick={unfollowDisplayedUser}
                                        >
                                            {isLoading ? (
                                                <span
                                                    className="spinner-border spinner-border-sm"
                                                    role="status"
                                                    aria-hidden="true"
                                                ></span>
                                            ) : (
                                                <div>Unfollow</div>
                                            )}
                                        </button>
                                    ) : (
                                        <button
                                            id="followButton"
                                            className="btn btn-md btn-primary me-1"
                                            type="submit"
                                            style={{ width: '6em' }}
                                            onClick={followDisplayedUser}
                                        >
                                            {isLoading ? (
                                                <span
                                                    className="spinner-border spinner-border-sm"
                                                    role="status"
                                                    aria-hidden="true"
                                                ></span>
                                            ) : (
                                                <div>Follow</div>
                                            )}
                                        </button>
                                    )}
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default UserInfo;
