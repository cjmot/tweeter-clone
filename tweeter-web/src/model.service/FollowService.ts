import { AuthToken, User, UserDto } from 'tweeter-shared';
import { ServerFacade } from '../network/ServerFacade';
import { Service } from './Service';

export class FollowService implements Service {
    private readonly serverFacade = new ServerFacade();

    public async loadMoreFollowees(
        authToken: AuthToken,
        userAlias: string,
        pageSize: number,
        lastFollowee: User | null
    ): Promise<[User[], boolean]> {
        const [followees, hasMore] = await this.serverFacade.getMoreFollowees(
            authToken.token,
            userAlias,
            pageSize,
            lastFollowee?.dto ?? null
        );
        return [this.toUsers(followees), hasMore];
    }

    public async loadMoreFollowers(
        authToken: AuthToken,
        userAlias: string,
        pageSize: number,
        lastFollower: User | null
    ): Promise<[User[], boolean]> {
        const [followers, hasMore] = await this.serverFacade.getMoreFollowers(
            authToken.token,
            userAlias,
            pageSize,
            lastFollower?.dto ?? null
        );
        return [this.toUsers(followers), hasMore];
    }

    private toUsers(dtos: UserDto[]): User[] {
        return dtos
            .map((dto) => User.fromDto(dto))
            .filter((user): user is User => user != null);
    }
}
