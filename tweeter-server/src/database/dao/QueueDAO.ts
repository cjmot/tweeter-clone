import TweeterDAO from './TweeterDAO';
import { PostStatusJob, UpdateFeedJob } from '../../model/service/QueueMessages';

export default interface QueueDAO extends TweeterDAO {
    enqueuePostStatusJob(job: PostStatusJob): Promise<void>;
    enqueueUpdateFeedJobs(jobs: UpdateFeedJob[]): Promise<void>;
}
