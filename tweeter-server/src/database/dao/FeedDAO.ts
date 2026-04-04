import TweeterDAO from './TweeterDAO';
import { StatusDto } from 'tweeter-shared';
import { DataPage } from '../../model/database/dataTypes';

export default interface FeedDAO extends TweeterDAO {
    putFeedStatus(userAlias: string, status: StatusDto): Promise<void>;
    batchPutFeedStatuses(userAliases: string[], status: StatusDto): Promise<void>;
    getPageOfFeedStatuses(userAlias: string, pageSize: number, lastTimestamp?: number): Promise<DataPage<StatusDto>>;
}
