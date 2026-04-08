import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import TweeterDAO from '../dao/TweeterDAO';

export default abstract class DynamoDAO implements TweeterDAO {
    protected docClient: DynamoDBDocumentClient;
    protected tableName: string;

    protected constructor(tableName: string) {
        const client = new DynamoDBClient({ region: 'us-east-1' });
        this.docClient = DynamoDBDocumentClient.from(client);
        this.tableName = tableName;
    }
}