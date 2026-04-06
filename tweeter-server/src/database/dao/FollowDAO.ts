import TweeterDAO from './TweeterDAO';
import { Follow, DataPage } from '../../model/database/dataTypes';

export default interface FollowDAO extends TweeterDAO {
    putFollow(follow: Follow): Promise<void>;

    getFollow(followerHandle: string, followeeHandle: string): Promise<Follow | null>;

    updateFollow(follow: Follow): Promise<Follow | null>;

    deleteFollow(followerHandle: string, followeeHandle: string): Promise<void>;

    getFolloweesForFollower(followerHandle: string): Promise<Follow[]>;

    getFollowersForFollowee(followeeHandle: string): Promise<Follow[]>;
    getFolloweeCountForFollower(followerHandle: string): Promise<number>;
    getFollowerCountForFollowee(followeeHandle: string): Promise<number>;

    getPageOfFollowees(
        followerHandle: string,
        pageSize: number,
        lastFolloweeHandle?: string
    ): Promise<DataPage<Follow>>;

    getPageOfFollowers(
        followeeHandle: string,
        pageSize: number,
        lastFollowerHandle?: string
    ): Promise<DataPage<Follow>>;
}
