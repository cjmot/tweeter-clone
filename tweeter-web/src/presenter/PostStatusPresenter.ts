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
        await this.doLoadingOperation(
            this.view,
            async () => {
                const status = new Status(post, currentUser, Date.now());
                await this.service.postStatus(authToken, status);

                this.view.clearPost();
                this.view.displayInfoMessage('Status posted!', 2000);
            },
            'post status',
            'Posting status...'
        );
    };
}
