import { FakeData, UserDto } from 'tweeter-shared';

export class UserService {
    public async getUser(authToken: string, alias: string): Promise<UserDto | null> {
        // TODO: Replace with the result of calling server
        const user = FakeData.instance.findUserByAlias(alias);
        return user == null ? null : user.dto;
    }

    public async unfollow(
        authToken: string,
        userToUnfollow: UserDto
    ): Promise<[followerCount: number, followeeCount: number]> {
        // Pause so we can see the unfollow message. Remove when connected to the server
        await new Promise((f) => setTimeout(f, 2000));

        // TODO: Call the server
        const followerCount = await FakeData.instance.getFollowerCount(userToUnfollow.alias);
        const followeeCount = await FakeData.instance.getFolloweeCount(userToUnfollow.alias);

        return [followerCount, followeeCount];
    }

    public async follow(
        authToken: string,
        userToFollow: UserDto
    ): Promise<[followerCount: number, followeeCount: number]> {
        // Pause so we can see the follow message. Remove when connected to the server
        await new Promise((f) => setTimeout(f, 2000));

        // TODO: Call the server
        const followerCount = await FakeData.instance.getFollowerCount(userToFollow.alias);
        const followeeCount = await FakeData.instance.getFolloweeCount(userToFollow.alias);

        return [followerCount, followeeCount];
    }

    public async getFollowerCount(authToken: string, userAlias: string): Promise<number> {
        // TODO: Replace with the result of calling server
        return FakeData.instance.getFollowerCount(userAlias);
    }

    public async getFolloweeCount(authToken: string, userAlias: string): Promise<number> {
        // TODO: Replace with the result of calling server
        return FakeData.instance.getFolloweeCount(userAlias);
    }

    public async getIsFollowerStatus(
        authToken: string,
        userAlias: string,
        selectedUserAlias: string
    ): Promise<boolean> {
        // TODO: Replace with the result of calling server
        return FakeData.instance.isFollower();
    }
}
