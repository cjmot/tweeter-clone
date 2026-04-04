import { UserCountResponse, UserRequest } from 'tweeter-shared';
import { FollowService } from '../../model/service/FollowService';
import { toApiGatewayError } from '../ApiGatewayError';

export const handler = async (request: UserRequest): Promise<UserCountResponse> => {
    try {
        const followService = new FollowService();
        const count = await followService.getFolloweeCount(request.token, request.userAlias);

        return {
            success: true,
            message: null,
            count: count,
        };
    } catch (error) {
        throw toApiGatewayError(error);
    }
};
