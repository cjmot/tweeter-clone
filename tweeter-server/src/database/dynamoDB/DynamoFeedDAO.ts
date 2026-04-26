import { BatchWriteCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { StatusDto } from 'tweeter-shared';
import FeedDAO from '../dao/FeedDAO';
import DynamoDAO from './DynamoDAO';
import { DataPage, FeedRecord } from '../../model/database/dataTypes';

export default class DynamoFeedDAO extends DynamoDAO implements FeedDAO {
    private static readonly MAX_BATCH_WRITE_SIZE = 25;

    public constructor() {
        super('feed');
    }

    public async putFeedStatus(userAlias: string, status: StatusDto): Promise<void> {
        const item: FeedRecord = {
            recipient_alias: userAlias,
            timestamp: status.timestamp,
            post: status.post,
            user: status.user,
        };

        try {
            await this.docClient.send(
                new PutCommand({
                    TableName: this.tableName,
                    Item: item,
                })
            );
        } catch (error) {
            throw this.wrapDynamoError(`Failed to store feed item for ${userAlias}`, error);
        }
    }

    public async batchPutFeedStatuses(userAliases: string[], status: StatusDto): Promise<void> {
        const uniqueAliases = Array.from(new Set(userAliases));
        if (uniqueAliases.length === 0) {
            return;
        }

        const writeRequests = uniqueAliases.map((alias) => ({
            PutRequest: {
                Item: {
                    recipient_alias: alias,
                    timestamp: status.timestamp,
                    post: status.post,
                    user: status.user,
                } as FeedRecord,
            },
        }));

        for (
            let startIndex = 0;
            startIndex < writeRequests.length;
            startIndex += DynamoFeedDAO.MAX_BATCH_WRITE_SIZE
        ) {
            const chunk = writeRequests.slice(startIndex, startIndex + DynamoFeedDAO.MAX_BATCH_WRITE_SIZE);
            await this.batchWriteWithRetry(chunk);
        }
    }

    public async getPageOfFeedStatuses(
        userAlias: string,
        pageSize: number,
        lastTimestamp?: number
    ): Promise<DataPage<StatusDto>> {
        const params = {
            TableName: this.tableName,
            KeyConditionExpression: 'recipient_alias = :recipientAlias',
            ExpressionAttributeValues: {
                ':recipientAlias': userAlias,
            },
            Limit: pageSize,
            ScanIndexForward: false,
            ExclusiveStartKey:
                lastTimestamp === undefined ? undefined : { recipient_alias: userAlias, timestamp: lastTimestamp },
        };

        try {
            const response = await this.docClient.send(new QueryCommand(params));
            const values =
                (response.Items as FeedRecord[] | undefined)?.map((item) => ({
                    post: item.post,
                    user: item.user,
                    timestamp: item.timestamp,
                })) ?? [];

            return new DataPage<StatusDto>(values, response.LastEvaluatedKey !== undefined, undefined);
        } catch (error) {
            throw this.wrapDynamoError(`Failed to load feed for ${userAlias}`, error);
        }
    }

    private wrapDynamoError(message: string, error: unknown): Error {
        if (error instanceof Error) {
            return new Error(`${message}: ${error.message}`, { cause: error });
        }

        return new Error(message);
    }

    private async batchWriteWithRetry(
        requests: Array<{ PutRequest: { Item: FeedRecord } }>
    ): Promise<void> {
        let unprocessedRequests = requests;
        let attempt = 0;

        while (unprocessedRequests.length > 0) {
            try {
                const response = await this.docClient.send(
                    new BatchWriteCommand({
                        RequestItems: {
                            [this.tableName]: unprocessedRequests,
                        },
                    })
                );

                unprocessedRequests =
                    (response.UnprocessedItems?.[this.tableName] as Array<{ PutRequest: { Item: FeedRecord } }> | undefined) ??
                    [];
            } catch (error) {
                throw this.wrapDynamoError('Failed to batch store feed items', error);
            }

            if (unprocessedRequests.length > 0) {
                attempt += 1;
                if (attempt > 5) {
                    throw new Error('Failed to batch store feed items: unprocessed items exceeded retry limit');
                }

                await this.sleep(attempt * 50);
            }
        }
    }

    private async sleep(milliseconds: number): Promise<void> {
        await new Promise((resolve) => setTimeout(resolve, milliseconds));
    }
}
