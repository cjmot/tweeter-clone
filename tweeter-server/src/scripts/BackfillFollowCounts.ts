import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, ScanCommandOutput, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const region = process.env.AWS_REGION ?? 'us-east-1';
const usersTableName = process.env.USERS_TABLE_NAME ?? 'users';
const followTableName = process.env.FOLLOW_TABLE_NAME ?? 'follow';
const updateBatchSize = Number(process.env.BACKFILL_BATCH_SIZE ?? '25');

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region }));

type UserRow = { alias: string };
type FollowRow = { follower_alias: string; followee_alias: string };

async function main(): Promise<void> {
    console.log(`Backfill starting in region=${region}`);
    console.log(`Using users table=${usersTableName}, follow table=${followTableName}`);

    const userAliases = await scanUserAliases();
    console.log(`Loaded ${userAliases.length} users`);

    const countsByAlias = await scanFollowCounts();
    console.log(`Computed counts for ${countsByAlias.size} aliases found in follow edges`);

    let updated = 0;
    for (let i = 0; i < userAliases.length; i += updateBatchSize) {
        const batch = userAliases.slice(i, i + updateBatchSize);
        await Promise.all(
            batch.map(async (alias) => {
                const counts = countsByAlias.get(alias) ?? { followerCount: 0, followeeCount: 0 };
                await updateUserCounts(alias, counts.followerCount, counts.followeeCount);
                updated += 1;
            })
        );

        if (updated % 500 === 0 || updated === userAliases.length) {
            console.log(`Updated ${updated}/${userAliases.length} users`);
        }
    }

    console.log('Backfill complete');
}

async function scanUserAliases(): Promise<string[]> {
    const aliases: string[] = [];
    let exclusiveStartKey: Record<string, unknown> | undefined = undefined;

    do {
        const response: ScanCommandOutput = await docClient.send(
            new ScanCommand({
                TableName: usersTableName,
                ProjectionExpression: 'alias',
                ExclusiveStartKey: exclusiveStartKey,
            })
        );

        const items = (response.Items as UserRow[] | undefined) ?? [];
        for (const item of items) {
            if (item.alias) {
                aliases.push(item.alias);
            }
        }

        exclusiveStartKey = response.LastEvaluatedKey;
    } while (exclusiveStartKey);

    return aliases;
}

async function scanFollowCounts(): Promise<Map<string, { followerCount: number; followeeCount: number }>> {
    const countsByAlias = new Map<string, { followerCount: number; followeeCount: number }>();
    let exclusiveStartKey: Record<string, unknown> | undefined = undefined;
    let edgesProcessed = 0;

    do {
        const response: ScanCommandOutput = await docClient.send(
            new ScanCommand({
                TableName: followTableName,
                ProjectionExpression: 'follower_alias, followee_alias',
                ExclusiveStartKey: exclusiveStartKey,
            })
        );

        const follows = (response.Items as FollowRow[] | undefined) ?? [];
        for (const follow of follows) {
            incrementFolloweeCount(countsByAlias, follow.follower_alias);
            incrementFollowerCount(countsByAlias, follow.followee_alias);
            edgesProcessed += 1;
        }

        if (edgesProcessed > 0 && edgesProcessed % 5000 === 0) {
            console.log(`Processed ${edgesProcessed} follow edges`);
        }

        exclusiveStartKey = response.LastEvaluatedKey;
    } while (exclusiveStartKey);

    console.log(`Total follow edges processed: ${edgesProcessed}`);
    return countsByAlias;
}

function incrementFollowerCount(
    countsByAlias: Map<string, { followerCount: number; followeeCount: number }>,
    alias: string
): void {
    const existing = countsByAlias.get(alias) ?? { followerCount: 0, followeeCount: 0 };
    existing.followerCount += 1;
    countsByAlias.set(alias, existing);
}

function incrementFolloweeCount(
    countsByAlias: Map<string, { followerCount: number; followeeCount: number }>,
    alias: string
): void {
    const existing = countsByAlias.get(alias) ?? { followerCount: 0, followeeCount: 0 };
    existing.followeeCount += 1;
    countsByAlias.set(alias, existing);
}

async function updateUserCounts(alias: string, followerCount: number, followeeCount: number): Promise<void> {
    await docClient.send(
        new UpdateCommand({
            TableName: usersTableName,
            Key: { alias },
            UpdateExpression: 'SET follower_count = :followerCount, followee_count = :followeeCount',
            ExpressionAttributeValues: {
                ':followerCount': followerCount,
                ':followeeCount': followeeCount,
            },
        })
    );
}

main().catch((error) => {
    console.error('Backfill failed:', error);
    process.exitCode = 1;
});
