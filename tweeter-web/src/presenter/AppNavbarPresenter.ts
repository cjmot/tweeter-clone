import { AuthToken } from 'tweeter-shared';
import { AuthService } from '../model.service/AuthService';

export interface AppNavbarView {
    displayInfoMessage: (message: string, duration: number) => string;
    deleteMessage: (id: string) => void;
    clearUserInfo: () => void;
    navigateTo: (path: string) => void;
    displayErrorMessage: (message: string) => void;
}

export class AppNavbarPresenter {
    private readonly _view: AppNavbarView;
    private readonly service: AuthService;

    public constructor(view: AppNavbarView) {
        this._view = view;
        this.service = new AuthService();
    }

    private get view() {
        return this._view;
    }

    public logOut = async (authToken: AuthToken): Promise<void> => {
        const loggingOutToastId = this.view.displayInfoMessage('Logging Out...', 0);

        try {
            await this.service.logout(authToken);
            this.view.deleteMessage(loggingOutToastId);
            this.view.clearUserInfo();
            this.view.navigateTo('/login');
        } catch (error) {
            this.view.displayErrorMessage(`Failed to log user out because of exception: ${error}`);
        }
    };
}
