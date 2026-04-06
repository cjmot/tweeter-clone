import { UserDto } from 'tweeter-shared';
import FollowDAO from '../../database/dao/FollowDAO';
import DAOFactory from '../../database/dao/DAOFactory';
import { AuthGuard } from './AuthGuard';
import DynamoDAOFactory from '../../database/dynamoDB/DynamoDAOFactory';
import UserDAO from '../../database/dao/UserDAO';

export class FollowService {
    private authGuard: AuthGuard;
    private followDao: FollowDAO;
    private userDao: UserDAO;

    constructor(factory: DAOFactory = new DynamoDAOFactory()) {
        this.authGuard = new AuthGuard(factory);
        this.followDao = factory.getFollowDao();
        this.userDao = factory.getUserDao();
    }

    public async loadMoreFollowees(
        token: string,
        userAlias: string,
        pageSize: number,
        lastItem: UserDto | null
    ): Promise<[UserDto[], boolean]> {
        await this.authGuard.verifySession(token);
        const normalizedUserAlias = this.normalizeAlias(userAlias);
        const lastFolloweeAlias = lastItem ? this.normalizeAlias(lastItem.alias) : undefined;
        const page = await this.followDao.getPageOfFollowees(normalizedUserAlias, pageSize, lastFolloweeAlias);
        const followeeAliases = page.values.map((follow) => follow.followee_alias);
        const users = await this.getUsersByAliases(followeeAliases);

        return [users, page.hasMorePages];
    }

    public async loadMoreFollowers(
        token: string,
        userAlias: string,
        pageSize: number,
        lastItem: UserDto | null
    ): Promise<[UserDto[], boolean]> {
        await this.authGuard.verifySession(token);
        const normalizedUserAlias = this.normalizeAlias(userAlias);
        const lastFollowerAlias = lastItem ? this.normalizeAlias(lastItem.alias) : undefined;
        const page = await this.followDao.getPageOfFollowers(normalizedUserAlias, pageSize, lastFollowerAlias);
        const followerAliases = page.values.map((follow) => follow.follower_alias);
        const users = await this.getUsersByAliases(followerAliases);

        return [users, page.hasMorePages];
    }

    public async unfollow(
        token: string,
        userToUnfollow: UserDto
    ): Promise<[followerCount: number, followeeCount: number]> {
        const session = await this.authGuard.verifySession(token);
        const followerAlias = this.normalizeAlias(session.alias);
        const followeeAlias = this.normalizeAlias(userToUnfollow.alias);
        await this.followDao.deleteFollow(followerAlias, followeeAlias);
        const followerCount = await this.followDao.getFollowerCountForFollowee(followeeAlias);
        const followeeCount = await this.followDao.getFolloweeCountForFollower(followerAlias);

        return [followerCount, followeeCount];
    }

    public async follow(token: string, userToFollow: UserDto): Promise<void> {
        const session = await this.authGuard.verifySession(token);
        const followerAlias = this.normalizeAlias(session.alias);
        const followeeAlias = this.normalizeAlias(userToFollow.alias);
        const followerUser = await this.userDao.getUserByAlias(followerAlias);
        if (!followerUser) {
            throw new Error('bad-request: Follower user not found');
        }

        await this.followDao.putFollow({
            follower_alias: followerAlias,
            follower_name: this.fullName(followerUser),
            followee_alias: followeeAlias,
            followee_name: this.fullName(userToFollow),
        });
    }

    public async getFollowerCount(token: string, userAlias: string): Promise<number> {
        await this.authGuard.verifySession(token);
        return await this.followDao.getFollowerCountForFollowee(this.normalizeAlias(userAlias));
    }

    public async getFolloweeCount(token: string, userAlias: string): Promise<number> {
        await this.authGuard.verifySession(token);
        return await this.followDao.getFolloweeCountForFollower(this.normalizeAlias(userAlias));
    }

    public async getIsFollowerStatus(token: string, userAlias: string, selectedUserAlias: string): Promise<boolean> {
        await this.authGuard.verifySession(token);
        const follow = await this.followDao.getFollow(this.normalizeAlias(userAlias), this.normalizeAlias(selectedUserAlias));
        return follow !== null;
    }

    private fullName(user: UserDto): string {
        return `${user.firstName} ${user.lastName}`.trim();
    }

    private normalizeAlias(alias: string): string {
        return alias.startsWith('@') ? alias : `@${alias}`;
    }

    private async getUsersByAliases(aliases: string[]): Promise<UserDto[]> {
        return this.userDao.getUsersByAliases(aliases);
    }
}
