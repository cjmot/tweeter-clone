import { AuthToken, User } from 'tweeter-shared';
import { Presenter, View } from './Presenter';
import { AuthService } from '../model.service/AuthService';

export interface AuthView extends View {
    setIsLoading: (isLoading: boolean) => void;
    updateUserInfo: (currentUser: User, displayedUser: User, authToken: AuthToken, remember: boolean) => void;
    navigateTo: (path: string) => void;
}

export abstract class AuthPresenter<T extends AuthView> extends Presenter<T> {
    protected authService: AuthService;

    constructor(view: T) {
        super(view);
        this.authService = new AuthService();
    }

    protected async doAuth(
        authAction: () => Promise<[User, AuthToken]>,
        getDestination: (user: User) => string,
        rememberMe: boolean,
        operationDescription: string
    ) {
        this.doFailureReportingOperation(async () => {
            this.view.setIsLoading(true);
            const [user, authToken] = await authAction();
            this.view.updateUserInfo(user, user, authToken, rememberMe);
            this.view.navigateTo(getDestination(user));
        }, operationDescription).finally(() => this.view.setIsLoading(false));
    }
}
