import { IsFollowerRequest, IsFollowerResponse } from 'tweeter-shared';
import { FollowService } from '../../model/service/FollowService';
import { toApiGatewayError } from '../ApiGatewayError';

export const handler = async (request: IsFollowerRequest): Promise<IsFollowerResponse> => {
    try {
        const followService = new FollowService();
        const isFollower = await followService.getIsFollowerStatus(
            request.token,
            request.userAlias,
            request.selectedUserAlias
        );

        return {
            success: true,
            message: null,
            isFollower: isFollower,
        };
    } catch (error) {
        throw toApiGatewayError(error);
    }
};
