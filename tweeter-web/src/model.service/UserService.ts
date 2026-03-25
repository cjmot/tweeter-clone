import { AuthToken, User } from 'tweeter-shared';
import { ServerFacade } from '../network/ServerFacade';
import { Service } from './Service';

export class UserService implements Service {
    private readonly serverFacade = new ServerFacade();

    public async getUser(authToken: AuthToken, alias: string): Promise<User | null> {
        const userDto = await this.serverFacade.getUser(authToken.token, alias);
        return User.fromDto(userDto);
    }

    public async unfollow(
        authToken: AuthToken,
        userToUnfollow: User
    ): Promise<[followerCount: number, followeeCount: number]> {
        await this.serverFacade.unfollow(authToken.token, userToUnfollow.dto);

        const followerCount = await this.getFollowerCount(authToken, userToUnfollow);
        const followeeCount = await this.getFolloweeCount(authToken, userToUnfollow);

        return [followerCount, followeeCount];
    }

    public async follow(
        authToken: AuthToken,
        userToFollow: User
    ): Promise<[followerCount: number, followeeCount: number]> {
        await this.serverFacade.follow(authToken.token, userToFollow.dto);

        const followerCount = await this.getFollowerCount(authToken, userToFollow);
        const followeeCount = await this.getFolloweeCount(authToken, userToFollow);

        return [followerCount, followeeCount];
    }

    public async getFollowerCount(authToken: AuthToken, user: User): Promise<number> {
        return this.serverFacade.getFollowerCount(authToken.token, user.alias);
    }

    public async getFolloweeCount(authToken: AuthToken, user: User): Promise<number> {
        return this.serverFacade.getFolloweeCount(authToken.token, user.alias);
    }

    public async getIsFollowerStatus(authToken: AuthToken, user: User, selectedUser: User): Promise<boolean> {
        return this.serverFacade.isFollower(authToken.token, user.alias, selectedUser.alias);
    }
}
