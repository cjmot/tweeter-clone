import { BatchGetCommand, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import bcrypt from 'bcryptjs';
import { UserDto } from 'tweeter-shared';
import UserDAO from '../dao/UserDAO';
import DynamoDAO from './DynamoDAO';
import { UserRecord } from '../../model/database/dataTypes';

export default class DynamoUserDAO extends DynamoDAO implements UserDAO {
    public constructor() {
        super('users');
    }

    public async createUser(user: UserDto, password: string): Promise<UserDto> {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        const item: UserRecord = {
            alias: user.alias,
            first_name: user.firstName,
            last_name: user.lastName,
            image_url: user.imageUrl,
            password: hash
        };

        try {
            await this.docClient.send(
                new PutCommand({
                    TableName: this.tableName,
                    Item: item,
                    ConditionExpression: 'attribute_not_exists(alias)',
                })
            );

            return user;
        } catch (error) {
            throw this.wrapDynamoError(`Failed to create user ${user.alias}`, error);
        }
    }

    public async getUserByAlias(alias: string): Promise<UserDto | null> {
        try {
            const response = await this.docClient.send(
                new GetCommand({
                    TableName: this.tableName,
                    Key: { alias },
                })
            );

            if (!response.Item) {
                return null;
            }

            return this.toUserDto(response.Item as UserRecord);
        } catch (error) {
            throw this.wrapDynamoError(`Failed to load user ${alias}`, error);
        }
    }

    public async getUsersByAliases(aliases: string[]): Promise<UserDto[]> {
        if (aliases.length === 0) {
            return [];
        }

        const uniqueAliases = Array.from(new Set(aliases));

        try {
            const response = await this.docClient.send(
                new BatchGetCommand({
                    RequestItems: {
                        [this.tableName]: {
                            Keys: uniqueAliases.map((alias) => ({ alias })),
                        },
                    },
                })
            );

            const items = (response.Responses?.[this.tableName] as UserRecord[] | undefined) ?? [];
            const usersByAlias = new Map(items.map((item) => [item.alias, this.toUserDto(item)]));

            return aliases
                .map((alias) => usersByAlias.get(alias))
                .filter((user): user is UserDto => user !== undefined);
        } catch (error) {
            throw this.wrapDynamoError('Failed to batch load users', error);
        }
    }

    public async verifyCredentials(alias: string, password: string): Promise<UserDto | null> {
        try {
            const response = await this.docClient.send(
                new GetCommand({
                    TableName: this.tableName,
                    Key: { alias },
                })
            );

            const item = response.Item as UserRecord | undefined;

            if (!item || !(await bcrypt.compare(password, item.password))) {
                return null
            }

            return this.toUserDto(item);
        } catch (error) {
            throw this.wrapDynamoError(`Failed to verify credentials for ${alias}`, error);
        }
    }

    private toUserDto(item: UserRecord): UserDto {
        return {
            alias: item.alias,
            firstName: item.first_name,
            lastName: item.last_name,
            imageUrl: item.image_url,
        };
    }

    private wrapDynamoError(message: string, error: unknown): Error {
        if (error instanceof Error) {
            return new Error(`${message}: ${error.message}`, { cause: error });
        }

        return new Error(message);
    }
}
