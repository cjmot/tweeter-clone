import { TweeterResponse } from './TweeterResponse';

export interface UserCountResponse extends TweeterResponse {
    readonly count: number;
}
