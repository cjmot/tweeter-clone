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
        const now = Date.now()
        if (!session) {
            throw new Error('unauthorized: invalid-session');
        }

        if (session.expires_at <= now) {
            await this.sessionDao.deleteSession(token)
            throw new Error('unauthorized: session-expired');
        }

        await this.sessionDao.extendSession(token, session.expires_at);

        return session;
    }
}
