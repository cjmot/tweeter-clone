import { StatusDto } from 'tweeter-shared';

export const POST_STATUS_JOB_TYPE = 'post-status-job';
export const UPDATE_FEED_JOB_TYPE = 'update-feed-job';
export const QUEUE_MESSAGE_VERSION = 1;

export interface PostStatusJob {
    type: typeof POST_STATUS_JOB_TYPE;
    version: typeof QUEUE_MESSAGE_VERSION;
    authorAlias: string;
    status: StatusDto;
    lastFollowerAlias?: string;
    continuationDepth?: number;
}

export interface UpdateFeedJob {
    type: typeof UPDATE_FEED_JOB_TYPE;
    version: typeof QUEUE_MESSAGE_VERSION;
    status: StatusDto;
    recipientAliases: string[];
}
