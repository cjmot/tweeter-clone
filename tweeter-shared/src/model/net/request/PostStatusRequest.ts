import { StatusDto } from '../../dto/StatusDto';
import { TokenRequest } from './TweeterRequest';

export interface PostStatusRequest extends TokenRequest {
    readonly newStatus: StatusDto;
}

