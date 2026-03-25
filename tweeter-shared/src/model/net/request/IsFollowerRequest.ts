import { UserAliasRequest } from './TweeterRequest';

export interface IsFollowerRequest extends UserAliasRequest {
    readonly selectedUserAlias: string;
}
