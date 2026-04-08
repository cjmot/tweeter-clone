import {
    DeleteCommand,
    GetCommand,
    PutCommand,
    QueryCommand,
    UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import FollowDAO from '../dao/FollowDAO';
import DynamoDAO from './DynamoDAO';
import { Follow, DataPage } from '../../model/database/dataTypes';


export class DynamoFollowDAO extends DynamoDAO implements FollowDAO {
    private readonly followIndexName = 'follow_index';

    public constructor() {
        super('follow');
    }

    public async putFollow(follow: Follow): Promise<void> {
        await this.docClient.send(
            new PutCommand({
                TableName: this.tableName,
                Item: follow,
            })
        );
    }

    public async getFollow(followerAlias: string, followeeAlias: string): Promise<Follow | null> {
        const response = await this.docClient.send(
            new GetCommand({
                TableName: this.tableName,
                Key: {
                    follower_alias: followerAlias,
                    followee_alias: followeeAlias,
                },
            })
        );

        return (response.Item as Follow | undefined) ?? null;
    }

    public async updateFollow(
        follow: Follow
    ): Promise<Follow | null> {
        const response = await this.docClient.send(
            new UpdateCommand({
                TableName: this.tableName,
                Key: {
                    follower_alias: follow.follower_alias,
                    followee_alias: follow.followee_alias,
                },
                UpdateExpression: 'SET follower_name = :followerName, followee_name = :followeeName',
                ExpressionAttributeValues: {
                    ':followerName': follow.follower_name,
                    ':followeeName': follow.followee_name,
                },
                ReturnValues: 'ALL_NEW',
            })
        );

        return (response.Attributes as Follow | undefined) ?? null;
    }

    public async deleteFollow(followerAlias: string, followeeAlias: string): Promise<void> {
        await this.docClient.send(
            new DeleteCommand({
                TableName: this.tableName,
                Key: {
                    follower_alias: followerAlias,
                    followee_alias: followeeAlias,
                },
            })
        );
    }

    public async getFolloweesForFollower(followerAlias: string): Promise<Follow[]> {
        const response = await this.docClient.send(
            new QueryCommand({
                TableName: this.tableName,
                KeyConditionExpression: 'follower_alias = :followerAlias',
                ExpressionAttributeValues: {
                    ':followerAlias': followerAlias,
                },
            })
        );

        return (response.Items as Follow[] | undefined) ?? [];
    }

    public async getFollowersForFollowee(followeeAlias: string): Promise<Follow[]> {
        const response = await this.docClient.send(
            new QueryCommand({
                TableName: this.tableName,
                IndexName: this.followIndexName,
                KeyConditionExpression: 'followee_alias = :followeeAlias',
                ExpressionAttributeValues: {
                    ':followeeAlias': followeeAlias,
                },
            })
        );

        return (response.Items as Follow[] | undefined) ?? [];
    }

    public async getFolloweeCountForFollower(followerAlias: string): Promise<number> {
        const response = await this.docClient.send(
            new QueryCommand({
                TableName: this.tableName,
                KeyConditionExpression: 'follower_alias = :followerAlias',
                ExpressionAttributeValues: {
                    ':followerAlias': followerAlias,
                },
                Select: 'COUNT',
            })
        );

        return response.Count ?? 0;
    }

    public async getFollowerCountForFollowee(followeeAlias: string): Promise<number> {
        const response = await this.docClient.send(
            new QueryCommand({
                TableName: this.tableName,
                IndexName: this.followIndexName,
                KeyConditionExpression: 'followee_alias = :followeeAlias',
                ExpressionAttributeValues: {
                    ':followeeAlias': followeeAlias,
                },
                Select: 'COUNT',
            })
        );

        return response.Count ?? 0;
    }

    async getPageOfFollowees(
        followerAlias: string,
        pageSize: number,
        lastFolloweeAlias?: string
    ): Promise<DataPage<Follow>> {
        const params = {
            KeyConditionExpression: 'follower_alias = :followerAlias',
            ExpressionAttributeValues: {
                ':followerAlias': followerAlias,
            },
            TableName: this.tableName,
            Limit: pageSize,
            ExclusiveStartKey:
                lastFolloweeAlias
                    ? { followee_alias: lastFolloweeAlias, follower_alias: followerAlias }
                    : undefined,
        };

        const items: Follow[] = [];
        const data = await this.docClient.send(new QueryCommand(params));
        const hasMorePages = data.LastEvaluatedKey !== undefined;
        data.Items?.forEach((item) =>
            items.push({
                follower_alias: item.follower_alias,
                follower_name: item.follower_name,
                followee_alias: item.followee_alias,
                followee_name: item.followee_name,
            } as Follow)
        );
        return new DataPage<Follow>(items, hasMorePages, data.LastEvaluatedKey?.followee_alias);
    }
    async getPageOfFollowers(
        followeeAlias: string,
        pageSize: number,
        lastFollowerAlias?: string
    ): Promise<DataPage<Follow>> {
        const params = {
            KeyConditionExpression: 'followee_alias = :followeeAlias',
            IndexName: this.followIndexName,
            ExpressionAttributeValues: {
                ':followeeAlias': followeeAlias,
            },
            TableName: this.tableName,
            Limit: pageSize,
            ExclusiveStartKey:
                lastFollowerAlias
                    ? { followee_alias: followeeAlias, follower_alias: lastFollowerAlias }
                    : undefined,
        };

        const items: Follow[] = [];
        const data = await this.docClient.send(new QueryCommand(params));
        const hasMorePages = data.LastEvaluatedKey !== undefined;
        data.Items?.forEach((item) =>
            items.push({
                follower_alias: item.follower_alias,
                follower_name: item.follower_name,
                followee_alias: item.followee_alias,
                followee_name: item.followee_name,
            } as Follow)
        );
        return new DataPage<Follow>(items, hasMorePages, data.LastEvaluatedKey?.follower_alias);
    }
}
