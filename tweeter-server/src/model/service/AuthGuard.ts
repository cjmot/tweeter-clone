import DAOFactory from '../../database/dao/DAOFactory';
import { SessionDAO } from '../../database/dao/SessionDAO';
import { Session } from '../database/dataTypes';
import DynamoDAOFactory from '../../database/dynamoDB/DynamoDAOFactory';

const SESSION_EXTEND_THRESHOLD_MS = 60 * 1000;

export class AuthGuard {
    private sessionDao: SessionDAO;

    public constructor(factory: DAOFactory = new DynamoDAOFactory()) {
        this.sessionDao = factory.getSessionDao();
    }

    public async verifySession(token: string): Promise<Session> {
        const session = await this.sessionDao.getSessionByToken(token);
        const now = Date.now();
        if (!session) {
            throw new Error('unauthorized: invalid-session');
        }

        if (session.expires_at <= now) {
            await this.sessionDao.deleteSession(token);
            throw new Error('unauthorized: session-expired');
        }

        if (session.expires_at - now <= SESSION_EXTEND_THRESHOLD_MS) {
            await this.sessionDao.extendSession(token, now);
        }

        return session;
    }
}
