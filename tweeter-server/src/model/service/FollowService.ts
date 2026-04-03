import { FakeData, User, UserDto } from 'tweeter-shared';
import { SessionDAO } from '../../database/dao/SessionDAO';
import FollowDAO from '../../database/dao/FollowDAO';
import DAOFactory from '../../database/dao/DAOFactory';

export class FollowService {
    private sessionDao: SessionDAO;
    private followDao: FollowDAO;

    constructor(factory: DAOFactory) {
        this.sessionDao = factory.getSessionDao();
        this.followDao = factory.getFollowDao();
    }

    public async loadMoreFollowees(
        token: string,
        userAlias: string,
        pageSize: number,
        lastItem: UserDto | null
    ): Promise<[UserDto[], boolean]> {
        // TODO: Replace with the result of calling DB
        return this.getFakeData(lastItem, pageSize, userAlias);
    }

    public async loadMoreFollowers(
        token: string,
        userAlias: string,
        pageSize: number,
        lastItem: UserDto | null
    ): Promise<[UserDto[], boolean]> {
        // TODO: Replace with the result of calling DB

        return this.getFakeData(lastItem, pageSize, userAlias);
    }

    public async unfollow(
        token: string,
        userToUnfollow: UserDto
    ): Promise<[followerCount: number, followeeCount: number]> {
        // Pause so we can see the unfollow message. Remove when connected to the DB
        await new Promise((f) => setTimeout(f, 2000));

        // TODO: Call the DB
        const followerCount = await FakeData.instance.getFollowerCount(userToUnfollow.alias);
        const followeeCount = await FakeData.instance.getFolloweeCount(userToUnfollow.alias);

        return [followerCount, followeeCount];
    }

    public async follow(token: string, userToFollow: UserDto): Promise<[followerCount: number, followeeCount: number]> {
        // Pause so we can see the follow message. Remove when connected to the DB
        await new Promise((f) => setTimeout(f, 2000));

        // TODO: Call the DB
        const followerCount = await FakeData.instance.getFollowerCount(userToFollow.alias);
        const followeeCount = await FakeData.instance.getFolloweeCount(userToFollow.alias);

        return [followerCount, followeeCount];
    }

    public async getFollowerCount(token: string, userAlias: string): Promise<number> {
        // TODO: Replace with the result of calling DB
        return FakeData.instance.getFollowerCount(userAlias);
    }

    public async getFolloweeCount(token: string, userAlias: string): Promise<number> {
        // TODO: Replace with the result of calling DB
        return FakeData.instance.getFolloweeCount(userAlias);
    }

    public async getIsFollowerStatus(token: string, userAlias: string, selectedUserAlias: string): Promise<boolean> {
        // TODO: Replace with the result of calling DB
        return FakeData.instance.isFollower();
    }

    private async getFakeData(
        lastItem: UserDto | null,
        pageSize: number,
        userAlias: string
    ): Promise<[UserDto[], boolean]> {
        const [users, hasMore] = FakeData.instance.getPageOfUsers(User.fromDto(lastItem), pageSize, userAlias);
        const dtos = users.map((user) => user.dto);
        return [dtos, hasMore];
    }
}
