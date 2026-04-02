import FeedDAO from './FeedDAO';
import FollowDAO from './FollowDAO';
import { SessionDAO } from './SessionDAO';
import StatusDAO from './StatusDAO';
import UserDAO from './UserDAO';

export default interface DAOFactory {
    getFeedDao(): FeedDAO;
    getFollowDao(): FollowDAO;
    getSessionDao(): SessionDAO;
    getStatusDao(): StatusDAO;
    getUserDao(): UserDAO;
}