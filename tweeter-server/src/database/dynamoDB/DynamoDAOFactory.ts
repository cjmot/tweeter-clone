import DAOFactory from '../dao/DAOFactory';
import FeedDAO from '../dao/FeedDAO';
import DynamoFeedDAO from './DynamoFeedDAO';
import FollowDAO from '../dao/FollowDAO';
import { DynamoFollowDAO } from './DynamoFollowDAO';
import ImagesDAO from '../dao/ImagesDAO';
import DynamoSessionDAO from './DynamoSessionDAO';
import DynamoStatusDAO from './DynamoStatusDAO';
import StatusDAO from '../dao/StatusDAO';
import { SessionDAO } from '../dao/SessionDAO';
import UserDAO from '../dao/UserDAO';
import DynamoUserDAO from './DynamoUserDAO';
import S3ImagesDAO from '../s3/S3ImagesDAO';

export default class DynamoDAOFactory implements DAOFactory {
    getFeedDao(): FeedDAO {
        return new DynamoFeedDAO();
    }

    getFollowDao(): FollowDAO {
        return new DynamoFollowDAO();
    }

    getImagesDao(): ImagesDAO {
        return new S3ImagesDAO();
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
