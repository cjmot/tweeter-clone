import { PagedStatusItemRequest, PagedStatusItemResponse } from 'tweeter-shared';
import { FeedService } from '../../model/service/FeedService';
import { toApiGatewayError } from '../ApiGatewayError';

export const handler = async (request: PagedStatusItemRequest): Promise<PagedStatusItemResponse> => {
    try {
        const feedService = new FeedService();
        const [items, hasMore] = await feedService.loadMoreFeedItems(
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
