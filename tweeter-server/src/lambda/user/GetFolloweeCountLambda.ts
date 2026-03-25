import { UserCountResponse, UserRequest } from 'tweeter-shared';
import { UserService } from '../../model/service/UserService';

export const handler = async (request: UserRequest): Promise<UserCountResponse> => {
    const userService = new UserService();
    const count = await userService.getFolloweeCount(request.token, request.userAlias);

    return {
        success: true,
        message: null,
        count: count,
    };
};
