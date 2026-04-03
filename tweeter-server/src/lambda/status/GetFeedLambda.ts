import { PagedStatusItemRequest, PagedStatusItemResponse } from 'tweeter-shared';
import { StatusService } from '../../model/service/StatusService';
import { toApiGatewayError } from '../ApiGatewayError';

export const handler = async (request: PagedStatusItemRequest): Promise<PagedStatusItemResponse> => {
    try {
        const statusService = new StatusService();
        const [items, hasMore] = await statusService.loadMoreFeedItems(
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
