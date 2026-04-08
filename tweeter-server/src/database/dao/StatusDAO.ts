import TweeterDAO from './TweeterDAO';
import { StatusDto } from 'tweeter-shared';
import { DataPage } from '../../model/database/dataTypes';

export default interface StatusDAO extends TweeterDAO {
    putStatus(status: StatusDto): Promise<void>;
    getPageOfStories(userAlias: string, pageSize: number, lastTimestamp?: number): Promise<DataPage<StatusDto>>;
}
