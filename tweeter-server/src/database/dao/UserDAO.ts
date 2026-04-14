import TweeterDAO from './TweeterDAO';
import { UserDto } from 'tweeter-shared';

export default interface UserDAO extends TweeterDAO {
    createUser(user: UserDto, password: string): Promise<UserDto>;
    getUserByAlias(alias: string): Promise<UserDto | null>;
    getUsersByAliases(aliases: string[]): Promise<UserDto[]>;
    verifyCredentials(alias: string, password: string): Promise<UserDto | null>;
    getFollowerCount(alias: string): Promise<number>;
    getFolloweeCount(alias: string): Promise<number>;
    updateFollowerCount(alias: string, delta: number): Promise<void>;
    updateFolloweeCount(alias: string, delta: number): Promise<void>;
}
