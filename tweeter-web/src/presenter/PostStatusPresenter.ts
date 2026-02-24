import { AuthToken, Status, User } from 'tweeter-shared';
import { StatusService } from '../model.service/StatusService';
import { MessageView, Presenter } from './Presenter';

export interface PostStatusView extends MessageView {
    setIsLoading: (isLoading: boolean) => void;
    clearPost: () => void;
}

export class PostStatusPresenter extends Presenter<PostStatusView> {
    private readonly service = new StatusService();

    submitPost = async (authToken: AuthToken, currentUser: User, post: string) => {
        const postingStatusToastId = this.view.displayInfoMessage('Posting status...', 0);

        this.doFailureReportingOperation(async () => {
            this.view.setIsLoading(true);

            const status = new Status(post, currentUser, Date.now());
            await this.service.postStatus(authToken, status);

            this.view.clearPost();
            this.view.displayInfoMessage('Status posted!', 2000);
        }, 'post status').finally(() => {
            this.view.deleteMessage(postingStatusToastId);
            this.view.setIsLoading(false);
        });
    };
}
