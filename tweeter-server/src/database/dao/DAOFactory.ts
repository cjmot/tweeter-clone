import FeedDAO from './FeedDAO';
import FollowDAO from './FollowDAO';
import ImagesDAO from './ImagesDAO';
import QueueDAO from './QueueDAO';
import { SessionDAO } from './SessionDAO';
import StatusDAO from './StatusDAO';
import UserDAO from './UserDAO';

export default interface DAOFactory {
    getFeedDao(): FeedDAO;
    getFollowDao(): FollowDAO;
    getImagesDao(): ImagesDAO;
    getQueueDao(): QueueDAO;
    getSessionDao(): SessionDAO;
    getStatusDao(): StatusDAO;
    getUserDao(): UserDAO;
}
