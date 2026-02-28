import { AuthToken, User } from 'tweeter-shared';
import { UserService } from '../model.service/UserService';
import { View, Presenter } from './Presenter';

export interface UserInfoView extends View {
    setIsFollower: (isFollower: boolean) => void;
    setFolloweeCount: (count: number) => void;
    setFollowerCount: (count: number) => void;
}

export class UserInfoPresenter extends Presenter<UserInfoView> {
    private readonly _userService = new UserService();

    public constructor(view: UserInfoView) {
        super(view);
        this._userService = new UserService();
    }

    public get userService() {
        return this._userService;
    }

    loadUserInfo = async (authToken: AuthToken, currentUser: User, displayedUser: User) => {
        await Promise.all([
            this.setIsFollowerStatus(authToken, currentUser, displayedUser),
            this.setCount(
                () => this.userService.getFolloweeCount(authToken, displayedUser),
                (c) => this.view.setFolloweeCount(c),
                'get followees count'
            ),
            this.setCount(
                () => this.userService.getFollowerCount(authToken, displayedUser),
                (c) => this.view.setFollowerCount(c),
                'get followers count'
            ),
        ]);
    };

    followUser = async (authToken: AuthToken, displayedUser: User) => {
        await this.updateFollowStatus(authToken, displayedUser, true, 'follow user');
    };

    unfollowUser = async (authToken: AuthToken, displayedUser: User) => {
        await this.updateFollowStatus(authToken, displayedUser, false, 'unfollow user');
    };

    private updateFollowStatus = async (
        authToken: AuthToken,
        displayedUser: User,
        isFollowing: boolean,
        operationDescription: string
    ) => {
        await this.doFailureReportingOperation(async () => {
            const operation = isFollowing
                ? () => this.userService.follow(authToken, displayedUser)
                : () => this.userService.unfollow(authToken, displayedUser);

            const [followerCount, followeeCount] = await operation();
            this.view.setIsFollower(isFollowing);
            this.view.setFollowerCount(followerCount);
            this.view.setFolloweeCount(followeeCount);
        }, operationDescription);
    };

    private setIsFollowerStatus = async (authToken: AuthToken, currentUser: User, displayedUser: User) => {
        await this.doFailureReportingOperation(async () => {
            if (currentUser.equals(displayedUser)) {
                this.view.setIsFollower(false);
            } else {
                this.view.setIsFollower(
                    await this.userService.getIsFollowerStatus(authToken, currentUser, displayedUser)
                );
            }
        }, 'determine follower status');
    };

    private setCount = async (fetcher: () => Promise<number>, setter: (count: number) => void, description: string) => {
        await this.doFailureReportingOperation(async () => {
            setter(await fetcher());
        }, description);
    };
}
