import { StatusDto } from '../../dto/StatusDto';

export interface PagedStatusItemRequest {
    readonly token: string;
    readonly userAlias: string;
    readonly pageSize: number;
    readonly lastItem: StatusDto | null;
}

