export interface TweeterRequest {}

export interface TokenRequest extends TweeterRequest {
	readonly token: string;
}


export interface UserAliasRequest extends TokenRequest {
	readonly userAlias: string;
}

export interface PagedRequest<TItem> extends UserAliasRequest {
	readonly pageSize: number;
	readonly lastItem: TItem | null;
}

