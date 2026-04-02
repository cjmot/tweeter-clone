export interface Follow {
    follower_handle: string;
    follower_name: string;
    followee_handle: string;
    followee_name: string;
}

export class DataPage<T> {
    values: T[]; // page of values returned by the database
    hasMorePages: boolean; // Indicates whether there are more pages of data available to be retrieved
    lastKey?: string;

    constructor(values: T[], hasMorePages: boolean, lastKey?: string) {
        this.values = values;
        this.hasMorePages = hasMorePages;
        this.lastKey = lastKey;
    }
}