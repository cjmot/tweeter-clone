import {
    AuthTokenDto,
    FollowActionRequest,
    FollowActionResponse,
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
    StatusDto,
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
        const SERVER_URL =
            import.meta.env.VITE_SERVER_URL ?? 'https://t1eduah3p3.execute-api.us-east-1.amazonaws.com/prod';
        this.clientCommunicator = new ClientCommunicator(SERVER_URL);
    }

    public async login(alias: string, password: string): Promise<[UserDto, AuthTokenDto]> {
        const request: LoginRequest = { alias, password };
        const response = await this.clientCommunicator.doPost<LoginRequest, LoginResponse>(
            request,
            ServerFacade.endpoints.login
        );

        if (response.user == null || response.authToken == null) {
            throw new Error(response.message ?? 'Login response is missing user or auth token');
        }

        return [response.user, response.authToken];
    }

    public async register(
        firstName: string,
        lastName: string,
        alias: string,
        password: string,
        imageBytesBase64: string,
        imageFileExtension: string
    ): Promise<[UserDto, AuthTokenDto]> {
        const request: RegisterRequest = {
            firstName,
            lastName,
            alias,
            password,
            imageBytesBase64,
            imageFileExtension,
        };
        const response = await this.clientCommunicator.doPost<RegisterRequest, RegisterResponse>(
            request,
            ServerFacade.endpoints.register
        );

        if (response.user == null || response.authToken == null) {
            throw new Error(response.message ?? 'Register response is missing user or auth token');
        }

        return [response.user, response.authToken];
    }

    public async logout(token: string): Promise<void> {
        const request: LogoutRequest = { token };
        await this.clientCommunicator.doPost<LogoutRequest, LogoutResponse>(request, ServerFacade.endpoints.logout);
    }

    public async getUser(token: string, userAlias: string): Promise<UserDto | null> {
        const request: UserRequest = { token, userAlias };
        const response = await this.clientCommunicator.doPost<UserRequest, GetUserResponse>(
            request,
            ServerFacade.endpoints.getUser
        );
        return response.user;
    }

    public async getMoreFollowees(
        token: string,
        userAlias: string,
        pageSize: number,
        lastItem: UserDto | null
    ): Promise<[UserDto[], boolean]> {
        const request: PagedUserItemRequest = { token, userAlias, pageSize, lastItem };
        const response = await this.clientCommunicator.doPost<PagedUserItemRequest, PagedUserItemResponse>(
            request,
            ServerFacade.endpoints.getFollowees
        );
        return [response.items ?? [], response.hasMore];
    }

    public async getMoreFollowers(
        token: string,
        userAlias: string,
        pageSize: number,
        lastItem: UserDto | null
    ): Promise<[UserDto[], boolean]> {
        const request: PagedUserItemRequest = { token, userAlias, pageSize, lastItem };
        const response = await this.clientCommunicator.doPost<PagedUserItemRequest, PagedUserItemResponse>(
            request,
            ServerFacade.endpoints.getFollowers
        );
        return [response.items ?? [], response.hasMore];
    }

    public async follow(token: string, user: UserDto): Promise<void> {
        const request: FollowActionRequest = { token, user };
        await this.clientCommunicator.doPost<FollowActionRequest, FollowActionResponse>(
            request,
            ServerFacade.endpoints.addFollow
        );
    }

    public async unfollow(token: string, user: UserDto): Promise<void> {
        const request: FollowActionRequest = { token, user };
        await this.clientCommunicator.doPost<FollowActionRequest, FollowActionResponse>(
            request,
            ServerFacade.endpoints.removeFollow
        );
    }

    public async isFollower(token: string, userAlias: string, selectedUserAlias: string): Promise<boolean> {
        const request: IsFollowerRequest = { token, userAlias, selectedUserAlias };
        const response = await this.clientCommunicator.doPost<IsFollowerRequest, IsFollowerResponse>(
            request,
            ServerFacade.endpoints.isFollower
        );
        return response.isFollower;
    }

    public async getFollowerCount(token: string, userAlias: string): Promise<number> {
        const request: UserRequest = { token, userAlias };
        const response = await this.clientCommunicator.doPost<UserRequest, UserCountResponse>(
            request,
            ServerFacade.endpoints.followerCount
        );
        return response.count;
    }

    public async getFolloweeCount(token: string, userAlias: string): Promise<number> {
        const request: UserRequest = { token, userAlias };
        const response = await this.clientCommunicator.doPost<UserRequest, UserCountResponse>(
            request,
            ServerFacade.endpoints.followeeCount
        );
        return response.count;
    }

    public async getMoreStoryItems(
        token: string,
        userAlias: string,
        pageSize: number,
        lastItem: StatusDto | null
    ): Promise<[StatusDto[], boolean]> {
        const request: PagedStatusItemRequest = { token, userAlias, pageSize, lastItem };
        const response = await this.clientCommunicator.doPost<PagedStatusItemRequest, PagedStatusItemResponse>(
            request,
            ServerFacade.endpoints.getStory
        );
        return [response.items ?? [], response.hasMore];
    }

    public async getMoreFeedItems(
        token: string,
        userAlias: string,
        pageSize: number,
        lastItem: StatusDto | null
    ): Promise<[StatusDto[], boolean]> {
        const request: PagedStatusItemRequest = { token, userAlias, pageSize, lastItem };
        const response = await this.clientCommunicator.doPost<PagedStatusItemRequest, PagedStatusItemResponse>(
            request,
            ServerFacade.endpoints.getFeed
        );
        return [response.items ?? [], response.hasMore];
    }

    public async postStatus(token: string, newStatus: StatusDto): Promise<void> {
        const request: PostStatusRequest = { token, newStatus };
        await this.clientCommunicator.doPost<PostStatusRequest, PostStatusResponse>(
            request,
            ServerFacade.endpoints.createStatus
        );
    }
}
