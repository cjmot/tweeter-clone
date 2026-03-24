import { UserDto } from '../../dto/UserDto';
import { TokenRequest } from './TweeterRequest';

export interface FollowActionRequest extends TokenRequest {
    readonly user: UserDto;
}
