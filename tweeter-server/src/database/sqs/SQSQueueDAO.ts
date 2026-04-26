import { SendMessageBatchCommand, SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import QueueDAO from '../dao/QueueDAO';
import { PostStatusJob, UpdateFeedJob } from '../../model/service/QueueMessages';

const MAX_SQS_BATCH_ENTRIES = 10;

export default class SQSQueueDAO implements QueueDAO {
    private sqsClient: SQSClient;
    private postStatusQueueUrl: string;
    private updateFeedQueueUrl: string;

    public constructor(
        postStatusQueueUrl: string = process.env.POST_STATUS_QUEUE_URL ?? '',
        updateFeedQueueUrl: string = process.env.UPDATE_FEED_QUEUE_URL ?? ''
    ) {
        const region = process.env.REGION ?? process.env.AWS_REGION ?? 'us-east-1';
        this.sqsClient = new SQSClient({ region });
        this.postStatusQueueUrl = postStatusQueueUrl;
        this.updateFeedQueueUrl = updateFeedQueueUrl;
    }

    public async enqueuePostStatusJob(job: PostStatusJob): Promise<void> {
        if (!this.postStatusQueueUrl) {
            throw new Error('internal-server-error: POST_STATUS_QUEUE_URL is not configured');
        }

        await this.sqsClient.send(
            new SendMessageCommand({
                QueueUrl: this.postStatusQueueUrl,
                MessageBody: JSON.stringify(job),
            })
        );
    }

    public async enqueueUpdateFeedJobs(jobs: UpdateFeedJob[]): Promise<void> {
        if (!this.updateFeedQueueUrl) {
            throw new Error('internal-server-error: UPDATE_FEED_QUEUE_URL is not configured');
        }

        const entries = jobs.map((job, index) => ({
            Id: `${index}`,
            MessageBody: JSON.stringify(job),
        }));

        for (let index = 0; index < entries.length; index += MAX_SQS_BATCH_ENTRIES) {
            const chunk = entries.slice(index, index + MAX_SQS_BATCH_ENTRIES);
            const response = await this.sqsClient.send(
                new SendMessageBatchCommand({
                    QueueUrl: this.updateFeedQueueUrl,
                    Entries: chunk,
                })
            );

            if ((response.Failed?.length ?? 0) > 0) {
                const failedIds = response.Failed?.map((failed) => failed.Id).join(', ');
                throw new Error(
                    `internal-server-error: Failed to enqueue update feed jobs: ${failedIds ?? 'unknown failure'}`
                );
            }
        }
    }
}
