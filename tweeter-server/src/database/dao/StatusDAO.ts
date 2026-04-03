import TweeterDAO from './TweeterDAO';

export default interface StatusDAO extends TweeterDAO {
    putStatus(): Promise<void>;
    getPageOfStories(): Promise<void>;

}