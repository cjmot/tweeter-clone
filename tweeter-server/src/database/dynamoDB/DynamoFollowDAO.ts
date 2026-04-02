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
    private readonly followsIndexName = 'follows_index';

    public constructor() {
        super('follows');
    }

    public async putFollow(follow: Follow): Promise<void> {
        await this.docClient.send(
            new PutCommand({
                TableName: this.tableName,
                Item: follow,
            })
        );
    }

    public async getFollow(followerHandle: string, followeeHandle: string): Promise<Follow | null> {
        const response = await this.docClient.send(
            new GetCommand({
                TableName: this.tableName,
                Key: {
                    follower_handle: followerHandle,
                    followee_handle: followeeHandle,
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
                    follower_handle: follow.follower_handle,
                    followee_handle: follow.followee_handle,
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

    public async deleteFollow(followerHandle: string, followeeHandle: string): Promise<void> {
        await this.docClient.send(
            new DeleteCommand({
                TableName: this.tableName,
                Key: {
                    follower_handle: followerHandle,
                    followee_handle: followeeHandle,
                },
            })
        );
    }

    public async getFolloweesForFollower(followerHandle: string): Promise<Follow[]> {
        const response = await this.docClient.send(
            new QueryCommand({
                TableName: this.tableName,
                KeyConditionExpression: 'follower_handle = :followerHandle',
                ExpressionAttributeValues: {
                    ':followerHandle': followerHandle,
                },
            })
        );

        return (response.Items as Follow[] | undefined) ?? [];
    }

    public async getFollowersForFollowee(followeeHandle: string): Promise<Follow[]> {
        const response = await this.docClient.send(
            new QueryCommand({
                TableName: this.tableName,
                IndexName: this.followsIndexName,
                KeyConditionExpression: 'followee_handle = :followeeHandle',
                ExpressionAttributeValues: {
                    ':followeeHandle': followeeHandle,
                },
            })
        );

        return (response.Items as Follow[] | undefined) ?? [];
    }

    async getPageOfFollowees(
        followerHandle: string,
        pageSize: number,
        lastFolloweeHandle?: string
    ): Promise<DataPage<Follow>> {
        const params = {
            KeyConditionExpression: 'follower_handle = :followerHandle',
            ExpressionAttributeValues: {
                ':followerHandle': followerHandle,
            },
            TableName: this.tableName,
            Limit: pageSize,
            ExclusiveStartKey:
                lastFolloweeHandle === null
                    ? undefined
                    : { followee_handle: lastFolloweeHandle, follower_handle: followerHandle },
        };

        const items: Follow[] = [];
        const data = await this.docClient.send(new QueryCommand(params));
        console.log(data);
        const hasMorePages = data.LastEvaluatedKey !== undefined;
        data.Items?.forEach((item) =>
            items.push({
                follower_handle: item.follower_handle,
                follower_name: item.follower_name,
                followee_handle: item.followee_handle,
                followee_name: item.followee_name,
            } as Follow)
        );
        return new DataPage<Follow>(items, hasMorePages, data.LastEvaluatedKey?.followee_handle);
    }
    async getPageOfFollowers(
        followeeHandle: string,
        pageSize: number,
        lastFollowerHandle?: string
    ): Promise<DataPage<Follow>> {
        const params = {
            KeyConditionExpression: 'followee_handle = :followeeHandle',
            IndexName: this.followsIndexName,
            ExpressionAttributeValues: {
                ':followeeHandle': followeeHandle,
            },
            TableName: this.tableName,
            Limit: pageSize,
            ExclusiveStartKey:
                lastFollowerHandle === null
                    ? undefined
                    : { followee_handle: followeeHandle, follower_handle: lastFollowerHandle },
        };

        const items: Follow[] = [];
        const data = await this.docClient.send(new QueryCommand(params));
        const hasMorePages = data.LastEvaluatedKey !== undefined;
        data.Items?.forEach((item) =>
            items.push({
                follower_handle: item.follower_handle,
                follower_name: item.follower_name,
                followee_handle: item.followee_handle,
                followee_name: item.followee_name,
            } as Follow)
        );
        return new DataPage<Follow>(items, hasMorePages, data.LastEvaluatedKey?.follower_handle);
    }
}
