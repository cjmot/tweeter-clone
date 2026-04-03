import { UserCountResponse, UserRequest } from 'tweeter-shared';
import DynamoDAOFactory from '../../database/dynamoDB/DynamoDAOFactory';
import { FollowService } from '../../model/service/FollowService';
import { toApiGatewayError } from '../ApiGatewayError';

export const handler = async (request: UserRequest): Promise<UserCountResponse> => {
    try {
        const followService = new FollowService(new DynamoDAOFactory());
        const count = await followService.getFollowerCount(request.token, request.userAlias);

        return {
            success: true,
            message: null,
            count: count,
        };
    } catch (error) {
        throw toApiGatewayError(error);
    }
};
