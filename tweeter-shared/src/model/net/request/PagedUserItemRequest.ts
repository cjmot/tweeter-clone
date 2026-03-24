import { UserDto } from '../../dto/UserDto';
import { PagedRequest } from './TweeterRequest';

export interface PagedUserItemRequest extends PagedRequest<UserDto> {}
