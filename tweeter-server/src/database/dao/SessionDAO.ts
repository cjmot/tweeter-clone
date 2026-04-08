import TweeterDAO from './TweeterDAO';
import { Session } from '../../model/database/dataTypes';

export interface SessionDAO extends TweeterDAO {
    createSession(session: Session): Promise<void>;
    getSessionByToken(token: string): Promise<Session | null>;
    deleteSession(token: string): Promise<void>;
    extendSession(token: string, expiresAt: number): Promise<void>;
}
