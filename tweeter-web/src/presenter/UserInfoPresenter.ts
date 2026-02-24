import { AuthToken, User } from 'tweeter-shared';
import { UserService } from '../model.service/UserService';
import { View, Presenter } from './Presenter';

export interface UserInfoView extends View {
    setIsFollower: (isFollower: boolean) => void;
    setFolloweeCount: (count: number) => void;
    setFollowerCount: (count: number) => void;
}

export class UserInfoPresenter extends Presenter<UserInfoView> {
    private readonly userService = new UserService();

    loadUserInfo = async (authToken: AuthToken, currentUser: User, displayedUser: User) => {
        await Promise.all([
            this.setIsFollowerStatus(authToken, currentUser, displayedUser),
            this.setNumbFollowees(authToken, displayedUser),
            this.setNumbFollowers(authToken, displayedUser),
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
        this.doFailureReportingOperation(async () => {
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
        this.doFailureReportingOperation(async () => {
            if (currentUser.equals(displayedUser)) {
                this.view.setIsFollower(false);
            } else {
                this.view.setIsFollower(
                    await this.userService.getIsFollowerStatus(authToken, currentUser, displayedUser)
                );
            }
        }, 'determine follower status');
    };

    private setNumbFollowees = async (authToken: AuthToken, displayedUser: User) => {
        this.doFailureReportingOperation(async () => {
            this.view.setFolloweeCount(await this.userService.getFolloweeCount(authToken, displayedUser));
        }, 'get followees count');
    };

    private setNumbFollowers = async (authToken: AuthToken, displayedUser: User) => {
        this.doFailureReportingOperation(async () => {
            this.view.setFollowerCount(await this.userService.getFollowerCount(authToken, displayedUser));
        }, 'get followers count');
    };
}
