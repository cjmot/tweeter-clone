import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import TweeterDAO from '../dao/TweeterDAO';

export default abstract class DynamoDAO implements TweeterDAO {
    private static sharedDocClient: DynamoDBDocumentClient | null = null;
    protected docClient: DynamoDBDocumentClient;
    protected tableName: string;

    protected constructor(tableName: string) {
        if (!DynamoDAO.sharedDocClient) {
            const region = process.env.REGION ?? process.env.AWS_REGION ?? 'us-east-1';
            const client = new DynamoDBClient({ region });
            DynamoDAO.sharedDocClient = DynamoDBDocumentClient.from(client);
        }

        this.docClient = DynamoDAO.sharedDocClient;
        this.tableName = tableName;
    }
}
