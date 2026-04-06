import DAOFactory from '../../database/dao/DAOFactory';
import { SessionDAO } from '../../database/dao/SessionDAO';
import { Session } from '../database/dataTypes';
import DynamoDAOFactory from '../../database/dynamoDB/DynamoDAOFactory';

export class AuthGuard {
    private sessionDao: SessionDAO;

    public constructor(factory: DAOFactory = new DynamoDAOFactory()) {
        this.sessionDao = factory.getSessionDao();
    }

    public async verifySession(token: string): Promise<Session> {
        const session = await this.sessionDao.getSessionByToken(token);
        if (!session) {
            throw new Error('unauthorized: invalid-session');
        }

        if (session.expires_at <= Date.now()) {
            throw new Error('unauthorized: session-expired');
        }

        return session;
    }
}
