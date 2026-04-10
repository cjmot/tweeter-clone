import { DeleteCommand, GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { SessionDAO } from '../dao/SessionDAO';
import { Session } from '../../model/database/dataTypes';
import DynamoDAO from './DynamoDAO';

const SESSION_DURATION_MS = 2 * 60 * 1000;

export default class DynamoSessionDAO extends DynamoDAO implements SessionDAO {
    public constructor() {
        super('session');
    }

    public async createSession(session: Session): Promise<void> {
        try {
            await this.docClient.send(
                new PutCommand({
                    TableName: this.tableName,
                    Item: { ...session, expires_at: session.expires_at + SESSION_DURATION_MS },
                })
            );
        } catch (error) {
            throw this.wrapDynamoError('Failed to create session', error);
        }
    }

    public async getSessionByToken(token: string): Promise<Session | null> {
        try {
            const response = await this.docClient.send(
                new GetCommand({
                    TableName: this.tableName,
                    Key: { token },
                })
            );

            return (response.Item as Session | undefined) ?? null;
        } catch (error) {
            throw this.wrapDynamoError(`Failed to load session for token ${token}`, error);
        }
    }

    public async deleteSession(token: string): Promise<void> {
        try {
            await this.docClient.send(
                new DeleteCommand({
                    TableName: this.tableName,
                    Key: { token },
                })
            );
        } catch (error) {
            throw this.wrapDynamoError(`Failed to delete session for token ${token}`, error);
        }
    }

    public async extendSession(token: string, expiresAt: number): Promise<void> {
        try {
            await this.docClient.send(
                new UpdateCommand({
                    TableName: this.tableName,
                    Key: { token },
                    UpdateExpression: 'SET expires_at = :expiresAt',
                    ExpressionAttributeValues: {
                        ':expiresAt': expiresAt + SESSION_DURATION_MS,
                    },
                })
            );
        } catch (error) {
            throw this.wrapDynamoError(`Failed to extend session for token ${token}`, error);
        }
    }

    private wrapDynamoError(message: string, error: unknown): Error {
        if (error instanceof Error) {
            return new Error(`${message}: ${error.message}`, { cause: error });
        }

        return new Error(message);
    }
}
