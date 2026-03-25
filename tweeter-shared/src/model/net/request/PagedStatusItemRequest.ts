import { StatusDto } from '../../dto/StatusDto';
import { PagedRequest } from './TweeterRequest';

export interface PagedStatusItemRequest extends PagedRequest<StatusDto> {}

