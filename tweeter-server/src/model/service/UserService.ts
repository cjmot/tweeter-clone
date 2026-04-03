import { UserDto } from 'tweeter-shared';
import DAOFactory from '../../database/dao/DAOFactory';
import UserDAO from '../../database/dao/UserDAO';
import DynamoDAOFactory from '../../database/dynamoDB/DynamoDAOFactory';
import { AuthGuard } from './AuthGuard';

export class UserService {
    private userDao: UserDAO;
    private authGuard: AuthGuard;

    public constructor(factory: DAOFactory = new DynamoDAOFactory()) {
        this.userDao = factory.getUserDao();
        this.authGuard = new AuthGuard(factory);
    }

    public async getUser(token: string, alias: string): Promise<UserDto | null> {
        await this.authGuard.verifySession(token);
        const normalizedAlias = alias.startsWith('@') ? alias : `@${alias}`;
        return this.userDao.getUserByAlias(normalizedAlias);
    }
}
