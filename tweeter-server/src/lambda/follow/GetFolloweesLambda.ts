import { PagedUserItemRequest, PagedUserItemResponse } from 'tweeter-shared';
import { FollowService } from '../../model/service/FollowService';
import DynamoDAOFactory from '../../database/dynamoDB/DynamoDAOFactory';
import { toApiGatewayError } from '../ApiGatewayError';

export const handler = async (request: PagedUserItemRequest): Promise<PagedUserItemResponse> => {
    try {
        const followService = new FollowService(new DynamoDAOFactory());
        const [items, hasMore] = await followService.loadMoreFollowees(
            request.token,
            request.userAlias,
            request.pageSize,
            request.lastItem
        );

        return {
            success: true,
            message: null,
            items: items,
            hasMore: hasMore,
        };
    } catch (error) {
        throw toApiGatewayError(error);
    }
};
