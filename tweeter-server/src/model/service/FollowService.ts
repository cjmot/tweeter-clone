import { UserDto } from 'tweeter-shared';
import FollowDAO from '../../database/dao/FollowDAO';
import DAOFactory from '../../database/dao/DAOFactory';
import { AuthGuard } from './AuthGuard';
import DynamoDAOFactory from '../../database/dynamoDB/DynamoDAOFactory';
import { Follow } from '../database/dataTypes';

export class FollowService {
    private authGuard: AuthGuard;
    private followDao: FollowDAO;

    constructor(factory: DAOFactory = new DynamoDAOFactory()) {
        this.authGuard = new AuthGuard(factory);
        this.followDao = factory.getFollowDao();
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

        return [page.values.map((follow) => this.toFolloweeDto(follow)), page.hasMorePages];
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

        return [page.values.map((follow) => this.toFollowerDto(follow)), page.hasMorePages];
    }

    public async unfollow(
        token: string,
        userToUnfollow: UserDto
    ): Promise<[followerCount: number, followeeCount: number]> {
        const session = await this.authGuard.verifySession(token);
        const followerAlias = this.normalizeAlias(session.alias);
        const followeeAlias = this.normalizeAlias(userToUnfollow.alias);
        await this.followDao.deleteFollow(followerAlias, followeeAlias);
        const followerCount = (await this.followDao.getFollowersForFollowee(followeeAlias)).length;
        const followeeCount = (await this.followDao.getFolloweesForFollower(followerAlias)).length;

        return [followerCount, followeeCount];
    }

    public async follow(token: string, userToFollow: UserDto): Promise<void> {
        const session = await this.authGuard.verifySession(token);
        const followerAlias = this.normalizeAlias(session.alias);
        const followeeAlias = this.normalizeAlias(userToFollow.alias);
        await this.followDao.putFollow({
            follower_alias: followerAlias,
            follower_name: followerAlias,
            followee_alias: followeeAlias,
            followee_name: this.fullName(userToFollow),
        });
    }

    public async getFollowerCount(token: string, userAlias: string): Promise<number> {
        await this.authGuard.verifySession(token);
        return (await this.followDao.getFollowersForFollowee(this.normalizeAlias(userAlias))).length;
    }

    public async getFolloweeCount(token: string, userAlias: string): Promise<number> {
        await this.authGuard.verifySession(token);
        return (await this.followDao.getFolloweesForFollower(this.normalizeAlias(userAlias))).length;
    }

    public async getIsFollowerStatus(token: string, userAlias: string, selectedUserAlias: string): Promise<boolean> {
        await this.authGuard.verifySession(token);
        const follow = await this.followDao.getFollow(this.normalizeAlias(userAlias), this.normalizeAlias(selectedUserAlias));
        return follow !== null;
    }

    private toFolloweeDto(follow: Follow): UserDto {
        const [firstName, lastName] = this.splitName(follow.followee_name);
        return {
            alias: follow.followee_alias,
            firstName,
            lastName,
            imageUrl: '',
        };
    }

    private toFollowerDto(follow: Follow): UserDto {
        const [firstName, lastName] = this.splitName(follow.follower_name);
        return {
            alias: follow.follower_alias,
            firstName,
            lastName,
            imageUrl: '',
        };
    }

    private fullName(user: UserDto): string {
        return `${user.firstName} ${user.lastName}`.trim();
    }

    private splitName(name: string): [string, string] {
        const trimmed = name.trim();
        if (!trimmed) {
            return ['', ''];
        }

        const [first, ...rest] = trimmed.split(/\s+/);
        return [first, rest.join(' ')];
    }

    private normalizeAlias(alias: string): string {
        return alias.startsWith('@') ? alias : `@${alias}`;
    }
}
