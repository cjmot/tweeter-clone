export interface Follow {
    follower_alias: string;
    follower_name: string;
    followee_alias: string;
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

export interface Session {
    token: string;
    alias: string;
    expires_at: number;
}

export interface UserRecord {
    alias: string;
    first_name: string;
    last_name: string;
    image_url: string;
    password: string;
    follower_count?: number;
    followee_count?: number;
}

export interface StatusRecord {
    user_alias: string;
    timestamp: number;
    post: string;
    user: {
        alias: string;
        firstName: string;
        lastName: string;
        imageUrl: string;
    };
}

export interface FeedRecord {
    recipient_alias: string;
    timestamp: number;
    post: string;
    user: {
        alias: string;
        firstName: string;
        lastName: string;
        imageUrl: string;
    };
}
