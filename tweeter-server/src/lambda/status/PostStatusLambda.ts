import { PostStatusRequest, PostStatusResponse } from 'tweeter-shared';
import { StatusService } from '../../model/service/StatusService';
import { toApiGatewayError } from '../ApiGatewayError';

export const handler = async (request: PostStatusRequest): Promise<PostStatusResponse> => {
    try {
        const statusService = new StatusService();
        await statusService.postStatus(request.token, request.newStatus);

        return {
            success: true,
            message: null,
        };
    } catch (error) {
        throw toApiGatewayError(error);
    }
};
