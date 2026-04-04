import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { StatusDto } from 'tweeter-shared';
import StatusDAO from '../dao/StatusDAO';
import DynamoDAO from './DynamoDAO';
import { DataPage, StatusRecord } from '../../model/database/dataTypes';

export default class DynamoStatusDAO extends DynamoDAO implements StatusDAO {
    public constructor() {
        super('status');
    }

    public async putStatus(status: StatusDto): Promise<void> {
        const item: StatusRecord = {
            user_alias: status.user.alias,
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
            throw this.wrapDynamoError('Failed to store status', error);
        }
    }

    public async getPageOfStories(
        userAlias: string,
        pageSize: number,
        lastTimestamp?: number
    ): Promise<DataPage<StatusDto>> {
        const params = {
            TableName: this.tableName,
            KeyConditionExpression: 'user_alias = :userAlias',
            ExpressionAttributeValues: {
                ':userAlias': userAlias,
            },
            Limit: pageSize,
            ScanIndexForward: false,
            ExclusiveStartKey:
                lastTimestamp === undefined ? undefined : { user_alias: userAlias, timestamp: lastTimestamp },
        };

        try {
            const response = await this.docClient.send(new QueryCommand(params));
            const items =
                (response.Items as StatusRecord[] | undefined)?.map((item) => ({
                    post: item.post,
                    user: item.user,
                    timestamp: item.timestamp,
                })) ?? [];

            return new DataPage<StatusDto>(items, response.LastEvaluatedKey !== undefined, undefined);
        } catch (error) {
            throw this.wrapDynamoError(`Failed to load story for ${userAlias}`, error);
        }
    }

    private wrapDynamoError(message: string, error: unknown): Error {
        if (error instanceof Error) {
            return new Error(`${message}: ${error.message}`, { cause: error });
        }

        return new Error(message);
    }
}
