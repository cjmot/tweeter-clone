import DAOFactory from '../dao/DAOFactory';
import FeedDAO from '../dao/FeedDAO';
import DynamoFeedDAO from './DynamoFeedDAO';
import FollowDAO from '../dao/FollowDAO';
import { DynamoFollowDAO } from './DynamoFollowDAO';
import DynamoSessionDAO from './DynamoSessionDAO';
import DynamoStatusDAO from './DynamoStatusDAO';
import StatusDAO from '../dao/StatusDAO';
import { SessionDAO } from '../dao/SessionDAO';
import UserDAO from '../dao/UserDAO';
import DynamoUserDAO from './DynamoUserDAO';

export default class DynamoDAOFactory implements DAOFactory {
    getFeedDao(): FeedDAO {
        return new DynamoFeedDAO();
    }

    getFollowDao(): FollowDAO {
        return new DynamoFollowDAO();
    }

    getStatusDao(): StatusDAO {
        return new DynamoStatusDAO();
    }

    getUserDao(): UserDAO {
        return new DynamoUserDAO();
    }

    getSessionDao(): SessionDAO {
        return new DynamoSessionDAO();
    }
}