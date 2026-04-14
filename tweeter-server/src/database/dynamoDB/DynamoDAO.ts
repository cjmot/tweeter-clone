import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import TweeterDAO from '../dao/TweeterDAO';

export default abstract class DynamoDAO implements TweeterDAO {
    protected docClient: DynamoDBDocumentClient;
    protected tableName: string;

    protected constructor(tableName: string) {
        const region = process.env.REGION ?? process.env.AWS_REGION ?? 'us-east-1';
        const client = new DynamoDBClient({ region });
        this.docClient = DynamoDBDocumentClient.from(client);
        this.tableName = tableName;
    }
}
