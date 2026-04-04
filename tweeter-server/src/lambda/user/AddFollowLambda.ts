import { FollowActionRequest, FollowActionResponse } from 'tweeter-shared';
import { FollowService } from '../../model/service/FollowService';
import { toApiGatewayError } from '../ApiGatewayError';

export const handler = async (request: FollowActionRequest): Promise<FollowActionResponse> => {
    try {
        const followService = new FollowService();
        await followService.follow(request.token, request.user);

        return {
            success: true,
            message: null,
        };
    } catch (error) {
        throw toApiGatewayError(error);
    }
};
