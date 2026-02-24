import { AuthToken } from 'tweeter-shared';
import { AuthService } from '../model.service/AuthService';
import { MessageView, Presenter } from './Presenter';

export interface AppNavbarView extends MessageView {
    clearUserInfo: () => void;
    navigateTo: (path: string) => void;
}

export class AppNavbarPresenter extends Presenter<AppNavbarView> {
    private readonly service = new AuthService();

    public logOut = async (authToken: AuthToken): Promise<void> => {
        const loggingOutToastId = this.view.displayInfoMessage('Logging Out...', 0);

        this.doFailureReportingOperation(async () => {
            await this.service.logout(authToken);
            this.view.deleteMessage(loggingOutToastId);
            this.view.clearUserInfo();
            this.view.navigateTo('/login');
        }, 'log out user');
    };
}
