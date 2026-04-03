import TweeterDAO from './TweeterDAO';
import { UserDto } from 'tweeter-shared'

export default interface UserDAO extends TweeterDAO {
    createUser(): Promise<UserDto>;
    getUserByAlias(): Promise<UserDto>;
    verifyCredentials(): Promise<UserDto>;
}