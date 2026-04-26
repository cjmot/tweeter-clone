import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { BatchWriteCommand, DynamoDBDocumentClient, ScanCommand, ScanCommandOutput } from '@aws-sdk/lib-dynamodb';

const region = process.env.AWS_REGION ?? process.env.REGION ?? 'us-east-1';
const feedTableName = process.env.FEED_TABLE_NAME ?? 'feed';
const scanPageSize = Number(process.env.FEED_DELETE_SCAN_PAGE_SIZE ?? '200');
const maxDeleteRetries = Number(process.env.FEED_DELETE_MAX_RETRIES ?? '8');
const retryDelayMs = Number(process.env.FEED_DELETE_RETRY_DELAY_MS ?? '100');

type FeedKey = { recipient_alias: string; timestamp: number };
type BatchWriteDeleteRequest = { DeleteRequest: { Key: FeedKey } };

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region }));

async function main(): Promise<void> {
    console.log(`Starting feed table batch delete in region=${region}, table=${feedTableName}`);

    let exclusiveStartKey: Record<string, unknown> | undefined = undefined;
    let totalDeleted = 0;
    let totalScanned = 0;

    do {
        const response: ScanCommandOutput = await docClient.send(
            new ScanCommand({
                TableName: feedTableName,
                ProjectionExpression: 'recipient_alias, #ts',
                ExpressionAttributeNames: {
                    '#ts': 'timestamp',
                },
                Limit: scanPageSize,
                ExclusiveStartKey: exclusiveStartKey,
            })
        );

        const keys: FeedKey[] =
            (response.Items as FeedKey[] | undefined)?.map((item) => ({
                recipient_alias: item.recipient_alias,
                timestamp: item.timestamp,
            })) ?? [];

        totalScanned += keys.length;
        if (keys.length > 0) {
            const deleted = await deleteKeysInBatches(keys);
            totalDeleted += deleted;
        }

        if (totalScanned > 0 && totalScanned % 5000 === 0) {
            console.log(`Progress: scanned=${totalScanned}, deleted=${totalDeleted}`);
        }

        exclusiveStartKey = response.LastEvaluatedKey;
    } while (exclusiveStartKey);

    console.log(`Feed delete complete. scanned=${totalScanned}, deleted=${totalDeleted}`);
}

async function deleteKeysInBatches(keys: FeedKey[]): Promise<number> {
    let deletedCount = 0;

    for (let index = 0; index < keys.length; index += 25) {
        const chunk = keys.slice(index, index + 25);
        const requests: BatchWriteDeleteRequest[] = chunk.map((key) => ({
            DeleteRequest: { Key: key },
        }));

        deletedCount += await deleteWithRetry(requests);
    }

    return deletedCount;
}

async function deleteWithRetry(requests: BatchWriteDeleteRequest[]): Promise<number> {
    let unprocessed: BatchWriteDeleteRequest[] = requests;
    let attempt = 0;

    while (unprocessed.length > 0) {
        const response = await docClient.send(
            new BatchWriteCommand({
                RequestItems: {
                    [feedTableName]: unprocessed,
                },
            })
        );

        unprocessed =
            (response.UnprocessedItems?.[feedTableName] as BatchWriteDeleteRequest[] | undefined) ?? [];

        if (unprocessed.length === 0) {
            return requests.length;
        }

        attempt += 1;
        if (attempt > maxDeleteRetries) {
            throw new Error(
                `Failed to delete ${unprocessed.length} feed items after ${maxDeleteRetries} retries`
            );
        }

        await sleep(retryDelayMs * attempt);
    }

    return requests.length;
}

async function sleep(milliseconds: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, milliseconds));
}

main().catch((error) => {
    console.error('Batch feed delete failed:', error);
    process.exitCode = 1;
});
