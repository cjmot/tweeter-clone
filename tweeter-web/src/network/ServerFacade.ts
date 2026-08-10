import {
    AuthTokenDto,
    FollowActionRequest,
    FollowActionResponse,
    FakeData,
    GetUserResponse,
    IsFollowerRequest,
    IsFollowerResponse,
    LoginRequest,
    LoginResponse,
    LogoutRequest,
    LogoutResponse,
    PagedStatusItemRequest,
    PagedStatusItemResponse,
    PagedUserItemRequest,
    PagedUserItemResponse,
    PostStatusRequest,
    PostStatusResponse,
    RegisterRequest,
    RegisterResponse,
    Status,
    StatusDto,
    User,
    UserCountResponse,
    UserDto,
    UserRequest,
} from 'tweeter-shared';
import { ClientCommunicator } from './ClientCommunicator';


export class ServerFacade {
    private static readonly endpoints = {
        login: '/auth/login',
        register: '/auth/register',
        logout: '/auth/logout',
        getUser: '/user/get',
        getFollowees: '/followees/get',
        getFollowers: '/followers/get',
        addFollow: '/follow/add',
        removeFollow: '/follow/remove',
        isFollower: '/follow/is_follower',
        followerCount: '/follow/count/followers',
        followeeCount: '/follow/count/followees',
        getStory: '/story/get',
        getFeed: '/feed/get',
        createStatus: '/status/create',
    } as const;

    private readonly clientCommunicator: ClientCommunicator;

    public constructor() {
        const SERVER_URL = 'https://t1eduah3p3.execute-api.us-east-1.amazonaws.com/prod';
        this.clientCommunicator = new ClientCommunicator(SERVER_URL);
    }

    public async login(alias: string, password: string): Promise<[UserDto, AuthTokenDto]> {
        // const request: LoginRequest = { alias, password };
        // const response = await this.clientCommunicator.doPost<LoginRequest, LoginResponse>(
        //     request,
        //     ServerFacade.endpoints.login
        // );

        // if (response.user == null || response.authToken == null) {
        //     throw new Error(response.message ?? 'Login response is missing user or auth token');
        // }

        // return [response.user, response.authToken];
        const user = FakeData.instance.findUserByAlias(alias) ?? FakeData.instance.firstUser;
        if (user == null) {
            throw new Error('No fake user is available');
        }
        return [user.dto, FakeData.instance.authToken.dto];
    }

    public async register(
        firstName: string,
        lastName: string,
        alias: string,
        password: string,
        imageBytesBase64: string,
        imageFileExtension: string
    ): Promise<[UserDto, AuthTokenDto]> {
        // const request: RegisterRequest = {
        //     firstName,
        //     lastName,
        //     alias,
        //     password,
        //     imageBytesBase64,
        //     imageFileExtension,
        // };
        // const response = await this.clientCommunicator.doPost<RegisterRequest, RegisterResponse>(
        //     request,
        //     ServerFacade.endpoints.register
        // );

        // if (response.user == null || response.authToken == null) {
        //     throw new Error(response.message ?? 'Register response is missing user or auth token');
        // }

        // return [response.user, response.authToken];
        const user = FakeData.instance.firstUser;
        if (user == null) {
            throw new Error('No fake user is available');
        }
        return [user.dto, FakeData.instance.authToken.dto];
    }

    public async logout(token: string): Promise<void> {
        // const request: LogoutRequest = { token };
        // await this.clientCommunicator.doPost<LogoutRequest, LogoutResponse>(request, ServerFacade.endpoints.logout);
        return Promise.resolve();
    }

    public async getUser(token: string, userAlias: string): Promise<UserDto | null> {
        // const request: UserRequest = { token, userAlias };
        // const response = await this.clientCommunicator.doPost<UserRequest, GetUserResponse>(
        //     request,
        //     ServerFacade.endpoints.getUser
        // );
        // return response.user;
        return FakeData.instance.findUserByAlias(userAlias)?.dto ?? null;
    }

    public async getMoreFollowees(
        token: string,
        userAlias: string,
        pageSize: number,
        lastItem: UserDto | null
    ): Promise<[UserDto[], boolean]> {
        // const request: PagedUserItemRequest = { token, userAlias, pageSize, lastItem };
        // const response = await this.clientCommunicator.doPost<PagedUserItemRequest, PagedUserItemResponse>(
        //     request,
        //     ServerFacade.endpoints.getFollowees
        // );
        // return [response.items ?? [], response.hasMore];
        const [users, hasMore] = FakeData.instance.getPageOfUsers(User.fromDto(lastItem), pageSize, userAlias);
        return [users.map((user) => user.dto), hasMore];
    }

    public async getMoreFollowers(
        token: string,
        userAlias: string,
        pageSize: number,
        lastItem: UserDto | null
    ): Promise<[UserDto[], boolean]> {
        // const request: PagedUserItemRequest = { token, userAlias, pageSize, lastItem };
        // const response = await this.clientCommunicator.doPost<PagedUserItemRequest, PagedUserItemResponse>(
        //     request,
        //     ServerFacade.endpoints.getFollowers
        // );
        // return [response.items ?? [], response.hasMore];
        const [users, hasMore] = FakeData.instance.getPageOfUsers(User.fromDto(lastItem), pageSize, userAlias);
        return [users.map((user) => user.dto), hasMore];
    }

    public async follow(token: string, user: UserDto): Promise<void> {
        // const request: FollowActionRequest = { token, user };
        // await this.clientCommunicator.doPost<FollowActionRequest, FollowActionResponse>(
        //     request,
        //     ServerFacade.endpoints.addFollow
        // );
        return Promise.resolve();
    }

    public async unfollow(token: string, user: UserDto): Promise<void> {
        // const request: FollowActionRequest = { token, user };
        // await this.clientCommunicator.doPost<FollowActionRequest, FollowActionResponse>(
        //     request,
        //     ServerFacade.endpoints.removeFollow
        // );
        return Promise.resolve();
    }

    public async isFollower(token: string, userAlias: string, selectedUserAlias: string): Promise<boolean> {
        // const request: IsFollowerRequest = { token, userAlias, selectedUserAlias };
        // const response = await this.clientCommunicator.doPost<IsFollowerRequest, IsFollowerResponse>(
        //     request,
        //     ServerFacade.endpoints.isFollower
        // );
        // return response.isFollower;
        return FakeData.instance.isFollower();
    }

    public async getFollowerCount(token: string, userAlias: string): Promise<number> {
        // const request: UserRequest = { token, userAlias };
        // const response = await this.clientCommunicator.doPost<UserRequest, UserCountResponse>(
        //     request,
        //     ServerFacade.endpoints.followerCount
        // );
        // return response.count;
        return FakeData.instance.getFollowerCount(userAlias);
    }

    public async getFolloweeCount(token: string, userAlias: string): Promise<number> {
        // const request: UserRequest = { token, userAlias };
        // const response = await this.clientCommunicator.doPost<UserRequest, UserCountResponse>(
        //     request,
        //     ServerFacade.endpoints.followeeCount
        // );
        // return response.count;
        return FakeData.instance.getFolloweeCount(userAlias);
    }

    public async getMoreStoryItems(
        token: string,
        userAlias: string,
        pageSize: number,
        lastItem: StatusDto | null
    ): Promise<[StatusDto[], boolean]> {
        // const request: PagedStatusItemRequest = { token, userAlias, pageSize, lastItem };
        // const response = await this.clientCommunicator.doPost<PagedStatusItemRequest, PagedStatusItemResponse>(
        //     request,
        //     ServerFacade.endpoints.getStory
        // );
        // return [response.items ?? [], response.hasMore];
        const [statuses, hasMore] = FakeData.instance.getPageOfStatuses(Status.fromDto(lastItem), pageSize);
        return [statuses.map((status) => status.dto), hasMore];
    }

    public async getMoreFeedItems(
        token: string,
        userAlias: string,
        pageSize: number,
        lastItem: StatusDto | null
    ): Promise<[StatusDto[], boolean]> {
        // const request: PagedStatusItemRequest = { token, userAlias, pageSize, lastItem };
        // const response = await this.clientCommunicator.doPost<PagedStatusItemRequest, PagedStatusItemResponse>(
        //     request,
        //     ServerFacade.endpoints.getFeed
        // );
        // return [response.items ?? [], response.hasMore];
        const [statuses, hasMore] = FakeData.instance.getPageOfStatuses(Status.fromDto(lastItem), pageSize);
        return [statuses.map((status) => status.dto), hasMore];
    }

    public async postStatus(token: string, newStatus: StatusDto): Promise<void> {
        // const request: PostStatusRequest = { token, newStatus };
        // await this.clientCommunicator.doPost<PostStatusRequest, PostStatusResponse>(
        //     request,
        //     ServerFacade.endpoints.createStatus
        // );
        const status = Status.fromDto(newStatus);
        if (status != null) {
            FakeData.instance.fakeStatuses.unshift(status);
        }
    }
}
