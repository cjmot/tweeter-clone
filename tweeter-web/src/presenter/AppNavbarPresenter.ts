import { AuthToken } from 'tweeter-shared';
import { AuthService } from '../model.service/AuthService';
import { MessageView, Presenter } from './Presenter';

export interface AppNavbarView extends MessageView {
    clearUserInfo: () => void;
    navigateTo: (path: string) => void;
}

export class AppNavbarPresenter extends Presenter<AppNavbarView> {
    private readonly _service;

    public constructor(view: AppNavbarView) {
        super(view);
        this._service = new AuthService();
    }

    public get service(): AuthService {
        return this._service;
    }

    public logOut = async (authToken: AuthToken): Promise<void> => {
        await this.doLoadingOperation(
            this.view,
            async () => {
                await this.service.logout(authToken);
                this.view.clearUserInfo();
                this.view.navigateTo('/login');
            },
            'log out user',
            'Logging Out...'
        );
    };
}
