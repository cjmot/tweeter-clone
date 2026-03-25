import { FollowActionRequest, FollowActionResponse } from 'tweeter-shared';
import { UserService } from '../../model/service/UserService';

export const handler = async (request: FollowActionRequest): Promise<FollowActionResponse> => {
    const userService = new UserService();
    await userService.unfollow(request.token, request.user);

    return {
        success: true,
        message: null,
    };
};

