import { AuthToken, Status, User } from 'tweeter-shared';
import { StatusService } from '../model.service/StatusService';

export interface PostStatusView {
    setIsLoading: (isLoading: boolean) => void;
    clearPost: () => void;
    displayInfoMessage: (message: string, duration: number) => string;
    displayErrorMessage: (message: string) => void;
    deleteMessage: (id: string) => void;
}

export class PostStatusPresenter {
    private readonly _view: PostStatusView;
    private readonly service: StatusService;

    public constructor(view: PostStatusView) {
        this._view = view;
        this.service = new StatusService();
    }

    public get view() {
        return this._view;
    }

    submitPost = async (authToken: AuthToken, currentUser: User, post: string) => {
        const postingStatusToastId = this.view.displayInfoMessage('Posting status...', 0);

        try {
            this.view.setIsLoading(true);

            const status = new Status(post, currentUser, Date.now());
            await this.service.postStatus(authToken, status);

            this.view.clearPost();
            this.view.displayInfoMessage('Status posted!', 2000);
        } catch (error) {
            this.view.displayErrorMessage(`Failed to post the status because of exception: ${error}`);
        } finally {
            this.view.deleteMessage(postingStatusToastId);
            this.view.setIsLoading(false);
        }
    };
}
