import { UserDto } from '../../dto/UserDto';

export interface FollowActionRequest {
    readonly token: string;
    readonly user: UserDto;
}
