import { Status } from 'tweeter-shared';
import { PagedItemPresenter } from './PagedItemPresenter';
import { StatusService } from '../model.service/StatusService';

export abstract class StatusItemsPresenter extends PagedItemPresenter<Status, StatusService> {
    protected serviceFactory(): StatusService {
        return new StatusService();
    }
}
