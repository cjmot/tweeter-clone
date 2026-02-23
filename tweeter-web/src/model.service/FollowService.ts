import { AuthToken, FakeData, User } from 'tweeter-shared';

export class FollowService {
    public async loadMoreFollowees(
        authToken: AuthToken,
        userAlias: string,
        pageSize: number,
        lastFollowee: User | null
    ): Promise<[User[], boolean]> {
        // TODO: Replace with the result of calling server
        return FakeData.instance.getPageOfUsers(lastFollowee, pageSize, userAlias);
    }

    public async loadMoreFollowers(
        authToken: AuthToken,
        userAlias: string,
        pageSize: number,
        lastFollower: User | null
    ): Promise<[User[], boolean]> {
        // TODO: Replace with the result of calling server
        return FakeData.instance.getPageOfUsers(lastFollower, pageSize, userAlias);
    }
}
