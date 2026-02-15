import { AuthToken, User } from "tweeter-shared";
import { UserService } from "../model.service/UserService";

export interface UserInfoView {
    setIsFollower: (isFollower: boolean) => void;
    setFolloweeCount: (count: number) => void;
    setFollowerCount: (count: number) => void;
    displayErrorMessage: (message: string) => void;
}

export class UserInfoPresenter {
    private readonly _view: UserInfoView;
    private readonly service: UserService;

    constructor(view: UserInfoView) {
        this._view = view;
        this.service = new UserService();
    }

    get view() {
        return this._view;
    }

    loadUserInfo = async (authToken: AuthToken, currentUser: User, displayedUser: User) => {
        await Promise.all([
            this.setIsFollowerStatus(authToken, currentUser, displayedUser),
            this.setNumbFollowees(authToken, displayedUser),
            this.setNumbFollowers(authToken, displayedUser),
        ]);
    };

    followUser = async (authToken: AuthToken, displayedUser: User) => {
        try {
            const [followerCount, followeeCount] = await this.service.follow(authToken, displayedUser);
            this.view.setIsFollower(true);
            this.view.setFollowerCount(followerCount);
            this.view.setFolloweeCount(followeeCount);
        } catch (error) {
            this.view.displayErrorMessage(`Failed to follow user because of exception: ${error}`);
        }
    };

    unfollowUser = async (authToken: AuthToken, displayedUser: User) => {
        try {
            const [followerCount, followeeCount] = await this.service.unfollow(authToken, displayedUser);
            this.view.setIsFollower(false);
            this.view.setFollowerCount(followerCount);
            this.view.setFolloweeCount(followeeCount);
        } catch (error) {
            this.view.displayErrorMessage(`Failed to unfollow user because of exception: ${error}`);
        }
    };

    private setIsFollowerStatus = async (authToken: AuthToken, currentUser: User, displayedUser: User) => {
        try {
            if (currentUser.equals(displayedUser)) {
                this.view.setIsFollower(false);
            } else {
                this.view.setIsFollower(await this.service.getIsFollowerStatus(authToken, currentUser, displayedUser));
            }
        } catch (error) {
            this.view.displayErrorMessage(`Failed to determine follower status because of exception: ${error}`);
        }
    };

    private setNumbFollowees = async (authToken: AuthToken, displayedUser: User) => {
        try {
            this.view.setFolloweeCount(await this.service.getFolloweeCount(authToken, displayedUser));
        } catch (error) {
            this.view.displayErrorMessage(`Failed to get followees count because of exception: ${error}`);
        }
    };

    private setNumbFollowers = async (authToken: AuthToken, displayedUser: User) => {
        try {
            this.view.setFollowerCount(await this.service.getFollowerCount(authToken, displayedUser));
        } catch (error) {
            this.view.displayErrorMessage(`Failed to get followers count because of exception: ${error}`);
        }
    };
}
