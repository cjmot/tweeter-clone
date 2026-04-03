import TweeterDAO from './TweeterDAO';
import { UserDto } from 'tweeter-shared';

export default interface UserDAO extends TweeterDAO {
    createUser(user: UserDto, password: string): Promise<UserDto>;
    getUserByAlias(alias: string): Promise<UserDto | null>;
    verifyCredentials(alias: string, password: string): Promise<UserDto | null>;
}
