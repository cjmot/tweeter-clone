import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { StatusDto } from 'tweeter-shared';
import FeedDAO from '../dao/FeedDAO';
import DynamoDAO from './DynamoDAO';
import { DataPage, FeedRecord } from '../../model/database/dataTypes';

export default class DynamoFeedDAO extends DynamoDAO implements FeedDAO {
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
        await Promise.all(uniqueAliases.map(async (alias) => this.putFeedStatus(alias, status)));
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
}
